import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function parseTimeTo24H(timeStr) {
  if (!timeStr) return '09:00';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  return timeStr;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body;

    console.log('addBookingToCalendar triggered, event type:', event?.type, 'status:', data?.status);

    if (!data) {
      return Response.json({ status: 'skipped', reason: 'no data' });
    }

    const bookingRef = data.reference_number || data.id;

    // On cancellation — remove the blocked time slot
    if (data.status === 'cancelled') {
      await base44.asServiceRole.entities.Availability.deleteMany({ booking_reference: bookingRef });
      console.log('Removed time block for cancelled booking:', bookingRef);
      return Response.json({ status: 'block_removed', bookingRef });
    }

    // Only create calendar event + time block when status is confirmed
    if (data.status !== 'confirmed') {
      return Response.json({ status: 'skipped', reason: 'not confirmed' });
    }

    // Avoid duplicates — remove any existing block for this booking first
    await base44.asServiceRole.entities.Availability.deleteMany({ booking_reference: bookingRef });

    // Create a blocked time slot in Availability so no other client can book it
    await base44.asServiceRole.entities.Availability.create({
      specific_date: data.appointment_date,
      start_time: data.appointment_time,
      is_blocked: true,
      block_reason: `Booked: ${data.customer_name} - ${data.hairstyle_name}`,
      booking_reference: bookingRef,
    });
    console.log('Time block created for booking:', bookingRef, 'on', data.appointment_date, 'at', data.appointment_time);

    // Create Google Calendar event
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    if (!accessToken) {
      console.error('No Google Calendar access token — time block created without calendar event');
      return Response.json({ status: 'block_only', bookingRef });
    }

    const appointmentDate = data.appointment_date;
    const time24 = parseTimeTo24H(data.appointment_time);
    const startDateTime = new Date(`${appointmentDate}T${time24}:00`);

    if (isNaN(startDateTime.getTime())) {
      console.error('Invalid date/time:', appointmentDate, time24, '(original:', data.appointment_time, ')');
      return Response.json({ status: 'block_only', error: 'invalid time for calendar' });
    }

    const endDateTime = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000);

    const calendarEvent = {
      summary: `${data.hairstyle_name} — ${data.customer_name}`,
      description: [
        `Client: ${data.customer_name}`,
        `Phone: ${data.customer_phone || 'N/A'}`,
        `Email: ${data.customer_email}`,
        `Style: ${data.hairstyle_name}`,
        data.hair_size ? `Size: ${data.hair_size}` : null,
        data.hair_length ? `Length: ${data.hair_length}` : null,
        data.notes ? `Notes: ${data.notes}` : null,
        `Booking Ref: ${bookingRef}`,
      ].filter(Boolean).join('\n'),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'email', minutes: 1440 },
        ],
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Google Calendar API error:', err);
      return Response.json({ error: err }, { status: 500 });
    }

    const created = await response.json();
    console.log('Calendar event created:', created.id, created.htmlLink);

    return Response.json({ status: 'success', eventId: created.id, link: created.htmlLink });
  } catch (error) {
    console.error('addBookingToCalendar error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
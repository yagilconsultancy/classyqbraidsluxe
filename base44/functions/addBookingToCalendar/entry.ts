import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;

    console.log('addBookingToCalendar triggered, event type:', event?.type, 'status:', data?.status);

    // Only process when status is confirmed
    if (!data || data.status !== 'confirmed') {
      return Response.json({ status: 'skipped', reason: 'not confirmed' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    if (!accessToken) {
      console.error('No Google Calendar access token found');
      return Response.json({ error: 'No access token' }, { status: 500 });
    }

    const appointmentDate = data.appointment_date; // YYYY-MM-DD
    const appointmentTime = data.appointment_time || '09:00'; // HH:MM

    const startDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000);

    const calendarEvent = {
      summary: `💆 ${data.hairstyle_name} — ${data.customer_name}`,
      description: [
        `Client: ${data.customer_name}`,
        `Phone: ${data.customer_phone || 'N/A'}`,
        `Email: ${data.customer_email}`,
        `Style: ${data.hairstyle_name}`,
        data.hair_size ? `Size: ${data.hair_size}` : null,
        data.hair_length ? `Length: ${data.hair_length}` : null,
        data.notes ? `Notes: ${data.notes}` : null,
        `Booking Ref: ${data.reference_number || data.id}`,
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
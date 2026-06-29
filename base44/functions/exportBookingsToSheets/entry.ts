import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    if (!accessToken) return Response.json({ error: 'Google Sheets not connected' }, { status: 500 });

    // Fetch all confirmed bookings
    const bookings = await base44.asServiceRole.entities.Booking.filter({ status: 'confirmed' });

    // Try to find existing spreadsheet named "ClassyqBraidsLuxe - Confirmed Bookings"
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='ClassyqBraidsLuxe - Confirmed Bookings' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&spaces=drive`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();

    let spreadsheetId;

    if (searchData.files && searchData.files.length > 0) {
      spreadsheetId = searchData.files[0].id;
    } else {
      // Create a new spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: { title: 'ClassyqBraidsLuxe - Confirmed Bookings' } }),
      });
      const created = await createRes.json();
      spreadsheetId = created.spreadsheetId;
    }

    // Build rows
    const headers = [
      'Reference #', 'Customer Name', 'Email', 'Phone',
      'Hairstyle', 'Hair Size', 'Hair Length',
      'Appointment Date', 'Appointment Time',
      'Total Price ($)', 'Payment Status', 'Notes'
    ];

    const rows = bookings.map(b => [
      b.reference_number || b.id,
      b.customer_name || '',
      b.customer_email || '',
      b.customer_phone || '',
      b.hairstyle_name || '',
      (b.hair_size || '').replace(/_/g, ' '),
      (b.hair_length || '').replace(/_/g, ' '),
      b.appointment_date || '',
      b.appointment_time || '',
      b.total_price || '',
      b.payment_status || '',
      b.notes || '',
    ]);

    const values = [headers, ...rows];

    // Clear and write data
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:L${values.length}:clear`,
      { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      }
    );

    if (!writeRes.ok) {
      const err = await writeRes.text();
      console.error('Sheets write error:', err);
      return Response.json({ error: err }, { status: 500 });
    }

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    console.log('Exported', bookings.length, 'bookings to', sheetUrl);

    return Response.json({ success: true, count: bookings.length, url: sheetUrl });
  } catch (error) {
    console.error('exportBookingsToSheets error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
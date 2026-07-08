import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const range = body?.range || 'all'; // 'daily' | 'weekly' | 'monthly' | 'all'

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    if (!accessToken) return Response.json({ error: 'Google Sheets not connected' }, { status: 500 });

    // Fetch ALL bookings
    const allBookings = await base44.asServiceRole.entities.Booking.list('-created_date');

    // Filter by date range based on created_date
    const now = new Date();
    let filtered = allBookings;
    if (range !== 'all') {
      const cutoff = new Date();
      if (range === 'daily') cutoff.setDate(now.getDate() - 1);
      else if (range === 'weekly') cutoff.setDate(now.getDate() - 7);
      else if (range === 'monthly') cutoff.setMonth(now.getMonth() - 1);
      filtered = allBookings.filter(b => new Date(b.created_date) >= cutoff);
    }

    const rangeLabels = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', all: 'All' };
    const sheetName = `ClassyqBraidsLuxe - ${rangeLabels[range] || 'All'} Bookings`;

    // Try to find existing spreadsheet with this name
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${sheetName}'`)} and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&spaces=drive`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();

    let spreadsheetId;

    if (searchData.files && searchData.files.length > 0) {
      spreadsheetId = searchData.files[0].id;
    } else {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: { title: sheetName } }),
      });
      const created = await createRes.json();
      spreadsheetId = created.spreadsheetId;
    }

    const headers = [
      'Reference #', 'Customer Name', 'Email', 'Phone',
      'Hairstyle', 'Hair Type', 'Hair Size', 'Hair Length',
      'Appointment Date', 'Appointment Time',
      'Total Price ($)', 'Status', 'Payment Status',
      'Requires Quote', 'Extension Source', 'Notes', 'Created Date'
    ];

    const hairTypeLabels = {
      human_hair: 'Human Hair', synthetic_hair: 'Synthetic Hair',
      curly_extensions: 'Curly Extensions', straight_extensions: 'Straight Extensions',
      body_wave_hair: 'Body Wave Hair',
    };
    const sizeLabels = {
      extra_small: 'Extra Small', small: 'Small', small_medium: 'Small/Medium',
      medium: 'Medium', large: 'Large', extra_large: 'Extra Large',
    };
    const lengthLabels = {
      shoulder: 'Shoulder', mid_back: 'Mid Back', waist: 'Waist',
      hip: 'Hip', custom: 'Custom',
    };

    const rows = filtered.map(b => [
      b.reference_number || b.id,
      b.customer_name || '',
      b.customer_email || '',
      b.customer_phone || '',
      b.hairstyle_name || '',
      hairTypeLabels[b.hair_type] || b.hair_type || '',
      sizeLabels[b.hair_size] || b.hair_size || '',
      lengthLabels[b.hair_length] || b.hair_length || '',
      b.appointment_date || '',
      b.appointment_time || '',
      b.total_price || '',
      b.status || '',
      b.payment_status || '',
      b.requires_quote ? 'Yes' : 'No',
      b.extension_source === 'buy_from_us' ? 'Buying from us' : (b.extension_source === 'own' ? 'Bringing own' : ''),
      (b.notes || '').replace(/\n/g, ' '),
      b.created_date ? new Date(b.created_date).toLocaleString() : '',
    ]);

    const values = [headers, ...rows];

    // Clear entire sheet first
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:Z10000:clear`,
      { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: '{}' }
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
    console.log(`Exported ${filtered.length} bookings (${range}) to ${sheetUrl}`);

    return Response.json({ success: true, count: filtered.length, range, url: sheetUrl });
  } catch (error) {
    console.error('exportBookingsToSheets error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
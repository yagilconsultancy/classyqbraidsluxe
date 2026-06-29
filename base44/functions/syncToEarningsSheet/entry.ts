import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SHEET_NAME = 'ClassyqBraidsLuxe - Daily Earnings';
const TAB = 'Earnings';

async function getOrCreateSpreadsheet(accessToken) {
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create with header row
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: SHEET_NAME },
      sheets: [{ properties: { title: TAB } }],
    }),
  });
  const created = await createRes.json();
  const id = created.spreadsheetId;

  // Write headers
  const headers = [['Date', 'Type', 'Reference #', 'Customer Name', 'Email', 'Description', 'Amount ($)', 'Status']];
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${TAB}!A1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: headers }),
    }
  );
  return id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { type, record } = body; // type: 'booking' | 'order'

    if (!record) return Response.json({ error: 'No record provided' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    if (!accessToken) return Response.json({ error: 'Google Sheets not connected' }, { status: 500 });

    const spreadsheetId = await getOrCreateSpreadsheet(accessToken);

    let row;
    const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' });

    if (type === 'booking') {
      row = [
        today,
        'Booking',
        record.reference_number || record.id,
        record.customer_name || '',
        record.customer_email || '',
        record.hairstyle_name || '',
        record.total_price || '',
        record.payment_status || 'unpaid',
      ];
    } else if (type === 'order') {
      const description = (record.items || []).map(i => `${i.product_name} x${i.quantity}`).join(', ');
      row = [
        today,
        'Product Order',
        record.order_number || record.id,
        record.customer_name || '',
        record.customer_email || '',
        description,
        record.total || record.subtotal || '',
        record.payment_status || 'unpaid',
      ];
    } else {
      return Response.json({ error: 'Unknown type' }, { status: 400 });
    }

    // Append row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${TAB}!A1:H1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [row] }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.text();
      console.error('Sheets append error:', err);
      return Response.json({ error: err }, { status: 500 });
    }

    console.log('Synced', type, record.id, 'to earnings sheet');
    return Response.json({ success: true, spreadsheetId });
  } catch (error) {
    console.error('syncToEarningsSheet error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
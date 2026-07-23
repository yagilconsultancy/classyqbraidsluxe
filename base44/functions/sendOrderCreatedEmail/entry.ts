import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_EMAIL = 'classyqbraidsluxe@gmail.com';

function itemsRows(items = []) {
  if (!items.length) return '';
  const rows = items.map((i) => {
    const opts = [i.length, i.color].filter(Boolean).join(' &middash; ');
    return `<tr><td style="font-size:13px;color:#111111;padding:6px 0;">${i.product_name}${opts ? ` <span style="color:#888;font-size:11px;">(${opts})</span>` : ''}</td><td style="font-size:13px;color:#666;text-align:center;padding:6px 0;">${i.quantity}</td><td style="font-size:13px;color:#9D7B1C;font-weight:600;text-align:right;padding:6px 0;">$${(i.price * i.quantity).toFixed(2)}</td></tr>`;
  }).join('');
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">${rows}<tr><td colspan="2" style="font-size:13px;color:#111;font-weight:600;padding:10px 0 0;border-top:1px solid #eee;">Total</td><td style="font-size:15px;color:#111;font-weight:700;text-align:right;padding:10px 0 0;border-top:1px solid #eee;">$${subtotal}</td></tr></table>`;
}

function row(label, value) {
  if (!value && value !== 0) return '';
  return `<tr><td style="font-size:10px;color:#888;text-transform:uppercase;width:90px;vertical-align:top;padding:4px 0;">${label}</td><td style="font-size:14px;color:#111;padding:4px 0;">${value}</td></tr>`;
}

function shell(title, body) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4EE;"><tr><td style="padding:24px 12px;" align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">
<tr><td style="background-color:#111111;padding:28px 32px;text-align:center;">
<p style="margin:0;color:#9D7B1C;font-size:26px;font-family:Georgia,serif;letter-spacing:0.04em;">ClassyqBraidsLuxe</p>
<p style="margin:6px 0 0;color:#888888;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">${title}</p>
</td></tr>
<tr><td style="padding:28px 24px;">${body}</td></tr>
<tr><td style="background-color:#111111;padding:20px 32px;text-align:center;">
<p style="margin:0;color:#666666;font-size:11px;">London, ON &nbsp;&bull;&nbsp; 437-299-6513</p>
<p style="margin:6px 0 0;color:#9D7B1C;font-size:13px;font-family:Georgia,serif;">ClassyqBraidsLuxe</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const event = body.event || {};
    const entityId = event.entity_id;
    let order = body.data;
    if (!order && entityId) {
      try {
        const list = await base44.asServiceRole.entities.Order.filter({ id: entityId });
        order = list[0];
      } catch (e) {
        return Response.json({ skipped: true, reason: 'order not found' });
      }
    }
    if (!order) return Response.json({ skipped: true, reason: 'no order' });

    const ref = order.order_number || order.id || 'N/A';
    const summary = itemsRows(order.items);
    const total = (order.total || 0).toFixed(2);

    // ---- Admin email ----
    const adminBody = `
<p style="margin:0 0 6px;font-size:20px;color:#111111;font-family:Georgia,serif;">New Order Received</p>
<p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.6;">A new order has been placed. Review it in the admin dashboard.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;"><tr><td style="background-color:#F8F4EE;padding:16px 20px;border-left:3px solid #9D7B1C;">
<p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.12em;">Order Number</p>
<p style="margin:4px 0 0;font-size:18px;color:#111;font-weight:600;font-family:Courier,monospace;">${ref}</p>
</td></tr></table>
<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Customer</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;background-color:#F8F4EE;"><tr><td style="padding:16px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
${row('Name', order.customer_name)}
${row('Email', order.customer_email)}
${row('Phone', order.customer_phone)}
${row('Shipping', order.shipping_address)}
${row('Payment', order.payment_status)}
</table></td></tr></table>
<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Items</p>
${summary}
<p style="margin:8px 0 0;font-size:12px;color:#888;">Review and confirm payment in the admin dashboard.</p>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      from_name: 'ClassyqBraidsLuxe',
      subject: `New Order - ${order.customer_name || ''} - ${ref}`,
      body: shell('New Order Received', adminBody),
    });

    // ---- Client email ----
    if (order.customer_email) {
      const clientBody = `
<p style="margin:0 0 6px;font-size:20px;color:#111111;font-family:Georgia,serif;">Hi ${order.customer_name || 'there'},</p>
<p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">Thank you for shopping with ClassyqBraidsLuxe! We've received your order and are getting it ready.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="background-color:#F8F4EE;padding:16px 20px;border-left:3px solid #9D7B1C;">
<p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.12em;">Order Number</p>
<p style="margin:4px 0 0;font-size:18px;color:#111;font-weight:600;font-family:Courier,monospace;">${ref}</p>
</td></tr></table>
<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Order Summary</p>
${summary}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr><td style="padding:14px 16px;background-color:#FAF3E0;border:1px solid #E8D9B0;font-size:12px;color:#9D7B1C;line-height:1.5;">For Interac e-Transfer, please send your payment to <strong>classyqbraidsluxe@gmail.com</strong> and upload your confirmation. We'll confirm your payment and ship your items shortly.</td></tr></table>
<p style="margin:0;font-size:13px;color:#666;line-height:1.6;">If you have any questions, feel free to reach out to us at <strong style="color:#111;">437-299-6513</strong> or reply to this email.</p>`;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.customer_email,
        from_name: 'ClassyqBraidsLuxe',
        subject: `Order Received - ${ref}`,
        body: shell('Order Received', clientBody),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendOrderCreatedEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
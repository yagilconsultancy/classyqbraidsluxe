function itemsRows(items = []) {
  if (!items.length) return '';
  const rows = items.map((i) => {
    const opts = [i.length, i.color].filter(Boolean).join(' · ');
    return `<tr><td style="font-size:13px;color:#111111;padding:6px 0;">${i.product_name}${opts ? ` <span style="color:#888;font-size:11px;">(${opts})</span>` : ''}</td><td style="font-size:13px;color:#666;text-align:center;padding:6px 0;">${i.quantity}</td><td style="font-size:13px;color:#9D7B1C;font-weight:600;text-align:right;padding:6px 0;">$${(i.price * i.quantity).toFixed(2)}</td></tr>`;
  }).join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">${rows}<tr><td colspan="2" style="font-size:13px;color:#111;font-weight:600;padding:10px 0 0;border-top:1px solid #eee;">Total</td><td style="font-size:15px;color:#111;font-weight:700;text-align:right;padding:10px 0 0;border-top:1px solid #eee;">$${items.reduce((s,i)=>s+i.price*i.quantity,0).toFixed(2)}</td></tr></table>`;
}

export function buildEmail(order, type) {
  const ref = order.order_number || order.id;
  const summary = itemsRows(order.items);

  const titles = {
    payment_confirmed: 'Payment Confirmed',
    shipped: 'Your Order Has Shipped',
    delivered: 'Order Delivered',
    cancelled: 'Order Cancelled',
  };
  const intros = {
    payment_confirmed: `Hi ${order.customer_name},<br><br>We've received your payment for order <strong>${ref}</strong>. Your items are now being prepared for shipment. We'll let you know as soon as they're on the way.`,
    shipped: `Hi ${order.customer_name},<br><br>Great news! Your order <strong>${ref}</strong> has been shipped and is on its way to you. Please allow a few business days for delivery.`,
    delivered: `Hi ${order.customer_name},<br><br>Your order <strong>${ref}</strong> has been delivered. We hope you love your new pieces! Feel free to reach out if you have any questions.`,
    cancelled: `Hi ${order.customer_name},<br><br>Your order <strong>${ref}</strong> has been cancelled. If you believe this was a mistake or have any questions, please contact us at <strong>437-299-6513</strong>.`,
  };
  const subjects = {
    payment_confirmed: `Payment Confirmed - ${ref}`,
    shipped: `Your Order ${ref} Has Shipped`,
    delivered: `Your Order ${ref} Has Been Delivered`,
    cancelled: `Order ${ref} Cancelled`,
  };

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8F4EE;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4EE;"><tr><td style="padding:24px 12px;" align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;width:100%;">
<tr><td style="background-color:#111111;padding:28px 32px;text-align:center;">
<p style="margin:0;color:#9D7B1C;font-size:26px;font-family:Georgia,serif;letter-spacing:0.04em;">ClassyqBraidsLuxe</p>
<p style="margin:6px 0 0;color:#888888;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">${titles[type]}</p>
</td></tr>
<tr><td style="padding:28px 24px;">
<p style="margin:0 0 20px;font-size:14px;color:#666666;line-height:1.6;">${intros[type]}</p>
${summary ? `<p style="margin:0 0 10px;font-size:12px;color:#9D7B1C;text-transform:uppercase;letter-spacing:0.15em;font-family:Georgia,serif;">Order Summary</p>${summary}` : ''}
<p style="margin:24px 0 0;font-size:13px;color:#666666;line-height:1.6;">If you have any questions, feel free to reach out to us at <strong style="color:#111111;">437-299-6513</strong> or reply to this email.</p>
</td></tr>
<tr><td style="background-color:#111111;padding:20px 32px;text-align:center;">
<p style="margin:0;color:#666666;font-size:11px;">London, ON &nbsp;&bull;&nbsp; 437-299-6513</p>
<p style="margin:6px 0 0;color:#9D7B1C;font-size:13px;font-family:Georgia,serif;">ClassyqBraidsLuxe</p>
</td></tr>
</table></td></tr></table></body></html>`;

  return { type, subject: subjects[type], html };
}

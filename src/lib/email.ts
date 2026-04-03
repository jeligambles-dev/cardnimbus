import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "Card Nimbus <noreply@cardnimbus.com>";

async function sendEmail(params: { from: string; to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(`[EMAIL STUB] To: ${params.to} | Subject: ${params.subject}`);
    return;
  }
  await resend.emails.send(params);
}

const ACCENT = "#f97316";
const DARK_BG = "#1a1a25";
const BODY_BG = "#f9f9fb";
const TEXT_MAIN = "#1a1a2e";
const TEXT_MUTED = "#6b7280";
const BORDER = "#e5e7eb";

function baseTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BODY_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT_MAIN};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BODY_BG};padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:${DARK_BG};padding:24px 32px;">
              <a href="https://cardnimbus.com" style="text-decoration:none;">
                <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;">
                  Card<span style="color:${ACCENT};">Nimbus</span>
                </span>
              </a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${BODY_BG};border-top:1px solid ${BORDER};padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${TEXT_MUTED};">
                © ${new Date().getFullYear()} Card Nimbus. All rights reserved.<br/>
                <a href="https://cardnimbus.com/unsubscribe" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="https://cardnimbus.com/privacy" style="color:${TEXT_MUTED};text-decoration:underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${TEXT_MAIN};">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="margin:0 0 24px;font-size:15px;color:${TEXT_MUTED};">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;" />`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:${ACCENT};color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">${label}</a>`;
}

function codeBlock(text: string): string {
  return `<div style="display:inline-block;background-color:${DARK_BG};color:${ACCENT};font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:700;letter-spacing:3px;padding:14px 28px;border-radius:8px;">${text}</div>`;
}

// ─── Email functions ──────────────────────────────────────────────────────────

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export async function sendOrderConfirmation(
  to: string,
  {
    orderNumber,
    total,
    items,
  }: {
    orderNumber: string;
    total: number;
    items: OrderItem[];
  }
): Promise<void> {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;font-size:14px;color:${TEXT_MAIN};border-bottom:1px solid ${BORDER};">${item.name}</td>
        <td style="padding:10px 0;font-size:14px;color:${TEXT_MUTED};text-align:center;border-bottom:1px solid ${BORDER};">×${item.quantity}</td>
        <td style="padding:10px 0;font-size:14px;color:${TEXT_MAIN};text-align:right;border-bottom:1px solid ${BORDER};">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const body = `
    ${heading("Order Confirmed!")}
    ${subheading(`Thanks for your purchase. Order <strong>#${orderNumber}</strong> has been received and is being processed.`)}
    <table width="100%" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th style="text-align:left;font-size:12px;font-weight:600;color:${TEXT_MUTED};text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid ${BORDER};">Item</th>
          <th style="text-align:center;font-size:12px;font-weight:600;color:${TEXT_MUTED};text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid ${BORDER};">Qty</th>
          <th style="text-align:right;font-size:12px;font-weight:600;color:${TEXT_MUTED};text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid ${BORDER};">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding-top:12px;font-size:15px;font-weight:700;color:${TEXT_MAIN};">Total</td>
          <td style="padding-top:12px;font-size:15px;font-weight:700;color:${ACCENT};text-align:right;">$${total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    ${divider()}
    <p style="margin:0 0 20px;font-size:14px;color:${TEXT_MUTED};">You'll receive another email once your order ships. Questions? Contact us at <a href="mailto:support@cardnimbus.com" style="color:${ACCENT};">support@cardnimbus.com</a>.</p>
    ${button("View Order", `https://cardnimbus.com/account/orders/${orderNumber}`)}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `Order Confirmed — #${orderNumber}`,
    html: baseTemplate(`Order Confirmed — #${orderNumber}`, body),
  });
}

export async function sendShippingNotification(
  to: string,
  {
    orderNumber,
    trackingNumber,
    carrier,
  }: {
    orderNumber: string;
    trackingNumber: string;
    carrier: string;
  }
): Promise<void> {
  const carrierUrls: Record<string, string> = {
    UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
  };
  const trackingUrl =
    carrierUrls[carrier] ??
    `https://cardnimbus.com/account/orders/${orderNumber}`;

  const body = `
    ${heading("Your order is on its way!")}
    ${subheading(`Order <strong>#${orderNumber}</strong> has shipped and is headed to you.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;font-size:14px;color:${TEXT_MUTED};width:140px;">Carrier</td>
        <td style="padding:10px 0;font-size:14px;font-weight:600;color:${TEXT_MAIN};">${carrier}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:${TEXT_MUTED};">Tracking #</td>
        <td style="padding:10px 0;font-size:14px;font-weight:600;color:${TEXT_MAIN};font-family:'Courier New',Courier,monospace;">${trackingNumber}</td>
      </tr>
    </table>
    ${button("Track Package", trackingUrl)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:${TEXT_MUTED};">Tracking information may take up to 24 hours to update after shipment.</p>
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `Your order #${orderNumber} has shipped!`,
    html: baseTemplate(`Order Shipped — #${orderNumber}`, body),
  });
}

export async function sendWelcomeEmail(
  to: string,
  { name, couponCode }: { name: string; couponCode: string }
): Promise<void> {
  const body = `
    ${heading(`Welcome to Card Nimbus, ${name}!`)}
    ${subheading("We're stoked to have you here. Start exploring thousands of Pokémon cards, packs, and more.")}
    <div style="background-color:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${ACCENT};text-transform:uppercase;letter-spacing:1px;">Your Welcome Gift</p>
      <p style="margin:0 0 16px;font-size:15px;color:${TEXT_MAIN};">Get <strong>5% off</strong> your first order with code:</p>
      ${codeBlock(couponCode)}
      <p style="margin:16px 0 0;font-size:13px;color:${TEXT_MUTED};">Valid for 30 days · Single use · No minimum spend</p>
    </div>
    ${button("Shop Now", "https://cardnimbus.com/shop")}
    ${divider()}
    <p style="margin:0;font-size:13px;color:${TEXT_MUTED};">Apply your code at checkout. Questions? We're always happy to help at <a href="mailto:support@cardnimbus.com" style="color:${ACCENT};">support@cardnimbus.com</a>.</p>
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: "Welcome to Card Nimbus — Here's 5% off your first order!",
    html: baseTemplate("Welcome to Card Nimbus", body),
  });
}

export async function sendCouponReminder(
  to: string,
  { name, couponCode }: { name: string; couponCode: string }
): Promise<void> {
  const body = `
    ${heading(`${name}, your coupon is about to expire!`)}
    ${subheading("You haven't used your welcome discount yet — don't let it go to waste.")}
    <div style="background-color:#fff7ed;border:2px dashed ${ACCENT};border-radius:10px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${ACCENT};text-transform:uppercase;letter-spacing:1px;">⏰ Reminder: 5% Off</p>
      <p style="margin:0 0 16px;font-size:15px;color:${TEXT_MAIN};">Your exclusive discount code:</p>
      ${codeBlock(couponCode)}
      <p style="margin:16px 0 0;font-size:13px;color:${TEXT_MUTED};">Expires soon · Use it before it's gone!</p>
    </div>
    ${button("Use My Coupon", "https://cardnimbus.com/shop")}
    ${divider()}
    <p style="margin:0;font-size:13px;color:${TEXT_MUTED};">Simply enter the code above at checkout. Only valid for one order.</p>
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `${name}, your 5% off coupon is waiting — don't miss it!`,
    html: baseTemplate("Your Coupon is Waiting", body),
  });
}

export async function sendPasswordReset(
  to: string,
  { resetUrl }: { resetUrl: string }
): Promise<void> {
  const body = `
    ${heading("Reset your password")}
    ${subheading("We received a request to reset the password for your Card Nimbus account.")}
    <p style="margin:0 0 24px;font-size:14px;color:${TEXT_MUTED};">Click the button below to create a new password. This link is valid for <strong>1 hour</strong>.</p>
    ${button("Reset Password", resetUrl)}
    ${divider()}
    <p style="margin:0 0 8px;font-size:13px;color:${TEXT_MUTED};">If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
    <p style="margin:0;font-size:13px;color:${TEXT_MUTED};">For security, never share this link with anyone.</p>
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your Card Nimbus password",
    html: baseTemplate("Password Reset", body),
  });
}

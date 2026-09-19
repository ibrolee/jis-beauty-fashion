/** Transactional email adapter: use Resend only when a sender is configured. */
export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(message: EmailMessage): Promise<{ sent: boolean; error?: string }> {
  // Never write customer addresses, reset links, order details or message bodies to logs.
  if (!isEmailConfigured()) return { sent: false, error: "Email provider or sender not configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      console.error(`[email] provider rejected message (HTTP ${response.status})`);
      return { sent: false, error: "Email delivery was rejected" };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] delivery request failed", error instanceof Error ? error.name : "Unknown error");
    return { sent: false, error: "Email delivery failed" };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

export function passwordResetEmail(resetUrl: string, firstName: string): Omit<EmailMessage, "to"> {
  return {
    subject: "Reset your JIS Beauty & Fashion password",
    text: `Hi ${firstName},\n\nWe received a request to reset your password. Use the link below (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n— JIS Beauty & Fashion`,
    html: `<p>Hi ${escapeHtml(firstName)},</p><p>We received a request to reset your password. Click the link below (valid for 1 hour):</p><p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p><p>If you did not request this, you can safely ignore this email.</p><p>— JIS Beauty &amp; Fashion</p>`,
  };
}

export function orderConfirmationEmail(params: {
  firstName: string;
  orderNumber: string;
  total: string;
  orderUrl: string;
}): Omit<EmailMessage, "to"> {
  const { firstName, orderNumber, total, orderUrl } = params;
  return {
    subject: `Order ${orderNumber} received — JIS Beauty & Fashion`,
    text: `Hi ${firstName},\n\nThank you for shopping with JIS Beauty & Fashion. We have received your order ${orderNumber} (${total}).\nTrack it here: ${orderUrl}\n\nWhere beauty meets style.`,
    html: `<p>Hi ${escapeHtml(firstName)},</p><p>Thank you for shopping with JIS Beauty &amp; Fashion. We have received your order <strong>${escapeHtml(orderNumber)}</strong> (${escapeHtml(total)}).</p><p><a href="${escapeHtml(orderUrl)}">View your order</a></p><p><em>Where beauty meets style.</em></p>`,
  };
}

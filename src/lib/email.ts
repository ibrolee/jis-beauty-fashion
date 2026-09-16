/**
 * Transactional email adapter.
 *
 * INTEGRATION POINT: Resend is wired by default (set RESEND_API_KEY + EMAIL_FROM).
 * To use another provider (SendGrid, Mailgun, SMTP via nodemailer…), replace the
 * body of `sendEmail` — every caller only depends on this function.
 *
 * When no provider is configured the email is logged to the server console and
 * `{ sent: false }` is returned so callers can degrade gracefully.
 */
export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(message: EmailMessage): Promise<{ sent: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.info(`[email:not-configured] To: ${message.to} | Subject: ${message.subject}\n${message.text ?? message.html}`);
    return { sent: false, error: "Email provider not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "JIS Beauty & Fashion <onboarding@resend.dev>",
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[email] provider error:", body);
      return { sent: false, error: body };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] send failed:", error);
    return { sent: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/* --------------------------- Email templates --------------------------- */

export function passwordResetEmail(resetUrl: string, firstName: string): Omit<EmailMessage, "to"> {
  return {
    subject: "Reset your JIS Beauty & Fashion password",
    text: `Hi ${firstName},\n\nWe received a request to reset your password. Use the link below (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n— JIS Beauty & Fashion`,
    html: `<p>Hi ${firstName},</p><p>We received a request to reset your password. Click the link below (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can safely ignore this email.</p><p>— JIS Beauty &amp; Fashion</p>`,
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
    html: `<p>Hi ${firstName},</p><p>Thank you for shopping with JIS Beauty &amp; Fashion. We have received your order <strong>${orderNumber}</strong> (${total}).</p><p><a href="${orderUrl}">View your order</a></p><p><em>Where beauty meets style.</em></p>`,
  };
}

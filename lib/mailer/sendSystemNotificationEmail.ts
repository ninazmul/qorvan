import nodemailer from "nodemailer";

function escapeHtml(unsafe: string) {
  if (!unsafe) return "";
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendAdminNotification({
  title,
  subject,
  details,
}: {
  title: string;
  subject: string;
  details: Record<string, string | undefined>;
}) {
  try {
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = Number(process.env.SMTP_PORT);
    const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
    const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const CONTACT_RECEIVER = process.env.CONTACT_RECEIVER;

    if (!SMTP_USER || !SMTP_PASS || !CONTACT_RECEIVER) {
      console.error("SMTP or CONTACT_RECEIVER not configured");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const rows = Object.entries(details)
      .filter(([_, val]) => val !== undefined && val !== null && val !== "")
      .map(
        ([key, val]) => `
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px;font-weight:bold;color:#374151;width:35%;vertical-align:top;">${escapeHtml(key)}</td>
          <td style="padding:10px;color:#1f2937;vertical-align:top;word-break:break-word;">${
            key.toLowerCase().includes("url") || key.toLowerCase().includes("resume")
              ? `<a href="${escapeHtml(val!)}" target="_blank" style="color:#226B3A;font-weight:bold;">${escapeHtml(val!)}</a>`
              : escapeHtml(val!).replace(/\n/g, "<br/>")
          }</td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <html>
      <body style="background:#f4f6f8;font-family:Arial,sans-serif;padding:24px;margin:0;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);border:1px solid #e5e7eb;">
          
          <div style="padding:24px;background:#226B3A;color:#ffffff;">
            <h2 style="margin:0;font-size:20px;font-weight:bold;">${escapeHtml(title)} 📩</h2>
            <p style="margin:6px 0 0 0;font-size:13px;opacity:0.9;">Notification for Admin from Hormuzan Foundation Website</p>
          </div>

          <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              ${rows}
            </table>
          </div>

          <div style="padding:14px;text-align:center;font-size:12px;color:#6b7280;background:#f9fafb;border-top:1px solid #f3f4f6;">
            © ${new Date().getFullYear()} Hormuzan Foundation. All rights reserved.
          </div>

        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Hormuzan Foundation" <${SMTP_USER}>`,
      to: CONTACT_RECEIVER,
      subject: `[Admin Alert] ${subject}`,
      html,
    });
  } catch (err) {
    console.error("Admin notification email failed:", err);
  }
}

export async function sendSystemNotificationEmail({
  subject,
  message,
}: {
  subject: string;
  message: string;
}) {
  return sendAdminNotification({
    title: "System Notification",
    subject,
    details: {
      Subject: subject,
      Message: message,
    },
  });
}

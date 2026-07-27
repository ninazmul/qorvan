import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

// ─── HTML Email Templates ──────────────────────────────
function wrapInLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Logo header -->
    <div style="text-align:center;padding:24px 0;">
      <span style="font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.5px;">QORVAN</span>
    </div>
    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:24px 0;font-size:12px;color:#a1a1aa;">
      <p style="margin:0;">© ${new Date().getFullYear()} Qorvan. All rights reserved.</p>
      <p style="margin:8px 0 0 0;">You received this email because you subscribed to our newsletter.</p>
    </div>
  </div>
</body>
</html>`;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  buildHtml: (vars?: Record<string, string>) => string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Qorvan! 🎉',
    buildHtml: () => wrapInLayout(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:64px;height:64px;background:#f0fdf4;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;">🎉</span>
        </div>
        <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#18181b;">Welcome Aboard!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
          Thank you for subscribing to Qorvan! You're now part of an exclusive community that gets first access to new products, special offers, and insider updates.
        </p>
        <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin:0 0 24px;">
          <p style="margin:0;font-size:13px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">What to expect</p>
          <p style="margin:8px 0 0;font-size:14px;color:#3f3f46;line-height:1.6;">✨ New arrivals &amp; exclusive drops<br/>🎁 Members-only discounts<br/>📖 Style guides &amp; tips</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SERVER_URL || '#'}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;">
          Start Shopping →
        </a>
      </div>
    `),
  },
  {
    id: 'promo',
    name: 'Promotional Offer',
    subject: 'Exclusive Deal Just For You! 🔥',
    buildHtml: (vars) => wrapInLayout(`
      <div style="background:linear-gradient(135deg,#18181b 0%,#3f3f46 100%);padding:40px 32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#a1a1aa;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Limited Time Offer</p>
        <h1 style="margin:0 0 8px;font-size:48px;font-weight:800;color:#ffffff;">${vars?.discount || '20% OFF'}</h1>
        <p style="margin:0;font-size:16px;color:#d4d4d8;">On your next purchase</p>
      </div>
      <div style="padding:32px;text-align:center;">
        <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
          ${vars?.message || "We've got something special for our most valued subscribers. Use the code below at checkout to save big!"}
        </p>
        <div style="background:#fafafa;border:2px dashed #d4d4d8;border-radius:12px;padding:16px;margin:0 0 24px;display:inline-block;min-width:200px;">
          <p style="margin:0;font-size:12px;color:#71717a;font-weight:600;">YOUR CODE</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:800;color:#18181b;letter-spacing:3px;">${vars?.code || 'QORVAN20'}</p>
        </div>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_SERVER_URL || '#'}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;">
          Shop Now →
        </a>
        <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">Offer valid for a limited time only.</p>
      </div>
    `),
  },
  {
    id: 'new-arrival',
    name: 'New Arrival Announcement',
    subject: 'New Arrivals Are Here! ✨',
    buildHtml: (vars) => wrapInLayout(`
      <div style="padding:40px 32px;text-align:center;">
        <div style="width:64px;height:64px;background:#eff6ff;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:28px;">✨</span>
        </div>
        <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#18181b;">Fresh Drops Just Landed</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
          ${vars?.message || "We've added exciting new products to our collection. Be the first to explore our latest arrivals before they sell out!"}
        </p>
        <a href="${process.env.NEXT_PUBLIC_SERVER_URL || '#'}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;">
          View New Arrivals →
        </a>
      </div>
    `),
  },
  {
    id: 'newsletter',
    name: 'Newsletter / Update',
    subject: 'Your Weekly Update from Qorvan 📬',
    buildHtml: (vars) => wrapInLayout(`
      <div style="padding:40px 32px;">
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#18181b;text-align:center;">
          ${vars?.heading || '📬 Weekly Newsletter'}
        </h1>
        <div style="font-size:15px;color:#3f3f46;line-height:1.7;">
          ${vars?.body || '<p>Thanks for staying connected! Here are this week\'s highlights from Qorvan.</p>'}
        </div>
        <div style="text-align:center;margin-top:28px;">
          <a href="${process.env.NEXT_PUBLIC_SERVER_URL || '#'}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;">
            Visit Qorvan →
          </a>
        </div>
      </div>
    `),
  },
  {
    id: 'custom',
    name: 'Custom Email',
    subject: '',
    buildHtml: (vars) => wrapInLayout(`
      <div style="padding:40px 32px;">
        <div style="font-size:15px;color:#3f3f46;line-height:1.7;">
          ${vars?.body || ''}
        </div>
      </div>
    `),
  },
];

// ─── GET: Return available templates ────────────────────
export async function GET() {
  return NextResponse.json({
    templates: EMAIL_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      defaultSubject: t.subject,
    })),
  });
}

// ─── POST: Send email ───────────────────────────────────
export async function POST(request: Request) {
  // Protect route – only authenticated admin users
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const isAdmin = process.env.CONTACT_RECEIVER
    ? user.emailAddresses.some((e) => e.emailAddress === process.env.CONTACT_RECEIVER)
    : false;
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { templateId, subject, body, recipients, variables } = await request.json();

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json({ error: 'At least one recipient is required' }, { status: 400 });
  }

  // Find template
  const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
  }

  const finalSubject = subject || template.subject || 'Message from Qorvan';
  const html = template.buildHtml({ ...variables, body });

  const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
  const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({ error: 'SMTP not configured' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    // Send in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((email: string) =>
          transporter.sendMail({
            from: `"Qorvan" <${SMTP_USER}>`,
            to: email,
            subject: finalSubject,
            html,
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      sent: recipients.length,
      message: `Successfully sent to ${recipients.length} recipient(s)`,
    });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

// Expected env vars:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER (optional)

export async function POST(request: Request) {
  // Protect route – only authenticated users can access
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const isAdmin = process.env.CONTACT_RECEIVER
    ? user.emailAddresses.some(e => e.emailAddress === process.env.CONTACT_RECEIVER)
    : false;
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { mode, subject, body, recipients, template } = await request.json();

  // Simple template handling – you can extend this map as needed
  const templates: Record<string, { subject: string; body: string }> = {
    welcome: { subject: 'Welcome to QORVAN', body: 'Thank you for joining our private club.' },
    promo: { subject: 'Exclusive Promotion', body: 'Enjoy a special discount just for you.' },
    custom: { subject: subject || 'No Subject', body: body || '' },
  };

  const selected = templates[template] || templates.custom;
  const mailSubject = selected.subject;
  const mailBody = selected.body;

  const smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    if (mode === 'single') {
      if (!recipients || typeof recipients !== 'string') {
        return NextResponse.json({ error: 'Recipient email required' }, { status: 400 });
      }
      await smtpTransport.sendMail({
        from: process.env.SMTP_USER,
        to: recipients,
        subject: mailSubject,
        text: mailBody,
      });
    } else if (mode === 'bulk') {
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json({ error: 'Recipients array required' }, { status: 400 });
      }
      const sendPromises = recipients.map((rcpt: string) =>
        smtpTransport.sendMail({
          from: process.env.SMTP_USER,
          to: rcpt,
          subject: mailSubject,
          text: mailBody,
        })
      );
      await Promise.all(sendPromises);
    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

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

const statusConfig: Record<
  string,
  { title: string; subtitle: string; color: string; badgeBg: string; badgeText: string; icon: string }
> = {
  pending: {
    title: "Order Received",
    subtitle: "We have received your order and are currently processing it.",
    color: "#f59e0b",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    icon: "⏳",
  },
  confirmed: {
    title: "Order Confirmed!",
    subtitle: "Your order has been confirmed and is being prepared for dispatch.",
    color: "#2563eb",
    badgeBg: "#dbeafe",
    badgeText: "#1e40af",
    icon: "✅",
  },
  processing: {
    title: "Order Processing",
    subtitle: "Your order is being packed with care by our team.",
    color: "#8b5cf6",
    badgeBg: "#f3e8ff",
    badgeText: "#6b21a8",
    icon: "📦",
  },
  shipped: {
    title: "On Its Way!",
    subtitle: "Your order has been handed over to our courier partner for delivery.",
    color: "#0284c7",
    badgeBg: "#e0f2fe",
    badgeText: "#075985",
    icon: "🚚",
  },
  delivered: {
    title: "Order Delivered!",
    subtitle: "Your package has been successfully delivered. Thank you for shopping with QORVAN!",
    color: "#16a34a",
    badgeBg: "#dcfce7",
    badgeText: "#166534",
    icon: "🎉",
  },
  cancelled: {
    title: "Order Cancelled",
    subtitle: "Your order has been cancelled. If you have questions, please contact our support.",
    color: "#dc2626",
    badgeBg: "#fee2e2",
    badgeText: "#991b1b",
    icon: "❌",
  },
  returned: {
    title: "Order Returned",
    subtitle: "Your return request has been processed.",
    color: "#6b7280",
    badgeBg: "#f3f4f6",
    badgeText: "#374151",
    icon: "↩️",
  },
};

export async function sendCustomerOrderStatusEmail({
  recipientEmail,
  recipientName,
  orderNumber,
  orderStatus,
  items,
  subtotal,
  deliveryCharge,
  discountAmount,
  totalAmount,
  paymentMethod,
  shippingAddress,
  note,
}: {
  recipientEmail: string;
  recipientName: string;
  orderNumber: string;
  orderStatus: string;
  items: { title: string; quantity: number; price: number; image?: string; size?: string; color?: string }[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
    zoneName?: string;
  };
  note?: string;
}) {
  try {
    const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
    const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
    const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
    const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!SMTP_USER || !SMTP_PASS || !recipientEmail) {
      console.log("Email sending skipped: SMTP parameters or recipient email missing");
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

    const statusInfo = statusConfig[orderStatus] || {
      title: `Order Status: ${orderStatus.toUpperCase()}`,
      subtitle: `Your order status has been updated to ${orderStatus}.`,
      color: "#18181b",
      badgeBg: "#f4f4f5",
      badgeText: "#18181b",
      icon: "📢",
    };

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "#";

    const itemsRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle;">
            <div style="font-weight: 600; color: #111827; font-size: 14px;">${escapeHtml(item.title)}</div>
            ${item.size ? `<div style="font-size: 12px; color: #6b7280;">Size: ${escapeHtml(item.size)}</div>` : ""}
            ${item.color ? `<div style="font-size: 12px; color: #6b7280;">Color: ${escapeHtml(item.color)}</div>` : ""}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #374151; font-size: 14px;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #111827; font-size: 14px;">
            ৳${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
    <!-- Logo Header -->
    <div style="text-align: center; padding: 20px 0;">
      <span style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #000000; text-transform: uppercase;">QORVAN</span>
    </div>

    <!-- Main Card -->
    <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e5e7eb;">
      
      <!-- Status Header Banner -->
      <div style="background: ${statusInfo.color}; padding: 32px 24px; text-align: center; color: #ffffff;">
        <div style="font-size: 40px; margin-bottom: 8px;">${statusInfo.icon}</div>
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">${statusInfo.title}</h1>
        <p style="margin: 0; font-size: 14px; opacity: 0.95; line-height: 1.5;">${statusInfo.subtitle}</p>
      </div>

      <div style="padding: 24px;">
        <!-- Hello & Note -->
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151;">
          Dear <strong>${escapeHtml(recipientName || "Valued Customer")}</strong>,
        </p>
        
        ${
          note
            ? `
          <div style="background: #f9fafb; border-left: 4px solid ${statusInfo.color}; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #4b5563;"><strong>Note:</strong> ${escapeHtml(note)}</p>
          </div>
        `
            : ""
        }

        <!-- Order Summary Box -->
        <div style="background: #fafafa; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="color: #6b7280; padding-bottom: 6px;">Order Number:</td>
              <td style="text-align: right; font-weight: 700; color: #111827; font-size: 14px; padding-bottom: 6px;">${escapeHtml(orderNumber)}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding-bottom: 6px;">Status:</td>
              <td style="text-align: right; padding-bottom: 6px;">
                <span style="background: ${statusInfo.badgeBg}; color: ${statusInfo.badgeText}; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                  ${escapeHtml(orderStatus)}
                </span>
              </td>
            </tr>
            <tr>
              <td style="color: #6b7280;">Payment Method:</td>
              <td style="text-align: right; font-weight: 600; color: #374151;">${escapeHtml(paymentMethod)}</td>
            </tr>
          </table>
        </div>

        <!-- Items Table -->
        <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #111827;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Item</th>
              <th style="padding: 8px 12px; text-align: center; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Qty</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Totals Breakdown -->
        <div style="border-top: 2px solid #f3f4f6; pt-16px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Subtotal:</td>
              <td style="padding: 4px 0; text-align: right; color: #111827;">৳${subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Delivery Charge:</td>
              <td style="padding: 4px 0; text-align: right; color: #111827;">৳${deliveryCharge.toLocaleString()}</td>
            </tr>
            ${
              discountAmount && discountAmount > 0
                ? `
            <tr>
              <td style="padding: 4px 0; color: #16a34a;">Discount:</td>
              <td style="padding: 4px 0; text-align: right; color: #16a34a;">-৳${discountAmount.toLocaleString()}</td>
            </tr>
            `
                : ""
            }
            <tr style="font-size: 16px; font-weight: 800;">
              <td style="padding: 12px 0 4px 0; color: #111827; border-top: 1px dashed #e5e7eb;">Total Amount:</td>
              <td style="padding: 12px 0 4px 0; text-align: right; color: #000000; border-top: 1px dashed #e5e7eb;">৳${totalAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Shipping Address -->
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Destination</h4>
          <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
            <strong>${escapeHtml(shippingAddress.fullName)}</strong><br>
            Phone: ${escapeHtml(shippingAddress.phone)}<br>
            ${escapeHtml(shippingAddress.addressLine)}, ${escapeHtml(shippingAddress.city)}, ${escapeHtml(shippingAddress.district)}
            ${shippingAddress.zoneName ? `<br>Zone: ${escapeHtml(shippingAddress.zoneName)}` : ""}
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 28px;">
          <a href="${serverUrl}" target="_blank" style="display: inline-block; background: #000000; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
            Visit QORVAN Store →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0;">© ${new Date().getFullYear()} QORVAN. All rights reserved.</p>
        <p style="margin: 4px 0 0 0;">If you have any questions, reply to this email or contact support.</p>
      </div>

    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"QORVAN Orders" <${SMTP_USER}>`,
      to: recipientEmail,
      subject: `[QORVAN] Order #${orderNumber} Update - ${statusInfo.title}`,
      html,
    });
    console.log(`Order status update email sent to customer: ${recipientEmail}`);
  } catch (error) {
    console.error("Failed to send customer order status email:", error);
  }
}

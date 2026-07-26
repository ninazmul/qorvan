"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import ContactMessage from "@/lib/database/models/contactMessage.model";
import { requirePermission } from "@/lib/auth/rbac";

import { sendSystemNotificationEmail } from "@/lib/mailer/sendSystemNotificationEmail";

export async function submitContactMessage(params: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  try {
    await connectToDatabase();
    const newMessage = await ContactMessage.create(params);

    revalidatePath("/dashboard/contact-messages");

    // Trigger async admin notification email to CONTACT_RECEIVER
    await sendSystemNotificationEmail({
      subject: `New Contact Message from ${params.name}`,
      message: `Sender: ${params.name}\nEmail: ${params.email}\nPhone: ${params.phone || 'N/A'}\nSubject: ${params.subject || 'N/A'}\nMessage: ${params.message}`,
    }).catch((err) => console.error("Email send error:", err));

    return { success: true, data: JSON.parse(JSON.stringify(newMessage)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit message" };
  }
}

export async function getContactMessages() {
  await requirePermission("contact-messages", "read");
  try {
    await connectToDatabase();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(messages)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch contact messages" };
  }
}

export async function updateContactMessageStatus(id: string, status: "unread" | "read") {
  await requirePermission("contact-messages", "update");
  try {
    await connectToDatabase();
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    revalidatePath("/dashboard/contact-messages");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update message status" };
  }
}

export async function deleteContactMessage(id: string) {
  await requirePermission("contact-messages", "delete");
  try {
    await connectToDatabase();
    await ContactMessage.findByIdAndDelete(id);
    revalidatePath("/dashboard/contact-messages");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete contact message" };
  }
}

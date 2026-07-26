"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import ReturnRequest from "@/lib/database/models/returnRequest.model";
import { requirePermission } from "@/lib/auth/rbac";
import { sendSystemNotificationEmail } from "@/lib/mailer/sendSystemNotificationEmail";

export async function createReturnRequest(params: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: { productTitle: string; quantity: number }[];
  reason: string;
  details?: string;
}) {
  try {
    await connectToDatabase();
    const returnReq = await ReturnRequest.create(params);
    revalidatePath("/dashboard/return-requests");
    await sendSystemNotificationEmail({
      subject: `New Return Request for Order ${params.orderNumber}`,
      message: `Customer ${params.customerName} (${params.customerEmail}) requested a return. Reason: ${params.reason}`,
    });
    return { success: true, data: JSON.parse(JSON.stringify(returnReq)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit return request" };
  }
}

export async function getReturnRequests() {
  await requirePermission("return-requests", "read");
  try {
    await connectToDatabase();
    const requests = await ReturnRequest.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(requests)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch return requests" };
  }
}

export async function updateReturnStatus(
  id: string,
  status: "approved" | "rejected" | "completed"
) {
  await requirePermission("return-requests", "update");
  try {
    await connectToDatabase();
    const updated = await ReturnRequest.findByIdAndUpdate(id, { status }, { new: true });
    revalidatePath("/dashboard/return-requests");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update return status" };
  }
}

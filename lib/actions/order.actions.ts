"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Order from "@/lib/database/models/order.model";
import Product from "@/lib/database/models/product.model";
import Coupon from "@/lib/database/models/coupon.model";
import User from "@/lib/database/models/user.model";
import { requirePermission, getCurrentDashboardAccess } from "@/lib/auth/rbac";
import { sendSystemNotificationEmail } from "@/lib/mailer/sendSystemNotificationEmail";
import { sendCustomerOrderStatusEmail } from "@/lib/mailer/sendCustomerOrderStatusEmail";

export async function createOrder(params: {
  customerDbUserId?: string;
  guestInfo?: { name: string; email: string; phone: string };
  items: {
    product: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    sku: string;
    size?: string;
    color?: string;
    variantSku?: string;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    addressLine: string;
    city: string;
    district: string;
    postalCode?: string;
    deliveryZoneId?: string;
    zoneName?: string;
  };
  deliveryCharge: number;
  discountAmount?: number;
  couponCode?: string;
  notes?: string;
}) {
  try {
    await connectToDatabase();

    if (!params.items || params.items.length === 0) {
      return { success: false, error: "Order items cannot be empty" };
    }

    const subtotal = params.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const discountAmount = params.discountAmount || 0;
    const totalAmount = Math.max(0, subtotal + params.deliveryCharge - discountAmount);

    // Generate Unique Luxury Order Number: e.g. QRV-948271
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `QRV-${randomDigits}`;

    const newOrder = await Order.create({
      orderNumber,
      customer: params.customerDbUserId || undefined,
      guestInfo: params.guestInfo,
      items: params.items,
      shippingAddress: params.shippingAddress,
      deliveryCharge: params.deliveryCharge,
      discountAmount,
      subtotal,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "pending",
      orderStatus: "pending",
      notes: params.notes,
      couponCode: params.couponCode,
      trackingHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order placed successfully via Cash on Delivery.",
          updatedBy: "Customer",
        },
      ],
    });

    // Update Product Inventory (stock decrement)
    for (const item of params.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Update coupon usage if applicable
    if (params.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: params.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/account");
    await sendSystemNotificationEmail({
      subject: "🛒 New Order Placed",
      message: `Order #${orderNumber} placed. Total: ৳${totalAmount.toLocaleString()}.`,
    });

    // Send order confirmation email to customer
    const customerEmail = params.shippingAddress?.email || params.guestInfo?.email;
    const customerName = params.shippingAddress?.fullName || params.guestInfo?.name || "Customer";
    if (customerEmail) {
      await sendCustomerOrderStatusEmail({
        recipientEmail: customerEmail,
        recipientName: customerName,
        orderNumber,
        orderStatus: "pending",
        items: params.items,
        subtotal,
        deliveryCharge: params.deliveryCharge,
        discountAmount,
        totalAmount,
        paymentMethod: "COD",
        shippingAddress: params.shippingAddress,
        note: "Thank you for placing your order with QORVAN!",
      });
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newOrder)),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to place order" };
  }
}

export async function getOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requirePermission("orders", "read");
  try {
    await connectToDatabase();
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params?.status && params.status !== "all") {
      filter.orderStatus = params.status;
    }

    if (params?.search) {
      const regex = new RegExp(params.search, "i");
      filter.$or = [
        { orderNumber: regex },
        { "shippingAddress.fullName": regex },
        { "shippingAddress.email": regex },
        { "shippingAddress.phone": regex },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("customer", "name email")
        .lean(),
      Order.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(orders)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch orders" };
  }
}

export async function getOrderById(id: string) {
  try {
    await connectToDatabase();
    const order = await Order.findById(id).populate("customer", "name email").lean();
    if (!order) return { success: false, error: "Order not found" };
    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch order" };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    await connectToDatabase();
    const order = await Order.findOne({ orderNumber }).lean();
    if (!order) return { success: false, error: "Order not found" };
    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch order" };
  }
}

export async function getCustomerOrders(emailOrUserId: string) {
  try {
    await connectToDatabase();
    let filter: any = { "shippingAddress.email": emailOrUserId.toLowerCase() };

    // Also check if valid Mongo ObjectId for customer user ref
    if (emailOrUserId.match(/^[0-9a-fA-F]{24}$/)) {
      filter = {
        $or: [
          { customer: emailOrUserId },
          { "shippingAddress.email": emailOrUserId.toLowerCase() },
        ],
      };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch customer orders" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned",
  note?: string
) {
  const access = await requirePermission("orders", "update");
  try {
    await connectToDatabase();
    const order = await Order.findById(orderId);
    if (!order) return { success: false, error: "Order not found" };

    order.orderStatus = newStatus;
    if (newStatus === "delivered") {
      order.paymentStatus = "paid";
    }

    const formattedNote = note?.trim() || `Order status updated to ${newStatus}`;

    order.trackingHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: formattedNote,
      updatedBy: access.name || "Admin",
    });

    await order.save();

    if (["shipped", "delivered", "cancelled", "returned", "confirmed", "processing"].includes(newStatus)) {
      await sendSystemNotificationEmail({
        subject: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: `Order #${order.orderNumber} status changed to ${newStatus}. Note: ${formattedNote}`,
      });
    }

    // Send status update email directly to customer with the custom note
    const customerEmail = order.shippingAddress?.email || order.guestInfo?.email;
    const customerName = order.shippingAddress?.fullName || order.guestInfo?.name || "Customer";
    if (customerEmail) {
      await sendCustomerOrderStatusEmail({
        recipientEmail: customerEmail,
        recipientName: customerName,
        orderNumber: order.orderNumber,
        orderStatus: newStatus,
        items: order.items || [],
        subtotal: order.subtotal || 0,
        deliveryCharge: order.deliveryCharge || 0,
        discountAmount: order.discountAmount || 0,
        totalAmount: order.totalAmount || 0,
        paymentMethod: order.paymentMethod || "COD",
        shippingAddress: order.shippingAddress,
        note: formattedNote,
      });
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/account");

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update order status" };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const access = await getCurrentDashboardAccess();
    if (!access) {
      return { success: false, error: "Unauthorized access" };
    }

    if (!access.isSuperAdmin) {
      return { success: false, error: "Forbidden: Only Super Admin can delete orders" };
    }

    await connectToDatabase();
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return { success: false, error: "Order not found" };
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/account");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete order" };
  }
}

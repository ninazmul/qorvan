"use server";

import { connectToDatabase } from "@/lib/database";
import Order from "@/lib/database/models/order.model";
import Product from "@/lib/database/models/product.model";
import User from "@/lib/database/models/user.model";
import { requirePermission } from "@/lib/auth/rbac";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getPeriodStart(period: "7d" | "30d" | "90d" | "365d") {
  const daysByPeriod = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "365d": 365,
  };
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setTime(start.getTime() - (daysByPeriod[period] - 1) * DAY_IN_MS);
  return start;
}

export async function getDashboardStats() {
  await requirePermission("dashboard", "read");
  try {
    await connectToDatabase();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      revenueResult,
      todayRevenueResult,
      monthRevenueResult,
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      // Total Revenue
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Today's Sales
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday },
            orderStatus: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      // Monthly Sales
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            orderStatus: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      User.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "active" }),
      Product.countDocuments({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("customer", "name email")
        .lean(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const todaySales = todayRevenueResult[0]?.total || 0;
    const monthlySales = monthRevenueResult[0]?.total || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Monthly Chart Data (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyChartData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedChartData = monthlyChartData.map((item) => ({
      month: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`,
      sales: item.sales,
      orders: item.orders,
    }));

    return {
      success: true,
      data: {
        totalRevenue,
        todaySales,
        todayRevenue: todaySales,
        monthlySales,
        totalOrders,
        todayOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        activeCustomers: totalCustomers,
        averageOrderValue,
        totalProducts,
        lowStockProducts,
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
        chartData: formattedChartData,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch analytics statistics" };
  }
}

export async function getSalesAnalyticsReport(period: "7d" | "30d" | "90d" | "365d" = "30d") {
  await requirePermission("reports", "read");
  try {
    await connectToDatabase();

    const startDate = getPeriodStart(period);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const data = salesData.map((item) => ({
      month:
        period === "365d"
          ? `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`
          : `${MONTH_NAMES[item._id.month - 1]} ${item._id.day}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch sales analytics report" };
  }
}

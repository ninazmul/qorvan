import Link from "next/link";
import { requireDashboardAccess } from "@/lib/auth/rbac";
import { canAccessModule } from "@/lib/auth/rbac-rules";
import { getDashboardStats } from "@/lib/actions/analytics.actions";
import SalesChart from "@/components/dashboard/SalesChart";
import {
  DollarSign, ShoppingCart, ShoppingBag, Users, AlertTriangle,
  ArrowRight, Plus, Truck, Package, Layers, Sparkles, LayoutDashboard
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default async function DashboardOverviewPage() {
  const access = await requireDashboardAccess("/");


  const statsRes = await getDashboardStats();

  const stats = statsRes.success && statsRes.data ? statsRes.data : {
    totalRevenue: 0,
    todaySales: 0,
    monthlySales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    recentOrders: [],
    chartData: [],
  };

  const metricCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      sub: `${formatCurrency(stats.todaySales)} today`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Monthly Sales",
      value: formatCurrency(stats.monthlySales),
      sub: "This calendar month",
      icon: DollarSign,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      sub: `${stats.pendingOrders} pending fulfillment`,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Active Products",
      value: stats.totalProducts.toString(),
      sub: `${stats.lowStockProducts} low stock alerts`,
      icon: ShoppingBag,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Registered Customers",
      value: stats.totalCustomers.toString(),
      sub: "Active customer accounts",
      icon: Users,
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      label: "Low Stock Alert",
      value: stats.lowStockProducts.toString(),
      sub: "Items need restock",
      icon: AlertTriangle,
      color: stats.lowStockProducts > 0 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-gray-50 text-gray-700 border-gray-200",
    },
  ];

  const quickActions = [
    { label: "Add Product", href: "/dashboard/products", icon: Plus, module: "products" },
    { label: "View Orders", href: "/dashboard/orders", icon: ShoppingCart, module: "orders" },
    { label: "Inventory Control", href: "/dashboard/inventory", icon: Package, module: "inventory" },
    { label: "Delivery Charges", href: "/dashboard/delivery-zones", icon: Truck, module: "delivery-zones" },
    { label: "Categories", href: "/dashboard/categories", icon: Layers, module: "categories" },
    { label: "Collections", href: "/dashboard/collections", icon: Sparkles, module: "collections" },
  ] as const;

  return (
    <div className="space-y-8 pb-10 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-6 rounded-xl shadow-lg">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 tracking-wider uppercase">
            <LayoutDashboard className="w-4 h-4" />
            QORVAN Executive Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Welcome back, {access.name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Luxury E-Commerce sales performance & operations overview.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions.filter((act) => canAccessModule(access, act.module)).map((act) => {
                const Icon = act.icon;
                return (
                  <Link
                    key={act.href}
                    href={act.href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:border-amber-500 hover:text-amber-900 transition shadow-sm backdrop-blur-sm bg-white/70"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {act.label}
                  </Link>
                );
              })}

        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-gray-900 tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs font-medium text-gray-500 mt-1">
                  {card.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-amber-950/5 border border-amber-900/10 rounded-xl p-5 backdrop-filter backdrop-blur-lg bg-white/30">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950 mb-3">
          Management Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.href}
                href={act.href}
                className="bg-white border border-gray-200 hover:border-amber-600 rounded-lg p-3 flex items-center gap-3 transition shadow-sm group"
              >
                <div className="w-8 h-8 rounded-md bg-amber-50 group-hover:bg-amber-600 group-hover:text-white text-amber-700 flex items-center justify-center transition">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-amber-900 transition">
                  {act.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Customer Orders</h2>
            <p className="text-xs text-gray-500">Live order processing feed</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
          >
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-lg bg-white/50 backdrop-blur-sm">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No orders recorded yet.</p>
            <p className="text-xs text-gray-400 mt-1">Orders placed by customers will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-bold text-amber-900">{ord.orderNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {ord.shippingAddress?.fullName || ord.customer?.name || "Guest Customer"}
                      <div className="text-[10px] text-gray-400">{ord.shippingAddress?.city}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {ord.items?.length || 0} product(s)
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                        ord.orderStatus === "delivered" ? "bg-emerald-100 text-emerald-800" :
                        ord.orderStatus === "shipped" ? "bg-blue-100 text-blue-800" :
                        ord.orderStatus === "cancelled" ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/orders/${ord._id}`}
                        className="text-xs font-semibold text-amber-700 hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SalesChart data={stats.chartData} />
      </div>
    </div>
  );
}

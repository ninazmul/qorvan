import { requireDashboardAccess, getCurrentDashboardAccess } from "@/lib/auth/rbac";
import { getOrderById } from "@/lib/actions/order.actions";
import Link from "next/link";
import DashboardOrderDetailClient from "./DashboardOrderDetailClient";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardAccess("/");
  const access = await getCurrentDashboardAccess();
  const { id } = await params;
  const res = await getOrderById(id);

  if (!res.success || !res.data) {
    return (
      <div className="p-12 text-center space-y-3">
        <h1 className="text-xl font-bold text-rose-600">Order Not Found</h1>
        <p className="text-xs text-gray-500">The order reference requested does not exist.</p>
        <Link
          href="/dashboard/orders"
          className="inline-block py-2 px-4 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <DashboardOrderDetailClient
      initialOrder={res.data}
      isSuperAdmin={access?.isSuperAdmin || false}
    />
  );
}

import { requirePermission } from "@/lib/auth/rbac";
import { getOrders } from "@/lib/actions/order.actions";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersDashboardPage() {
  await requirePermission("orders", "read");
  const res = await getOrders({ limit: 100 });
  const orders = res.success ? res.data : [];

  return <OrdersClient initialOrders={orders} />;
}

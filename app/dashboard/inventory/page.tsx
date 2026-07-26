import { requirePermission } from "@/lib/auth/rbac";
import { getProducts } from "@/lib/actions/product.actions";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await requirePermission("inventory", "read");
  const res = await getProducts({ limit: 150, status: "all" });
  const products = res.success ? res.data : [];

  return <InventoryClient initialProducts={products} />;
}

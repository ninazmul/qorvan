import { requirePermission } from "@/lib/auth/rbac";
import { getProducts } from "@/lib/actions/product.actions";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage(props: any) {
  const { searchParams } = props;
  await requirePermission("inventory", "read");
  const page = typeof searchParams?.page === "string" ? parseInt(searchParams.page) : 1;
  const res = await getProducts({ limit: 20, page, status: "all" });
  const products = res.success ? res.data : [];

  return <InventoryClient initialProducts={products} currentPage={page} />;
}


import { getBrands } from "@/lib/actions/brand.actions";
import { requirePermission } from "@/lib/auth/rbac";
import BrandsClient from "./BrandsClient";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  await requirePermission("brands", "read");
  const res = await getBrands();
  const brands = res.success ? res.data : [];

  return <BrandsClient initialBrands={brands} />;
}

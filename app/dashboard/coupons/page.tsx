import { requirePermission } from "@/lib/auth/rbac";
import { getCoupons } from "@/lib/actions/coupon.actions";
import CouponsClient from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  await requirePermission("coupons", "read");
  const res = await getCoupons();
  const coupons = res.success ? res.data : [];

  return <CouponsClient initialCoupons={coupons} />;
}

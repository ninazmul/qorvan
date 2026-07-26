import { requirePermission } from "@/lib/auth/rbac";
import { getDeliveryZones } from "@/lib/actions/delivery.actions";
import DeliveryZonesClient from "./DeliveryZonesClient";

export const dynamic = "force-dynamic";

export default async function DeliveryZonesPage() {
  await requirePermission("delivery-zones", "read");
  const res = await getDeliveryZones();
  const zones = res.success ? res.data : [];

  return <DeliveryZonesClient initialZones={zones} />;
}

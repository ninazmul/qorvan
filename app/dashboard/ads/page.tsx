import { requireDashboardAccess } from "@/lib/auth/rbac";
import { getAdCampaigns } from "@/lib/actions/ad.actions";
import AdsClient from "./AdsClient";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  await requireDashboardAccess("/");
  const res = await getAdCampaigns();
  const initialCampaigns = res.success ? res.data : [];

  return <AdsClient initialCampaigns={initialCampaigns} />;
}

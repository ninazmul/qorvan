import { requireDashboardAccess } from "@/lib/auth/rbac";
import { getPixelConfig } from "@/lib/actions/pixel.actions";
import PixelClient from "./PixelClient";

export const dynamic = "force-dynamic";

export default async function PixelPage() {
  await requireDashboardAccess("/");
  const res = await getPixelConfig();
  const initialConfig = res.success ? res.data : {};

  return <PixelClient initialConfig={initialConfig} />;
}

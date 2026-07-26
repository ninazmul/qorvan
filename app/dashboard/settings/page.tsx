import { getSetting } from "@/lib/actions/setting.actions";
import { requirePermission } from "@/lib/auth/rbac";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsDashboardPage() {
  const access = await requirePermission("settings", "read");
  const result = await getSetting();
  const setting = result || ({} as any);

  return <SettingsClient initialSettings={setting} access={access} />;
}

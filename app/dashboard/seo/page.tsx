import { requireDashboardAccess } from "@/lib/auth/rbac";
import { getAllSeoPages } from "@/lib/actions/seo.actions";
import SeoClient from "./SeoClient";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  await requireDashboardAccess("/");
  const res = await getAllSeoPages();
  const initialPages = res.success ? res.data : [];

  return <SeoClient initialPages={initialPages} />;
}

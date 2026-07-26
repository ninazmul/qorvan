import { requirePermission } from "@/lib/auth/rbac";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requirePermission("reports", "read");
  return <ReportsClient />;
}

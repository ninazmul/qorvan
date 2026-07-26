import { requirePermission } from "@/lib/auth/rbac";
import { getReturnRequests } from "@/lib/actions/return.actions";
import ReturnRequestsClient from "./ReturnRequestsClient";

export const dynamic = "force-dynamic";

export default async function ReturnRequestsPage() {
  await requirePermission("return-requests", "read");
  const res = await getReturnRequests();
  const requests = res.success ? res.data : [];

  return <ReturnRequestsClient initialRequests={requests} />;
}

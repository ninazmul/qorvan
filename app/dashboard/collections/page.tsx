import { requirePermission } from "@/lib/auth/rbac";
import { getCollections } from "@/lib/actions/collection.actions";
import CollectionsClient from "./CollectionsClient";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  await requirePermission("collections", "read");
  const res = await getCollections();
  const collections = res.success ? res.data : [];

  return <CollectionsClient initialCollections={collections} />;
}

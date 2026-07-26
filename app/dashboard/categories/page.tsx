import { requirePermission } from "@/lib/auth/rbac";
import { getCategories } from "@/lib/actions/category.actions";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requirePermission("categories", "read");
  const res = await getCategories();
  const categories = res.success ? res.data : [];

  return <CategoriesClient initialCategories={categories} />;
}

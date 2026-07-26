import { requirePermission } from "@/lib/auth/rbac";
import { getProducts } from "@/lib/actions/product.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { getCollections } from "@/lib/actions/collection.actions";
import { getBrands } from "@/lib/actions/brand.actions";
import ProductManagerClient from "./ProductManagerClient";

export const dynamic = "force-dynamic";

export default async function ProductsDashboardPage() {
  await requirePermission("products", "read");

  const [productsRes, categoriesRes, collectionsRes, brandsRes] = await Promise.all([
    getProducts({ limit: 100, status: "all" }),
    getCategories(),
    getCollections(),
    getBrands(),
  ]);

  const products = productsRes.success ? productsRes.data : [];
  const categories = categoriesRes.success ? categoriesRes.data : [];
  const collections = collectionsRes.success ? collectionsRes.data : [];
  const brands = brandsRes.success ? brandsRes.data : [];

  return (
    <ProductManagerClient
      initialProducts={products}
      categories={categories}
      collections={collections}
      brands={brands}
    />
  );
}

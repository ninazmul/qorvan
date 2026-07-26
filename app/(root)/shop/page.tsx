import { getProducts } from "@/lib/actions/product.actions";
import { getCategories } from "@/lib/actions/category.actions";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string; sort?: any; minPrice?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const [productsRes, categoriesRes] = await Promise.all([
    getProducts({
      category: params.category,
      query: params.query,
      sort: params.sort,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      limit: 40,
    }),
    getCategories(),
  ]);

  let products = productsRes.success ? productsRes.data : [];
  let categories = categoriesRes.success ? categoriesRes.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-amber-950 text-amber-50 p-8 sm:p-12 rounded-3xl border border-amber-900/50 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            QORVAN Luxury Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">
            {params.category ? params.category.replace("-", " ").toUpperCase() : "Catalog Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
            Handcrafted luxury ties, wallets, belts, bags, formal shirts, and abayas tailored to perfection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 border-b pb-2 flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-700" /> Categories
            </h3>

            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/shop"
                  className={`block py-1 px-2 rounded ${
                    !params.category ? "bg-amber-950 text-amber-300 font-bold" : "text-gray-700 hover:text-amber-800"
                  }`}
                >
                  All Products
                </Link>
              </li>
              {categories.map((c: any) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className={`block py-1 px-2 rounded ${
                      params.category === c.slug
                        ? "bg-amber-950 text-amber-300 font-bold"
                        : "text-gray-700 hover:text-amber-800"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-xs font-semibold">
            <span className="text-gray-600">Showing {products.length} Luxury Items</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Sort by:</span>
              <select
                className="bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-xs"
                defaultValue={params.sort || "newest"}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 space-y-3">
              <p className="text-sm font-bold text-gray-700">No products found in this category.</p>
              <Link href="/shop" className="inline-block text-xs font-bold text-amber-800 underline">
                Reset Filter
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

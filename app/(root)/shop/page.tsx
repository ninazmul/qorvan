import { Metadata } from "next";
import { getProducts } from "@/lib/actions/product.actions";
import { getCategories } from "@/lib/actions/category.actions";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string; sort?: any; minPrice?: string; maxPrice?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  let title = "Luxury Catalog & Collections | QORVAN Bangladesh";
  if (params.category) {
    const formattedCat = params.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${formattedCat} - Luxury Collection | QORVAN`;
  } else if (params.query) {
    title = `Search: "${params.query}" - Product Catalog | QORVAN`;
  }

  const description =
    "Browse QORVAN's luxury catalog offering Italian silk tie sets, full-grain executive leather wallets, belts, premium bags, formal shirts, and royal abayas with Cash on Delivery in Bangladesh.";

  const canonical = params.category
    ? `${baseUrl}/shop?category=${encodeURIComponent(params.category)}`
    : `${baseUrl}/shop`;

  return {
    title,
    description,
    keywords: ["QORVAN Shop", "Luxury Menswear Bangladesh", "Full-grain leather wallet online", "Italian tie set", "Executive belt BD"],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "QORVAN",
      images: [
        {
          url: `${baseUrl}/assets/images/og-cover.webp`,
          width: 1200,
          height: 630,
          alt: "QORVAN Luxury Collection Catalog",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/assets/images/og-cover.webp`],
    },
  };
}

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.category ? `QORVAN ${params.category.replace("-", " ").toUpperCase()} Collection` : "QORVAN Luxury Product Catalog",
    url: `${baseUrl}/shop`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${baseUrl}/product/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${baseUrl}/shop`,
      },
      ...(params.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: params.category.replace("-", " ").toUpperCase(),
              item: `${baseUrl}/shop?category=${params.category}`,
            },
          ]
        : []),
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Top Banner Header */}
      <div className="bg-black text-white p-8 sm:p-12 rounded-3xl border border-gray-200 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-300">
            QORVAN Luxury Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">
            {params.category ? params.category.replace("-", " ").toUpperCase() : "Catalog Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Handcrafted luxury ties, wallets, belts, bags, formal shirts, and abayas tailored to perfection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b pb-2 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-700" /> Categories
            </h3>

            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/shop"
                  className={`block py-1 px-2 rounded ${!params.category ? "bg-gray-200 text-black font-bold" : "text-gray-700 hover:text-gray-800"
                    }`}
                >
                  All Products
                </Link>
              </li>
              {categories.map((c: any) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className={`block py-1 px-2 rounded ${params.category === c.slug
                      ? "bg-gray-200 text-black font-bold"
                      : "text-gray-700 hover:text-gray-800"
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
              <Link href="/shop" className="inline-block text-xs font-bold text-gray-800 underline">
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

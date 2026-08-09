import { Metadata } from "next";
import { getProducts } from "@/lib/actions/product.actions";
import { getCategories } from "@/lib/actions/category.actions";
import ShopClient from "@/components/storefront/ShopClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    query?: string;
    sort?: any;
    minPrice?: string;
    maxPrice?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  let title = "Luxury Catalog & Collections | QORVAN Bangladesh";
  if (params.category) {
    const formattedCat = params.category
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
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
    keywords: [
      "QORVAN Shop",
      "Luxury Menswear Bangladesh",
      "Full-grain leather wallet online",
      "Italian tie set",
      "Executive belt BD",
    ],
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
  searchParams: Promise<{
    category?: string;
    query?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;

  // Fetch initial catalog dataset efficiently in parallel
  const [productsRes, categoriesRes] = await Promise.all([
    getProducts({
      limit: 100, // Fetch catalog items for instant client-side interactions
    }),
    getCategories(),
  ]);

  const products = productsRes.success ? productsRes.data : [];
  const categories = categoriesRes.success ? categoriesRes.data : [];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.category
      ? `QORVAN ${params.category.replace("-", " ").toUpperCase()} Collection`
      : "QORVAN Luxury Product Catalog",
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ShopClient
          initialProducts={products}
          categories={categories}
          initialParams={params}
        />
      </div>
    </>
  );
}

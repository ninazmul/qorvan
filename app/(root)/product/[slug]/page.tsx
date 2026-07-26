import { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/product.actions";
import { getReviewsByProduct } from "@/lib/actions/review.actions";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import Script from "next/script";

export const dynamic = "force-dynamic";

// ─── Dynamic SEO Metadata ─────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getProductBySlug(slug);

  if (!res.success || !res.data) {
    return { title: "Product Not Found | QORVAN" };
  }

  const p = res.data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  return {
    title: p.seo?.title || `${p.title} | QORVAN`,
    description:
      p.seo?.description || p.shortDescription || p.description?.slice(0, 160),
    keywords: p.seo?.keywords || p.tags || [],
    openGraph: {
      title: p.seo?.title || p.title,
      description:
        p.seo?.description || p.shortDescription || p.description?.slice(0, 160),
      url: `${baseUrl}/product/${p.slug}`,
      images: p.featuredImage
        ? [{ url: p.featuredImage, width: 800, height: 800, alt: p.title }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: p.seo?.title || p.title,
      description:
        p.seo?.description || p.shortDescription || p.description?.slice(0, 160),
      images: p.featuredImage ? [p.featuredImage] : [],
    },
  };
}

// ─── Product Detail Page ──────────────────────────────────────
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await getProductBySlug(slug);

  if (!res.success || !res.data) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold font-serif text-gray-900">Product Not Found</h1>
        <p className="text-xs text-gray-500">The luxury item you are looking for is unavailable.</p>
        <Link href="/shop" className="inline-block text-xs font-bold text-gray-800 underline">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const product = res.data;
  const [relatedRes, reviewsRes] = await Promise.all([
    getRelatedProducts(product.category?._id || product.category, product._id),
    getReviewsByProduct(product._id),
  ]);

  const related = relatedRes.success ? relatedRes.data : [];
  const reviews = reviewsRes.success ? reviewsRes.data : [];

  // ─── JSON-LD Structured Data ─────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription || product.description?.slice(0, 300),
    image: product.images?.length
      ? product.images
      : product.featuredImage
      ? [product.featuredImage]
      : [],
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || "QORVAN",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: "BDT",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "QORVAN",
      },
    },
    ...(product.ratings?.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratings.average,
        reviewCount: product.ratings.count,
      },
    }),
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
      ...(product.category?.name
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${baseUrl}/shop?category=${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category?.name ? 4 : 3,
        name: product.title,
        item: `${baseUrl}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={related} reviews={reviews} />
    </>
  );
}


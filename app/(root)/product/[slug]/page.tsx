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

  const title = p.seoTitle || p.seo?.title || `${p.title} - Buy Online in Bangladesh | QORVAN Luxury`;
  const description =
    p.seoDescription ||
    p.seo?.description ||
    p.shortDescription ||
    `${p.title} - Handcrafted luxury item at ৳${p.price?.toLocaleString()}. Cash on Delivery available across Bangladesh. Buy authentic QORVAN fashion online.`;
  
  const keywords = p.seoKeywords?.length
    ? p.seoKeywords
    : p.seo?.keywords || [
        p.title,
        p.category?.name || "Luxury Fashion",
        "QORVAN",
        "Buy online Bangladesh",
        "Cash on Delivery fashion",
        ...(p.tags || []),
      ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: p.canonicalUrl || `${baseUrl}/product/${p.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/product/${p.slug}`,
      siteName: "QORVAN",
      images: p.featuredImage
        ? [{ url: p.featuredImage, width: 1200, height: 1200, alt: p.title }]
        : [{ url: `${baseUrl}/assets/images/og-cover.webp`, width: 1200, height: 630, alt: p.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: p.featuredImage ? [p.featuredImage] : [`${baseUrl}/assets/images/og-cover.webp`],
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

  const productJsonLd: Record<string, any> = {
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
    mpn: product.sku || product._id,
    category: product.category?.name || "Luxury Fashion",
    brand: {
      "@type": "Brand",
      name: product.brand?.name || "QORVAN",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: "BDT",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "QORVAN",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "BD",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(product.ratings?.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratings.average,
        reviewCount: product.ratings.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 5).map((r: any) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: r.authorName || "Customer",
        },
        datePublished: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
        reviewBody: r.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating || 5,
          bestRating: 5,
          worstRating: 1,
        },
      })),
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



import { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/actions/product.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { getHeroSlides } from "@/lib/actions/hero.actions";
import { getApprovedReviews, getProductsForReview } from "@/lib/actions/review.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import ProductCard from "@/components/storefront/ProductCard";
import TestimonialsSection from "@/components/storefront/TestimonialsSection";
import { ShieldCheck, ArrowRight, Sparkles, Star, Award, Crown, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSetting();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  const title = setting?.seo?.siteTitle || "QORVAN | Luxury Fashion & Leather Goods";
  const description =
    setting?.seo?.siteMetaDescription ||
    "Discover QORVAN masterwork Italian silk tie sets, full-grain executive leather wallets, belts, premium bags, formal shirts, and royal abayas.";
  const keywords = setting?.seo?.siteKeywords?.length
    ? setting.seo.siteKeywords
    : [
        "QORVAN",
        "Luxury Fashion Bangladesh",
        "Italian Silk Tie Sets",
        "Full-Grain Leather Wallet",
        "Executive Leather Belt",
        "Premium Bags",
        "Formal Shirts",
        "Royal Abayas",
      ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "QORVAN",
      images: [
        {
          url: setting?.seo?.ogImage || `${baseUrl}/assets/images/og-cover.webp`,
          width: 1200,
          height: 630,
          alt: "QORVAN Luxury Fashion",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [setting?.seo?.twitterCardImage || `${baseUrl}/assets/images/og-cover.webp`],
    },
  };
}

export default async function HomePage() {
  const [productsRes, categoriesRes, heroSlidesRes, reviewsRes, reviewProductsRes] = await Promise.all([
    getProducts({ limit: 12 }),
    getCategories(),
    getHeroSlides({ enabled: true }),
    getApprovedReviews(12),
    getProductsForReview(),
  ]);

  let products = productsRes.success ? productsRes.data : [];
  let categories = categoriesRes.success ? categoriesRes.data : [];
  const heroSlide = heroSlidesRes.success && heroSlidesRes.data?.length ? heroSlidesRes.data[0] : null;
  const approvedReviews = reviewsRes.success ? reviewsRes.data : [];
  const reviewProducts = reviewProductsRes.success ? reviewProductsRes.data : [];
  const heroTitle = heroSlide?.title || "The Pinnacle of Luxury & Elegance";
  const heroSubtitle =
    heroSlide?.subtitle ||
    "Explore QORVAN's masterwork of Italian silk tie sets, full-grain executive leather goods, bespoke formal tailoring, and royal haute couture.";
  const heroImage =
    heroSlide?.backgroundImage ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600";
  const heroButtonText = heroSlide?.buttonText || "Shop Collection";
  const heroButtonUrl = heroSlide?.buttonUrl || "/shop";

  // Seed sample luxury products if database has no products yet
  if (products.length === 0) {
    products = [
      {
        _id: "demo-1",
        title: "Royal Italian Silk Tie & Cufflink Set",
        slug: "royal-italian-silk-tie-set",
        price: 3850,
        compareAtPrice: 4500,
        featuredImage: "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800",
        sku: "QRV-TIE-01",
        stock: 12,
        isFeatured: true,
        isBestSeller: true,
        category: { name: "Premium Tie Sets", slug: "tie-sets" },
        ratings: { average: 5.0, count: 18 },
      },
      {
        _id: "demo-2",
        title: "Handcrafted Bifold Full-Grain Leather Wallet",
        slug: "handcrafted-leather-wallet",
        price: 2950,
        compareAtPrice: 3500,
        featuredImage: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
        sku: "QRV-WLT-02",
        stock: 8,
        isFeatured: true,
        isTrending: true,
        category: { name: "Leather Wallets", slug: "leather-wallets" },
        ratings: { average: 4.9, count: 24 },
      },
      {
        _id: "demo-3",
        title: "Executive Full-Grain Leather Belt (Gold Buckle)",
        slug: "executive-leather-belt",
        price: 3200,
        compareAtPrice: 3800,
        featuredImage: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800",
        sku: "QRV-BLT-03",
        stock: 15,
        isFeatured: true,
        category: { name: "Leather Belts", slug: "leather-belts" },
        ratings: { average: 5.0, count: 12 },
      },
      {
        _id: "demo-4",
        title: "Presidential Briefcase Leather Bag",
        slug: "presidential-briefcase-leather-bag",
        price: 12500,
        compareAtPrice: 15000,
        featuredImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
        sku: "QRV-BAG-04",
        stock: 5,
        isFeatured: true,
        isBestSeller: true,
        category: { name: "Bags", slug: "bags" },
        ratings: { average: 5.0, count: 32 },
      },
      {
        _id: "demo-5",
        title: "Royal Egyptian Cotton Formal Shirt (White)",
        slug: "royal-egyptian-cotton-formal-shirt",
        price: 4200,
        compareAtPrice: 4800,
        featuredImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
        sku: "QRV-SHIRT-05",
        stock: 20,
        isNewArrival: true,
        category: { name: "Formal Shirts", slug: "formal-shirts" },
        ratings: { average: 4.8, count: 9 },
      },
      {
        _id: "demo-6",
        title: "Embellished Velvet Royal Abaya",
        slug: "embellished-velvet-royal-abaya",
        price: 8900,
        compareAtPrice: 10500,
        featuredImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
        sku: "QRV-ABY-06",
        stock: 7,
        isFeatured: true,
        isTrending: true,
        category: { name: "Burkas / Abayas", slug: "burkas-abayas" },
        ratings: { average: 5.0, count: 41 },
      },
    ];
  }

  const defaultCategories = [
    { name: "Premium Tie Sets", slug: "tie-sets", image: "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800" },
    { name: "Leather Wallets", slug: "leather-wallets", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800" },
    { name: "Leather Belts", slug: "leather-belts", image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800" },
    { name: "Executive Bags", slug: "bags", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800" },
    { name: "Formal Shirts", slug: "formal-shirts", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800" },
    { name: "Burkas / Abayas", slug: "burkas-abayas", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800" },
  ];

  const catList = categories.length > 0 ? categories : defaultCategories;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";
  const homepageItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "QORVAN Featured Luxury Products",
    itemListElement: products.slice(0, 8).map((p: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${baseUrl}/product/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageItemListJsonLd) }}
      />
      <div className="space-y-20 pb-20">
        {/* Hero Banner Section */}
      <section className="relative bg-black text-white overflow-hidden border-b border-zinc-200">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="QORVAN Luxury Fashion"
            className="w-full h-full object-cover opacity-30 filter contrast-125 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 flex flex-col justify-center min-h-[600px]">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Crown className="w-3.5 h-3.5 text-white" /> Handcrafted Atelier Collection
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-serif tracking-tight leading-tight text-white">
              {heroTitle.includes("&") ? heroTitle.split("&")[0].trim() : heroTitle} <br />
              <span className="text-white underline decoration-zinc-500 underline-offset-8">
                {heroTitle.includes("&") ? `& ${heroTitle.split("&").slice(1).join("&").trim()}` : "Luxury & Elegance"}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href={heroButtonUrl}
                className="px-8 py-4 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition shadow-xl flex items-center gap-2"
              >
                {heroButtonText} <ArrowRight className="w-4 h-4 text-black" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 border border-zinc-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg hover:bg-white/10 transition"
              >
                Discover Craftsmanship
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-zinc-500">
            Curated Categories
          </span>
          <h2 className="text-3xl font-extrabold font-serif text-black">
            Signature Products
          </h2>
          <div className="w-12 h-0.5 bg-black mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {catList.map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] border border-zinc-200 shadow-sm hover:shadow-xl hover:border-black transition"
            >
              <img
                src={cat.image || "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800"}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-3 right-3 text-center">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider group-hover:text-zinc-300 transition">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Luxury Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-4 border-zinc-200">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-zinc-500">
              QORVAN Essentials
            </span>
            <h2 className="text-3xl font-extrabold font-serif text-black mt-1">
              Featured Luxury Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-extrabold uppercase tracking-widest text-black hover:underline inline-flex items-center gap-1 mt-2 sm:mt-0"
          >
            View Entire Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Heritage & Brand Story Section */}
      <section className="bg-black text-white py-20 border-y border-zinc-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-zinc-400">
              The Atelier Legacy
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white leading-tight">
              Uncompromising Quality & Handcrafted Luxury
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed font-light">
              Every QORVAN piece represents hours of dedicated craftsmanship by master artisans. From selecting full-grain leathers to sourcing 100% pure silk and Egyptian long-staple cotton, our commitment to perfection defines executive luxury.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
              <div>
                <div className="text-2xl font-bold text-white font-serif">100%</div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Full-Grain Leather</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-serif">Pure</div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Italian Silk</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-serif">COD</div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider">All Bangladesh</div>
              </div>
            </div>
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000"
              alt="Craftsmanship QORVAN"
              className="w-full h-full object-cover filter contrast-110 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Customer Testimonials + Review Form */}
      <TestimonialsSection reviews={approvedReviews} products={reviewProducts} />
    </div>
  </>
  );
}

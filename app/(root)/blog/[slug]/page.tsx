import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogPostBySlug } from "@/lib/actions/blog.actions";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  Bookmark,
  ArrowRight,
  Check,
} from "lucide-react";

export const revalidate = 60; // Revalidate post page every 60s

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getBlogPostBySlug(slug);

  if (!res.success || !res.data) {
    return {
      title: "Article Not Found | QORVAN",
      description: "The requested editorial article could not be found.",
    };
  }

  const post = res.data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";
  const pageTitle = post.seoTitle || `${post.title} | QORVAN Journal`;
  const pageDescription = post.seoDescription || post.excerpt;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: post.seoKeywords?.length ? post.seoKeywords : post.tags || ["QORVAN Journal", "Luxury Fashion", "Style Guide"],
    alternates: {
      canonical: post.canonicalUrl || `${baseUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "article",
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt,
      authors: [post.author || "QORVAN Editorial"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [post.featuredImage],
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const res = await getBlogPostBySlug(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const post = res.data;
  const relatedPosts = res.related || [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qorvan.com";

  // JSON-LD Structured Data for Google Article Schema
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: [post.featuredImage],
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: {
      "@type": "Person",
      name: post.author || "QORVAN Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: "QORVAN",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/assets/images/og-cover.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`,
    },
    articleSection: post.category || "Fashion & Style",
    keywords: post.tags?.join(", ") || "",
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
        name: "Journal",
        item: `${baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${baseUrl}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <article className="min-h-screen bg-white text-black pb-24">
      {/* Inject JSON-LD for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Header Bar */}
      <div className="bg-gray-50 border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <Link href="/" className="hover:text-black transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-black transition">
              Journal
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate">{post.title}</span>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 font-bold text-black hover:underline shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Journal
          </Link>
        </div>
      </div>

      {/* Article Header Container */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="bg-black text-white text-[11px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-xs">
            {post.category || "Fashion & Style"}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight max-w-3xl mx-auto">
          {post.title}
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed italic">
          "{post.excerpt}"
        </p>

        {/* Meta Bar */}
        <div className="pt-4 border-t border-b border-gray-100 py-4 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs uppercase shadow-xs">
              {post.author?.charAt(0) || "Q"}
            </div>
            <span className="font-bold text-gray-900">{post.author || "QORVAN Editorial"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Published"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{post.readingTime || "4 min read"}</span>
          </div>
        </div>
      </header>

      {/* Featured Header Banner Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-100">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            unoptimized
            priority
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Main Article Body Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-sans space-y-6 text-sm sm:text-base border-b border-gray-200 pb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags List */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 pb-8 border-b border-gray-200 flex items-center flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-2">
              Tags:
            </span>
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/blog?search=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-full transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Share Section */}
        <div className="py-8 flex items-center justify-between border-b border-gray-200">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Share this story
          </span>
          <div className="flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://qorvan.com/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              X / Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://qorvan.com/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=https://qorvan.com/blog/${post.slug}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Related Stories Section */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="border-t border-gray-200 pt-12">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8 text-center">
              More Stories from {post.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((rel: any) => (
                <article
                  key={rel._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition group"
                >
                  <Link href={`/blog/${rel.slug}`} className="relative aspect-[16/10] overflow-hidden bg-gray-100 block">
                    <Image
                      src={rel.featuredImage}
                      alt={rel.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      {rel.category}
                    </span>
                    <h4 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-black">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-gray-500">{rel.readingTime || "4 min read"}</span>
                      <Link
                        href={`/blog/${rel.slug}`}
                        className="font-bold text-black hover:underline inline-flex items-center gap-1 text-xs"
                      >
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

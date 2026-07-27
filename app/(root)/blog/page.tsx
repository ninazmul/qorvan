import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/actions/blog.actions";
import { ArrowRight, Clock, Tag, User, Search, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Editorial Journal & Style Guides | QORVAN Luxury Fashion",
  description:
    "Explore the QORVAN Editorial Journal for the latest insights in luxury menswear, bespoke craftsmanship, seasonal style guides, and haute couture trends.",
  openGraph: {
    title: "Editorial Journal & Style Guides | QORVAN Luxury Fashion",
    description:
      "Explore the QORVAN Editorial Journal for the latest insights in luxury menswear, bespoke craftsmanship, seasonal style guides, and haute couture trends.",
    type: "website",
  },
};

export const revalidate = 60; // Revalidate every 60s

export default async function BlogIndexPage(props: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeCategory = searchParams.category || "All";
  const searchQuery = searchParams.search || "";

  const response = await getBlogPosts({
    category: activeCategory !== "All" ? activeCategory : undefined,
    search: searchQuery || undefined,
  });

  const posts = response.success && response.data ? response.data : [];
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.length > 1 ? posts.slice(1) : posts;

  const categories = [
    "All",
    "Fashion & Style",
    "Luxury Living",
    "Craftsmanship",
    "Editorial & Trends",
    "Style Guides",
  ];

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      {/* Journal Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full inline-block shadow-xs">
            The QORVAN Journal
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Style, Heritage & Elegance
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Curated articles on bespoke craftsmanship, sartorial elegance, seasonal wardrobe guides, and luxury lifestyle.
          </p>

          {/* Search Bar */}
          <form className="max-w-md mx-auto mt-6 flex gap-2" action="/blog" method="GET">
            {activeCategory !== "All" && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search journal articles..."
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black bg-white shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-800 transition shadow-xs"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Category Pills Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 border-b border-gray-100 scrollbar-none justify-center">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const queryParams = new URLSearchParams();
            if (cat !== "All") queryParams.set("category", cat);
            if (searchQuery) queryParams.set("search", searchQuery);
            const href = `/blog${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

            return (
              <Link
                key={cat}
                href={href}
                className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
                  isActive
                    ? "bg-black text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Featured Article Banner (If Available) */}
        {featuredPost && !searchQuery && activeCategory === "All" && (
          <div className="mb-16">
            <div className="relative bg-black text-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 group">
              <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[440px]">
                <Image
                  src={featuredPost.featuredImage}
                  alt={featuredPost.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:hidden" />
              </div>
              <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-white/20">
                      Featured Story
                    </span>
                    <span className="text-xs text-gray-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readingTime || "4 min read"}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug group-hover:text-gray-200 transition">
                    <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 mt-3 line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {featuredPost.author?.charAt(0) || "Q"}
                    </div>
                    <span className="text-xs font-semibold text-gray-300">
                      {featuredPost.author || "QORVAN Editorial"}
                    </span>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline uppercase tracking-wider"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Grid Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Articles"}
          </h3>
          <span className="text-xs text-gray-500 font-semibold">
            Showing {posts.length} {posts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {/* Grid of Articles */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-900">No Articles Found</h4>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              We couldn't find any articles matching your search criteria.
            </p>
            <Link
              href="/blog"
              className="inline-block px-5 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition"
            >
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <article
                key={post._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition duration-300 flex flex-col group"
              >
                <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-gray-100 block">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md">
                      {post.category || "Editorial"}
                    </span>
                  </div>
                </Link>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readingTime || "4 min read"}
                      </span>
                      <span>•</span>
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently Published"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition line-clamp-2 leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">
                      {post.author || "QORVAN Editorial"}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-black hover:translate-x-1 transition-transform uppercase tracking-wider"
                    >
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

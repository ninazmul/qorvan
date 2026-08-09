"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductCard from "@/components/storefront/ProductCard";
import { Filter, Search, X, SlidersHorizontal, ArrowUpDown, RotateCcw } from "lucide-react";

interface ShopClientProps {
  initialProducts: any[];
  categories: any[];
  initialParams: {
    category?: string;
    query?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default function ShopClient({
  initialProducts,
  categories,
  initialParams,
}: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for instant responsive interactions
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialParams.category || ""
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    initialParams.query || ""
  );
  const [sortOption, setSortOption] = useState<string>(
    initialParams.sort || "newest"
  );
  const [minPrice, setMinPrice] = useState<string>(
    initialParams.minPrice || ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialParams.maxPrice || ""
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL searchParams change externally
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("query") || "");
    setSortOption(searchParams.get("sort") || "newest");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Sync URL in background without blocking UI
  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      const newQuery = params.toString();
      router.push(newQuery ? `${pathname}?${newQuery}` : pathname, {
        scroll: false,
      });
    });
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    updateUrlParams({ category: slug || null });
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    updateUrlParams({ sort: newSort === "newest" ? null : newSort });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams({ query: val.trim() || null });
  };

  const handlePriceFilter = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateUrlParams({
      minPrice: min || null,
      maxPrice: max || null,
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSortOption("newest");
    setMinPrice("");
    setMaxPrice("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // Instant client-side memoized filtering & sorting (0ms delay)
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Category if selected
    if (selectedCategory) {
      result = result.filter((p) => {
        const catSlug =
          typeof p.category === "object" ? p.category?.slug : p.category;
        return catSlug === selectedCategory;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const skuMatch = p.sku?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const categoryName =
          typeof p.category === "object" ? p.category?.name?.toLowerCase() : "";
        return titleMatch || skuMatch || descMatch || categoryName?.includes(q);
      });
    }

    // Filter by Price Range
    const minP = parseFloat(minPrice);
    const maxP = parseFloat(maxPrice);
    if (!isNaN(minP)) {
      result = result.filter((p) => p.price >= minP);
    }
    if (!isNaN(maxP)) {
      result = result.filter((p) => p.price <= maxP);
    }

    // Sort Products
    if (sortOption === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating") {
      result.sort(
        (a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0)
      );
    } else if (sortOption === "popular") {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else {
      // Default: newest
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [initialProducts, selectedCategory, searchQuery, sortOption, minPrice, maxPrice]);

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (sortOption !== "newest" ? 1 : 0);

  const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-black text-white p-8 sm:p-12 rounded-3xl border border-zinc-800 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-zinc-400">
            QORVAN Luxury Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">
            {selectedCategoryObj
              ? selectedCategoryObj.name
              : selectedCategory
              ? selectedCategory.replace(/-/g, " ").toUpperCase()
              : "Catalog Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Handcrafted luxury ties, wallets, belts, bags, formal shirts, and abayas tailored to perfection.
          </p>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="flex lg:hidden items-center justify-between gap-3">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 py-3 px-4 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters &amp; Categories
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters (Desktop & Collapsible Mobile Overlay) */}
        <aside
          className={`space-y-6 lg:block ${
            mobileFilterOpen
              ? "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex justify-end"
              : "hidden"
          }`}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className={`space-y-6 ${
              mobileFilterOpen
                ? "bg-white text-black w-full max-w-xs h-full p-6 overflow-y-auto rounded-3xl shadow-2xl"
                : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {mobileFilterOpen && (
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold uppercase tracking-wider text-sm">
                  Filter Catalog
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 hover:bg-zinc-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Live Search Input */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-zinc-500" /> Search Catalog
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search ties, wallets..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs bg-zinc-50 border border-zinc-300 rounded-xl text-gray-900 focus:outline-none focus:border-black font-medium transition"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                <Filter className="w-4 h-4 text-zinc-500" /> Categories
              </h3>

              <ul className="space-y-1 text-xs font-medium">
                <li>
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`w-full text-left py-2 px-3 rounded-xl transition flex items-center justify-between ${
                      !selectedCategory
                        ? "bg-black text-white font-bold"
                        : "text-gray-700 hover:bg-zinc-100"
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-[10px] opacity-70">({initialProducts.length})</span>
                  </button>
                </li>
                {categories.map((c: any) => {
                  const count = initialProducts.filter(
                    (p) =>
                      (typeof p.category === "object" ? p.category?.slug : p.category) ===
                      c.slug
                  ).length;

                  return (
                    <li key={c.slug}>
                      <button
                        onClick={() => handleCategoryChange(c.slug)}
                        className={`w-full text-left py-2 px-3 rounded-xl transition flex items-center justify-between ${
                          selectedCategory === c.slug
                            ? "bg-black text-white font-bold"
                            : "text-gray-700 hover:bg-zinc-100"
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {count > 0 && (
                          <span className="text-[10px] opacity-70 ml-2 font-mono">
                            ({count})
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                Price Range (৳)
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1">
                    MIN
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceFilter(e.target.value, maxPrice)}
                    placeholder="0"
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:outline-none focus:border-black font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1">
                    MAX
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handlePriceFilter(minPrice, e.target.value)}
                    placeholder="10000"
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:outline-none focus:border-black font-mono"
                  />
                </div>
              </div>

              {/* Price Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: "Under ৳1k", min: "", max: "1000" },
                  { label: "৳1k - ৳3k", min: "1000", max: "3000" },
                  { label: "৳3k+", min: "3000", max: "" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePriceFilter(preset.min, preset.max)}
                    className="text-[10px] font-bold px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white rounded-md text-zinc-700 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset All Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 text-xs font-bold text-gray-700 border border-zinc-300 rounded-xl hover:bg-zinc-100 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products Display Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-extrabold">
                Showing {filteredProducts.length} Item{filteredProducts.length !== 1 ? "s" : ""}
              </span>
              {isPending && (
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin ml-1" />
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 outline-none text-xs font-bold text-gray-900 cursor-pointer focus:border-black transition"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Best Sellers</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs">
              <span className="font-extrabold text-zinc-500 uppercase tracking-wider text-[10px]">
                Active Filters:
              </span>
              {selectedCategory && (
                <span className="bg-black text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold">
                  Cat: {selectedCategory}
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() => handleCategoryChange("")}
                  />
                </span>
              )}
              {searchQuery && (
                <span className="bg-black text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold">
                  "{searchQuery}"
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() => handleSearchChange("")}
                  />
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="bg-black text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold">
                  ৳{minPrice || "0"} - ৳{maxPrice || "∞"}
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() => handlePriceFilter("", "")}
                  />
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-zinc-600 hover:text-black underline ml-auto"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300 space-y-4">
              <Filter className="w-12 h-12 text-zinc-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-base font-bold text-gray-900">
                  No products matched your criteria
                </p>
                <p className="text-xs text-zinc-400">
                  Try clearing your filters or searching for something else.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="inline-block py-2.5 px-5 bg-black text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition shadow"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

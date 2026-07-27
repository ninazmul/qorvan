"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Newspaper,
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  Tag,
  BookOpen,
} from "lucide-react";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "@/lib/actions/blog.actions";
import { toast } from "react-hot-toast";
import ImageUploader from "@/components/shared/ImageUploader";
import Link from "next/link";

interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  readingTime?: string;
  isPublished: boolean;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
}

const CATEGORIES = [
  "Fashion & Style",
  "Luxury Living",
  "Craftsmanship",
  "Editorial & Trends",
  "Style Guides",
  "Product Spotlights",
];

const emptyFormData = {
  title: "",
  slug: "",
  category: "Fashion & Style",
  author: "QORVAN Editorial",
  readingTime: "",
  featuredImage: "",
  excerpt: "",
  content: "",
  tagsString: "",
  isPublished: true,
  seoTitle: "",
  seoDescription: "",
  seoKeywordsString: "",
  canonicalUrl: "",
};

export default function BlogAdminClient({ initialPosts }: { initialPosts: BlogPostItem[] }) {
  const [posts, setPosts] = useState<BlogPostItem[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [form, setForm] = useState(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyFormData);
    setActiveTab("content");
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPostItem) => {
    setEditingId(post._id);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      category: post.category || "Fashion & Style",
      author: post.author || "QORVAN Editorial",
      readingTime: post.readingTime || "",
      featuredImage: post.featuredImage || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      tagsString: (post.tags || []).join(", "),
      isPublished: post.isPublished ?? true,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      seoKeywordsString: (post.seoKeywords || []).join(", "),
      canonicalUrl: post.canonicalUrl || "",
    });
    setActiveTab("content");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Article title is required.");
      return;
    }

    setIsSubmitting(true);

    const tags = form.tagsString
      ? form.tagsString.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const seoKeywords = form.seoKeywordsString
      ? form.seoKeywordsString.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      category: form.category,
      author: form.author.trim() || "QORVAN Editorial",
      readingTime: form.readingTime.trim() || undefined,
      featuredImage: form.featuredImage.trim() || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      tags,
      isPublished: form.isPublished,
      seoTitle: form.seoTitle.trim() || form.title.trim(),
      seoDescription: form.seoDescription.trim() || form.excerpt.trim(),
      seoKeywords,
      canonicalUrl: form.canonicalUrl.trim() || undefined,
    };

    let res;
    if (editingId) {
      res = await updateBlogPost(editingId, payload);
    } else {
      res = await createBlogPost(payload);
    }

    setIsSubmitting(false);

    if (res.success) {
      toast.success(editingId ? "Article updated successfully!" : "Article published successfully!");
      if (editingId) {
        setPosts((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
      } else {
        setPosts((prev) => [res.data, ...prev]);
      }
      setIsModalOpen(false);
    } else {
      toast.error(res.error || "Failed to save article.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const res = await deleteBlogPost(id);
    if (res.success) {
      toast.success("Article deleted");
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } else {
      toast.error(res.error || "Failed to delete article");
    }
  };

  const togglePublishStatus = async (post: BlogPostItem) => {
    const res = await updateBlogPost(post._id, { isPublished: !post.isPublished });
    if (res.success) {
      toast.success(`Article set to ${!post.isPublished ? "Published" : "Draft"}`);
      setPosts((prev) => prev.map((p) => (p._id === post._id ? res.data : p)));
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCatFilter === "All" || p.category === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-black" />
            Editorial Journal & Blog Manager
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Publish luxury articles, style guides, SEO-optimized metadata, and editorial news.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Article
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles by title, slug, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
          />
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Category:
          </span>
          <button
            onClick={() => setSelectedCatFilter("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCatFilter === "All"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({posts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                  selectedCatFilter === cat
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b font-bold text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Article</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Author & Read Time</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold">No blog articles found.</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Create your first post by clicking "Create New Article" above.
                  </p>
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50/80 transition group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-black">
                          {post.title}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          /blog/{post.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900">{post.author}</div>
                    <div className="text-[10px] text-gray-500">{post.readingTime || "4 min read"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => togglePublishStatus(post)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                        post.isPublished
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      }`}
                      title="Click to toggle publish state"
                    >
                      {post.isPublished ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-amber-700" /> Draft
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-black transition"
                        title="Preview Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 hover:text-black transition"
                        title="Edit Article & SEO"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor & SEO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId ? "Edit Article & SEO Settings" : "Create & Publish New Article"}
                </h2>
                <p className="text-xs text-gray-500">
                  Configure article content, featured media, tags, and search engine metadata.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b px-6 bg-white gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === "content"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <BookOpen className="w-4 h-4" /> Article Content & Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === "seo"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Globe className="w-4 h-4" /> Search Engine Optimization (SEO)
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {activeTab === "content" ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Article Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          title: newTitle,
                          slug: prev.slug || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                        }));
                      }}
                      placeholder="e.g. The Craft of Bespoke Tailoring: A Guide to Timeless Elegance"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black font-semibold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="bespoke-tailoring-guide"
                        className="w-full p-2 border border-gray-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Author Name</label>
                      <input
                        type="text"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        placeholder="QORVAN Editorial"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Estimated Reading Time (optional)
                      </label>
                      <input
                        type="text"
                        value={form.readingTime}
                        onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
                        placeholder="Auto-calculated if blank (e.g. 5 min read)"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <ImageUploader
                    label="Featured Header Image"
                    value={form.featuredImage}
                    onChange={(url) => setForm({ ...form, featuredImage: url })}
                    placeholder="https://... or upload from library"
                  />

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Short Excerpt (Summary for Cards) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Brief 1-2 sentence article preview for blog listing cards..."
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Full Article Body (Supports HTML / Rich Text) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={10}
                      required
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Write your article body here... HTML tags like <h2>, <p>, <blockquote>, <ul> are fully supported."
                      className="w-full p-3 border border-gray-300 rounded-lg font-mono text-xs leading-relaxed"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Tip: You can paste HTML paragraphs, subheadings (`&lt;h2&gt;`), images (`&lt;img&gt;`), or plain text.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Article Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={form.tagsString}
                      onChange={(e) => setForm({ ...form, tagsString: e.target.value })}
                      placeholder="Fashion, Suits, Luxury, Spring Collection"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-black focus:ring-black"
                    />
                    <label htmlFor="isPublished" className="font-bold text-gray-800 cursor-pointer">
                      Publish immediately to public website
                    </label>
                  </div>
                </div>
              ) : (
                /* SEO Tab */
                <div className="space-y-5 text-xs">
                  {/* Google Snippet Live Preview */}
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-black" /> Google Search Preview
                      </span>
                      <span className="text-[10px] text-gray-400">Live Mockup</span>
                    </div>
                    <div className="bg-white border rounded-lg p-3.5 shadow-xs space-y-1 font-sans">
                      <div className="text-[11px] text-gray-600 truncate flex items-center gap-1">
                        <span className="text-gray-400">qorvan.com</span>
                        <span>› blog › {form.slug || "article-slug"}</span>
                      </div>
                      <div className="text-base text-blue-800 font-medium hover:underline cursor-pointer truncate">
                        {form.seoTitle || form.title || "Article SEO Title"}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {form.seoDescription || form.excerpt || "Enter a compelling meta description to optimize your click-through rate on search engines."}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-700 block">SEO Meta Title</label>
                      <span className={`text-[10px] font-mono ${form.seoTitle.length > 60 ? "text-amber-600" : "text-gray-400"}`}>
                        {form.seoTitle.length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      placeholder="Leave blank to use Article Title"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-700 block">SEO Meta Description</label>
                      <span className={`text-[10px] font-mono ${form.seoDescription.length > 160 ? "text-amber-600" : "text-gray-400"}`}>
                        {form.seoDescription.length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={form.seoDescription}
                      onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                      placeholder="Summarize the article in 150-160 characters for search engine result pages..."
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Target SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={form.seoKeywordsString}
                      onChange={(e) => setForm({ ...form, seoKeywordsString: e.target.value })}
                      placeholder="luxury fashion, bespoke suits, silk tie matching, editorial guide"
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Canonical URL (optional)</label>
                    <input
                      type="text"
                      value={form.canonicalUrl}
                      onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                      placeholder="https://qorvan.com/blog/original-article-link"
                      className="w-full p-2.5 border border-gray-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t flex items-center justify-between bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black transition"
                >
                  Cancel
                </button>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingId
                      ? "Update Article & SEO"
                      : "Publish Article"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

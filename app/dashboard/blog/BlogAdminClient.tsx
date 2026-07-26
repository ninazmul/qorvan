"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Newspaper } from "lucide-react";
import { createBlogPost, deleteBlogPost } from "@/lib/actions/blog.actions";
import { toast } from "react-hot-toast";

export default function BlogAdminClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      excerpt,
      content,
      featuredImage: featuredImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      isPublished: true,
    };

    const res = await createBlogPost(payload);
    if (res.success) {
      toast.success("Blog post created!");
      setPosts((prev) => [res.data, ...prev]);
      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setFeaturedImage("");
    } else {
      toast.error(res.error || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete post?")) return;
    const res = await deleteBlogPost(id);
    if (res.success) {
      toast.success("Post deleted");
      setPosts((prev) => prev.filter((p) => p._id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts Manager</h1>
        <p className="text-xs text-gray-500">Publish luxury fashion lifestyle articles and editorial content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Publish New Article</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                placeholder="e.g. The Art of Matching Silk Ties with Bespoke Suits"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-2 border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Featured Image URL</label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Excerpt</label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Content</label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-amber-900 text-amber-300 font-bold rounded-md hover:bg-amber-950 transition"
            >
              Publish Article
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase font-bold border-b text-gray-700">
              <tr>
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img src={p.featuredImage} alt={p.title} className="w-10 h-10 rounded object-cover border" />
                    <div>
                      <div className="font-bold text-gray-900">{p.title}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{p.slug}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-700">{p.author || "QORVAN Editorial"}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => handleDelete(p._id)} className="text-gray-600 hover:text-rose-600">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

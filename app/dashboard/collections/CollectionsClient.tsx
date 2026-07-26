"use client";

import { useState } from "react";
import { Sparkles, Trash2, Edit2 } from "lucide-react";
import { createCollection, deleteCollection } from "@/lib/actions/collection.actions";
import { toast } from "react-hot-toast";

export default function CollectionsClient({ initialCollections }: { initialCollections: any[] }) {
  const [collections, setCollections] = useState(initialCollections);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      bannerImage: bannerImage || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
      description,
      isFeatured: true,
    };

    const res = await createCollection(payload);
    if (res.success) {
      toast.success("Collection created!");
      setCollections((prev) => [res.data, ...prev]);
      setName("");
      setSlug("");
      setBannerImage("");
      setDescription("");
    } else {
      toast.error(res.error || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete collection?")) return;
    const res = await deleteCollection(id);
    if (res.success) {
      toast.success("Deleted");
      setCollections((prev) => prev.filter((c) => c._id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Curated Collections</h1>
        <p className="text-xs text-gray-500">Manage featured luxury fashion collections (e.g. Royal Silk Ties, Leather Heritage)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Add New Collection</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Collection Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                placeholder="e.g. Executive Leather Goods"
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
              <label className="font-bold block mb-1">Banner Image URL</label>
              <input
                type="text"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-amber-900 text-amber-300 font-bold rounded-md hover:bg-amber-950 transition"
            >
              Create Collection
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase font-bold border-b text-gray-700">
              <tr>
                <th className="py-3.5 px-4">Collection</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collections.map((col) => (
                <tr key={col._id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img src={col.bannerImage} alt={col.name} className="w-10 h-10 rounded object-cover border" />
                    <span className="font-bold text-gray-900">{col.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">{col.slug}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => handleDelete(col._id)} className="text-gray-600 hover:text-rose-600">
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

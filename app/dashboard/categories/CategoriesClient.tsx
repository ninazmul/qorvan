"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Layers, Image as ImageIcon } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/category.actions";
import { toast } from "react-hot-toast";

export default function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      image: image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
      description,
    };

    if (editingId) {
      const res = await updateCategory(editingId, payload);
      if (res.success) {
        toast.success("Category updated");
        setCategories((prev) => prev.map((c) => (c._id === editingId ? res.data : c)));
        resetForm();
      } else {
        toast.error(res.error || "Failed");
      }
    } else {
      const res = await createCategory(payload);
      if (res.success) {
        toast.success("Category created");
        setCategories((prev) => [...prev, res.data]);
        resetForm();
      } else {
        toast.error(res.error || "Failed");
      }
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setImage("");
    setDescription("");
    setEditingId(null);
  };

  const handleEdit = (c: any) => {
    setEditingId(c._id);
    setName(c.name);
    setSlug(c.slug);
    setImage(c.image || "");
    setDescription(c.description || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete category?")) return;
    const res = await deleteCategory(id);
    if (res.success) {
      toast.success("Deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
        <p className="text-xs text-gray-500">Organize QORVAN luxury product categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">
            {editingId ? "Edit Category" : "Add New Category"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                placeholder="e.g. Premium Tie Sets"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-2 border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Banner Image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-900 text-amber-300 font-bold rounded-md hover:bg-amber-950 transition"
              >
                {editingId ? "Update" : "Create Category"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase font-bold border-b text-gray-700">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={c.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"}
                      alt={c.name}
                      className="w-8 h-8 rounded object-cover border"
                    />
                    <span className="font-bold text-gray-900">{c.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">{c.slug}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button onClick={() => handleEdit(c)} className="text-gray-600 hover:text-amber-800">
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="text-gray-600 hover:text-rose-600">
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

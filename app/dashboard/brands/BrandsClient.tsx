"use client";

import { useState, useTransition } from "react";
import { Award, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { createBrand, updateBrand, deleteBrand } from "@/lib/actions/brand.actions";
import toast from "react-hot-toast";
import ImageUploader from "@/components/shared/ImageUploader";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status: "active" | "inactive";
}

export default function BrandsClient({ initialBrands }: { initialBrands: Brand[] }) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");

  function openCreate() {
    setEditingBrand(null);
    setName("");
    setSlug("");
    setLogo("");
    setDescription("");
    setShowForm(true);
  }

  function openEdit(brand: Brand) {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setLogo(brand.logo || "");
    setDescription(brand.description || "");
    setShowForm(true);
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!editingBrand) setSlug(generateSlug(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (editingBrand) {
        const res = await updateBrand(editingBrand._id, { name, slug, logo, description });
        if (res.success) {
          toast.success("Brand updated");
          setBrands((prev) => prev.map((brand) => (brand._id === editingBrand._id ? res.data : brand)));
          setShowForm(false);
        } else {
          toast.error(res.error || "Failed");
        }
      } else {
        const res = await createBrand({ name, slug, logo, description });
        if (res.success) {
          toast.success("Brand created");
          setBrands((prev) => [res.data, ...prev]);
          setShowForm(false);
        } else {
          toast.error(res.error || "Failed");
        }
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this brand?")) return;
    startTransition(async () => {
      const res = await deleteBrand(id);
      if (res.success) {
        toast.success("Brand deleted");
        setBrands((prev) => prev.filter((brand) => brand._id !== id));
      } else {
        toast.error(res.error || "Failed");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product brands</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      {brands.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No brands yet. Add your first brand above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-10 h-10 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-black" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{brand.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono">{brand.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEdit(brand)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-black"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {brand.description && (
                <p className="text-xs text-gray-500 mt-3 line-clamp-2">{brand.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingBrand ? "Edit Brand" : "New Brand"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Brand Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. QORVAN"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="brand-slug"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <ImageUploader
                label="Logo Image"
                value={logo}
                onChange={(url) => setLogo(url)}
                placeholder="https://... or upload from library"
              />
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingBrand ? "Update Brand" : "Create Brand"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

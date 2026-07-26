"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Tag, Layers, Check, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/product.actions";
import { toast } from "react-hot-toast";

interface ProductManagerClientProps {
  initialProducts: any[];
  categories: any[];
  collections: any[];
  brands: any[];
}

export default function ProductManagerClient({
  initialProducts,
  categories,
  collections,
  brands,
}: ProductManagerClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    featuredImage: "",
    images: "",
    sku: "",
    stock: "10",
    lowStockThreshold: "5",
    category: "",
    subcategory: "",
    collectionId: "",
    brandId: "",
    tags: "",
    sizes: "S, M, L, XL, XXL",
    colors: "Black, Gold, Navy, White",
    careInstructions: "",
    isFeatured: false,
    isTrending: false,
    isNewArrival: true,
    isBestSeller: false,
    status: "active",
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory ? p.category?._id === selectedCategory || p.category === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title || "",
        slug: product.slug || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        price: product.price?.toString() || "",
        compareAtPrice: product.compareAtPrice?.toString() || "",
        featuredImage: product.featuredImage || "",
        images: product.images ? product.images.join(", ") : "",
        sku: product.sku || "",
        stock: product.stock?.toString() || "0",
        lowStockThreshold: product.lowStockThreshold?.toString() || "5",
        category: typeof product.category === "object" ? product.category._id : product.category || "",
        subcategory: typeof product.subcategory === "object" ? product.subcategory._id : product.subcategory || "",
        collectionId: typeof product.collectionId === "object" ? product.collectionId._id : product.collectionId || "",
        brandId: typeof product.brandId === "object" ? product.brandId._id : product.brandId || "",
        tags: product.tags ? product.tags.join(", ") : "",
        sizes: product.sizes ? product.sizes.join(", ") : "",
        colors: product.colors ? product.colors.map((c: any) => c.name || c).join(", ") : "",
        careInstructions: product.careInstructions || "",
        isFeatured: product.isFeatured || false,
        isTrending: product.isTrending || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        status: product.status || "active",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: "",
        slug: "",
        description: "",
        shortDescription: "",
        price: "",
        compareAtPrice: "",
        featuredImage: "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800",
        images: "",
        sku: `QRV-${Math.floor(1000 + Math.random() * 9000)}`,
        stock: "15",
        lowStockThreshold: "5",
        category: categories[0]?._id || "",
        subcategory: "",
        collectionId: collections[0]?._id || "",
        brandId: brands[0]?._id || "",
        tags: "Tie, Leather, Premium, Luxury",
        sizes: "S, M, L, XL",
        colors: "Obsidian, Champagne Gold, Navy Blue",
        careInstructions: "Dry clean only. Store in protective velvet case.",
        isFeatured: true,
        isTrending: true,
        isNewArrival: true,
        isBestSeller: false,
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, title, slug: prev.slug ? prev.slug : slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description || "Luxury QORVAN crafted product.",
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price) || 0,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        featuredImage: formData.featuredImage,
        images: formData.images ? formData.images.split(",").map((s) => s.trim()).filter(Boolean) : [formData.featuredImage],
        sku: formData.sku,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        collectionId: formData.collectionId || undefined,
        brandId: formData.brandId || undefined,
        tags: formData.tags ? formData.tags.split(",").map((s) => s.trim()) : [],
        sizes: formData.sizes ? formData.sizes.split(",").map((s) => s.trim()) : [],
        colors: formData.colors
          ? formData.colors.split(",").map((s) => ({ name: s.trim() }))
          : [{ name: "Standard" }],
        specifications: [
          { key: "Brand", value: "QORVAN Luxury" },
          { key: "Material", value: "Premium Craftsmanship" },
          { key: "Origin", value: "Handcrafted Luxury" },
        ],
        careInstructions: formData.careInstructions,
        isFeatured: formData.isFeatured,
        isTrending: formData.isTrending,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        status: formData.status,
      };

      if (editingProduct) {
        const res = await updateProduct(editingProduct._id, payload);
        if (res.success) {
          toast.success("Product updated successfully!");
          setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? res.data : p)));
          setIsModalOpen(false);
        } else {
          toast.error(res.error || "Failed to update product");
        }
      } else {
        const res = await createProduct(payload);
        if (res.success) {
          toast.success("Product created successfully!");
          setProducts((prev) => [res.data, ...prev]);
          setIsModalOpen(false);
        } else {
          toast.error(res.error || "Failed to create product");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success("Product deleted");
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error(res.error || "Failed to delete product");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Catalog</h1>
          <p className="text-xs text-gray-500">Manage QORVAN luxury fashion & leather catalog</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-amber-900 text-amber-300 hover:bg-amber-950 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by title, SKU, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-amber-600"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-amber-600"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 font-bold uppercase border-b">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Flags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden relative flex-shrink-0 border">
                        {p.featuredImage ? (
                          <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{p.title}</div>
                        <div className="text-[10px] text-gray-400">{p.slug}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-900">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">
                      {p.category?.name || "General"}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ৳{p.price?.toLocaleString()}
                      {p.compareAtPrice && (
                        <span className="text-[10px] text-gray-400 line-through block font-normal">
                          ৳{p.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock <= (p.lowStockThreshold || 5)
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.stock <= (p.lowStockThreshold || 5) && <AlertCircle className="w-3 h-3" />}
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.isFeatured && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            Featured
                          </span>
                        )}
                        {p.isTrending && (
                          <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            Trending
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="p-1.5 text-gray-600 hover:text-amber-700 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-gray-600 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 border border-amber-900/20 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Create New QORVAN Product"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Royal Italian Silk Tie Set"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2 border rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Price (BDT ৳) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="3500"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Compare At Price</label>
                  <input
                    type="number"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="4500"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Collection</label>
                  <select
                    value={formData.collectionId}
                    onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    <option value="">Select Collection</option>
                    {collections.map((col) => (
                      <option key={col._id} value={col._id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Brand</label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-1 block">Featured Image URL *</label>
                <input
                  type="text"
                  required
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-1 block">Gallery Images (comma separated URLs)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://..., https://..."
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-1 block">Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Crafted with pure Italian silk..."
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Colors (comma separated)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Black, Gold, Navy"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 border-t pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-amber-700"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    className="rounded text-amber-700"
                  />
                  <span>Trending</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="rounded text-amber-700"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-900 text-amber-300 rounded-md font-bold hover:bg-amber-950 transition"
                >
                  {loading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

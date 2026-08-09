"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Layers,
  Check,
  X,
  Image as ImageIcon,
  AlertCircle,
  Globe,
  Sparkles,
  Package,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/product.actions";
import { toast } from "react-hot-toast";
import ImageUploader from "@/components/shared/ImageUploader";
import MultiImageUploader from "@/components/shared/MultiImageUploader";
import Link from "next/link";

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
  const [modalTab, setModalTab] = useState<"general" | "seo">("general");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    featuredImage: "",
    images: [] as string[],
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
    // SEO Fields
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      !selectedCategory ||
      (typeof p.category === "object"
        ? p.category?._id === selectedCategory
        : p.category === selectedCategory);
    return matchesSearch && matchesCat;
  });

  const openCreateOrEditModal = (product?: any) => {
    setModalTab("general");
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
        images: Array.isArray(product.images)
          ? product.images
          : typeof product.images === "string"
            ? product.images
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
        sku: product.sku || "",
        stock: product.stock?.toString() || "0",
        lowStockThreshold: product.lowStockThreshold?.toString() || "5",
        category:
          typeof product.category === "object"
            ? product.category._id
            : product.category || "",
        subcategory:
          typeof product.subcategory === "object"
            ? product.subcategory._id
            : product.subcategory || "",
        collectionId:
          typeof product.collectionId === "object"
            ? product.collectionId._id
            : product.collectionId || "",
        brandId:
          typeof product.brandId === "object"
            ? product.brandId._id
            : product.brandId || "",
        tags: product.tags ? product.tags.join(", ") : "",
        sizes: product.sizes ? product.sizes.join(", ") : "",
        colors: product.colors
          ? product.colors.map((c: any) => c.name || c).join(", ")
          : "",
        careInstructions: product.careInstructions || "",
        isFeatured: product.isFeatured || false,
        isTrending: product.isTrending || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        status: product.status || "active",
        // SEO Fields
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        seoKeywords: product.seoKeywords ? product.seoKeywords.join(", ") : "",
        canonicalUrl: product.canonicalUrl || "",
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
        featuredImage:
          "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800",
        images: [] as string[],
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
        // SEO Defaults
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        canonicalUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug ? prev.slug : slug,
      seoTitle: prev.seoTitle ? prev.seoTitle : title,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        slug:
          formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description || "Luxury QORVAN crafted product.",
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price) || 0,
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : undefined,
        featuredImage: formData.featuredImage,
        images:
          Array.isArray(formData.images) && formData.images.length > 0
            ? formData.images
            : formData.featuredImage
              ? [formData.featuredImage]
              : [],
        sku: formData.sku,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        collectionId: formData.collectionId || undefined,
        brandId: formData.brandId || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        sizes: formData.sizes
          ? formData.sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        colors: formData.colors
          ? formData.colors
              .split(",")
              .map((s) => ({ name: s.trim() }))
              .filter((c) => c.name)
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
        // SEO Payload
        seoTitle: formData.seoTitle.trim() || formData.title.trim(),
        seoDescription:
          formData.seoDescription.trim() ||
          formData.shortDescription.trim() ||
          formData.description.slice(0, 160),
        seoKeywords: formData.seoKeywords
          ? formData.seoKeywords
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : formData.tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
        canonicalUrl: formData.canonicalUrl.trim() || undefined,
      };

      if (editingProduct) {
        const res = await updateProduct(editingProduct._id, payload);
        if (res.success) {
          toast.success("Product updated successfully!");
          setProducts((prev) =>
            prev.map((p) => (p._id === editingProduct._id ? res.data : p)),
          );
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
      toast.error(err.message || "An unexpected error occurred");
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
        toast.error(res.error || "Failed to delete");
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-black" />
            Product Catalog & Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage luxury fashion catalog, pricing, variants, stock, and SEO
            search optimization.
          </p>
        </div>
        <button
          onClick={() => openCreateOrEditModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-black bg-white"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-black"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-xs font-bold text-gray-500 shrink-0">
            Total: {filteredProducts.length} items
          </span>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b font-bold text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No products match your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.featuredImage}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-gray-900 line-clamp-1">
                            {p.title}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {typeof p.category === "object"
                              ? p.category?.name
                              : "Category"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-700">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ৳{p.price?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock <= (p.lowStockThreshold || 5)
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.isFeatured && (
                          <span className="bg-gray-100 text-gray-800 text-[9px] px-1.5 py-0.5 rounded font-bold border border-gray-200">
                            Featured
                          </span>
                        )}
                        {p.isTrending && (
                          <span className="bg-gray-100 text-gray-800 text-[9px] px-1.5 py-0.5 rounded font-bold border border-gray-200">
                            Trending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition"
                          title="View on Storefront"
                        >
                          <Globe className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openCreateOrEditModal(p)}
                          className="p-1.5 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition"
                          title="Edit Product & SEO"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                          title="Delete Product"
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
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingProduct
                    ? `Edit Product: ${editingProduct.title}`
                    : "Create New QORVAN Product"}
                </h2>
                <p className="text-xs text-gray-500">
                  Configure catalog properties, inventory stock, and SEO search
                  tags.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b px-6 bg-white gap-6">
              <button
                type="button"
                onClick={() => setModalTab("general")}
                className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                  modalTab === "general"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Package className="w-4 h-4" /> Product Details & Pricing
              </button>
              <button
                type="button"
                onClick={() => setModalTab("seo")}
                className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                  modalTab === "seo"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Globe className="w-4 h-4" /> Search Engine Optimization (SEO)
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {modalTab === "general" ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 mb-1 block">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Royal Italian Silk Tie Set"
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-black font-semibold text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 mb-1 block">
                        SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        className="w-full p-2.5 border rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 mb-1 block">
                        Price (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="3500"
                        className="w-full p-2.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 mb-1 block">
                        Compare At Price
                      </label>
                      <input
                        type="number"
                        value={formData.compareAtPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            compareAtPrice: e.target.value,
                          })
                        }
                        placeholder="4500"
                        className="w-full p-2.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 mb-1 block">
                        Initial Stock *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        className="w-full p-2.5 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 mb-1 block">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full p-2.5 border rounded-lg bg-white"
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
                      <label className="font-bold text-gray-700 mb-1 block">
                        Collection
                      </label>
                      <select
                        value={formData.collectionId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            collectionId: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border rounded-lg bg-white"
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
                      <label className="font-bold text-gray-700 mb-1 block">
                        Brand
                      </label>
                      <select
                        value={formData.brandId}
                        onChange={(e) =>
                          setFormData({ ...formData, brandId: e.target.value })
                        }
                        className="w-full p-2.5 border rounded-lg bg-white"
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

                  <ImageUploader
                    label="Featured Main Image"
                    required
                    value={formData.featuredImage}
                    onChange={(url) =>
                      setFormData({ ...formData, featuredImage: url })
                    }
                    placeholder="https://... or upload from library"
                  />

                  <MultiImageUploader
                    label="Gallery Images"
                    value={formData.images}
                    onChange={(urls) =>
                      setFormData({ ...formData, images: urls })
                    }
                    maxImages={15}
                  />

                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shortDescription: e.target.value,
                        })
                      }
                      placeholder="Brief 1-sentence product highlight..."
                      className="w-full p-2.5 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">
                      Full Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Crafted with pure Italian silk..."
                      className="w-full p-2.5 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 mb-1 block">
                        Sizes (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.sizes}
                        onChange={(e) =>
                          setFormData({ ...formData, sizes: e.target.value })
                        }
                        placeholder="S, M, L, XL"
                        className="w-full p-2.5 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 mb-1 block">
                        Colors (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.colors}
                        onChange={(e) =>
                          setFormData({ ...formData, colors: e.target.value })
                        }
                        placeholder="Black, Gold, Navy"
                        className="w-full p-2.5 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 border-t pt-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isFeatured: e.target.checked,
                          })
                        }
                        className="rounded text-black focus:ring-black"
                      />
                      <span>Featured Product</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={formData.isTrending}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isTrending: e.target.checked,
                          })
                        }
                        className="rounded text-black focus:ring-black"
                      />
                      <span>Trending</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={formData.isNewArrival}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isNewArrival: e.target.checked,
                          })
                        }
                        className="rounded text-black focus:ring-black"
                      />
                      <span>New Arrival</span>
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
                        <Sparkles className="w-3.5 h-3.5 text-black" /> Google
                        Search Preview
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Live Mockup
                      </span>
                    </div>
                    <div className="bg-white border rounded-lg p-3.5 shadow-xs space-y-1 font-sans">
                      <div className="text-[11px] text-gray-600 truncate flex items-center gap-1">
                        <span className="text-gray-400">qorvan.com</span>
                        <span>
                          › product › {formData.slug || "product-slug"}
                        </span>
                      </div>
                      <div className="text-base text-blue-800 font-medium hover:underline cursor-pointer truncate">
                        {formData.seoTitle ||
                          formData.title ||
                          "Product SEO Title | QORVAN"}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {formData.seoDescription ||
                          formData.shortDescription ||
                          formData.description.slice(0, 160) ||
                          "Enter a compelling meta description to optimize product ranking and click-through rate on Google."}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-700 block">
                        Product SEO Title
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          formData.seoTitle.length > 60
                            ? "text-amber-600"
                            : "text-gray-400"
                        }`}
                      >
                        {formData.seoTitle.length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, seoTitle: e.target.value })
                      }
                      placeholder="Leave blank to use Product Title"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-gray-700 block">
                        Product SEO Meta Description
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          formData.seoDescription.length > 160
                            ? "text-amber-600"
                            : "text-gray-400"
                        }`}
                      >
                        {formData.seoDescription.length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.seoDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seoDescription: e.target.value,
                        })
                      }
                      placeholder="Summarize product features and benefits in 150-160 characters for search engine result pages..."
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.seoKeywords}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seoKeywords: e.target.value,
                        })
                      }
                      placeholder="silk tie, luxury menswear, bespoke suit accessories"
                      className="w-full p-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Canonical URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.canonicalUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          canonicalUrl: e.target.value,
                        })
                      }
                      placeholder="https://qorvan.com/product/original-product-link"
                      className="w-full p-2.5 border border-gray-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-sm disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product & SEO"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

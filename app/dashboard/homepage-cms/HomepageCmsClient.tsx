"use client";

import { useState } from "react";
import { Image as ImageIcon, LayoutGrid, Pencil, Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { createHeroSlide, deleteHeroSlide, updateHeroSlide } from "@/lib/actions/hero.actions";
import ImageUploader from "@/components/shared/ImageUploader";

interface HeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  buttonText?: string;
  buttonUrl?: string;
  order?: number;
  enabled?: boolean;
}

const emptyForm = {
  title: "",
  subtitle: "",
  backgroundImage: "",
  buttonText: "Shop Collection",
  buttonUrl: "/shop",
  order: "0",
  enabled: true,
};

export default function HomepageCmsClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [form, setForm] = useState(emptyForm);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditingSlide(null);
    setForm({
      ...emptyForm,
      title: "The Pinnacle of Luxury & Elegance",
      subtitle: "Explore QORVAN's masterwork of Italian silk tie sets, full-grain executive leather goods, bespoke formal tailoring, and royal haute couture.",
      backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
      order: String(slides.length),
    });
    setIsFormOpen(true);
  }

  function openEdit(slide: HeroSlide) {
    setEditingSlide(slide);
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      backgroundImage: slide.backgroundImage || "",
      buttonText: slide.buttonText || "",
      buttonUrl: slide.buttonUrl || "",
      order: String(slide.order ?? 0),
      enabled: slide.enabled !== false,
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      backgroundImage: form.backgroundImage.trim(),
      buttonText: form.buttonText.trim(),
      buttonUrl: form.buttonUrl.trim(),
      order: Number(form.order) || 0,
      enabled: form.enabled,
    };

    try {
      const res = editingSlide
        ? await updateHeroSlide(editingSlide._id, payload)
        : await createHeroSlide(payload);

      if (res.success && res.data) {
        toast.success(editingSlide ? "Hero slide updated" : "Hero slide created");
        setSlides((prev) =>
          editingSlide
            ? prev.map((slide) => (slide._id === editingSlide._id ? res.data : slide))
            : [res.data, ...prev],
        );
        setIsFormOpen(false);
      } else {
        toast.error(res.error || "Failed to save hero slide");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save hero slide");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this homepage hero slide?")) return;

    const res = await deleteHeroSlide(id);
    if (res.success) {
      toast.success("Hero slide deleted");
      setSlides((prev) => prev.filter((slide) => slide._id !== id));
    } else {
      toast.error(res.error || "Failed to delete hero slide");
    }
  }

  const sortedSlides = [...slides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 uppercase tracking-wider">
            <LayoutGrid className="w-4 h-4" />
            Storefront Content
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Homepage CMS</h1>
          <p className="text-xs text-gray-500">Manage the QORVAN storefront hero campaign slides.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gray-800 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Hero Slide
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedSlides.length === 0 ? (
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No homepage hero slides configured.</p>
          </div>
        ) : (
          sortedSlides.map((slide) => (
            <div key={slide._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="relative aspect-[16/7] bg-black">
                {slide.backgroundImage ? (
                  <img src={slide.backgroundImage} alt={slide.title} className="w-full h-full object-cover opacity-75" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent" />
                <div className="absolute left-5 right-5 bottom-5 text-white">
                  <div className="text-[10px] uppercase tracking-widest text-white font-bold">
                    {slide.enabled === false ? "Disabled" : "Published"} / Order {slide.order ?? 0}
                  </div>
                  <h2 className="text-lg font-serif font-bold mt-1">{slide.title}</h2>
                  {slide.subtitle && <p className="text-xs text-gray-200/80 mt-1 line-clamp-2">{slide.subtitle}</p>}
                </div>
              </div>
              <div className="p-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEdit(slide)}
                  className="p-2 rounded-lg text-gray-900 hover:bg-gray-200"
                  title="Edit slide"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(slide._id)}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                  title="Delete slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editingSlide ? "Edit Hero Slide" : "Create Hero Slide"}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 mb-1 block">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 mb-1 block">Subtitle</label>
                <textarea
                  rows={3}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
              <ImageUploader
                label="Background Image"
                required
                value={form.backgroundImage}
                onChange={(url) => setForm({ ...form, backgroundImage: url })}
                placeholder="https://... or upload from library"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Button Text</label>
                  <input
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Button URL</label>
                  <input
                    value={form.buttonUrl}
                    onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                />
                Publish this slide
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-black text-white rounded-lg font-bold inline-flex items-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

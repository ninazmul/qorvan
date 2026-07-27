"use client";

import { useState } from "react";
import { AlertTriangle, Search, Save, ArrowLeft, ArrowRight, Download } from "lucide-react";
import { updateInventoryStock } from "@/lib/actions/product.actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function InventoryClient({ initialProducts, currentPage }: { initialProducts: any[]; currentPage?: number }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const page = currentPage ?? 1;

  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 5)).length;

  const handleStockChange = (id: string, newStock: number) => {
    setStockEdits((prev) => ({ ...prev, [id]: newStock }));
  };

  const handleSaveStock = async (id: string) => {
    const newStock = stockEdits[id];
    if (newStock === undefined) return;

    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await updateInventoryStock(id, newStock);
      if (res.success) {
        toast.success("Stock updated!");
        setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stock: newStock } : p)));
        setStockEdits((prev) => {
          const c = { ...prev };
          delete c[id];
          return c;
        });
      } else {
        toast.error(res.error || "Failed to update stock");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving stock");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filtered = products.filter(
    (p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const goToPage = (newPage: number) => {
    router.push(`/dashboard/inventory?page=${newPage}`);
  };

  const exportCsv = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    const resp = await fetch(`/api/inventory/export?${params.toString()}`);
    if (!resp.ok) {
      toast.error("Failed to export CSV");
      return;
    }
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Stock Control</h1>
          <p className="text-xs text-gray-500">Real-time product stock level adjustment & low stock alerts</p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {lowStockCount} Products Low on Stock
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter stock list by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none"
        />
        <button onClick={exportCsv} className="ml-2 flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-black hover:text-black transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 uppercase font-bold text-gray-700 border-b">
            <tr>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Current Stock</th>
              <th className="py-3.5 px-4">Low Stock Limit</th>
              <th className="py-3.5 px-4">Stock Status</th>
              <th className="py-3.5 px-4 text-right">Quick Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => {
              const currentStock = stockEdits[p._id] !== undefined ? stockEdits[p._id] : p.stock;
              const isLow = currentStock <= (p.lowStockThreshold || 5);
              const isEdited = stockEdits[p._id] !== undefined && stockEdits[p._id] !== p.stock;

              return (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-3">
                    <img src={p.featuredImage} alt={p.title} className="w-8 h-8 rounded object-cover border" />
                    {p.title}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">{p.sku}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={currentStock}
                      onChange={(e) => handleStockChange(p._id, parseInt(e.target.value) || 0)}
                      className="w-20 p-1 border rounded text-center font-bold text-gray-900"
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-medium">{p.lowStockThreshold || 5} units</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isLow ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                    >
                      {isLow ? "Low Stock Alert" : "In Stock"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEdited && (
                      <button
                        onClick={() => handleSaveStock(p._id)}
                        disabled={loading[p._id]}
                        className="px-3 py-1 bg-black text-white font-bold rounded hover:bg-gray-800 text-xs inline-flex items-center gap-1 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Prev
        </button>
        <span className="px-3 py-1">Page {page}</span>
        <button
          onClick={() => goToPage(page + 1)}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

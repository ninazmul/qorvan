"use client";

import { useEffect, useState } from "react";
import { Bell, Trash2, Download, RefreshCw, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe");
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove ${email} from subscribers?`)) return;
    try {
      const res = await fetch("/api/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Subscriber removed");
        fetchSubscribers();
      } else {
        toast.error("Failed to remove subscriber");
      }
    } catch {
      toast.error("Server error");
    }
  };

  const handleExport = () => {
    const csv = ["Email", ...subscribers].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  };

  const filtered = subscribers.filter((e) =>
    e.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6" /> Subscribers
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage newsletter subscribers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubscribers}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExport}
            disabled={subscribers.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:border-black hover:text-black transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Subscribers</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Showing</p>
            <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          </div>
        </div>
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-black transition"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-300" />
            Loading subscribers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            {search ? "No matching subscribers found." : "No subscribers yet."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  #
                </th>
                <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Email Address
                </th>
                <th className="py-3 px-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((email, idx) => (
                <tr key={email} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4 text-gray-400 text-[11px] font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    {email}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(email)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove subscriber"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

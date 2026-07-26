"use client";

import { useState } from "react";
import { Undo2, CheckCircle, XCircle } from "lucide-react";
import { updateReturnStatus } from "@/lib/actions/return.actions";
import { toast } from "react-hot-toast";

export default function ReturnRequestsClient({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);

  const handleStatus = async (id: string, status: any) => {
    const res = await updateReturnStatus(id, status);
    if (res.success) {
      toast.success(`Return status updated to ${status}`);
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } else {
      toast.error(res.error || "Failed");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Return & Exchange Requests</h1>
        <p className="text-xs text-gray-500">Manage customer product return applications</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 uppercase font-bold border-b text-gray-700">
            <tr>
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Item & Reason</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-amber-900">{r.orderNumber}</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-gray-900">{r.customerName}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{r.customerEmail}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-gray-900">{r.items?.[0]?.productTitle}</div>
                  <div className="text-gray-600 text-[11px] font-medium">{r.reason}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === "approved"
                        ? "bg-blue-100 text-blue-800"
                        : r.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <select
                    value={r.status}
                    onChange={(e) => handleStatus(r._id, e.target.value)}
                    className="p-1 border rounded bg-white text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

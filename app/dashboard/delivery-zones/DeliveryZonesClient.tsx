"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { createDeliveryZone, updateDeliveryZone, deleteDeliveryZone } from "@/lib/actions/delivery.actions";
import { toast } from "react-hot-toast";

export default function DeliveryZonesClient({ initialZones }: { initialZones: any[] }) {
  const [zones, setZones] = useState(initialZones);
  const [name, setName] = useState("");
  const [locations, setLocations] = useState("");
  const [baseCharge, setBaseCharge] = useState("80");
  const [freeThreshold, setFreeThreshold] = useState("5000");
  const [estimatedDays, setEstimatedDays] = useState("2-3 Days");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      locations: locations.split(",").map((s) => s.trim()).filter(Boolean),
      baseCharge: parseFloat(baseCharge) || 0,
      freeDeliveryThreshold: freeThreshold ? parseFloat(freeThreshold) : 0,
      estimatedDays,
      isActive: true,
    };

    if (editingId) {
      const res = await updateDeliveryZone(editingId, payload);
      if (res.success) {
        toast.success("Delivery Zone updated");
        setZones((prev) => prev.map((z) => (z._id === editingId ? res.data : z)));
        resetForm();
      } else {
        toast.error(res.error || "Failed");
      }
    } else {
      const res = await createDeliveryZone(payload);
      if (res.success) {
        toast.success("Delivery Zone created");
        setZones((prev) => [...prev, res.data]);
        resetForm();
      } else {
        toast.error(res.error || "Failed");
      }
    }
  };

  const resetForm = () => {
    setName("");
    setLocations("");
    setBaseCharge("80");
    setFreeThreshold("5000");
    setEstimatedDays("2-3 Days");
    setEditingId(null);
  };

  const handleEdit = (z: any) => {
    setEditingId(z._id);
    setName(z.name);
    setLocations(z.locations ? z.locations.join(", ") : "");
    setBaseCharge(z.baseCharge?.toString() || "0");
    setFreeThreshold(z.freeDeliveryThreshold?.toString() || "0");
    setEstimatedDays(z.estimatedDays || "2-3 Days");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete zone?")) return;
    const res = await deleteDeliveryZone(id);
    if (res.success) {
      toast.success("Zone deleted");
      setZones((prev) => prev.filter((z) => z._id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Charges & Shipping Zones</h1>
        <p className="text-xs text-gray-500">
          Configure dynamic shipping rates (Dhaka City, Outside Dhaka, Bangladesh, International) & free delivery rules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">
            {editingId ? "Edit Delivery Zone" : "Create New Shipping Zone"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">Zone Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dhaka City"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Base Delivery Charge (৳ BDT) *</label>
              <input
                type="number"
                required
                value={baseCharge}
                onChange={(e) => setBaseCharge(e.target.value)}
                placeholder="80"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Free Delivery Minimum Amount (৳ BDT)</label>
              <input
                type="number"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                placeholder="5000"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Estimated Delivery Time *</label>
              <input
                type="text"
                required
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="1-2 Days"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Covered Locations (comma separated)</label>
              <textarea
                rows={2}
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="Gulshan, Banani, Dhanmondi, Uttara, Mirpur"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition"
              >
                {editingId ? "Update Zone" : "Add Zone"}
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

        {/* Zones Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 uppercase font-bold border-b text-gray-700">
              <tr>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Charge</th>
                <th className="py-3.5 px-4">Free Shipping</th>
                <th className="py-3.5 px-4">Est. Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zones.map((z) => (
                <tr key={z._id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-gray-800" />
                      {z.name}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 max-w-xs truncate">
                      {z.locations?.join(", ")}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">৳{z.baseCharge}</td>
                  <td className="py-3.5 px-4 text-gray-600 font-medium">
                    {z.freeDeliveryThreshold ? `Orders > ৳${z.freeDeliveryThreshold}` : "None"}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-900">{z.estimatedDays}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button onClick={() => handleEdit(z)} className="text-gray-600 hover:text-gray-900">
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button onClick={() => handleDelete(z._id)} className="text-gray-600 hover:text-rose-600">
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

"use client";

import { useState } from "react";
import { Undo2, CheckCircle } from "lucide-react";
import { createReturnRequest } from "@/lib/actions/return.actions";
import { toast } from "react-hot-toast";

export default function ReturnsPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [reason, setReason] = useState("Defective or Damaged Item");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createReturnRequest({
        orderNumber,
        customerName,
        customerEmail,
        items: [{ productTitle, quantity: 1 }],
        reason,
        details,
      });

      if (res.success) {
        setSubmitted(true);
        toast.success("Return Request Submitted!");
      } else {
        toast.error(res.error || "Failed to submit return request");
      }
    } catch (err: any) {
      toast.error(err.message || "Error submitting return request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-800">
          Hassle-Free Concierge Support
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-gray-900">
          Request Return or Exchange
        </h1>
        <p className="text-xs text-gray-500">
          QORVAN offers easy 7-day returns for unused luxury items with original packaging.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold font-serif text-gray-900">Return Request Received</h2>
          <p className="text-xs text-gray-600">
            Our concierge team will review your request and contact you via email/phone within 24 hours to schedule pickup.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Order Reference Number *</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="QRV-948271"
                className="w-full p-3 border rounded-xl font-mono uppercase"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email address"
                className="w-full p-3 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g. Royal Silk Tie Set"
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Reason for Return *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border rounded-xl bg-white font-medium"
            >
              <option value="Defective or Damaged Item">Defective or Damaged Item</option>
              <option value="Wrong Size Delivered">Wrong Size Delivered</option>
              <option value="Incorrect Product Received">Incorrect Product Received</option>
              <option value="Changed Mind">Changed Mind</option>
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1">Additional Details</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-900 transition shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Return Request"}
          </button>
        </form>
      )}
    </div>
  );
}

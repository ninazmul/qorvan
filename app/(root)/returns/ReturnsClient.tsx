"use client";

import { useState } from "react";
import { Undo2, CheckCircle, CheckCircle2 } from "lucide-react";
import { createReturnRequest } from "@/lib/actions/return.actions";
import { toast } from "react-hot-toast";

export default function ReturnsClient({ page }: { page: any }) {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-800">
          {page?.subtitle || "Hassle-Free Concierge Support"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-gray-900">
          {page?.title || "Returns & Exchange Policy"}
        </h1>
        {page?.content && <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">{page.content}</p>}
      </div>

      {/* Dynamic Policy Sections */}
      {page?.sections && page.sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {page.sections.map((sec: any, idx: number) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1.5">
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {sec.heading}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed pl-5 whitespace-pre-line">
                {sec.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Form */}
      <div className="pt-4">
        <h2 className="text-xl font-bold font-serif text-gray-900 text-center mb-6">Submit Return / Exchange Request</h2>
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
    </div>
  );
}

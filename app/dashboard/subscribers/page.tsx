"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Bell,
  Trash2,
  Download,
  RefreshCw,
  Users,
  Mail,
  Send,
  X,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronDown,
  Sparkles,
  FileText,
  Megaphone,
  Newspaper,
  PenLine,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ──────────────────────────────────────────────
interface EmailTemplate {
  id: string;
  name: string;
  defaultSubject: string;
}

type ComposeStep = "template" | "compose" | "sending" | "done";

// ─── Template Icon Map ──────────────────────────────────
const templateIcons: Record<string, typeof Sparkles> = {
  welcome: Sparkles,
  promo: Megaphone,
  "new-arrival": Sparkles,
  newsletter: Newspaper,
  custom: PenLine,
};

const templateColors: Record<string, string> = {
  welcome: "bg-emerald-50 text-emerald-600 border-emerald-200",
  promo: "bg-orange-50 text-orange-600 border-orange-200",
  "new-arrival": "bg-blue-50 text-blue-600 border-blue-200",
  newsletter: "bg-violet-50 text-violet-600 border-violet-200",
  custom: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

// ─── Main Page ──────────────────────────────────────────
export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Email compose
  const [showCompose, setShowCompose] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [composeStep, setComposeStep] = useState<ComposeStep>("template");
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // ─── Fetch Subscribers ────────────────────────────────
  const fetchSubscribers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // ─── Fetch Templates ─────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/email");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      console.error("Failed to load templates");
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // ─── Filtered list ────────────────────────────────────
  const filtered = useMemo(
    () => subscribers.filter((e) => e.toLowerCase().includes(search.toLowerCase())),
    [subscribers, search]
  );

  // ─── Selection Handlers ───────────────────────────────
  const isAllSelected = filtered.length > 0 && filtered.every((e) => selected.has(e));
  const isSomeSelected = filtered.some((e) => selected.has(e));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selected);
      filtered.forEach((e) => next.delete(e));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((e) => next.add(e));
      setSelected(next);
    }
  };

  const toggleSelect = (email: string) => {
    const next = new Set(selected);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.add(email);
    }
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  // ─── Delete ───────────────────────────────────────────
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
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(email);
          return next;
        });
        fetchSubscribers();
      } else {
        toast.error("Failed to remove subscriber");
      }
    } catch {
      toast.error("Server error");
    }
  };

  const handleBulkDelete = async () => {
    const count = selected.size;
    if (!confirm(`Remove ${count} subscriber(s)?`)) return;
    try {
      await Promise.all(
        Array.from(selected).map((email) =>
          fetch("/api/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
        )
      );
      toast.success(`${count} subscriber(s) removed`);
      setSelected(new Set());
      fetchSubscribers();
    } catch {
      toast.error("Failed to remove subscribers");
    }
  };

  // ─── Export ───────────────────────────────────────────
  const handleExport = () => {
    const emails = selected.size > 0 ? Array.from(selected) : subscribers;
    const csv = ["Email", ...emails].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${emails.length} subscriber(s)`);
  };

  // ─── Email Compose ────────────────────────────────────
  const openCompose = () => {
    if (selected.size === 0) {
      toast.error("Select at least one subscriber");
      return;
    }
    setComposeStep("template");
    setSelectedTemplate("");
    setEmailSubject("");
    setEmailBody("");
    setPromoCode("");
    setPromoDiscount("");
    setSendResult(null);
    setShowCompose(true);
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setEmailSubject(tmpl.defaultSubject);
    }
    setComposeStep("compose");
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim()) {
      toast.error("Subject is required");
      return;
    }
    setComposeStep("sending");
    try {
      const variables: Record<string, string> = {};
      if (selectedTemplate === "promo") {
        if (promoCode) variables.code = promoCode;
        if (promoDiscount) variables.discount = promoDiscount;
        if (emailBody) variables.message = emailBody;
      }

      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          subject: emailSubject,
          body: selectedTemplate === "custom" || selectedTemplate === "newsletter"
            ? emailBody.replace(/\n/g, "<br/>")
            : emailBody,
          recipients: Array.from(selected),
          variables,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSendResult({ success: true, message: data.message || `Sent to ${selected.size} recipient(s)` });
        setComposeStep("done");
      } else {
        setSendResult({ success: false, message: data.error || "Failed to send" });
        setComposeStep("done");
      }
    } catch {
      setSendResult({ success: false, message: "Network error. Please try again." });
      setComposeStep("done");
    }
  };

  const closeCompose = () => {
    setShowCompose(false);
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6" /> Subscribers
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage newsletter subscribers &amp; send emails
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
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-black hover:text-black transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            {selected.size > 0 ? `Export Selected (${selected.size})` : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Showing</p>
            <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Selected</p>
            <p className="text-2xl font-bold text-gray-900">{selected.size}</p>
          </div>
        </div>
      </div>

      {/* Selection Actions Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-800 flex-1">
            {selected.size} subscriber{selected.size > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={openCompose}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white hover:bg-neutral-800 transition shadow-sm"
          >
            <Mail className="w-3.5 h-3.5" /> Send Email
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button
            onClick={clearSelection}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search + Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:flex-none sm:w-72 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-black transition"
          />
          {filtered.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-black rounded-lg hover:bg-gray-50 transition border border-gray-200"
            >
              {isAllSelected ? (
                <>
                  <MinusSquare className="w-3.5 h-3.5" /> Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5" /> Select All
                </>
              )}
            </button>
          )}
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
                <th className="py-3 px-4 text-left w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-gray-700 transition"
                    title={isAllSelected ? "Deselect all" : "Select all"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : isSomeSelected ? (
                      <MinusSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
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
              {filtered.map((email, idx) => {
                const isChecked = selected.has(email);
                return (
                  <tr
                    key={email}
                    className={`transition cursor-pointer ${
                      isChecked
                        ? "bg-blue-50/50 hover:bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleSelect(email)}
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelect(email)}
                        className="text-gray-400 hover:text-gray-700 transition"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px] font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {email}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(email)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Remove subscriber"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Email Compose Modal ─────────────────────────── */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeCompose}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Send Email</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  To {selected.size} subscriber{selected.size > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={closeCompose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step: Template Selection */}
            {composeStep === "template" && (
              <div className="p-6 space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-4">Choose a template</p>
                {templates.map((tmpl) => {
                  const IconComp = templateIcons[tmpl.id] || FileText;
                  const colorClass = templateColors[tmpl.id] || templateColors.custom;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => selectTemplate(tmpl.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-black">
                          {tmpl.name}
                        </p>
                        {tmpl.defaultSubject && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {tmpl.defaultSubject}
                          </p>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90 group-hover:text-gray-500 transition" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step: Compose */}
            {composeStep === "compose" && (
              <div className="p-6 space-y-5">
                {/* Back to templates */}
                <button
                  onClick={() => setComposeStep("template")}
                  className="text-xs font-medium text-gray-500 hover:text-black transition flex items-center gap-1"
                >
                  ← Change template
                </button>

                {/* Template badge */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const tmpl = templates.find((t) => t.id === selectedTemplate);
                    const IconComp = templateIcons[selectedTemplate] || FileText;
                    const colorClass = templateColors[selectedTemplate] || templateColors.custom;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${colorClass}`}>
                        <IconComp className="w-3.5 h-3.5" />
                        {tmpl?.name || selectedTemplate}
                      </span>
                    );
                  })()}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition"
                  />
                </div>

                {/* Promo fields */}
                {selectedTemplate === "promo" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Discount Text
                      </label>
                      <input
                        type="text"
                        value={promoDiscount}
                        onChange={(e) => setPromoDiscount(e.target.value)}
                        placeholder="e.g. 20% OFF"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. QORVAN20"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition"
                      />
                    </div>
                  </div>
                )}

                {/* Body - shown for custom, newsletter, promo, new-arrival */}
                {(selectedTemplate === "custom" ||
                  selectedTemplate === "newsletter" ||
                  selectedTemplate === "promo" ||
                  selectedTemplate === "new-arrival") && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {selectedTemplate === "custom"
                        ? "Email Body (HTML supported)"
                        : selectedTemplate === "newsletter"
                        ? "Newsletter Content (HTML supported)"
                        : "Message (optional)"}
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={selectedTemplate === "custom" || selectedTemplate === "newsletter" ? 8 : 4}
                      placeholder={
                        selectedTemplate === "custom"
                          ? "Write your email content here..."
                          : selectedTemplate === "newsletter"
                          ? "Write your newsletter content..."
                          : "Optional custom message..."
                      }
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition resize-none"
                    />
                  </div>
                )}

                {/* Newsletter heading */}
                {selectedTemplate === "newsletter" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Heading (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 📬 Weekly Newsletter"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition"
                    />
                  </div>
                )}

                {/* Recipients preview */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Recipients ({selected.size})
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {Array.from(selected)
                      .slice(0, 10)
                      .map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center px-2 py-1 bg-white rounded-md text-[11px] text-gray-600 border border-gray-200"
                        >
                          {email}
                        </span>
                      ))}
                    {selected.size > 10 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-md text-[11px] text-gray-500 font-medium">
                        +{selected.size - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Send button */}
                <button
                  onClick={handleSendEmail}
                  disabled={!emailSubject.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" /> Send to {selected.size} Subscriber
                  {selected.size > 1 ? "s" : ""}
                </button>
              </div>
            )}

            {/* Step: Sending */}
            {composeStep === "sending" && (
              <div className="p-12 text-center">
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-700">
                  Sending emails to {selected.size} subscriber{selected.size > 1 ? "s" : ""}...
                </p>
                <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
              </div>
            )}

            {/* Step: Done */}
            {composeStep === "done" && sendResult && (
              <div className="p-12 text-center">
                {sendResult.success ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">Emails Sent!</p>
                    <p className="text-sm text-gray-500">{sendResult.message}</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">Failed to Send</p>
                    <p className="text-sm text-gray-500">{sendResult.message}</p>
                  </>
                )}
                <button
                  onClick={closeCompose}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

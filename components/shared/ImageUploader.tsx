"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import MediaLibraryModal from "@/components/shared/MediaLibrary/MediaLibraryModal";

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  placeholder = "https://...",
  required = false,
  className = "",
}: ImageUploaderProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-gray-700 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-3 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-0.5 rounded-full"
              title="Clear Image URL"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsLibraryOpen(true)}
          className="px-3 py-2 text-xs font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload / Library</span>
        </button>
      </div>

      {/* Image Preview Thumbnail */}
      {value && (
        <div className="relative mt-2 w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-sm group">
          <Image
            src={value}
            alt="Preview"
            fill
            unoptimized
            sizes="80px"
            className="object-cover"
            onError={(e) => {
              // Handle broken images gracefully
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onSelect={(selectedUrl) => {
          onChange(selectedUrl);
        }}
      />
    </div>
  );
}

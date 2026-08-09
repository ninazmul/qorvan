"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Plus, Image as ImageIcon, ArrowUp, ArrowDown } from "lucide-react";
import MediaLibraryModal from "@/components/shared/MediaLibrary/MediaLibraryModal";
import { Button } from "@/components/ui/button";

interface MultiImageUploaderProps {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  required?: boolean;
  className?: string;
}

export default function MultiImageUploader({
  label,
  value,
  onChange,
  maxImages = 10,
  required = false,
  className = "",
}: MultiImageUploaderProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const urls = Array.isArray(value) ? value : [];
  const remaining = Math.max(0, maxImages - urls.length);

  const handleRemove = (index: number) => {
    const next = urls.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= urls.length) return;
    const next = [...urls];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };

  const handleAddFromLibrary = (selectedUrls: string[]) => {
    const deduped = Array.from(new Set([...urls, ...selectedUrls]));
    const capped = deduped.slice(0, maxImages);
    onChange(capped);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-gray-700 block">
          {label}
          {required && <span className="text-red-500"> *</span>}
          <span className="ml-2 text-gray-500 font-normal">
            ({urls.length}/{maxImages})
          </span>
        </label>
      )}

      {urls.length === 0 ? (
        <button
          type="button"
          onClick={() => setIsLibraryOpen(true)}
          className="w-full min-h-[180px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition flex flex-col items-center justify-center gap-2 text-gray-500 group"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm border flex items-center justify-center group-hover:scale-110 transition">
            <Plus className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-sm font-semibold">No gallery images yet</p>
          <p className="text-xs text-gray-500">
            Click to browse media library and add up to {maxImages} images
          </p>
        </button>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {urls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative aspect-square border rounded-xl overflow-hidden bg-gray-50 shadow-sm"
              >
                <Image
                  src={url}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 50vw, 150px"
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col">
                  <div className="flex justify-between items-start p-1.5">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded shadow disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move left / earlier"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 1)}
                        disabled={index === urls.length - 1}
                        className="bg-white/90 hover:bg-white text-gray-700 p-1 rounded shadow disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move right / later"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-auto flex justify-center pb-2">
                    <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      #{index + 1}
                    </span>
                  </div>
                </div>
                {urls.length > 1 && (
                  <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition">
                    <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      #{index + 1}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {urls.length < maxImages && (
              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition flex flex-col items-center justify-center gap-1.5 text-gray-500 group"
                title={`Add more images (${remaining} remaining)`}
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border flex items-center justify-center group-hover:scale-110 transition">
                  <Plus className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-[11px] font-semibold">Add Image</p>
                <p className="text-[10px] text-gray-500">{remaining} slots left</p>
              </button>
            )}
          </div>

          {urls.length >= maxImages && (
            <p className="text-xs text-amber-600 font-medium">
              Maximum of {maxImages} images reached. Remove an image to add more.
            </p>
          )}
        </>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsLibraryOpen(true)}
          className="gap-1.5 text-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Browse Media Library</span>
        </Button>
        {urls.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </Button>
        )}
      </div>

      <MediaLibraryModal
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        mode="multi"
        initialSelection={urls}
        onSelect={handleAddFromLibrary}
      />
    </div>
  );
}

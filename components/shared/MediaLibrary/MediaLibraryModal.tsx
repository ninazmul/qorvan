"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDropzone } from "@/lib/uploadthing";
import { getMediaItems, getDistinctFolders } from "@/lib/actions/media.actions";
import { IMedia } from "@/lib/database/models/media.model";
import Image from "next/image";
import Loader from "@/components/shared/Loader";
import { FileText, Search, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

type MediaLibraryModalMode = "single" | "multi";

interface MediaLibraryModalBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowedTypes?: string[];
}

interface SingleSelectProps extends MediaLibraryModalBaseProps {
  mode?: "single";
  onSelect: (url: string) => void;
  initialSelection?: never;
}

interface MultiSelectProps extends MediaLibraryModalBaseProps {
  mode: "multi";
  onSelect: (urls: string[]) => void;
  initialSelection?: string[];
}

type MediaLibraryModalProps = SingleSelectProps | MultiSelectProps;

export default function MediaLibraryModal(props: MediaLibraryModalProps) {
  const { open, onOpenChange, allowedTypes } = props;
  const mode: MediaLibraryModalMode =
    (props as any).mode === "multi" ? "multi" : "single";

  const [items, setItems] = useState<IMedia[]>([]);
  const [folders, setFolders] = useState<string[]>(["Root"]);
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("browse");

  const [multiSelection, setMultiSelection] = useState<Set<string>>(new Set());

  const filteredItems = items.filter((item) =>
    item.mimeType?.startsWith("image/"),
  );

  useEffect(() => {
    if (open && mode === "multi") {
      const initial = (props as MultiSelectProps).initialSelection || [];
      setMultiSelection(new Set(initial));
    }
  }, [open, mode]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await getMediaItems({
        folder: selectedFolder,
        search: searchQuery,
        limit: 50,
      });
      setItems(response.items);

      const distinctFolders = await getDistinctFolders();
      setFolders(distinctFolders);
    } catch (error) {
      toast.error("Failed to load media library assets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, selectedFolder, searchQuery]);

  const handleUploadComplete = (res: any[]) => {
    const count = Array.isArray(res) ? res.length : 1;
    toast.success(`${count} file(s) uploaded successfully.`);
    setActiveTab("browse");
    fetchMedia();
  };

  const toggleMultiSelect = (url: string) => {
    setMultiSelection((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleConfirmMultiSelect = () => {
    const urls = Array.from(multiSelection);
    (props as MultiSelectProps).onSelect(urls);
    onOpenChange(false);
  };

  const handleClearMultiSelection = () => {
    setMultiSelection(new Set());
  };

  const handleSingleItemClick = (url: string) => {
    (props as SingleSelectProps).onSelect(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Media Library
            {mode === "multi" && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Multi-select: {multiSelection.size} selected)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="browse">Browse Assets</TabsTrigger>
            <TabsTrigger value="upload">Upload New Asset</TabsTrigger>
          </TabsList>

          <TabsContent
            value="browse"
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4.5 w-4.5 text-gray-500" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Folders</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mode === "multi" && multiSelection.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearMultiSelection}
                  className="shrink-0"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg bg-gray-50 p-4">
              {isLoading ? (
                <Loader label="Loading library assets..." />
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[250px] text-gray-500">
                  <p>No media files found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {filteredItems.map((item) => {
                    const isImage = item.mimeType?.startsWith("image/");
                    const isSelected = multiSelection.has(item.url);
                    return (
                      <div
                        key={item._id.toString()}
                        onClick={() => {
                          if (mode === "multi") {
                            toggleMultiSelect(item.url);
                          } else {
                            handleSingleItemClick(item.url);
                          }
                        }}
                        className={`group relative cursor-pointer border rounded-lg bg-white overflow-hidden hover:shadow-md transition aspect-square ${
                          isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                      >
                        {isImage ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={item.url}
                              alt={item.altText || item.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 250px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            <FileText className="w-10 h-10 text-primary/50 mb-2" />
                            <span className="text-xs font-medium text-gray-600 truncate w-full">
                              {item.name}
                            </span>
                          </div>
                        )}

                        {mode === "multi" ? (
                          <div className="absolute top-2 left-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleMultiSelect(item.url)}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-white border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Button size="sm" variant="secondary">
                              Select Asset
                            </Button>
                          </div>
                        )}

                        {isSelected && mode === "multi" && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {mode === "multi" && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{multiSelection.size}</span>{" "}
                  image{multiSelection.size === 1 ? "" : "s"} selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmMultiSelect}
                    disabled={multiSelection.size === 0}
                  >
                    Confirm Selection
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="upload"
            className="flex-1 overflow-y-auto min-h-0"
          >
            <div className="border rounded-lg bg-gray-50 p-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-lg">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Upload Destination Folder
                  </label>
                  <Select
                    value={selectedFolder === "All" ? "Root" : selectedFolder}
                    onValueChange={setSelectedFolder}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder} value={folder}>
                          {folder}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  You may select up to 20 images at once (8MB max per image).
                </p>

                <UploadDropzone
                  endpoint="mediaUploader"
                  input={{
                    folder: selectedFolder === "All" ? "Root" : selectedFolder,
                  }}
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`);
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

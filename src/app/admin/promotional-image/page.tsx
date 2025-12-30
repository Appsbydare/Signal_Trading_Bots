"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function PromotionalImageAdminPage() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current image on mount
  useEffect(() => {
    loadCurrentImage();
    
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const loadCurrentImage = async () => {
    setLoading(true);
    setImageLoadError(false);
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/admin/promotional-image", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const imageSource = data.imageUrl || data.apiEndpoint || null;
        if (imageSource) {
          // Add timestamp to prevent caching - use fresh timestamp each time
          const freshTimestamp = Date.now();
          setCurrentImage(`${imageSource}?t=${freshTimestamp}&v=${freshTimestamp}`);
          setCurrentUrl(data.redirectUrl || "");
          setImageLoadError(false);
        } else {
          setCurrentImage(null);
          setCurrentUrl("");
          setImageLoadError(false);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setImageLoadError(true);
        setMessage({ type: "error", text: errorData.error || "Failed to load image data" });
      }
    } catch (error: any) {
      console.error("Failed to load image:", error);
      setImageLoadError(true);
      if (error.name === "AbortError") {
        setMessage({ type: "error", text: "Request timed out. Please try again." });
      } else {
        setMessage({ type: "error", text: "Failed to load current image. Please check your connection and try again." });
      }
      setCurrentImage(null);
      setCurrentUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." });
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ type: "error", text: "File size too large. Maximum size is 5MB." });
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Create preview URL
    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setMessage(null);
  };

  const handleSave = async () => {
    // If no file selected and no current image, just save URL
    if (!selectedFile && !currentImage) {
      setMessage({ type: "error", text: "Please select an image to upload" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      
      // If a new file is selected, include it
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      formData.append("url", currentUrl);

      // Use POST if new image, PATCH if only URL update
      const method = selectedFile ? "POST" : "PATCH";
      const response = await fetch("/api/admin/promotional-image", {
        method,
        body: method === "POST" ? formData : JSON.stringify({ url: currentUrl }),
        headers: method === "PATCH" ? { "Content-Type": "application/json" } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: "success", text: data.message || "Saved successfully!" });
        
        // Clear selected file and preview
        if (selectedFile) {
          setSelectedFile(null);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
        
        // Clear current image and preview to force reload
        setCurrentImage(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        
        // Force reload with a delay to ensure file is fully written to disk
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadCurrentImage();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to save" });
      }
    } catch (error) {
      console.error("Failed to save:", error);
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the current promotional image?")) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/promotional-image", {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Image deleted successfully!" });
        setCurrentImage(null);
        setCurrentUrl("");
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to delete image" });
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      setMessage({ type: "error", text: "Failed to delete image" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Promotional Image Admin</h1>
        <p className="mt-1 text-sm text-zinc-400">Upload and manage promotional image for the application</p>
      </div>

      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success" 
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" 
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Current Image Preview */}
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-12">
            <p className="text-zinc-400">Loading...</p>
          </div>
        ) : currentImage || previewUrl ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {previewUrl ? "New Image Preview" : "Current Promotional Image"}
            </h2>
            <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
              {imageLoadError && !previewUrl ? (
                <div className="flex h-full items-center justify-center bg-red-500/10">
                  <p className="text-red-300">Failed to load image</p>
                </div>
              ) : (
                <Image
                  src={previewUrl || currentImage || ""}
                  alt="Promotional Image"
                  fill
                  className="object-contain"
                  unoptimized
                  onError={() => {
                    if (!previewUrl) {
                      setImageLoadError(true);
                    }
                  }}
                />
              )}
            </div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>
                <strong className="text-zinc-300">API Endpoint:</strong>{" "}
                <code className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">
                  https://www.signaltradingbots.com/api/app/promotional-image
                </code>
              </p>
              {currentUrl && (
                <p>
                  <strong className="text-zinc-300">Redirect URL:</strong>{" "}
                  <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-[#5e17eb] hover:underline">
                    {currentUrl}
                  </a>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <p className="text-zinc-400">No promotional image uploaded yet</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">Upload New Image</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Select Image File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                disabled={saving}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#5e17eb] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#4512c2] disabled:opacity-50"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Supported formats: JPEG, PNG, GIF, WebP. Maximum file size: 5MB
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Redirect URL (when image is clicked)
              </label>
              <input
                type="url"
                value={currentUrl}
                onChange={(e) => setCurrentUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#5e17eb] focus:outline-none focus:ring-1 focus:ring-[#5e17eb]"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Enter the URL where users will be redirected when they click on the image
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || (!selectedFile && !currentImage)}
            className="rounded-md bg-[#5e17eb] px-6 py-2 text-white transition hover:bg-[#4512c2] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {currentImage && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-md border border-red-500/30 bg-red-500/10 px-6 py-2 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Image"}
            </button>
          )}
          <button
            onClick={loadCurrentImage}
            disabled={loading || saving}
            className="rounded-md border border-zinc-700 bg-zinc-800/50 px-6 py-2 text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
}


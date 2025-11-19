"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function PromotionalImageAdminPage() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current image on mount
  useEffect(() => {
    loadCurrentImage();
  }, []);

  const loadCurrentImage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/promotional-image");
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          // Add timestamp to prevent caching
          setCurrentImage(`${data.url}?t=${Date.now()}`);
        } else {
          setCurrentImage(null);
        }
      }
    } catch (error) {
      console.error("Failed to load image:", error);
      setMessage({ type: "error", text: "Failed to load current image" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ type: "error", text: "File size too large. Maximum size is 5MB." });
      return;
    }

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/promotional-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: "success", text: data.message || "Image uploaded successfully!" });
        // Reload to show new image
        await loadCurrentImage();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to upload image" });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      setMessage({ type: "error", text: "Failed to upload image" });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Promotional Image - Admin</h1>
        <p className="text-zinc-600">Upload and manage promotional image for the application</p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-md p-4 ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Current Image Preview */}
        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-12">
            <p className="text-zinc-600">Loading...</p>
          </div>
        ) : currentImage ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-zinc-700">Current Promotional Image</h2>
            <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
              <Image
                src={currentImage}
                alt="Promotional Image"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="text-sm text-zinc-600">
              <p>
                <strong>API Endpoint:</strong>{" "}
                <code className="rounded bg-zinc-100 px-2 py-1">
                  https://www.signaltradingbots.com/api/app/promotional-image
                </code>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center">
            <p className="text-zinc-600">No promotional image uploaded yet</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-700">Upload New Image</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Select Image File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                disabled={uploading}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#5e17eb] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#4512c2] disabled:opacity-50"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Supported formats: JPEG, PNG, GIF, WebP. Maximum file size: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-md bg-[#5e17eb] px-6 py-2 text-white transition hover:bg-[#4512c2] disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Choose File"}
          </button>
          {currentImage && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md border border-red-300 bg-white px-6 py-2 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Image"}
            </button>
          )}
          <button
            onClick={loadCurrentImage}
            disabled={loading}
            className="rounded-md border border-zinc-300 bg-white px-6 py-2 text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
}


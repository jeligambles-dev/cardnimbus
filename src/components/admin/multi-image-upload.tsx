"use client";

import { useState, useRef } from "react";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  hint?: string;
  maxImages?: number;
}

export function MultiImageUpload({
  value,
  onChange,
  label = "Images",
  hint,
  maxImages = 6,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setError(null);
    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const formData = new FormData();
      toUpload.forEach((f) => formData.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      const newUrls = (data.uploads ?? []).map((u: { url: string }) => u.url);
      onChange([...value, ...newUrls]);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {value.map((url, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-24 w-24 rounded-lg border border-surface-border object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-surface-border bg-surface-raised px-6 py-6 transition-colors hover:border-nimbus-400 hover:bg-nimbus-50/50"
        >
          <svg
            className="h-7 w-7 text-text-muted mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm font-medium text-text-primary">
            {uploading ? "Uploading..." : `Click to upload (${value.length}/${maxImages})`}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            JPEG, PNG, or WebP · Max 10MB each
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

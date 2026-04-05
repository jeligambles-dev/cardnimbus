"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface AvatarUploadProps {
  currentAvatar: string | null;
  userName: string;
  userEmail: string;
}

export function AvatarUpload({ currentAvatar, userName, userEmail }: AvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallback = (userName || userEmail || "U").charAt(0).toUpperCase();

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setAvatar(data.avatarUrl);
      router.refresh();
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove your profile picture?")) return;
    setUploading(true);
    try {
      await fetch("/api/account/avatar", { method: "DELETE" });
      setAvatar(null);
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-5">
      <div className="relative">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface-overlay border-2 border-nimbus-400 flex-shrink-0">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={userName} className="h-full w-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-nimbus-600">
              {fallback}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <svg
                className="animate-spin h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-b from-nimbus-500 to-nimbus-600 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_12px_-2px_rgba(255,0,0,0.35)] ring-1 ring-inset ring-white/10 hover:from-nimbus-400 hover:to-nimbus-500 hover:-translate-y-px active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:translate-y-0"
          >
            {avatar ? "Change photo" : "Upload photo"}
          </button>
          {avatar && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="h-9 px-4 rounded-xl text-xs font-bold border border-surface-border bg-white text-text-secondary hover:border-red-400 hover:text-red-600 hover:-translate-y-px active:translate-y-0 transition-all duration-150 disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-text-muted">JPEG, PNG, or WebP · Max 10MB</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

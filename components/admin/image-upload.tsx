"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { uploadMedia } from "@/lib/upload-media";

export function ImageUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseBrowser();

  const onFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadMedia(supabase, file));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="rounded-xl border border-line max-h-48" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-surface border border-line rounded-full p-1 hover:bg-bg-2"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl p-8 cursor-pointer hover:bg-bg-2 transition-colors">
          <Upload size={20} className="text-ink-3" />
          <span className="text-sm text-ink-2">{uploading ? "Uploading..." : "Click to upload image (max 5MB)"}</span>
          {error && <span className="text-xs text-destructive">{error}</span>}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </label>
      )}
    </div>
  );
}

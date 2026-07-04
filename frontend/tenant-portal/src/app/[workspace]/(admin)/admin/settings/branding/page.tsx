"use client";

import { useRef, useState } from "react";
import { ImageIcon, UploadCloud } from "lucide-react";
import { PageHeader, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

const MAX_BYTES = 512 * 1024;
const ACCEPTED = ["image/png", "image/jpeg"];
const LOGO_URL = "/api/proxy/api/v1/tenant/logo";

export default function BrandingPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  // Cache-buster so the preview reloads after an upload; null until we know a logo exists.
  const [version, setVersion] = useState(0);
  const [hasLogo, setHasLogo] = useState<boolean | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast("Logo must be a PNG or JPEG image.", "error");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast("Logo must be 512 KB or smaller.", "error");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      await apiClient.post("/api/v1/tenant/logo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHasLogo(true);
      setVersion((v) => v + 1);
      toast("Logo updated", "success");
    } catch {
      toast("Upload failed. Check the file type and size, then try again.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Branding" subtitle="Your company logo, used on generated documents." />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        <div className="max-w-xl rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-[14px] font-semibold text-near-black">Company logo</p>
          <p className="text-[13px] text-neutral-500 leading-snug mt-1">
            Appears on the letterhead of your Certificate of Service documents. PNG or JPEG, max 512&nbsp;KB.
          </p>

          <div className="flex items-center gap-5 mt-5">
            <div className="flex-shrink-0 w-28 h-28 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden">
              {hasLogo === false ? (
                <ImageIcon className="w-8 h-8 text-neutral-300" aria-hidden="true" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${LOGO_URL}?v=${version}`}
                  alt="Company logo"
                  className="max-w-full max-h-full object-contain"
                  onLoad={() => setHasLogo(true)}
                  onError={() => setHasLogo(false)}
                />
              )}
            </div>

            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[13.5px] px-4 h-10 rounded-lg transition-colors"
              >
                <UploadCloud size={16} aria-hidden="true" />
                {uploading ? "Uploading…" : hasLogo ? "Replace logo" : "Upload logo"}
              </button>
              <p className="text-[12px] text-neutral-400 mt-2">Recommended: a square or wide logo on a transparent background.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

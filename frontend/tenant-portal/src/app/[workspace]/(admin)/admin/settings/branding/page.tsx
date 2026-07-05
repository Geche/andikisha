"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, UploadCloud, PenLine } from "lucide-react";
import { PageHeader, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

const MAX_BYTES = 512 * 1024;
const ACCEPTED = ["image/png", "image/jpeg"];
const LOGO_URL = "/api/proxy/api/v1/tenant/logo";
const SIGNATURE_URL = "/api/proxy/api/v1/tenant/signatory/image";

interface Signatory {
  name: string;
  title: string;
  signatureContentType: string;
}

function LogoCard() {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [version, setVersion] = useState(0);
  const [hasLogo, setHasLogo] = useState<boolean | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) return toast("Logo must be a PNG or JPEG image.", "error");
    if (file.size > MAX_BYTES) return toast("Logo must be 512 KB or smaller.", "error");
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      await apiClient.post("/api/v1/tenant/logo", form, { headers: { "Content-Type": "multipart/form-data" } });
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
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={handleFile} className="hidden" />
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
  );
}

function SignatoryCard() {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState(0);

  const { data, isLoading, refetch } = useQuery<Signatory | null>({
    queryKey: ["tenant-signatory"],
    queryFn: () =>
      apiClient
        .get("/api/v1/tenant/signatory")
        .then((r) => r.data)
        .catch(() => null),
  });

  useEffect(() => {
    if (data) {
      setName(data.name);
      setTitle(data.title);
    }
  }, [data]);

  const canSave = name.trim() !== "" && title.trim() !== "" && file !== null && !saving;

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && !ACCEPTED.includes(f.type)) return toast("Signature must be a PNG or JPEG image.", "error");
    if (f && f.size > MAX_BYTES) return toast("Signature must be 512 KB or smaller.", "error");
    setFile(f);
  }

  async function save() {
    if (!file) return;
    const form = new FormData();
    form.append("name", name.trim());
    form.append("title", title.trim());
    form.append("file", file);
    setSaving(true);
    try {
      await apiClient.post("/api/v1/tenant/signatory", form, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      setVersion((v) => v + 1);
      if (fileRef.current) fileRef.current.value = "";
      await refetch();
      toast("Signatory saved", "success");
    } catch {
      toast("Save failed. Check the name, title, and image, then try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl rounded-xl border border-neutral-200 bg-white p-6 mt-4">
      <p className="text-[14px] font-semibold text-near-black">Authorized signatory</p>
      <p className="text-[13px] text-neutral-500 leading-snug mt-1">
        Signs your issued Certificates of Service. The name, title, and signature image appear on the document.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="sig-name" className="block text-[12.5px] font-semibold text-neutral-600 mb-1.5">Name</label>
          <input
            id="sig-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            placeholder="e.g. Grace Wanjiku"
            disabled={isLoading}
            className="w-full border border-neutral-200 rounded-lg px-3 h-10 text-[13.5px] text-near-black placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-brand-900/15 focus:border-brand-900"
          />
        </div>
        <div>
          <label htmlFor="sig-title" className="block text-[12.5px] font-semibold text-neutral-600 mb-1.5">Title</label>
          <input
            id="sig-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="e.g. HR Manager"
            disabled={isLoading}
            className="w-full border border-neutral-200 rounded-lg px-3 h-10 text-[13.5px] text-near-black placeholder:text-neutral-300 focus:outline-none focus:ring-4 focus:ring-brand-900/15 focus:border-brand-900"
          />
        </div>

        <div className="flex items-end gap-5">
          <div className="flex-shrink-0 w-40 h-20 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden">
            {file ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={URL.createObjectURL(file)} alt="Signature preview" className="max-w-full max-h-full object-contain" />
            ) : data ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${SIGNATURE_URL}?v=${version}`} alt="Signature" className="max-w-full max-h-full object-contain" />
            ) : (
              <PenLine className="w-7 h-7 text-neutral-300" aria-hidden="true" />
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={pickFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] px-3 h-9 rounded-lg transition-colors"
            >
              <UploadCloud size={14} aria-hidden="true" /> {data ? "Choose new signature" : "Choose signature"}
            </button>
            <p className="text-[12px] text-neutral-400 mt-2">PNG or JPEG on a transparent or white background, max 512&nbsp;KB.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[13.5px] px-4 h-10 rounded-lg transition-colors"
        >
          {saving ? "Saving…" : "Save signatory"}
        </button>
      </div>
    </div>
  );
}

export default function BrandingPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Branding" subtitle="Your company logo and authorized signatory, used on issued documents." />
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        <LogoCard />
        <SignatoryCard />
      </div>
    </div>
  );
}

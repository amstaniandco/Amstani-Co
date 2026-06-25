"use client";

import { useEffect, useRef, useState } from "react";

interface ClaimFormProps {
  issueType: string;
  message: string;
  setIssueType: (value: string) => void;
  setMessage: (value: string) => void;
  mediaFiles: File[];
  onMediaChange: (files: File[]) => void;
  onSubmit: () => void;
  submitting?: boolean;
  error?: string;
  success?: string;
}

export default function ClaimForm({
  issueType,
  message,
  setIssueType,
  setMessage,
  mediaFiles,
  onMediaChange,
  onSubmit,
  submitting,
  error,
  success,
}: ClaimFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const urls = mediaFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [mediaFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files || []);
    onMediaChange([...mediaFiles, ...added]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    onMediaChange(mediaFiles.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full shadow-sm">
        <h2 className="text-base font-bold text-gray-800 dark:text-slate-200 tracking-widest uppercase mb-1">CLAIM</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Please let us know the issue you are facing</p>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Issue Type</label>
          <div className="relative">
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full appearance-none border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-xs text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
            >
              <option value="" disabled>Select Issue Type</option>
              <option value="damaged">Damaged Item</option>
              <option value="missing">Missing Item</option>
              <option value="wrong">Wrong Item</option>
              <option value="other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="#a0aec0" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
            Photo Evidence <span className="text-red-500">*</span>
          </label>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {mediaFiles.length === 0 ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-lg hover:border-teal-400 hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-300 dark:text-slate-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400 dark:text-slate-500">Click to upload photos (JPEG, PNG, WebP)</span>
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group h-20 w-20 shrink-0">
                  <img
                    src={src}
                    alt={`Evidence ${i + 1}`}
                    onClick={() => setLightbox(src)}
                    className="h-full w-full rounded-xl object-cover cursor-pointer border border-gray-200 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    aria-label="Remove photo"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="h-20 w-20 shrink-0 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 hover:border-teal-400 hover:text-teal-500 transition-colors"
                aria-label="Add more photos"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] mt-1">Add more</span>
              </button>
            </div>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please type your message here"
            rows={4}
            className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-xs text-gray-700 dark:text-slate-200 dark:bg-slate-700 placeholder-gray-300 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-teal-400"
          />
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        {success && <p className="text-xs text-teal-600 mb-3">{success}</p>}

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 transition-colors text-white text-sm font-semibold rounded-xl"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <img
            src={lightbox}
            alt="Full view"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

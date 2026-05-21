"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Pause, Play, Store, Trash2, Upload } from "lucide-react";

type Track = {
  _id: string;
  name: string;
  url: string;
  isApplied: boolean;
  createdAt: string;
};

export default function OwnerMusicPage() {
  const [storeName, setStoreName] = useState("My Store");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [applying, setApplying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load store name + tracks
  useEffect(() => {
    fetch("/api/owner/store")
      .then((r) => r.json())
      .then((d) => setStoreName(d.store?.name || "My Store"))
      .catch(() => {});

    fetch("/api/owner/music")
      .then((r) => r.json())
      .then((d) => setTracks(d.tracks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".mp3")) {
      setUploadError("Only MP3 files are supported.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File must be under 15 MB.");
      return;
    }

    setUploadError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/owner/music", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error || "Upload failed."); return; }
      setTracks((prev) => [data.track, ...prev]);
    } finally {
      setUploading(false);
    }
  };

  // ── Preview (play/pause in browser) ────────────────────────────────────────
  const handlePreview = (track: Track) => {
    if (playingId === track._id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(track.url);
    audioRef.current = audio;
    audio.play().catch(() => {});
    audio.onended = () => setPlayingId(null);
    setPlayingId(track._id);
  };

  // ── Apply ───────────────────────────────────────────────────────────────────
  const handleApply = async (track: Track) => {
    if (track.isApplied) return;
    setApplying(track._id);
    try {
      const res = await fetch("/api/owner/music", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: track._id }),
      });
      if (res.ok) {
        const data = await res.json();
        setTracks(data.tracks || []);
      }
    } finally {
      setApplying(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (track: Track) => {
    if (!window.confirm(`Delete "${track.name}"?`)) return;
    // stop preview if playing
    if (playingId === track._id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    setDeleting(track._id);
    try {
      const res = await fetch(`/api/owner/music?id=${track._id}`, { method: "DELETE" });
      if (res.ok) setTracks((prev) => prev.filter((t) => t._id !== track._id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,audio/mpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      <section className="flex items-center gap-2 text-slate-900">
        <Store className="h-5 w-5 text-[#65bbc5]" />
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{storeName}</h1>
      </section>

      <section className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="pt-1 text-[18px] font-semibold tracking-[0.06em] text-slate-900">Upload music file</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Upload an MP3 track, then <strong>Apply</strong> it to play it in your store.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-11 w-full min-w-[140px] items-center justify-center gap-2 rounded-2xl border border-slate-900 bg-white px-6 text-[15px] font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload File"}
            </button>
            <p className="text-[13px] italic text-slate-500">Only MP3, max 15 MB</p>
            {uploadError && <p className="text-[13px] text-red-500">{uploadError}</p>}
          </div>
        </div>

        <div className="mt-4 border-b border-[#99adc4]" />

        {loading ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : tracks.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-400">No tracks uploaded yet. Upload your first MP3.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {tracks.map((track) => (
              <div
                key={track._id}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 transition sm:gap-4 sm:px-4 ${
                  track.isApplied ? "bg-[#b9d8de]" : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                {/* Preview button */}
                <button
                  type="button"
                  onClick={() => handlePreview(track)}
                  className="shrink-0 text-slate-700 hover:text-slate-900"
                  aria-label={playingId === track._id ? "Pause preview" : "Preview track"}
                >
                  {playingId === track._id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>

                {/* Track name */}
                <p className="min-w-0 flex-1 truncate text-[15px] tracking-[0.01em] text-slate-800 sm:text-[16px]">
                  {track.name}
                </p>

                {/* Applied badge */}
                {track.isApplied && (
                  <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#007f88] px-2.5 py-0.5 text-[11px] font-semibold text-white sm:inline-flex">
                    <CheckCircle2 className="h-3 w-3" /> Applied
                  </span>
                )}

                {/* Apply button */}
                <button
                  type="button"
                  onClick={() => handleApply(track)}
                  disabled={track.isApplied || applying === track._id}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                    track.isApplied
                      ? "cursor-default bg-transparent text-[#007f88]"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-[#65bbc5] hover:text-[#65bbc5] disabled:opacity-50"
                  }`}
                  aria-label={track.isApplied ? "Currently applied" : "Apply to store"}
                >
                  {applying === track._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : track.isApplied ? (
                    "✓ Active"
                  ) : (
                    "Apply"
                  )}
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(track)}
                  disabled={deleting === track._id}
                  className="shrink-0 text-red-400 transition hover:text-red-500 disabled:opacity-50"
                  aria-label="Delete track"
                >
                  {deleting === track._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

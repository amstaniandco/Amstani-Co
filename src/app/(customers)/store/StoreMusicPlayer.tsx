"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Music2, VolumeX } from "lucide-react";
import { fetchStore } from "../../../lib/store-cache";

const MUTE_KEY = "storeMusicMuted";
const STORE_ID_KEY = "currentStoreId";

// Where the store's resume position is saved, per store.
function progressKey(storeId: string) {
  return `storeMusicProgress:${storeId}`;
}

type Progress = { index: number; time: number };

function loadProgress(storeId: string): Progress | null {
  try {
    const raw = localStorage.getItem(progressKey(storeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.index === "number" && typeof parsed?.time === "number") return parsed;
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

function saveProgress(storeId: string, index: number, time: number) {
  try {
    localStorage.setItem(progressKey(storeId), JSON.stringify({ index, time }));
  } catch {
    /* ignore quota errors */
  }
}

// Pages of a store where the store's music should keep playing.
function isMusicPath(pathname: string) {
  return (
    pathname === "/store" ||
    pathname.startsWith("/store/") ||
    pathname === "/product" ||
    pathname === "/form"
  );
}

export default function StoreMusicPlayer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlStoreId = searchParams.get("storeId");
  const onMusicPage = isMusicPath(pathname);

  const [playlist, setPlaylist] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fetchedForRef = useRef<string | null>(null);
  const storeIdRef = useRef<string | null>(null);
  const indexRef = useRef(0);
  const lastSaveRef = useRef(0);

  // Restore persisted mute preference
  useEffect(() => {
    setIsMuted(localStorage.getItem(MUTE_KEY) === "true");
  }, []);

  // Remember the active store whenever it appears in the URL
  useEffect(() => {
    if (urlStoreId) sessionStorage.setItem(STORE_ID_KEY, urlStoreId);
  }, [urlStoreId]);

  // Fetch the store's playlist — only when on a store page, and only when the
  // store actually changes (so it never refetches between pages of the same store).
  useEffect(() => {
    if (!onMusicPage) return;
    const effectiveStoreId = urlStoreId || sessionStorage.getItem(STORE_ID_KEY);
    if (!effectiveStoreId || effectiveStoreId === fetchedForRef.current) return;
    fetchedForRef.current = effectiveStoreId;
    storeIdRef.current = effectiveStoreId;

    // Shares the same request/cache as the store page — no duplicate fetch
    fetchStore({ storeId: effectiveStoreId }).then((store) => {
      const urls = store?.settings?.musicUrls?.length
        ? store.settings.musicUrls
        : store?.settings?.musicUrl
          ? [store.settings.musicUrl]
          : [];
      setPlaylist(urls);
    });
  }, [onMusicPage, urlStoreId]);

  // Create / swap the audio element only when the playlist itself changes.
  // This component is mounted once at the customer layout level, so it does NOT
  // remount between pages — the audio keeps playing across navigation. Tracks
  // play one after another (looping back to the first), and playback resumes
  // from the exact track + position where the customer last left the store.
  useEffect(() => {
    if (!playlist.length) {
      audioRef.current?.pause();
      audioRef.current = null;
      return;
    }

    const storeId = storeIdRef.current;
    const saved = storeId ? loadProgress(storeId) : null;
    const startIndex = saved && saved.index < playlist.length ? saved.index : 0;
    const startTime = saved ? saved.time : 0;
    indexRef.current = startIndex;

    const audio = new Audio(playlist[startIndex]);
    audio.muted = isMuted;
    audioRef.current = audio;

    // Seek to the saved position once the track's metadata is available.
    const onLoaded = () => {
      if (startTime > 0) {
        try {
          audio.currentTime = startTime;
        } catch {
          /* seeking may fail before the track is ready — ignore */
        }
      }
    };
    audio.addEventListener("loadedmetadata", onLoaded, { once: true });

    // When a track ends, advance to the next one (wrapping back to the first).
    const onEnded = () => {
      indexRef.current = (indexRef.current + 1) % playlist.length;
      audio.src = playlist[indexRef.current];
      audio.currentTime = 0;
      if (storeId) saveProgress(storeId, indexRef.current, 0);
      audio.play().catch(() => {});
    };
    audio.addEventListener("ended", onEnded);

    // Persist the resume position as the track plays (throttled to ~1/sec).
    const onTimeUpdate = () => {
      if (!storeId) return;
      const now = Date.now();
      if (now - lastSaveRef.current < 1000) return;
      lastSaveRef.current = now;
      saveProgress(storeId, indexRef.current, audio.currentTime);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);

    if (onMusicPage && !isMuted) {
      audio.play().catch(() => setAutoplayBlocked(true));
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist]);

  // Save the exact position whenever the tab is hidden or the page unloads, so
  // closing the store captures the precise moment the music stopped.
  useEffect(() => {
    const persist = () => {
      const audio = audioRef.current;
      const storeId = storeIdRef.current;
      if (audio && storeId) saveProgress(storeId, indexRef.current, audio.currentTime);
    };
    const onVisibility = () => {
      if (document.hidden) persist();
    };
    window.addEventListener("beforeunload", persist);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Pause when the user leaves store pages; resume when they return — without
  // recreating the audio (so it doesn't restart). Save position on leaving.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (onMusicPage && !isMuted) {
      audio.play().catch(() => {});
    } else if (!onMusicPage) {
      audio.pause();
      if (storeIdRef.current) saveProgress(storeIdRef.current, indexRef.current, audio.currentTime);
    }
  }, [onMusicPage, isMuted]);

  // Sync mute to the audio element and persist the preference
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
    localStorage.setItem(MUTE_KEY, String(isMuted));
  }, [isMuted]);

  if (!onMusicPage || !playlist.length) return null;

  function handleClick() {
    if (autoplayBlocked && audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {});
      setAutoplayBlocked(false);
      setIsMuted(false);
      return;
    }
    setIsMuted((prev) => !prev);
  }

  return (
    <button
      type="button"
      data-tutorial-id="customer-music-toggle"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full p-3 sm:rounded-xl sm:px-4 sm:py-2.5 text-sm font-semibold border border-[#68B8C1] bg-[#eaf8fa] text-[#68B8C1] shadow-sm transition hover:bg-[#ddf3f6] dark:border-[#4f9ea7] dark:bg-slate-800 dark:text-[#7dc8d1] dark:hover:bg-slate-700"
    >
      {isMuted && !autoplayBlocked ? <VolumeX className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
      <span className="hidden sm:inline">
        {autoplayBlocked ? "Tap to play music" : isMuted ? "Music Muted" : "Mute Store Music"}
      </span>
    </button>
  );
}

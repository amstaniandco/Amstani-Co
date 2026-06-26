"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Music2, VolumeX } from "lucide-react";
import { fetchStore } from "../../../lib/store-cache";

const MUTE_KEY = "storeMusicMuted";
const STORE_ID_KEY = "currentStoreId";

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

  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fetchedForRef = useRef<string | null>(null);

  // Restore persisted mute preference
  useEffect(() => {
    setIsMuted(localStorage.getItem(MUTE_KEY) === "true");
  }, []);

  // Remember the active store whenever it appears in the URL
  useEffect(() => {
    if (urlStoreId) sessionStorage.setItem(STORE_ID_KEY, urlStoreId);
  }, [urlStoreId]);

  // Fetch the store's music URL — only when on a store page, and only
  // when the store actually changes (so it never refetches between pages
  // of the same store).
  useEffect(() => {
    if (!onMusicPage) return;
    const effectiveStoreId = urlStoreId || sessionStorage.getItem(STORE_ID_KEY);
    if (!effectiveStoreId || effectiveStoreId === fetchedForRef.current) return;
    fetchedForRef.current = effectiveStoreId;

    // Shares the same request/cache as the store page — no duplicate fetch
    fetchStore({ storeId: effectiveStoreId }).then((store) => {
      setMusicUrl(store?.settings?.musicUrl ?? null);
    });
  }, [onMusicPage, urlStoreId]);

  // Create / swap the audio element only when the track itself changes.
  // This component is mounted once at the customer layout level, so it does
  // NOT remount between pages — the audio keeps playing across navigation.
  useEffect(() => {
    if (!musicUrl) {
      audioRef.current?.pause();
      return;
    }
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.muted = isMuted;
    audioRef.current = audio;
    audio.play().catch(() => setAutoplayBlocked(true));
    return () => {
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicUrl]);

  // Pause when the user leaves store pages; resume when they return —
  // without recreating the audio (so it doesn't restart).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (onMusicPage && !isMuted) {
      audio.play().catch(() => {});
    } else if (!onMusicPage) {
      audio.pause();
    }
  }, [onMusicPage, isMuted]);

  // Sync mute to the audio element and persist the preference
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
    localStorage.setItem(MUTE_KEY, String(isMuted));
  }, [isMuted]);

  if (!onMusicPage || !musicUrl) return null;

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

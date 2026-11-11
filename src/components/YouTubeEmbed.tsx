"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, PlayCircle } from "lucide-react";

interface YouTubeEmbedProps {
  title: string;
  youtubeUrl: string;
  offlineNotice: string;
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    const parts = u.pathname.split("/");
    const embedIdx = parts.indexOf("embed");
    if (embedIdx !== -1 && parts[embedIdx + 1]) {
      return parts[embedIdx + 1];
    }
  } catch {
    // ignore
  }
  return null;
}

export function YouTubeEmbed({ title, youtubeUrl, offlineNotice }: YouTubeEmbedProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Probe YouTube favicon to detect LAN-only / no-internet environment
    const img = new Image();
    const timer = setTimeout(() => setLoadFailed(true), 3500);
    img.onload = () => {
      clearTimeout(timer);
      setLoadFailed(false);
    };
    img.onerror = () => {
      clearTimeout(timer);
      setLoadFailed(true);
    };
    img.src = `https://www.youtube.com/favicon.ico?_t=${Date.now()}`;

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const videoId = extractYouTubeId(youtubeUrl);

  if (!isOnline || loadFailed || !videoId) {
    return (
      <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-5 flex items-center gap-4">
        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
          <WifiOff className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            {title}
          </h4>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mt-1">
            Video uchun internet kerak ({offlineNotice})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-900">
      <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-slate-900 dark:text-white">{title}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{offlineNotice}</span>
      </div>
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

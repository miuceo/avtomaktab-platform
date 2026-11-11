"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { Edit2, Plus, Trash2 } from "lucide-react";

interface VideoRow {
  id: number;
  chapter_id: number | null;
  title_uz: string;
  title_ru: string;
  youtube_url: string;
  ru_reviewed: boolean;
}

export function AdminVideosClient({
  lang,
  videos,
  chapters,
}: {
  lang: Lang;
  videos: VideoRow[];
  chapters: Array<{ id: number; title_uz: string }>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [chapterId, setChapterId] = useState<number | null>(chapters[0]?.id || null);
  const [titleUz, setTitleUz] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "video",
        payload: {
          id: editingId,
          chapter_id: chapterId,
          title_uz: titleUz,
          title_ru: titleRu,
          youtube_url: youtubeUrl,
          ru_reviewed: true,
        },
      }),
    });
    setEditingId(undefined);
    setTitleUz("");
    setTitleRu("");
    setYoutubeUrl("");
    router.refresh();
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/entities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "video", id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-enter">
      <h1 className="text-2xl font-bold">{t(lang, "nav.adminVideos")}</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-xs font-bold mb-1">Video sarlavhasi (UZ) *</label>
          <input
            type="text"
            required
            value={titleUz}
            onChange={(e) => setTitleUz(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Название видео (RU)</label>
          <input
            type="text"
            value={titleRu}
            onChange={(e) => setTitleRu(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">YouTube URL *</label>
          <input
            type="url"
            required
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Tegishli bob</label>
          <select
            value={chapterId || ""}
            onChange={(e) => setChapterId(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          >
            <option value="">— Tanlanmagan —</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title_uz}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-800 text-white text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            {editingId ? t(lang, "app.save") : t(lang, "app.add")}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {videos.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-bold">{v.title_uz}</div>
              <div className="text-xs text-slate-500">{v.youtube_url}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(v.id);
                  setChapterId(v.chapter_id);
                  setTitleUz(v.title_uz);
                  setTitleRu(v.title_ru);
                  setYoutubeUrl(v.youtube_url);
                }}
                className="p-2 rounded border"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(v.id)}
                className="p-2 rounded border text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

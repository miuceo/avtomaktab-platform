"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";

interface ChapterRow {
  id: number;
  sort: number;
  title_uz: string;
  title_ru: string;
  body_uz: string;
  body_ru: string;
  topic_id: number | null;
  ru_reviewed: boolean;
}

export function AdminChaptersClient({
  lang,
  chapters,
  topics,
}: {
  lang: Lang;
  chapters: ChapterRow[];
  topics: Array<{ id: number; name_uz: string }>;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState(chapters.length + 1);
  const [titleUz, setTitleUz] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [bodyUz, setBodyUz] = useState("");
  const [bodyRu, setBodyRu] = useState("");
  const [topicId, setTopicId] = useState<number | null>(topics[0]?.id || null);
  const [ruReviewed, setRuReviewed] = useState(true);

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.path) {
      setBodyUz((prev) => `${prev}\n![Rasm](${data.path})\n`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "chapter",
        payload: {
          id: editingId,
          sort: Number(sort),
          title_uz: titleUz,
          title_ru: titleRu,
          body_uz: bodyUz,
          body_ru: bodyRu,
          topic_id: topicId,
          ru_reviewed: ruReviewed,
        },
      }),
    });
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/entities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "chapter", id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t(lang, "nav.adminChapters")}</h1>
        <button
          type="button"
          onClick={() => {
            setEditingId(undefined);
            setSort(chapters.length + 1);
            setTitleUz("");
            setTitleRu("");
            setBodyUz("");
            setBodyRu("");
            setTopicId(topics[0]?.id || null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-800 text-white text-sm font-bold"
        >
          <Plus className="w-4 h-4" />
          {t(lang, "app.add")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-700 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Tartib raqami (Sort)</label>
              <input
                type="number"
                value={sort}
                onChange={(e) => setSort(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Bog&apos;langan mavzu</label>
              <select
                value={topicId || ""}
                onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="">— Tanlanmagan —</option>
                {topics.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.name_uz}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Matnga rasm qo&apos;shish</span>
                <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Sarlavha (UZ) *</label>
              <input
                type="text"
                required
                value={titleUz}
                onChange={(e) => setTitleUz(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Заголовок (RU)</label>
              <input
                type="text"
                value={titleRu}
                onChange={(e) => setTitleRu(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Matn (Markdown UZ) *</label>
              <textarea
                rows={7}
                required
                value={bodyUz}
                onChange={(e) => setBodyUz(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Текст (Markdown RU)</label>
              <textarea
                rows={7}
                value={bodyRu}
                onChange={(e) => setBodyRu(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border text-sm"
            >
              {t(lang, "app.cancel")}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-800 text-white text-sm font-bold"
            >
              {t(lang, "app.save")}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {chapters.map((ch) => (
          <div
            key={ch.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-bold text-base">
                {ch.sort}. {ch.title_uz}
              </div>
              <div className="text-xs text-slate-500">{ch.title_ru}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(ch.id);
                  setSort(ch.sort);
                  setTitleUz(ch.title_uz);
                  setTitleRu(ch.title_ru);
                  setBodyUz(ch.body_uz);
                  setBodyRu(ch.body_ru);
                  setTopicId(ch.topic_id);
                  setRuReviewed(ch.ru_reviewed);
                  setShowForm(true);
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(ch.id)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600"
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

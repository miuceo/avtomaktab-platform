"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { Edit2, Plus, Trash2 } from "lucide-react";

interface TopicRow {
  id: number;
  name_uz: string;
  name_ru: string;
  ru_reviewed: boolean;
}

export function AdminTopicsClient({
  lang,
  topics,
}: {
  lang: Lang;
  topics: TopicRow[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [nameUz, setNameUz] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [ruReviewed, setRuReviewed] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "topic",
        payload: {
          id: editingId,
          name_uz: nameUz.trim(),
          name_ru: nameRu.trim(),
          ru_reviewed: ruReviewed,
        },
      }),
    });
    setEditingId(undefined);
    setNameUz("");
    setNameRu("");
    router.refresh();
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/entities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "topic", id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-enter">
      <h1 className="text-2xl font-bold">{t(lang, "nav.adminTopics")}</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      >
        <div>
          <label className="block text-xs font-bold mb-1">Mavzu nomi (UZ) *</label>
          <input
            type="text"
            required
            value={nameUz}
            onChange={(e) => setNameUz(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Название темы (RU)</label>
          <input
            type="text"
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-800 text-white text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            {editingId ? t(lang, "app.save") : t(lang, "app.add")}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(undefined);
                setNameUz("");
                setNameRu("");
              }}
              className="px-4 py-2.5 rounded-xl border text-sm"
            >
              {t(lang, "app.cancel")}
            </button>
          )}
        </div>
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">O&apos;zbekcha</th>
              <th className="py-3 px-4">Русский</th>
              <th className="py-3 px-4 text-right">{t(lang, "app.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((tp) => (
              <tr
                key={tp.id}
                className="border-b border-slate-100 dark:border-slate-800/60"
              >
                <td className="py-3 px-4 font-mono text-xs">{tp.id}</td>
                <td className="py-3 px-4 font-bold">{tp.name_uz}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{tp.name_ru}</td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(tp.id);
                        setNameUz(tp.name_uz);
                        setNameRu(tp.name_ru);
                        setRuReviewed(tp.ru_reviewed);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tp.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

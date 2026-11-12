"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";

interface SignRow {
  id: number;
  code: string;
  group_uz: string;
  group_ru: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  image_path: string;
  ru_reviewed: boolean;
}

export function AdminSignsClient({
  lang,
  signs,
}: {
  lang: Lang;
  signs: SignRow[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [code, setCode] = useState("1.1");
  const [groupUz, setGroupUz] = useState("1. Ogohlantiruvchi belgilar");
  const [groupRu, setGroupRu] = useState("1. Предупреждающие знаки");
  const [nameUz, setNameUz] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [descUz, setDescUz] = useState("");
  const [descRu, setDescRu] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [ruReviewed, setRuReviewed] = useState(true);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.path) {
      setImagePath(data.path);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "road_sign",
        payload: {
          id: editingId,
          code,
          group_uz: groupUz,
          group_ru: groupRu,
          name_uz: nameUz,
          name_ru: nameRu,
          description_uz: descUz,
          description_ru: descRu,
          image_path: imagePath,
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
      body: JSON.stringify({ entity: "road_sign", id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t(lang, "nav.adminSigns")} ({signs.length})
        </h1>
        <button
          type="button"
          onClick={() => {
            setEditingId(undefined);
            setCode("");
            setNameUz("");
            setNameRu("");
            setDescUz("");
            setDescRu("");
            setImagePath("");
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
              <label className="block text-xs font-bold mb-1">Belgi kodi (masalan, 2.1) *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Guruh (UZ) *</label>
              <input
                type="text"
                required
                value={groupUz}
                onChange={(e) => setGroupUz(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Группа (RU)</label>
              <input
                type="text"
                value={groupRu}
                onChange={(e) => setGroupRu(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Nomi (UZ) *</label>
              <input
                type="text"
                required
                value={nameUz}
                onChange={(e) => setNameUz(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Название (RU)</label>
              <input
                type="text"
                value={nameRu}
                onChange={(e) => setNameRu(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Tavsif (UZ)</label>
              <textarea
                rows={2}
                value={descUz}
                onChange={(e) => setDescUz(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Описание (RU)</label>
              <textarea
                rows={2}
                value={descRu}
                onChange={(e) => setDescRu(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              required
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-bold cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Rasm yuklash</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {signs.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={s.image_path}
                alt={s.code}
                className="w-12 h-12 object-contain shrink-0"
              />
              <div>
                <div className="text-xs font-mono font-bold text-blue-700">{s.code}</div>
                <div className="font-bold text-sm">{s.name_uz}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingId(s.id);
                  setCode(s.code);
                  setGroupUz(s.group_uz);
                  setGroupRu(s.group_ru);
                  setNameUz(s.name_uz);
                  setNameRu(s.name_ru);
                  setDescUz(s.description_uz);
                  setDescRu(s.description_ru);
                  setImagePath(s.image_path);
                  setRuReviewed(s.ru_reviewed);
                  setShowForm(true);
                }}
                className="p-1.5 rounded border"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="p-1.5 rounded border text-red-600"
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

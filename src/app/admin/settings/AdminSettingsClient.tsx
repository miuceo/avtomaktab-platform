"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import type { AppSettings } from "@/lib/settings";
import { CheckCircle2, Save, Upload } from "lucide-react";

export function AdminSettingsClient({
  lang,
  initialSettings,
}: {
  lang: Lang;
  initialSettings: AppSettings;
}) {
  const router = useRouter();
  const [centerName, setCenterName] = useState(initialSettings.center_name);
  const [logoPath, setLogoPath] = useState(initialSettings.logo_path);
  const [questionCount, setQuestionCount] = useState(
    initialSettings.exam_question_count
  );
  const [examMinutes, setExamMinutes] = useState(initialSettings.exam_minutes);
  const [examMaxWrong, setExamMaxWrong] = useState(
    initialSettings.exam_max_wrong
  );
  const [saved, setSaved] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.path) {
      setLogoPath(data.path);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "settings",
        payload: {
          center_name: centerName,
          logo_path: logoPath,
          exam_question_count: Number(questionCount),
          exam_minutes: Number(examMinutes),
          exam_max_wrong: Number(examMaxWrong),
        },
      }),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-enter">
      <h1 className="text-2xl font-bold">{t(lang, "nav.adminSettings")}</h1>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Sozlamalar muvaffaqiyatli saqlandi!
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm"
      >
        <div>
          <label className="block text-sm font-bold mb-1.5">
            {t(lang, "admin.centerName")}
          </label>
          <input
            type="text"
            required
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1.5">
            {t(lang, "admin.logo")}
          </label>
          <div className="flex items-center gap-4">
            {logoPath && (
              <img
                src={logoPath}
                alt="Logo"
                className="w-12 h-12 rounded-xl object-contain bg-slate-100 p-1 border"
              />
            )}
            <input
              type="text"
              value={logoPath}
              onChange={(e) => setLogoPath(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Yuklash</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              {t(lang, "admin.examQuestionCount")}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              {t(lang, "admin.examMinutes")}
            </label>
            <input
              type="number"
              min={1}
              max={180}
              required
              value={examMinutes}
              onChange={(e) => setExamMinutes(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              {t(lang, "admin.examMaxWrong")}
            </label>
            <input
              type="number"
              min={0}
              max={50}
              required
              value={examMaxWrong}
              onChange={(e) => setExamMaxWrong(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm"
          >
            <Save className="w-4 h-4" />
            {t(lang, "app.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

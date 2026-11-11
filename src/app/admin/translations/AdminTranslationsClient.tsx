"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { CheckCircle2, Languages } from "lucide-react";

interface UnreviewedQuestion {
  id: number;
  text_uz: string;
  text_ru: string;
  explanation_uz: string;
  explanation_ru: string;
  answers: Array<{
    id: number;
    text_uz: string;
    text_ru: string;
  }>;
}

export function AdminTranslationsClient({
  lang,
  questions,
  topics,
  chapters,
  signs,
  videos,
}: {
  lang: Lang;
  questions: UnreviewedQuestion[];
  topics: Array<{ id: number; name_uz: string; name_ru: string }>;
  chapters: Array<{ id: number; title_uz: string; title_ru: string; body_uz: string; body_ru: string }>;
  signs: Array<{
    id: number;
    code: string;
    group_uz: string;
    group_ru: string;
    name_uz: string;
    name_ru: string;
    description_uz: string;
    description_ru: string;
  }>;
  videos: Array<{ id: number; title_uz: string; title_ru: string }>;
}) {
  const router = useRouter();
  const [qState, setQState] = useState(questions);
  const [tState, setTState] = useState(topics);
  const [cState, setCState] = useState(chapters);
  const [sState, setSState] = useState(signs);
  const [vState, setVState] = useState(videos);

  async function approveQuestion(q: UnreviewedQuestion) {
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "translation",
        payload: {
          entityType: "question",
          id: q.id,
          text_ru: q.text_ru,
          explanation_ru: q.explanation_ru,
          answers_ru: q.answers.map((a) => ({ id: a.id, text_ru: a.text_ru })),
        },
      }),
    });
    setQState((prev) => prev.filter((item) => item.id !== q.id));
    router.refresh();
  }

  async function approveTopic(tp: { id: number; name_uz: string; name_ru: string }) {
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "translation",
        payload: {
          entityType: "topic",
          id: tp.id,
          name_ru: tp.name_ru,
        },
      }),
    });
    setTState((prev) => prev.filter((item) => item.id !== tp.id));
    router.refresh();
  }

  async function approveChapter(ch: {
    id: number;
    title_uz: string;
    title_ru: string;
    body_uz: string;
    body_ru: string;
  }) {
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "translation",
        payload: {
          entityType: "chapter",
          id: ch.id,
          title_ru: ch.title_ru,
          body_ru: ch.body_ru,
        },
      }),
    });
    setCState((prev) => prev.filter((item) => item.id !== ch.id));
    router.refresh();
  }

  async function approveSign(s: {
    id: number;
    group_ru: string;
    name_ru: string;
    description_ru: string;
  }) {
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "translation",
        payload: {
          entityType: "road_sign",
          id: s.id,
          group_ru: s.group_ru,
          name_ru: s.name_ru,
          description_ru: s.description_ru,
        },
      }),
    });
    setSState((prev) => prev.filter((item) => item.id !== s.id));
    router.refresh();
  }

  async function approveVideo(v: { id: number; title_ru: string }) {
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "translation",
        payload: {
          entityType: "video",
          id: v.id,
          title_ru: v.title_ru,
        },
      }),
    });
    setVState((prev) => prev.filter((item) => item.id !== v.id));
    router.refresh();
  }

  const totalPending =
    qState.length + tState.length + cState.length + sState.length + vState.length;

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <Languages className="w-7 h-7 text-blue-800 dark:text-blue-400" />
          {t(lang, "admin.translationQueue")} ({totalPending})
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Tarjimani tekshirish va tasdiqlash (`ru_reviewed = true`)
        </p>
      </div>

      {totalPending === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <div className="font-bold text-lg">Barcha ruscha tarjimalar tekshirilgan!</div>
        </div>
      )}

      {/* Unreviewed Questions */}
      {qState.map((q, qIdx) => (
        <div
          key={`q-${q.id}`}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-800">
              Savol #{q.id}
            </span>
            <button
              type="button"
              onClick={() => approveQuestion(q)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t(lang, "admin.approveTranslation")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">UZ:</div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-semibold">
                {q.text_uz}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">RU:</div>
              <textarea
                rows={2}
                value={q.text_ru}
                onChange={(e) => {
                  const next = [...qState];
                  next[qIdx] = { ...q, text_ru: e.target.value };
                  setQState(next);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-2">
            {q.answers.map((ans, aIdx) => (
              <div key={ans.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div className="text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  {ans.text_uz}
                </div>
                <input
                  type="text"
                  value={ans.text_ru}
                  onChange={(e) => {
                    const next = [...qState];
                    const nextAns = [...q.answers];
                    nextAns[aIdx] = { ...ans, text_ru: e.target.value };
                    next[qIdx] = { ...q, answers: nextAns };
                    setQState(next);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Unreviewed Topics */}
      {tState.map((tp, idx) => (
        <div
          key={`tp-${tp.id}`}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-100 text-indigo-800">
              Mavzu #{tp.id}
            </span>
            <button
              type="button"
              onClick={() => approveTopic(tp)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t(lang, "admin.approveTranslation")}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="font-bold text-sm">{tp.name_uz}</div>
            <input
              type="text"
              value={tp.name_ru}
              onChange={(e) => {
                const next = [...tState];
                next[idx] = { ...tp, name_ru: e.target.value };
                setTState(next);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
        </div>
      ))}

      {/* Unreviewed Chapters */}
      {cState.map((ch, idx) => (
        <div
          key={`ch-${ch.id}`}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-teal-100 text-teal-800">
              Bob #{ch.id}: {ch.title_uz}
            </span>
            <button
              type="button"
              onClick={() => approveChapter(ch)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t(lang, "admin.approveTranslation")}
            </button>
          </div>
          <input
            type="text"
            value={ch.title_ru}
            onChange={(e) => {
              const next = [...cState];
              next[idx] = { ...ch, title_ru: e.target.value };
              setCState(next);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
          <textarea
            rows={4}
            value={ch.body_ru}
            onChange={(e) => {
              const next = [...cState];
              next[idx] = { ...ch, body_ru: e.target.value };
              setCState(next);
            }}
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
          />
        </div>
      ))}

      {/* Unreviewed Signs */}
      {sState.map((s, idx) => (
        <div
          key={`s-${s.id}`}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-rose-100 text-rose-800">
              Yo&apos;l belgisi {s.code}: {s.name_uz}
            </span>
            <button
              type="button"
              onClick={() => approveSign(s)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t(lang, "admin.approveTranslation")}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={s.name_ru}
              onChange={(e) => {
                const next = [...sState];
                next[idx] = { ...s, name_ru: e.target.value };
                setSState(next);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
            <input
              type="text"
              value={s.description_ru}
              onChange={(e) => {
                const next = [...sState];
                next[idx] = { ...s, description_ru: e.target.value };
                setSState(next);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
        </div>
      ))}

      {/* Unreviewed Videos */}
      {vState.map((v, idx) => (
        <div
          key={`v-${v.id}`}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-100 text-purple-800">
              Video #{v.id}: {v.title_uz}
            </span>
            <button
              type="button"
              onClick={() => approveVideo(v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t(lang, "admin.approveTranslation")}
            </button>
          </div>
          <input
            type="text"
            value={v.title_ru}
            onChange={(e) => {
              const next = [...vState];
              next[idx] = { ...v, title_ru: e.target.value };
              setVState(next);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
      ))}
    </div>
  );
}

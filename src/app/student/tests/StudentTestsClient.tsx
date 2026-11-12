"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import {
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  HelpCircle,
  Play,
  Radio,
  Timer,
} from "lucide-react";
import type {
  StudentAssignmentItem,
  StudentTestHistoryItem,
} from "@/lib/test-service";

interface StudentTestsClientProps {
  lang: Lang;
  live: StudentAssignmentItem[];
  open: StudentAssignmentItem[];
  history: StudentTestHistoryItem[];
  serverNow: number;
}

function formatRemaining(endsAt: number, now: number): string {
  const diffSec = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const m = Math.floor(diffSec / 60);
  const s = diffSec % 60;
  return `${m} daq. ${s} son.`;
}

export function StudentTestsClient({
  lang,
  live,
  open,
  history,
  serverNow,
}: StudentTestsClientProps) {
  const router = useRouter();
  const [startingId, setStartingId] = useState<number | null>(null);

  async function handleStart(assignmentId: number) {
    setStartingId(assignmentId);
    try {
      const res = await fetch("/api/student/tests/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error === "ended" ? "Test vaqti tugagan" : "Xatolik yuz berdi");
        router.refresh();
        return;
      }
      router.push(data.redirectTo);
    } catch {
      alert("Xatolik yuz berdi");
    } finally {
      setStartingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <Radio className="w-7 h-7 text-blue-800 dark:text-blue-400" />
          {t(lang, "tests.title")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          O&apos;qituvchi tomonidan belgilangan jonli umumiy testlar va ixtiyoriy ochiq testlar
        </p>
      </div>

      {/* SECTION 1: Active Live Tests */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t(lang, "tests.liveTests")} ({live.length})
          </h2>
        </div>

        {live.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2 shadow-sm">
            <Radio className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-500">
              Hozirda faol jonli testlar yo&apos;q. O&apos;qituvchi umumiy test boshlaganda bu yerda paydo bo&apos;ladi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {live.map((item) => {
              const remainingText = item.endsAt
                ? formatRemaining(item.endsAt, serverNow)
                : null;
              const isRunning = item.runningAttemptId != null;
              const isFinished = item.finishedAttemptId != null;

              return (
                <div
                  key={item.assignmentId}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-950/80 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        JONLI TEST
                      </span>
                      {remainingText && (
                        <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5" />
                          Qolgan vaqt: {remainingText}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div>Guruh: <strong className="text-slate-700 dark:text-slate-300">{item.groupName}</strong></div>
                      <div>Umumiy davomiyligi: {item.durationMinutes} daqiqa</div>
                      <div className="text-amber-600 dark:text-amber-400 font-medium pt-1">
                        * {t(lang, "tests.lateJoinHint")}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isFinished ? (
                      <Link
                        href={`/student/tests/result/${item.finishedAttemptId}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Natijani ko&apos;rish</span>
                      </Link>
                    ) : isRunning ? (
                      <Link
                        href={`/student/tests/run/${item.runningAttemptId}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Play className="w-4 h-4" />
                        <span>Davom ettirish →</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={startingId === item.assignmentId}
                        onClick={() => void handleStart(item.assignmentId)}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        <Play className="w-4 h-4" />
                        <span>{startingId === item.assignmentId ? t(lang, "app.loading") : "Testga kirish"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Open Tests */}
      <div className="space-y-3 pt-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-800 dark:text-blue-400" />
          {t(lang, "tests.openTests")} ({open.length})
        </h2>

        {open.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2 shadow-sm">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-500">
              Hozirda guruhingiz uchun ochiq testlar mavjud emas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {open.map((item) => {
              const isRunning = item.runningAttemptId != null;

              return (
                <div
                  key={item.assignmentId}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Ochiq test
                    </span>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div>Guruh: <strong className="text-slate-700 dark:text-slate-300">{item.groupName}</strong></div>
                      <div>Vaqt: {item.durationMinutes} daqiqa (har bir urinish uchun)</div>
                      <div>Mening urinishlarim: {item.attemptsCount} ta</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isRunning ? (
                      <Link
                        href={`/student/tests/run/${item.runningAttemptId}`}
                        className="w-full py-2 px-3 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Davom ettirish →</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={startingId === item.assignmentId}
                        onClick={() => void handleStart(item.assignmentId)}
                        className="w-full py-2 px-3 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>
                          {startingId === item.assignmentId
                            ? t(lang, "app.loading")
                            : item.attemptsCount > 0
                              ? "Qayta topshirish"
                              : "Boshlash"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: History */}
      <div className="space-y-3 pt-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-700" />
          {t(lang, "tests.history")}
        </h2>

        {history.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
            {t(lang, "tests.noHistory")}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <th className="py-3 px-4">Test nomi</th>
                    <th className="py-3 px-4">Turi</th>
                    <th className="py-3 px-4">Tugallangan vaqt</th>
                    <th className="py-3 px-4 text-center">To&apos;g&apos;ri / Jami</th>
                    <th className="py-3 px-4 text-center">Foiz (%)</th>
                    <th className="py-3 px-4 text-right">{t(lang, "app.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {history.map((h) => (
                    <tr
                      key={h.attemptId}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {h.title}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            h.kind === "live"
                              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {h.kind === "live" ? "Jonli" : "Ochiq"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(h.finishedAt).toLocaleString(
                          lang === "ru" ? "ru-RU" : "uz-UZ"
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">
                        <strong className="text-emerald-600">+{h.correct}</strong> / {h.total}
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900 dark:text-white">
                        {h.percent}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/student/tests/result/${h.attemptId}`}
                          className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          Ko&apos;rish →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

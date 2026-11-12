import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getLang } from "@/lib/auth";
import { localizedText, t } from "@/lib/i18n";
import {
  getOwnAttempt,
  loadAttemptReview,
  finalizeAttempt,
} from "@/lib/test-service";
import { computeScore } from "@/lib/test-logic";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
} from "lucide-react";

export default async function TestResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const { attemptId: rawId } = await params;
  const attemptId = parseInt(rawId, 10);
  if (isNaN(attemptId)) notFound();

  const own = await getOwnAttempt(user.id, attemptId);
  if (!own) notFound();

  let { attempt } = own;
  const { test } = own;

  // Finalize if not yet finished
  if (attempt.finished_at == null) {
    const nowMs = Date.now();
    await finalizeAttempt(attempt.id, Math.min(nowMs, attempt.deadline_at));
    const reloaded = await getOwnAttempt(user.id, attemptId);
    if (reloaded) attempt = reloaded.attempt;
  }

  const reviewQuestions = await loadAttemptReview(attempt);
  const score = computeScore(attempt.correct, attempt.total);
  const isGood = score.percent >= 70;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-enter">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/tests"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-800 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t(lang, "app.back")}</span>
        </Link>

        <Link
          href="/student"
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          {t(lang, "nav.dashboard")}
        </Link>
      </div>

      {/* Result Score Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Test natijasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {test.title}
          </h1>
        </div>

        <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mx-auto">
          <div className="space-y-1">
            <div
              className={`text-5xl sm:text-6xl font-black ${
                isGood ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {score.percent}%
            </div>
            <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {score.correct} / {score.total} to&apos;g&apos;ri javob
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-xs text-slate-500 pt-2">
          {attempt.finished_at && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Tugallandi:{" "}
                {new Date(attempt.finished_at).toLocaleString(
                  lang === "ru" ? "ru-RU" : "uz-UZ"
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Full Questions Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-800" />
          Savollar va javoblar tahlili
        </h2>

        {reviewQuestions.map((q, idx) => {
          const qText = localizedText(lang, q.text_uz, q.text_ru);
          const explanation = localizedText(lang, q.explanation_uz, q.explanation_ru);

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all shadow-sm space-y-4 ${
                q.isCorrect
                  ? "border-emerald-200 dark:border-emerald-900/60"
                  : "border-red-200 dark:border-red-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  #{idx + 1}
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                    q.isCorrect
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  {q.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t(lang, "student.correctAnswer")}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Xato javob</span>
                    </>
                  )}
                </span>
              </div>

              {q.image_path && (
                <div className="flex justify-center bg-slate-100 dark:bg-slate-800/60 rounded-xl p-2 border border-slate-200 dark:border-slate-800">
                  <img
                    src={q.image_path}
                    alt=""
                    className="max-h-44 w-auto object-contain rounded-lg"
                  />
                </div>
              )}

              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                {qText}
              </h3>

              <div className="space-y-2">
                {q.answers.map((ans) => {
                  const ansText = localizedText(lang, ans.text_uz, ans.text_ru);
                  const isUserAnswer = ans.id === q.selectedAnswerId;
                  const isCorrectAnswer = ans.id === q.correctAnswerId;

                  let style =
                    "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300";
                  if (isCorrectAnswer) {
                    style =
                      "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold";
                  } else if (isUserAnswer && !q.isCorrect) {
                    style =
                      "border-red-500 bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 font-semibold";
                  }

                  return (
                    <div
                      key={ans.id}
                      className={`p-3 rounded-xl border-2 text-sm flex items-center justify-between gap-3 ${style}`}
                    >
                      <span className="leading-snug">{ansText}</span>
                      <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold">
                        {isCorrectAnswer && (
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px]">
                            {t(lang, "student.correctAnswer")}
                          </span>
                        )}
                        {isUserAnswer && (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              q.isCorrect
                                ? "bg-emerald-700 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {t(lang, "student.yourAnswer")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {explanation && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                  <strong>{t(lang, "student.explanation")}:</strong> {explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

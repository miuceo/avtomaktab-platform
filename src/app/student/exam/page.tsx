import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { t } from "@/lib/i18n";
import { db } from "@/db";
import { exam_attempts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CheckCircle2, Clock, GraduationCap, ShieldAlert, XCircle } from "lucide-react";

export default async function StudentExamIntroPage() {
  const [user, lang, settings] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
    getAppSettings(),
  ]);

  const pastExams = await db
    .select()
    .from(exam_attempts)
    .where(and(eq(exam_attempts.student_id, user.id), eq(exam_attempts.mode, "exam")))
    .orderBy(desc(exam_attempts.started_at));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-enter">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t(lang, "nav.exam")}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t(lang, "student.examRules")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 uppercase">Savollar</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {settings.exam_question_count} ta
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Vaqt
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {settings.exam_minutes} daqiqa
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Maks. xatolar
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {settings.exam_max_wrong} ta
            </div>
          </div>
        </div>

        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900">
          {t(lang, "student.examRulesDesc", {
            count: settings.exam_question_count,
            minutes: settings.exam_minutes,
            maxWrong: settings.exam_max_wrong,
            failWrong: settings.exam_max_wrong + 1,
          })}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t(lang, "student.keyboardHint")}
          </span>
          <Link
            href="/student/exam/run"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-lg shadow-sm transition-all"
          >
            <GraduationCap className="w-6 h-6" />
            {t(lang, "student.startExam")}
          </Link>
        </div>
      </div>

      {/* Previous Exam Attempts */}
      {pastExams.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold">{t(lang, "student.recentAttempts")}</h2>
          <div className="space-y-2.5">
            {pastExams.slice(0, 10).map((att) => (
              <div
                key={att.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {att.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {att.passed ? t(lang, "student.passed") : t(lang, "student.failed")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(att.started_at).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-emerald-600">+{att.correct}</span>
                  <span className="text-sm font-semibold text-red-600">-{att.wrong}</span>
                  {att.finished_at && (
                    <Link
                      href={`/student/exam/result/${att.id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-800 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      Natija →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

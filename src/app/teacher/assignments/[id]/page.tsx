import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getAssignmentResults } from "@/lib/test-service";
import { PrintButton } from "@/components/PrintButton";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Users,
  XCircle,
} from "lucide-react";

export default async function AssignmentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, lang] = await Promise.all([
    requireRole(["teacher", "admin"]),
    getLang(),
  ]);

  const { id } = await params;
  const assignmentId = parseInt(id, 10);
  if (isNaN(assignmentId)) notFound();

  const results = await getAssignmentResults(assignmentId);
  if (!results) notFound();

  // Ownership check: if teacher, must be the teacher of this group
  if (user.role === "teacher" && results.group.teacher_id !== user.id) {
    notFound();
  }

  const { assignment, test, group, questionCount, rows } = results;
  const isLive = assignment.kind === "live";

  const finishedRows = rows.filter((r) => r.status === "finished");
  const absentRows = rows.filter((r) => r.status === "absent");
  const inProgressRows = rows.filter((r) => r.status === "in_progress");

  const avgPercent =
    finishedRows.length > 0
      ? Math.round(
          finishedRows.reduce((acc, r) => acc + r.percent, 0) / finishedRows.length
        )
      : 0;

  return (
    <div className="space-y-6 animate-enter">
      {/* Top Bar with back link and print */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/teacher/tests"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-800 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t(lang, "app.back")}</span>
        </Link>

        <PrintButton label={t(lang, "app.print")} />
      </div>

      {/* Assignment Header Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isLive
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {isLive ? "Jonli umumiy test" : "Ixtiyoriy ochiq test"}
              </span>
              <span className="text-xs text-slate-500">
                Guruh: <strong className="text-slate-800 dark:text-slate-200">{group.name}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {test.title}
            </h1>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Jami savollar: {questionCount} ta</div>
            <div>Davomiyligi: {test.duration_minutes} daqiqa</div>
            {isLive && assignment.started_at && (
              <div className="font-mono mt-0.5">
                Boshlangan: {new Date(assignment.started_at).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ")}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500">Guruh a&apos;zolari</div>
            <div className="text-xl font-bold mt-0.5">{rows.length} nafar</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500">Tugatganlar</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">{finishedRows.length} nafar</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500">O&apos;rtacha ko&apos;rsatkich</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-0.5">{avgPercent}%</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500">
              {isLive ? "Kelmadi (0 ball)" : "Jarayonda"}
            </div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">
              {isLive ? absentRows.length : inProgressRows.length} nafar
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-800 dark:text-blue-400" />
            Natijalar jadvali
          </h2>
          <span className="text-xs text-slate-500">
            {isLive
              ? "Jonli testda qatnashmagan talabalar 'Kelmadi' deb belgilanadi"
              : "Barcha urinishlar hisobi"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-800/50 text-xs">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">{t(lang, "teacher.studentName")}</th>
                <th className="py-3 px-4">Login</th>
                <th className="py-3 px-4">{t(lang, "app.status")}</th>
                <th className="py-3 px-4 text-center">To&apos;g&apos;ri / Jami</th>
                <th className="py-3 px-4 text-center">Foiz (%)</th>
                {!isLive && <th className="py-3 px-4 text-center">Eng yaxshi</th>}
                {!isLive && <th className="py-3 px-4 text-center">Urinishlar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {rows.map((r, idx) => {
                const isAbsent = r.status === "absent";
                const isFinished = r.status === "finished";
                const isInProgress = r.status === "in_progress";

                return (
                  <tr
                    key={r.studentId}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <Link
                        href={`/teacher/students/${r.studentId}`}
                        className="hover:text-blue-700 dark:hover:text-blue-400"
                      >
                        {r.fullName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {r.login}
                    </td>
                    <td className="py-3 px-4">
                      {isFinished ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t(lang, "tests.finished")}</span>
                        </span>
                      ) : isAbsent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t(lang, "tests.absent")}</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>{t(lang, "tests.inProgress")}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {t(lang, "tests.notStarted")}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {isFinished ? (
                        <span>
                          <strong className="text-emerald-600">+{r.correct}</strong> / {r.total}
                        </span>
                      ) : isAbsent ? (
                        <span className="text-red-600 font-bold">0 / {questionCount}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isFinished ? (
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {r.percent}%
                        </span>
                      ) : isAbsent ? (
                        <span className="font-bold text-red-600">0%</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    {!isLive && (
                      <td className="py-3 px-4 text-center font-bold text-blue-700 dark:text-blue-400">
                        {r.bestPercent != null ? `${r.bestPercent}%` : "—"}
                      </td>
                    )}
                    {!isLive && (
                      <td className="py-3 px-4 text-center text-xs text-slate-500">
                        {r.attempts.length} ta
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

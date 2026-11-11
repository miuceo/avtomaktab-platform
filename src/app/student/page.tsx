import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { localizedText, t } from "@/lib/i18n";
import { calculateWeakTopics } from "@/lib/exam-logic";
import { db } from "@/db";
import {
  tickets,
  exam_attempts,
  attempt_answers,
  questions,
  topics,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ListChecks,
  ShieldAlert,
  TrendingDown,
  XCircle,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const [allTickets, userAttempts, userAnswerStats] = await Promise.all([
    db.select().from(tickets),
    db
      .select()
      .from(exam_attempts)
      .where(eq(exam_attempts.student_id, user.id))
      .orderBy(desc(exam_attempts.started_at)),
    db
      .select({
        questionId: attempt_answers.question_id,
        isCorrect: attempt_answers.is_correct,
        answerRowId: attempt_answers.id,
        topicId: topics.id,
        topicNameUz: topics.name_uz,
        topicNameRu: topics.name_ru,
      })
      .from(attempt_answers)
      .innerJoin(exam_attempts, eq(attempt_answers.attempt_id, exam_attempts.id))
      .innerJoin(questions, eq(attempt_answers.question_id, questions.id))
      .innerJoin(topics, eq(questions.topic_id, topics.id))
      .where(eq(exam_attempts.student_id, user.id))
      .orderBy(desc(attempt_answers.id)),
  ]);

  const solvedTicketIds = new Set(
    userAttempts
      .filter((a) => a.mode === "ticket" && a.ticket_id && a.passed)
      .map((a) => a.ticket_id!)
  );

  const examOnlyAttempts = userAttempts.filter((a) => a.mode === "exam" && a.finished_at);
  const lastExam = examOnlyAttempts[0] || null;

  const weakTopics = calculateWeakTopics(
    userAnswerStats.map((s) => ({
      topicId: s.topicId,
      topicNameUz: s.topicNameUz,
      topicNameRu: s.topicNameRu,
      isCorrect: s.isCorrect,
    }))
  )
    .filter((w) => w.wrong > 0)
    .slice(0, 5);

  // Count active mistakes (questions where latest answer was wrong)
  const latestByQuestion = new Map<number, boolean>();
  for (const row of userAnswerStats) {
    if (!latestByQuestion.has(row.questionId)) {
      latestByQuestion.set(row.questionId, row.isCorrect);
    }
  }
  const activeMistakesCount = Array.from(latestByQuestion.values()).filter(
    (ok) => !ok
  ).length;

  return (
    <div className="space-y-6 animate-enter">
      {/* Welcome Banner & Primary CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">
            {t(lang, "auth.welcome")}, {user.full_name}!
          </h1>
          <p className="text-blue-100 text-sm mt-1">{t(lang, "app.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/student/exam"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all shadow-sm"
          >
            <GraduationCap className="w-5 h-5" />
            {t(lang, "student.startExam")}
          </Link>
          <Link
            href="/student/tickets"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-700/80 text-white font-semibold hover:bg-blue-700 border border-blue-500/40 transition-all"
          >
            <ListChecks className="w-5 h-5" />
            {t(lang, "student.practiceTickets")}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t(lang, "student.ticketsSolved")}
          </div>
          <div className="text-3xl font-bold mt-2 text-blue-800 dark:text-blue-400">
            {solvedTicketIds.size} / {allTickets.length}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t(lang, "student.lastExam")}
          </div>
          {lastExam ? (
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 text-lg font-bold ${
                  lastExam.passed
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {lastExam.passed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                {lastExam.passed ? t(lang, "student.passed") : t(lang, "student.failed")}
              </span>
              <Link
                href={`/student/exam/result/${lastExam.id}`}
                className="text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
              >
                +{lastExam.correct} / -{lastExam.wrong} →
              </Link>
            </div>
          ) : (
            <div className="text-base font-medium text-slate-400 mt-2">
              {t(lang, "student.noAttempts")}
            </div>
          )}
        </div>

        <Link
          href="/student/mistakes"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-all block"
        >
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{t(lang, "nav.mistakes")}</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold mt-2 text-amber-600 dark:text-amber-400">
            {activeMistakesCount}
          </div>
        </Link>
      </div>

      {/* Quick Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/student/tickets"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">{t(lang, "nav.tickets")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">F1–F5 / 1–5</div>
          </div>
        </Link>

        <Link
          href="/student/topics"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">{t(lang, "nav.topics")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t(lang, "student.practiceTopics")}
            </div>
          </div>
        </Link>

        <Link
          href="/student/knowledge"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">{t(lang, "nav.knowledge")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">YHQ boblar va video</div>
          </div>
        </Link>

        <Link
          href="/student/signs"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">{t(lang, "nav.signs")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Katalog va qidiruv</div>
          </div>
        </Link>
      </div>

      {/* Weakest Topics & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            {t(lang, "student.weakTopics")}
          </h2>

          {weakTopics.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(lang, "student.noMistakes")}
            </p>
          ) : (
            <div className="space-y-3">
              {weakTopics.map((wt) => (
                <div
                  key={wt.topicId}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-sm">
                      {localizedText(lang, wt.topicNameUz, wt.topicNameRu)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(lang, "student.wrongCount", { count: wt.wrong })} / {wt.total} (
                      {wt.errorRate}% xato)
                    </div>
                  </div>
                  <Link
                    href={`/student/topics/${wt.topicId}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-800 text-white text-xs font-bold hover:bg-blue-700 shrink-0"
                  >
                    Mashq qilish
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-lg font-bold">{t(lang, "student.recentAttempts")}</h2>
          {userAttempts.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(lang, "student.noAttempts")}
            </p>
          ) : (
            <div className="space-y-2.5">
              {userAttempts.slice(0, 6).map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 mr-2">
                      {t(lang, `modes.${att.mode}`)}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                      {new Date(att.started_at).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 font-semibold">+{att.correct}</span>
                    <span className="text-red-600 font-semibold">-{att.wrong}</span>
                    {att.mode === "exam" && att.finished_at && (
                      <Link
                        href={`/student/exam/result/${att.id}`}
                        className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        Ko&apos;rish →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { localizedText, t } from "@/lib/i18n";
import { calculateWeakTopics } from "@/lib/exam-logic";
import { getStudentTestOverview } from "@/lib/test-service";
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
  ClipboardCheck,
  GraduationCap,
  ListChecks,
  Radio,
  ShieldAlert,
  Timer,
  TrendingDown,
  XCircle,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const nowMs = Date.now();
  const [allTickets, userAttempts, userAnswerStats, testOverview] = await Promise.all([
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
    getStudentTestOverview(user.id, nowMs),
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

      {/* Active Live Test Alert Banner (if any) */}
      {testOverview.live.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/80 border-2 border-red-500 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-enter shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white">
                  JONLI TEST
                </span>
                <span className="text-xs font-bold text-red-700 dark:text-red-300">
                  {testOverview.live[0].groupName}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {testOverview.live[0].title}
              </h2>
            </div>
          </div>
          <Link
            href="/student/tests"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm shadow-sm transition-all"
          >
            <span>Testga kirish →</span>
          </Link>
        </div>
      )}

      {/* Quick Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href="/student/tests"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600 transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">{t(lang, "nav.tests")}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {testOverview.live.length + testOverview.open.length} ta faol
            </div>
          </div>
        </Link>

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

      {/* Tests Section (Brief-2 requirement) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-700" />
            <span>{t(lang, "nav.tests")} (Jonli va ochiq testlar)</span>
          </h2>
          <Link
            href="/student/tests"
            className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
          >
            Barchasini ko&apos;rish →
          </Link>
        </div>

        {testOverview.live.length === 0 && testOverview.open.length === 0 && testOverview.history.length === 0 ? (
          <p className="text-sm text-slate-500">{t(lang, "tests.noTests")}</p>
        ) : (
          <div className="space-y-4">
            {/* Live & Open tests mini cards */}
            {(testOverview.live.length > 0 || testOverview.open.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {testOverview.live.map((lt) => (
                  <div
                    key={`live-${lt.assignmentId}`}
                    className="p-4 rounded-xl border-2 border-red-200 dark:border-red-950/70 bg-red-50/40 dark:bg-red-950/20 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                        Jonli test
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
                        {lt.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{lt.groupName} · {lt.durationMinutes} daqiqa</p>
                    </div>
                    <Link
                      href={
                        lt.finishedAttemptId
                          ? `/student/tests/result/${lt.finishedAttemptId}`
                          : lt.runningAttemptId
                            ? `/student/tests/run/${lt.runningAttemptId}`
                            : "/student/tests"
                      }
                      className="mt-2 w-full py-1.5 px-3 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs text-center block"
                    >
                      {lt.finishedAttemptId
                        ? "Natija"
                        : lt.runningAttemptId
                          ? "Davom ettirish →"
                          : "Kirish →"}
                    </Link>
                  </div>
                ))}

                {testOverview.open.map((ot) => (
                  <div
                    key={`open-${ot.assignmentId}`}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Ochiq test
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
                        {ot.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{ot.groupName} · {ot.durationMinutes} daqiqa</p>
                    </div>
                    <Link
                      href={
                        ot.runningAttemptId
                          ? `/student/tests/run/${ot.runningAttemptId}`
                          : "/student/tests"
                      }
                      className="mt-2 w-full py-1.5 px-3 rounded-lg bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs text-center block"
                    >
                      {ot.runningAttemptId ? "Davom ettirish →" : "Boshlash →"}
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Recent test history */}
            {testOverview.history.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 mb-2">Oxirgi topshirilgan testlar:</div>
                <div className="space-y-2">
                  {testOverview.history.slice(0, 3).map((h) => (
                    <div
                      key={`hist-${h.attemptId}`}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white mr-2">
                          {h.title}
                        </span>
                        <span className="text-slate-500">
                          {new Date(h.finishedAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600">+{h.correct}/{h.total}</span>
                        <span className="font-extrabold">{h.percent}%</span>
                        <Link
                          href={`/student/tests/result/${h.attemptId}`}
                          className="font-bold text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          Ko&apos;rish →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

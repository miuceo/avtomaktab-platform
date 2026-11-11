import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getLang } from "@/lib/auth";
import { localizedText, t } from "@/lib/i18n";
import { calculateWeakTopics } from "@/lib/exam-logic";
import { db } from "@/db";
import {
  users,
  groups,
  group_members,
  exam_attempts,
  attempt_answers,
  questions,
  topics,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, TrendingDown, XCircle } from "lucide-react";

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, lang, resolvedParams] = await Promise.all([
    requireRole(["teacher", "admin"]),
    getLang(),
    params,
  ]);

  const studentId = Number(resolvedParams.id);
  if (!studentId) notFound();

  const studentRows = await db
    .select()
    .from(users)
    .where(and(eq(users.id, studentId), eq(users.role, "student")))
    .limit(1);

  if (studentRows.length === 0) notFound();
  const student = studentRows[0];

  if (user.role === "teacher") {
    const ownedMembership = await db
      .select({ studentId: group_members.student_id })
      .from(group_members)
      .innerJoin(groups, eq(group_members.group_id, groups.id))
      .where(
        and(
          eq(group_members.student_id, student.id),
          eq(groups.teacher_id, user.id)
        )
      )
      .limit(1);

    if (ownedMembership.length === 0) {
      notFound();
    }
  }

  const [attempts, answerStats] = await Promise.all([
    db
      .select()
      .from(exam_attempts)
      .where(eq(exam_attempts.student_id, student.id))
      .orderBy(desc(exam_attempts.started_at)),
    db
      .select({
        topicId: topics.id,
        topicNameUz: topics.name_uz,
        topicNameRu: topics.name_ru,
        isCorrect: attempt_answers.is_correct,
      })
      .from(attempt_answers)
      .innerJoin(exam_attempts, eq(attempt_answers.attempt_id, exam_attempts.id))
      .innerJoin(questions, eq(attempt_answers.question_id, questions.id))
      .innerJoin(topics, eq(questions.topic_id, topics.id))
      .where(eq(exam_attempts.student_id, student.id)),
  ]);

  const weakTopics = calculateWeakTopics(answerStats);

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center gap-3">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {t(lang, "app.back")}
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h1 className="text-2xl font-bold">{student.full_name}</h1>
        <p className="text-sm text-slate-500 font-mono mt-1">Login: {student.login}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weakest Topics (error rate per topic) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            {t(lang, "student.weakTopics")} ({t(lang, "student.errorRate")})
          </h2>

          {weakTopics.length === 0 ? (
            <p className="text-sm text-slate-500">{t(lang, "student.noAttempts")}</p>
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
                    <div className="text-xs text-slate-500 mt-0.5">
                      Jami: {wt.total} | To&apos;g&apos;ri: {wt.correct} | Xato: {wt.wrong}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      wt.errorRate >= 50
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : wt.errorRate > 0
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {wt.errorRate}% xato
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-bold">{t(lang, "student.recentAttempts")}</h2>
          {attempts.length === 0 ? (
            <p className="text-sm text-slate-500">{t(lang, "student.noAttempts")}</p>
          ) : (
            <div className="space-y-2.5">
              {attempts.map((att) => (
                <div
                  key={att.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    {att.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 mr-2">
                        {t(lang, `modes.${att.mode}`)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(att.started_at).toLocaleString(
                          lang === "ru" ? "ru-RU" : "uz-UZ"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 font-bold">+{att.correct}</span>
                    <span className="text-red-600 font-bold">-{att.wrong}</span>
                    <Link
                      href={`/student/exam/result/${att.id}`}
                      className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Batafsil →
                    </Link>
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

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getLang } from "@/lib/auth";
import { localizedText, t } from "@/lib/i18n";
import { db } from "@/db";
import {
  exam_attempts,
  attempt_answers,
  questions,
  answers,
  groups,
  group_members,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const [user, lang, resolvedParams] = await Promise.all([
    requireRole(["student", "teacher", "admin"]),
    getLang(),
    params,
  ]);

  const attemptId = Number(resolvedParams.attemptId);
  if (!attemptId) notFound();

  const attemptRows = await db
    .select()
    .from(exam_attempts)
    .where(eq(exam_attempts.id, attemptId))
    .limit(1);

  if (attemptRows.length === 0) notFound();
  const attempt = attemptRows[0];

  // If student, ensure they only view their own attempt
  if (user.role === "student" && attempt.student_id !== user.id) {
    notFound();
  }

  // If teacher, ensure student belongs to one of teacher's groups
  if (user.role === "teacher") {
    const ownedMembership = await db
      .select({ studentId: group_members.student_id })
      .from(group_members)
      .innerJoin(groups, eq(group_members.group_id, groups.id))
      .where(
        and(
          eq(group_members.student_id, attempt.student_id),
          eq(groups.teacher_id, user.id)
        )
      )
      .limit(1);

    if (ownedMembership.length === 0) {
      notFound();
    }
  }

  const studentAnswers = await db
    .select()
    .from(attempt_answers)
    .where(eq(attempt_answers.attempt_id, attemptId));

  let questionIds: number[] = [];
  try {
    questionIds = JSON.parse(attempt.question_ids_json || "[]");
  } catch {
    questionIds = [];
  }
  if (questionIds.length === 0) {
    questionIds = studentAnswers.map((a) => a.question_id);
  }

  const questionRows =
    questionIds.length > 0
      ? await db.select().from(questions).where(inArray(questions.id, questionIds))
      : [];

  const answerRows =
    questionIds.length > 0
      ? await db.select().from(answers).where(inArray(answers.question_id, questionIds))
      : [];

  const elapsedSeconds = attempt.finished_at
    ? Math.max(1, Math.round((attempt.finished_at - attempt.started_at) / 1000))
    : 0;
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-enter">
      {/* Result Summary Banner */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border-2 text-center space-y-4 ${
          attempt.passed
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500"
            : "bg-red-50 dark:bg-red-950/40 border-red-500"
        }`}
      >
        <div className="flex justify-center">
          {attempt.passed ? (
            <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
          )}
        </div>

        <h1 className="text-3xl font-extrabold">
          {attempt.passed ? t(lang, "student.passed") : t(lang, "student.failed")}
        </h1>

        <div className="flex flex-wrap justify-center gap-6 text-base font-bold">
          <span className="text-emerald-700 dark:text-emerald-300">
            {t(lang, "student.correctCount", { count: attempt.correct })}
          </span>
          <span className="text-red-700 dark:text-red-300">
            {t(lang, "student.wrongCount", { count: attempt.wrong })}
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4" />
            {t(lang, "student.timeSpent")}: {mins}m {secs}s
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/student/exam/run"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-800 text-white font-bold hover:bg-blue-700"
          >
            <RotateCcw className="w-4 h-4" />
            {t(lang, "student.startExam")}
          </Link>
          <Link
            href="/student"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(lang, "nav.dashboard")}
          </Link>
        </div>
      </div>

      {/* Detailed breakdown of every question */}
      <div className="space-y-4">
        {questionIds.map((qId, idx) => {
          const q = questionRows.find((row) => row.id === qId);
          if (!q) return null;

          const qAnswers = answerRows
            .filter((a) => a.question_id === q.id)
            .sort((a, b) => a.sort - b.sort);
          const studentAnsRecord = studentAnswers.find((sa) => sa.question_id === q.id);
          const chosenAns = qAnswers.find((a) => a.id === studentAnsRecord?.answer_id);
          const correctAns = qAnswers.find((a) => a.is_correct);

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800">
                  #{idx + 1}
                </span>
                {studentAnsRecord ? (
                  studentAnsRecord.is_correct ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> To&apos;g&apos;ri
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Xato
                    </span>
                  )
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    {t(lang, "student.notAnswered")}
                  </span>
                )}
              </div>

              {q.image_path && (
                <div className="flex justify-center bg-slate-100 dark:bg-slate-800/50 rounded-xl p-2">
                  <img
                    src={q.image_path}
                    alt="Question diagram"
                    className="max-h-40 object-contain rounded"
                  />
                </div>
              )}

              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {localizedText(lang, q.text_uz, q.text_ru)}
              </h3>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div
                  className={`p-3 rounded-xl border ${
                    studentAnsRecord?.is_correct
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400"
                      : "bg-red-50 dark:bg-red-950/50 border-red-400"
                  }`}
                >
                  <span className="font-bold mr-2">{t(lang, "student.yourAnswer")}:</span>
                  <span>
                    {chosenAns
                      ? localizedText(lang, chosenAns.text_uz, chosenAns.text_ru)
                      : t(lang, "student.notAnswered")}
                  </span>
                </div>

                {(!studentAnsRecord || !studentAnsRecord.is_correct) && correctAns && (
                  <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500">
                    <span className="font-bold mr-2 text-emerald-800 dark:text-emerald-300">
                      {t(lang, "student.correctAnswer")}:
                    </span>
                    <span>{localizedText(lang, correctAns.text_uz, correctAns.text_ru)}</span>
                  </div>
                )}
              </div>

              {(q.explanation_uz || q.explanation_ru) && (
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <strong className="mr-1">{t(lang, "student.explanation")}:</strong>
                  {localizedText(lang, q.explanation_uz, q.explanation_ru)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

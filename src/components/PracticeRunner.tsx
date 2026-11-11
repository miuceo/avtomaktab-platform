"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lang, localizedText, t } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";

export interface PracticeQuestionItem {
  id: number;
  topic_id: number;
  text_uz: string;
  text_ru: string;
  image_path: string | null;
  explanation_uz: string;
  explanation_ru: string;
  answers: Array<{
    id: number;
    question_id: number;
    text_uz: string;
    text_ru: string;
    is_correct: boolean;
    sort: number;
  }>;
}

interface PracticeRunnerProps {
  lang: Lang;
  mode: "ticket" | "topic" | "mistakes";
  title: string;
  backHref: string;
  ticketId?: number | null;
  topicId?: number | null;
  questions: PracticeQuestionItem[];
}

export function PracticeRunner({
  lang,
  mode,
  title,
  backHref,
  ticketId = null,
  topicId = null,
  questions,
}: PracticeRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<number | undefined>(undefined);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = useCallback(
    async (answerId: number) => {
      if (!currentQuestion) return;
      if (selectedAnswers[currentQuestion.id] !== undefined) return; // already answered

      const nextSelected = {
        ...selectedAnswers,
        [currentQuestion.id]: answerId,
      };
      setSelectedAnswers(nextSelected);

      const isAllDone = Object.keys(nextSelected).length === questions.length;

      try {
        const res = await fetch("/api/student/practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            mode,
            ticketId,
            topicId,
            questionIds: questions.map((q) => q.id),
            questionId: currentQuestion.id,
            answerId,
            finish: isAllDone,
          }),
        });
        const data = await res.json();
        if (data.attemptId && !attemptId) {
          setAttemptId(data.attemptId);
        }
      } catch (err) {
        console.error("Failed to record practice answer:", err);
      }
    },
    [attemptId, currentQuestion, mode, questions, selectedAnswers, ticketId, topicId]
  );

  // Keyboard shortcuts: 1-5, F1-F5, ArrowLeft, ArrowRight
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (finished || !currentQuestion) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const keyMap: Record<string, number> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "5": 4,
        F1: 0,
        F2: 1,
        F3: 2,
        F4: 3,
        F5: 4,
      };

      if (e.key in keyMap) {
        e.preventDefault();
        const idx = keyMap[e.key];
        const targetAns = currentQuestion.answers[idx];
        if (targetAns) {
          handleSelectAnswer(targetAns.id);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((i) => i - 1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, currentQuestion, finished, handleSelectAnswer, questions.length]);

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <p className="text-lg font-semibold">{t(lang, "student.noMistakes")}</p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-800 text-white font-semibold hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {t(lang, "app.back")}
        </Link>
      </div>
    );
  }

  const totalAnswered = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  let wrongCount = 0;

  for (const q of questions) {
    const chosenId = selectedAnswers[q.id];
    if (chosenId !== undefined) {
      const ans = q.answers.find((a) => a.id === chosenId);
      if (ans?.is_correct) correctCount++;
      else wrongCount++;
    }
  }

  async function handleFinishSession() {
    if (attemptId) {
      await fetch("/api/student/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          mode,
          ticketId,
          topicId,
          finish: true,
        }),
      });
    }
    setFinished(true);
    router.refresh();
  }

  if (finished) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-enter">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex justify-center gap-6 text-lg font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400">
              {t(lang, "student.correctCount", { count: correctCount })}
            </span>
            <span className="text-red-600 dark:text-red-400">
              {t(lang, "student.wrongCount", { count: wrongCount })}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedAnswers({});
                setAttemptId(undefined);
                setCurrentIndex(0);
                setFinished(false);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-800 text-white font-semibold hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4" />
              Qayta ishlash
            </button>
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              {t(lang, "app.back")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const chosenForCurrent = selectedAnswers[currentQuestion.id];
  const isAnswered = chosenForCurrent !== undefined;
  const questionText = localizedText(lang, currentQuestion.text_uz, currentQuestion.text_ru);
  const explanationText = localizedText(
    lang,
    currentQuestion.explanation_uz,
    currentQuestion.explanation_ru
  );

  return (
    <div className="max-w-5xl mx-auto space-y-3 animate-enter">
      {/* Compact top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(lang, "app.back")}
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <h1 className="font-bold text-base sm:text-lg">{title}</h1>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="text-emerald-600 dark:text-emerald-400">
            {t(lang, "student.correctCount", { count: correctCount })}
          </span>
          <span className="text-red-600 dark:text-red-400">
            {t(lang, "student.wrongCount", { count: wrongCount })}
          </span>
          <button
            type="button"
            onClick={handleFinishSession}
            className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90"
          >
            {t(lang, "student.finishPractice")}
          </button>
        </div>
      </div>

      {/* Question Navigator */}
      <div
        role="navigation"
        aria-label="Question navigator"
        className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800"
      >
        {questions.map((q, idx) => {
          const ansId = selectedAnswers[q.id];
          const isCurrent = idx === currentIndex;
          let stateClass =
            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

          if (ansId !== undefined) {
            const ansObj = q.answers.find((a) => a.id === ansId);
            if (ansObj?.is_correct) {
              stateClass = "bg-emerald-600 text-white border-emerald-600";
            } else {
              stateClass = "bg-red-600 text-white border-red-600";
            }
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Savol ${idx + 1}`}
              aria-current={isCurrent ? "step" : undefined}
              className={`w-9 h-9 rounded-lg font-bold text-sm border transition-all duration-150 ease-out-expo ${stateClass} ${
                isCurrent ? "ring-2 ring-blue-700 dark:ring-blue-400 scale-105" : "hover:opacity-90"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card — optimized to fit 1366x768 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs shrink-0">
            #{currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t(lang, "student.keyboardHint")}
          </span>
        </div>

        {currentQuestion.image_path && (
          <div className="flex justify-center bg-slate-100 dark:bg-slate-800/60 rounded-xl p-2 border border-slate-200 dark:border-slate-800">
            <img
              src={currentQuestion.image_path}
              alt="Question diagram"
              className="max-h-44 sm:max-h-48 w-auto object-contain rounded-lg"
            />
          </div>
        )}

        <h2 className="text-lg sm:text-xl font-bold leading-snug text-slate-900 dark:text-white">
          {questionText}
        </h2>

        {/* Answer buttons */}
        <div className="space-y-2.5">
          {currentQuestion.answers.map((ans, idx) => {
            const ansText = localizedText(lang, ans.text_uz, ans.text_ru);
            const isSelected = chosenForCurrent === ans.id;

            let btnStyle =
              "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-500 text-slate-900 dark:text-slate-100";

            if (isAnswered) {
              if (ans.is_correct) {
                btnStyle =
                  "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/40";
              } else if (isSelected && !ans.is_correct) {
                btnStyle =
                  "border-red-600 bg-red-50 dark:bg-red-950/60 text-red-950 dark:text-red-100 ring-2 ring-red-500/40";
              } else {
                btnStyle =
                  "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-65";
              }
            }

            return (
              <button
                key={ans.id}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectAnswer(ans.id)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-150 ease-out-expo flex items-center gap-3.5 ${btnStyle}`}
              >
                <span className="w-8 h-8 rounded-lg bg-blue-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  F{idx + 1}
                </span>
                <span className="flex-1 font-medium text-base leading-snug">{ansText}</span>
                {isAnswered && ans.is_correct && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {isAnswered && isSelected && !ans.is_correct && (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Explanation */}
        {isAnswered && explanationText && (
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-start gap-3 animate-enter">
            <HelpCircle className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">
              <span className="font-bold text-blue-900 dark:text-blue-200 mr-1.5">
                {t(lang, "student.explanation")}:
              </span>
              <span className="text-slate-800 dark:text-slate-200">{explanationText}</span>
            </div>
          </div>
        )}

        {/* Prev / Next Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(lang, "student.prevQuestion")}
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-800 text-white font-semibold text-sm hover:bg-blue-700"
            >
              {t(lang, "student.nextQuestion")}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishSession}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-600"
            >
              {t(lang, "student.finishPractice")} ({totalAnswered}/{questions.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

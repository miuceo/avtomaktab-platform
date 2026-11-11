"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lang, localizedText, t } from "@/lib/i18n";
import { Clock, Flag } from "lucide-react";

interface SanitizedExamQuestion {
  id: number;
  topic_id: number;
  text_uz: string;
  text_ru: string;
  image_path: string | null;
  answers: Array<{
    id: number;
    question_id: number;
    text_uz: string;
    text_ru: string;
    sort: number;
  }>;
}

interface ExamRunnerClientProps {
  lang: Lang;
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamRunnerClient({ lang }: ExamRunnerClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<SanitizedExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredMap, setAnsweredMap] = useState<Record<number, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  // Start exam on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function initExam() {
      try {
        const res = await fetch("/api/student/exam/start", { method: "POST" });
        const data = await res.json();
        if (!res.ok || !data.attemptId) {
          router.replace("/student/exam");
          return;
        }
        setAttemptId(data.attemptId);
        setQuestions(data.questions || []);
        setRemainingSeconds((data.durationMinutes || 25) * 60);
        setLoading(false);
      } catch {
        router.replace("/student/exam");
      }
    }

    initExam();
  }, [router]);

  const finishAndRedirect = useCallback(
    async (idToFinish: number) => {
      try {
        await fetch("/api/student/exam/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId: idToFinish, finish: true }),
        });
      } finally {
        router.replace(`/student/exam/result/${idToFinish}`);
      }
    },
    [router]
  );

  // Countdown timer
  useEffect(() => {
    if (loading || !attemptId) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishAndRedirect(attemptId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [attemptId, finishAndRedirect, loading]);

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = useCallback(
    async (answerId: number) => {
      if (!attemptId || !currentQuestion || submitting) return;
      if (answeredMap[currentQuestion.id] !== undefined) return; // already answered

      setSubmitting(true);
      const nextAnswered = {
        ...answeredMap,
        [currentQuestion.id]: answerId,
      };
      setAnsweredMap(nextAnswered);

      try {
        const res = await fetch("/api/student/exam/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            questionId: currentQuestion.id,
            answerId,
          }),
        });
        const data = await res.json();

        if (data.finished) {
          // Immediately end exam (wrong > max_wrong, timeout, or all answered)
          router.replace(`/student/exam/result/${attemptId}`);
          return;
        }

        // Advance to next unanswered question automatically
        const nextUnansweredIdx = questions.findIndex(
          (q, idx) => idx > currentIndex && nextAnswered[q.id] === undefined
        );
        if (nextUnansweredIdx !== -1) {
          setCurrentIndex(nextUnansweredIdx);
        } else {
          const firstUnansweredIdx = questions.findIndex(
            (q) => nextAnswered[q.id] === undefined
          );
          if (firstUnansweredIdx !== -1) {
            setCurrentIndex(firstUnansweredIdx);
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
    [answeredMap, attemptId, currentIndex, currentQuestion, questions, router, submitting]
  );

  // Keyboard navigation in exam: 1-5, F1-F5, ArrowLeft, ArrowRight
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (loading || !currentQuestion) return;
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
        const ans = currentQuestion.answers[keyMap[e.key]];
        if (ans) {
          handleSelectAnswer(ans.id);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentQuestion, handleSelectAnswer, loading, questions.length]);

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-lg font-bold text-slate-600 dark:text-slate-300">
          {t(lang, "app.loading")}
        </div>
      </div>
    );
  }

  const chosenAnswerId = answeredMap[currentQuestion.id];
  const questionText = localizedText(lang, currentQuestion.text_uz, currentQuestion.text_ru);

  return (
    <div className="max-w-5xl mx-auto space-y-2.5 select-none">
      {/* Distraction-free top bar: Timer + Question Navigator + Finish button */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div
          aria-live="polite"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-lg font-bold ${
            remainingSeconds <= 120
              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{formatSeconds(remainingSeconds)}</span>
        </div>

        {/* Navigator showing answered states (NO correct/wrong feedback during exam!) */}
        <div
          role="navigation"
          aria-label="Exam question navigator"
          className="flex flex-wrap items-center gap-1"
        >
          {questions.map((q, idx) => {
            const isAnswered = answeredMap[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Savol ${idx + 1}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                  isAnswered
                    ? "bg-blue-800 text-white border-blue-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                } ${isCurrent ? "ring-2 ring-blue-600 dark:ring-blue-400 scale-105" : ""}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => attemptId && finishAndRedirect(attemptId)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold"
        >
          <Flag className="w-3.5 h-3.5" />
          {t(lang, "student.finishExam")}
        </button>
      </div>

      {/* Main Question + Answers Box — compact height so 1366x768 fits without scrolling */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-blue-800 dark:text-blue-300 text-sm">
            Savol #{currentIndex + 1} / {questions.length}
          </span>
          <span>{t(lang, "student.keyboardHint")}</span>
        </div>

        {currentQuestion.image_path && (
          <div className="flex justify-center bg-slate-100 dark:bg-slate-800/60 rounded-xl p-2 border border-slate-200 dark:border-slate-800">
            <img
              src={currentQuestion.image_path}
              alt="Exam question diagram"
              className="max-h-40 sm:max-h-44 w-auto object-contain rounded-lg"
            />
          </div>
        )}

        <h1 className="text-lg sm:text-xl font-bold leading-snug text-slate-900 dark:text-white">
          {questionText}
        </h1>

        <div className="space-y-2">
          {currentQuestion.answers.map((ans, idx) => {
            const ansText = localizedText(lang, ans.text_uz, ans.text_ru);
            const isChosen = chosenAnswerId === ans.id;

            return (
              <button
                key={ans.id}
                type="button"
                disabled={chosenAnswerId !== undefined || submitting}
                onClick={() => handleSelectAnswer(ans.id)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-150 ease-out-expo flex items-center gap-3.5 ${
                  isChosen
                    ? "border-blue-800 bg-blue-50 dark:bg-blue-950/70 text-blue-950 dark:text-blue-100"
                    : chosenAnswerId !== undefined
                    ? "border-slate-200 dark:border-slate-800 opacity-60"
                    : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-600"
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-blue-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  F{idx + 1}
                </span>
                <span className="flex-1 font-medium text-base leading-snug">{ansText}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, localizedText, t } from "@/lib/i18n";
import { Clock, Flag } from "lucide-react";

interface RunQuestion {
  id: number;
  text_uz: string;
  text_ru: string;
  image_path: string | null;
  answers: Array<{ id: number; text_uz: string; text_ru: string }>;
}

interface TestRunnerClientProps {
  lang: Lang;
  attemptId: number;
  title: string;
  questions: RunQuestion[];
  initialSelected: Record<number, number>;
  /** server clock at render time (ms) and the attempt deadline (ms): the server is the truth */
  serverNow: number;
  deadlineAt: number;
}

function formatSeconds(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function TestRunnerClient({
  lang,
  attemptId,
  title,
  questions,
  initialSelected,
  serverNow,
  deadlineAt,
}: TestRunnerClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstOpen = questions.findIndex((q) => initialSelected[q.id] === undefined);
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [selected, setSelected] = useState<Record<number, number>>(initialSelected);
  const [error, setError] = useState<string | null>(null);
  const finishingRef = useRef(false);

  // Offset between the server clock and this computer's clock.
  const offsetRef = useRef(serverNow - Date.now());
  const computeRemaining = useCallback(
    () => Math.max(0, Math.ceil((deadlineAt - (Date.now() + offsetRef.current)) / 1000)),
    [deadlineAt]
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(computeRemaining);

  const goToResult = useCallback(
    async (callFinish: boolean) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      try {
        if (callFinish) {
          await fetch("/api/student/tests/finish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attemptId }),
          });
        }
      } finally {
        router.replace(`/student/tests/result/${attemptId}`);
        router.refresh();
      }
    },
    [attemptId, router]
  );

  // Countdown to the server-defined deadline
  useEffect(() => {
    const interval = setInterval(() => {
      const left = computeRemaining();
      setRemainingSeconds(left);
      if (left <= 0) {
        clearInterval(interval);
        void goToResult(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [computeRemaining, goToResult]);

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = useCallback(
    async (answerId: number) => {
      if (!currentQuestion || finishingRef.current) return;
      const questionId = currentQuestion.id;
      const previous = selected[questionId];
      if (previous === answerId) return;

      setError(null);
      setSelected((prev) => ({ ...prev, [questionId]: answerId }));

      try {
        const res = await fetch("/api/student/tests/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, questionId, answerId }),
        });
        if (res.status === 409) {
          // Time is over (or attempt finished) on the server.
          void goToResult(false);
          return;
        }
        if (!res.ok) {
          setSelected((prev) => {
            const next = { ...prev };
            if (previous === undefined) delete next[questionId];
            else next[questionId] = previous;
            return next;
          });
          setError(t(lang, "tests.saveError"));
          return;
        }
        // Move on to the next unanswered question
        const nextIdx = questions.findIndex(
          (q, idx) => idx > currentIndex && selected[q.id] === undefined && q.id !== questionId
        );
        if (nextIdx !== -1) setCurrentIndex(nextIdx);
      } catch {
        setSelected((prev) => {
          const next = { ...prev };
          if (previous === undefined) delete next[questionId];
          else next[questionId] = previous;
          return next;
        });
        setError(t(lang, "tests.saveError"));
      }
    },
    [attemptId, currentIndex, currentQuestion, goToResult, lang, questions, selected]
  );

  // Keyboard: 1-5, F1-F5, ArrowLeft, ArrowRight
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion) return;
      const keyMap: Record<string, number> = {
        "1": 0, "2": 1, "3": 2, "4": 3, "5": 4,
        F1: 0, F2: 1, F3: 2, F4: 3, F5: 4,
      };
      if (e.key in keyMap) {
        e.preventDefault();
        const ans = currentQuestion.answers[keyMap[e.key]];
        if (ans) void handleSelectAnswer(ans.id);
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
  }, [currentQuestion, handleSelectAnswer, questions.length]);

  const answeredCount = useMemo(
    () => questions.filter((q) => selected[q.id] !== undefined).length,
    [questions, selected]
  );

  function handleFinishClick() {
    const unanswered = questions.length - answeredCount;
    if (unanswered > 0 && !window.confirm(t(lang, "tests.confirmFinish", { count: unanswered }))) {
      return;
    }
    void goToResult(true);
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 py-16">
        <p className="font-semibold">{t(lang, "tests.noQuestions")}</p>
        <button
          type="button"
          onClick={() => void goToResult(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-800 text-white font-bold"
        >
          {t(lang, "student.finishPractice")}
        </button>
      </div>
    );
  }

  const chosenAnswerId = selected[currentQuestion.id];
  const questionText = localizedText(lang, currentQuestion.text_uz, currentQuestion.text_ru);

  return (
    <div className="max-w-5xl mx-auto space-y-2.5 select-none">
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

        <div
          role="navigation"
          aria-label={t(lang, "tests.navigator")}
          className="flex flex-wrap items-center gap-1"
        >
          {questions.map((q, idx) => {
            const isAnswered = selected[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${t(lang, "tests.question")} ${idx + 1}`}
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
          onClick={handleFinishClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold"
        >
          <Flag className="w-3.5 h-3.5" />
          {t(lang, "tests.finish")}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-700 dark:text-red-300 text-sm font-semibold"
        >
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-blue-800 dark:text-blue-300 text-sm">
            {title} · {t(lang, "tests.question")} #{currentIndex + 1} / {questions.length}
          </span>
          <span>{t(lang, "student.keyboardHint")}</span>
        </div>

        {currentQuestion.image_path && (
          <div className="flex justify-center bg-slate-100 dark:bg-slate-800/60 rounded-xl p-2 border border-slate-200 dark:border-slate-800">
            <img
              src={currentQuestion.image_path}
              alt=""
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
                aria-pressed={isChosen}
                onClick={() => void handleSelectAnswer(ans.id)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-150 flex items-center gap-3.5 ${
                  isChosen
                    ? "border-blue-800 bg-blue-50 dark:bg-blue-950/70 text-blue-950 dark:text-blue-100"
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

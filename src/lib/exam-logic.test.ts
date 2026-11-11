import { describe, it, expect } from "vitest";
import {
  evaluateExamState,
  calculateWeakTopics,
  chunkQuestionsIntoTickets,
  sanitizeQuestionForClientExam,
} from "./exam-logic";

describe("Exam scoring logic (GAI format)", () => {
  const baseTime = 1_700_000_000_000;

  it("passes when all 20 questions are answered within time and wrong <= maxWrong (2)", () => {
    const answers = Array.from({ length: 20 }, (_, i) => ({
      questionId: i + 1,
      answerId: (i + 1) * 10,
      isCorrect: i >= 2, // 2 wrong, 18 correct
    }));

    const result = evaluateExamState({
      totalQuestions: 20,
      maxWrong: 2,
      durationMinutes: 25,
      startedAtMs: baseTime,
      nowMs: baseTime + 10 * 60 * 1000, // 10 mins elapsed
      answers,
    });

    expect(result.finished).toBe(true);
    expect(result.passed).toBe(true);
    expect(result.correct).toBe(18);
    expect(result.wrong).toBe(2);
    expect(result.reason).toBe("passed");
  });

  it("fails immediately when wrong > maxWrong (e.g. 3rd mistake on question 5)", () => {
    const answers = [
      { questionId: 1, answerId: 11, isCorrect: false },
      { questionId: 2, answerId: 21, isCorrect: true },
      { questionId: 3, answerId: 31, isCorrect: false },
      { questionId: 4, answerId: 41, isCorrect: true },
      { questionId: 5, answerId: 51, isCorrect: false }, // 3rd mistake!
    ];

    const result = evaluateExamState({
      totalQuestions: 20,
      maxWrong: 2,
      durationMinutes: 25,
      startedAtMs: baseTime,
      nowMs: baseTime + 3 * 60 * 1000,
      answers,
    });

    expect(result.finished).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.isMaxWrongExceeded).toBe(true);
    expect(result.wrong).toBe(3);
    expect(result.reason).toBe("wrong_limit");
  });

  it("fails on timeout even if no mistakes were made yet", () => {
    const answers = Array.from({ length: 15 }, (_, i) => ({
      questionId: i + 1,
      answerId: (i + 1) * 10,
      isCorrect: true,
    }));

    const result = evaluateExamState({
      totalQuestions: 20,
      maxWrong: 2,
      durationMinutes: 25,
      startedAtMs: baseTime,
      nowMs: baseTime + 25 * 60 * 1000 + 1000, // 25m 01s elapsed
      answers,
    });

    expect(result.finished).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.isTimeout).toBe(true);
    expect(result.remainingSeconds).toBe(0);
    expect(result.reason).toBe("timeout");
  });

  it("stays in_progress while time remains, wrong <= maxWrong, and questions remain", () => {
    const answers = [
      { questionId: 1, answerId: 11, isCorrect: true },
      { questionId: 2, answerId: 21, isCorrect: false },
    ];

    const result = evaluateExamState({
      totalQuestions: 20,
      maxWrong: 2,
      durationMinutes: 25,
      startedAtMs: baseTime,
      nowMs: baseTime + 5 * 60 * 1000,
      answers,
    });

    expect(result.finished).toBe(false);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe("in_progress");
    expect(result.remainingSeconds).toBe(20 * 60);
  });

  it("fails if student force-finishes before answering all questions", () => {
    const answers = [{ questionId: 1, answerId: 11, isCorrect: true }];
    const result = evaluateExamState({
      totalQuestions: 20,
      maxWrong: 2,
      durationMinutes: 25,
      startedAtMs: baseTime,
      nowMs: baseTime + 2 * 60 * 1000,
      answers,
      forceFinish: true,
    });

    expect(result.finished).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe("finished_incomplete");
  });

  it("strips is_correct when sanitizing question for exam client", () => {
    const q = {
      id: 10,
      topic_id: 2,
      text_uz: "Savol?",
      text_ru: "Вопрос?",
      image_path: null,
      explanation_uz: "Izoh",
      answers: [
        { id: 1, question_id: 10, text_uz: "A", text_ru: "А", sort: 1, is_correct: true },
        { id: 2, question_id: 10, text_uz: "B", text_ru: "Б", sort: 2, is_correct: false },
      ],
    };

    const sanitized = sanitizeQuestionForClientExam(q);
    expect("is_correct" in sanitized.answers[0]).toBe(false);
    expect("explanation_uz" in sanitized).toBe(false);
  });

  it("calculates weak topics sorted by error rate", () => {
    const stats = calculateWeakTopics([
      { topicId: 1, topicNameUz: "Chorraha", topicNameRu: "Перекрестки", isCorrect: false },
      { topicId: 1, topicNameUz: "Chorraha", topicNameRu: "Перекрестки", isCorrect: false },
      { topicId: 2, topicNameUz: "Tezlik", topicNameRu: "Скорость", isCorrect: true },
      { topicId: 2, topicNameUz: "Tezlik", topicNameRu: "Скорость", isCorrect: false },
    ]);

    expect(stats[0].topicId).toBe(1);
    expect(stats[0].errorRate).toBe(100);
    expect(stats[1].topicId).toBe(2);
    expect(stats[1].errorRate).toBe(50);
  });

  it("chunks published questions into tickets of 20", () => {
    const ids = Array.from({ length: 40 }, (_, i) => i + 1);
    const chunks = chunkQuestionsIntoTickets(ids, 20);
    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(20);
    expect(chunks[1].length).toBe(20);
  });
});

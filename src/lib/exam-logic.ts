export interface ExamAnswerRecord {
  questionId: number;
  answerId: number;
  isCorrect: boolean;
}

export interface ExamEvaluationInput {
  totalQuestions: number;
  maxWrong: number;
  durationMinutes: number;
  startedAtMs: number;
  nowMs: number;
  answers: ExamAnswerRecord[];
  forceFinish?: boolean;
}

export interface ExamEvaluationResult {
  correct: number;
  wrong: number;
  answeredCount: number;
  remainingSeconds: number;
  isTimeout: boolean;
  isMaxWrongExceeded: boolean;
  isAllAnswered: boolean;
  finished: boolean;
  passed: boolean;
  reason: "in_progress" | "passed" | "wrong_limit" | "timeout" | "finished_incomplete";
}

export function evaluateExamState(input: ExamEvaluationInput): ExamEvaluationResult {
  const {
    totalQuestions,
    maxWrong,
    durationMinutes,
    startedAtMs,
    nowMs,
    answers,
    forceFinish = false,
  } = input;

  // Deduplicate by questionId (keep first answer per question)
  const seen = new Set<number>();
  let correct = 0;
  let wrong = 0;

  for (const ans of answers) {
    if (seen.has(ans.questionId)) continue;
    seen.add(ans.questionId);
    if (ans.isCorrect) {
      correct++;
    } else {
      wrong++;
    }
  }

  const answeredCount = seen.size;
  const durationMs = durationMinutes * 60 * 1000;
  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const remainingSeconds = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));

  const isTimeout = elapsedMs > durationMs;
  const isMaxWrongExceeded = wrong > maxWrong;
  const isAllAnswered = totalQuestions > 0 && answeredCount >= totalQuestions;

  if (isMaxWrongExceeded) {
    return {
      correct,
      wrong,
      answeredCount,
      remainingSeconds,
      isTimeout,
      isMaxWrongExceeded: true,
      isAllAnswered,
      finished: true,
      passed: false,
      reason: "wrong_limit",
    };
  }

  if (isTimeout) {
    return {
      correct,
      wrong,
      answeredCount,
      remainingSeconds: 0,
      isTimeout: true,
      isMaxWrongExceeded: false,
      isAllAnswered,
      finished: true,
      passed: false,
      reason: "timeout",
    };
  }

  if (isAllAnswered) {
    const passed = wrong <= maxWrong && correct >= totalQuestions - maxWrong;
    return {
      correct,
      wrong,
      answeredCount,
      remainingSeconds,
      isTimeout: false,
      isMaxWrongExceeded: false,
      isAllAnswered: true,
      finished: true,
      passed,
      reason: passed ? "passed" : "wrong_limit",
    };
  }

  if (forceFinish) {
    return {
      correct,
      wrong,
      answeredCount,
      remainingSeconds,
      isTimeout: false,
      isMaxWrongExceeded: false,
      isAllAnswered: false,
      finished: true,
      passed: false,
      reason: "finished_incomplete",
    };
  }

  return {
    correct,
    wrong,
    answeredCount,
    remainingSeconds,
    isTimeout: false,
    isMaxWrongExceeded: false,
    isAllAnswered: false,
    finished: false,
    passed: false,
    reason: "in_progress",
  };
}

export interface TopicAnswerStatInput {
  topicId: number;
  topicNameUz: string;
  topicNameRu: string;
  isCorrect: boolean;
}

export interface TopicWeaknessStat {
  topicId: number;
  topicNameUz: string;
  topicNameRu: string;
  total: number;
  wrong: number;
  correct: number;
  errorRate: number; // 0..100 integer percentage
}

export function calculateWeakTopics(records: TopicAnswerStatInput[]): TopicWeaknessStat[] {
  const map = new Map<number, TopicWeaknessStat>();

  for (const r of records) {
    let entry = map.get(r.topicId);
    if (!entry) {
      entry = {
        topicId: r.topicId,
        topicNameUz: r.topicNameUz,
        topicNameRu: r.topicNameRu,
        total: 0,
        wrong: 0,
        correct: 0,
        errorRate: 0,
      };
      map.set(r.topicId, entry);
    }
    entry.total++;
    if (r.isCorrect) {
      entry.correct++;
    } else {
      entry.wrong++;
    }
  }

  const list = Array.from(map.values()).map((item) => ({
    ...item,
    errorRate: item.total > 0 ? Math.round((item.wrong / item.total) * 100) : 0,
  }));

  list.sort((a, b) => b.errorRate - a.errorRate || b.wrong - a.wrong);
  return list;
}

export function chunkQuestionsIntoTickets(questionIds: number[], perTicket = 20): number[][] {
  const chunks: number[][] = [];
  for (let i = 0; i < questionIds.length; i += perTicket) {
    chunks.push(questionIds.slice(i, i + perTicket));
  }
  return chunks;
}

export function sanitizeQuestionForClientExam<
  T extends {
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
      is_correct?: boolean;
    }>;
  }
>(question: T) {
  return {
    id: question.id,
    topic_id: question.topic_id,
    text_uz: question.text_uz,
    text_ru: question.text_ru,
    image_path: question.image_path,
    answers: question.answers.map((a) => ({
      id: a.id,
      question_id: a.question_id,
      text_uz: a.text_uz,
      text_ru: a.text_ru,
      sort: a.sort,
    })),
  };
}

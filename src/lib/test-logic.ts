/**
 * Pure logic for the "Tests" feature (live = umumiy, open = ixtiyoriy).
 * Everything here is deterministic and takes `nowMs` explicitly so it can be unit-tested.
 * Server time is the single source of truth for every deadline.
 */

export type TestKind = "live" | "open";

const MINUTE_MS = 60_000;

/** Live test: same end time for everybody. */
export function liveEndsAt(startedAtMs: number, durationMinutes: number): number {
  return startedAtMs + durationMinutes * MINUTE_MS;
}

/** A student may join a live test any time strictly before `ends_at`. */
export function canEnterLive(nowMs: number, endsAtMs: number): boolean {
  return nowMs < endsAtMs;
}

/**
 * Deadline of one attempt.
 * - live: the shared `ends_at` (a late student only gets the remaining time)
 * - open: the test duration counted from the attempt's own start
 */
export function attemptDeadline(args: {
  kind: TestKind;
  nowMs: number;
  durationMinutes: number;
  assignmentEndsAt?: number | null;
}): number {
  if (args.kind === "live") {
    if (args.assignmentEndsAt == null) {
      throw new Error("Live assignment has no ends_at");
    }
    return args.assignmentEndsAt;
  }
  return args.nowMs + args.durationMinutes * MINUTE_MS;
}

export function remainingSeconds(nowMs: number, deadlineMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

/** Answers are accepted only while the attempt is unfinished and before its deadline. */
export function canAcceptAnswer(
  nowMs: number,
  deadlineMs: number,
  finishedAtMs: number | null | undefined
): boolean {
  return (finishedAtMs == null) && nowMs < deadlineMs;
}

/** An attempt is over when it was finished explicitly or its deadline has passed. */
export function isAttemptOver(
  nowMs: number,
  deadlineMs: number,
  finishedAtMs: number | null | undefined
): boolean {
  return finishedAtMs != null || nowMs >= deadlineMs;
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface AttemptOrder {
  questionOrder: number[];
  /** question id -> answer ids in the order shown to this student */
  answerOrder: Record<number, number[]>;
}

/** Random question order AND random answer order per question for one attempt. */
export function buildAttemptOrder(
  questions: ReadonlyArray<{ id: number; answerIds: readonly number[] }>,
  rng: () => number = Math.random
): AttemptOrder {
  const questionOrder = shuffle(
    questions.map((q) => q.id),
    rng
  );
  const answerOrder: Record<number, number[]> = {};
  for (const q of questions) {
    answerOrder[q.id] = shuffle(q.answerIds, rng);
  }
  return { questionOrder, answerOrder };
}

export interface Score {
  correct: number;
  total: number;
  percent: number;
}

export function computeScore(correct: number, total: number): Score {
  return {
    correct,
    total,
    percent: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}

export type ParticipantStatus = "finished" | "in_progress" | "not_started" | "absent";

export interface AttemptLike {
  finished_at: number | null;
  deadline_at: number;
}

/**
 * Status of one group member for one assignment.
 * - finished: has a finished attempt (or one whose deadline passed)
 * - in_progress: has an attempt that is still running
 * - absent ("Kelmadi"): live test only — never started before `ends_at` (score 0)
 * - not_started: live test still running and the student has not started yet
 */
export function classifyParticipant(args: {
  kind: TestKind;
  attempts: readonly AttemptLike[];
  nowMs: number;
  liveEndsAt?: number | null;
}): ParticipantStatus {
  const { kind, attempts, nowMs, liveEndsAt } = args;

  if (attempts.length === 0) {
    if (kind === "live" && liveEndsAt != null && nowMs >= liveEndsAt) return "absent";
    return "not_started";
  }
  if (attempts.some((a) => isAttemptOver(nowMs, a.deadline_at, a.finished_at))) {
    return "finished";
  }
  return "in_progress";
}

/** Best attempt by correct answers (ties: the earliest one). */
export function pickBestAttempt<T extends { correct: number; started_at?: number }>(
  attempts: readonly T[]
): T | null {
  let best: T | null = null;
  for (const a of attempts) {
    if (
      best === null ||
      a.correct > best.correct ||
      (a.correct === best.correct && (a.started_at ?? 0) < (best.started_at ?? 0))
    ) {
      best = a;
    }
  }
  return best;
}

/** Live results: students who joined the group after the live test started are not counted. */
export function isCountedInLiveResults(args: {
  joinedAtMs: number;
  liveStartedAtMs: number;
  hasAttempt: boolean;
}): boolean {
  return args.joinedAtMs <= args.liveStartedAtMs || args.hasAttempt;
}

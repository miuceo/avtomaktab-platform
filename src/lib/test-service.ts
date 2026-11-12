import { z } from "zod";
import { and, asc, desc, eq, gt, inArray, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  answers,
  group_members,
  groups,
  questions,
  test_assignments,
  test_attempt_answers,
  test_attempts,
  test_questions,
  tests,
  users,
} from "@/db/schema";
import {
  attemptDeadline,
  buildAttemptOrder,
  canAcceptAnswer,
  canEnterLive,
  classifyParticipant,
  computeScore,
  isAttemptOver,
  isCountedInLiveResults,
  liveEndsAt,
  pickBestAttempt,
  type ParticipantStatus,
  type TestKind,
} from "./test-logic";
import { getManagedGroup } from "./students";
import type { AuthUser } from "./auth";

type Actor = Pick<AuthUser, "id" | "role">;

// ---------------------------------------------------------------------------
// Tests (the question sets)
// ---------------------------------------------------------------------------

export const TestInputSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(150),
  durationMinutes: z.number().int().min(1).max(300),
  questionIds: z.array(z.number().int().positive()).min(1).max(300),
});

export type TestInput = z.infer<typeof TestInputSchema>;

export type SaveTestResult =
  | { ok: true; id: number }
  | { ok: false; error: "forbidden" | "notFound" | "invalidQuestions" };

/** Admin may edit any test, a teacher only their own. */
export function canEditTest(actor: Actor, test: { created_by: number }): boolean {
  return actor.role === "admin" || (actor.role === "teacher" && test.created_by === actor.id);
}

export async function saveTest(
  actor: Actor,
  input: TestInput,
  nowMs = Date.now()
): Promise<SaveTestResult> {
  if (actor.role !== "admin" && actor.role !== "teacher") {
    return { ok: false, error: "forbidden" };
  }

  const questionIds = Array.from(new Set(input.questionIds));
  const published = await db
    .select({ id: questions.id })
    .from(questions)
    .where(and(inArray(questions.id, questionIds), eq(questions.status, "published")));
  if (published.length !== questionIds.length) {
    return { ok: false, error: "invalidQuestions" };
  }

  if (input.id) {
    const existing = await db.select().from(tests).where(eq(tests.id, input.id)).limit(1);
    if (existing.length === 0) return { ok: false, error: "notFound" };
    if (!canEditTest(actor, existing[0])) return { ok: false, error: "forbidden" };

    await db
      .update(tests)
      .set({ title: input.title, duration_minutes: input.durationMinutes })
      .where(eq(tests.id, input.id));
    await db.delete(test_questions).where(eq(test_questions.test_id, input.id));
    await db.insert(test_questions).values(
      questionIds.map((qId, idx) => ({ test_id: input.id!, question_id: qId, sort: idx + 1 }))
    );
    return { ok: true, id: input.id };
  }

  const [created] = await db
    .insert(tests)
    .values({
      title: input.title,
      duration_minutes: input.durationMinutes,
      created_by: actor.id,
      created_at: nowMs,
    })
    .returning({ id: tests.id });
  await db.insert(test_questions).values(
    questionIds.map((qId, idx) => ({ test_id: created.id, question_id: qId, sort: idx + 1 }))
  );
  return { ok: true, id: created.id };
}

export async function deleteTest(
  actor: Actor,
  testId: number
): Promise<{ ok: true } | { ok: false; error: "forbidden" | "notFound" }> {
  const existing = await db.select().from(tests).where(eq(tests.id, testId)).limit(1);
  if (existing.length === 0) return { ok: false, error: "notFound" };
  if (!canEditTest(actor, existing[0])) return { ok: false, error: "forbidden" };
  await db.delete(tests).where(eq(tests.id, testId));
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Assignments (a test given to a group)
// ---------------------------------------------------------------------------

export type CreateAssignmentResult =
  | { ok: true; id: number; startedAt: number | null; endsAt: number | null }
  | { ok: false; error: "forbidden" | "testNotFound" | "emptyTest" };

/**
 * live: the server sets started_at = now and ends_at = now + duration (same end for everybody).
 * open: stays open until the teacher closes it.
 */
export async function createAssignment(
  actor: Actor,
  input: { testId: number; groupId: number; kind: TestKind },
  nowMs = Date.now()
): Promise<CreateAssignmentResult> {
  const group = await getManagedGroup(actor, input.groupId);
  if (!group) return { ok: false, error: "forbidden" };

  const found = await db.select().from(tests).where(eq(tests.id, input.testId)).limit(1);
  if (found.length === 0) return { ok: false, error: "testNotFound" };
  const test = found[0];

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(test_questions)
    .where(eq(test_questions.test_id, test.id));
  if (Number(n) === 0) return { ok: false, error: "emptyTest" };

  const isLive = input.kind === "live";
  const startedAt = isLive ? nowMs : null;
  const endsAt = isLive ? liveEndsAt(nowMs, test.duration_minutes) : null;

  const [row] = await db
    .insert(test_assignments)
    .values({
      test_id: test.id,
      group_id: group.id,
      kind: input.kind,
      started_at: startedAt,
      ends_at: endsAt,
      created_by: actor.id,
      created_at: nowMs,
    })
    .returning({ id: test_assignments.id });

  return { ok: true, id: row.id, startedAt, endsAt };
}

/** Returns the assignment (with its group) if the actor may manage it. */
export async function getManagedAssignment(actor: Actor, assignmentId: number) {
  const rows = await db
    .select({ assignment: test_assignments, group: groups })
    .from(test_assignments)
    .innerJoin(groups, eq(test_assignments.group_id, groups.id))
    .where(eq(test_assignments.id, assignmentId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (actor.role === "admin") return row;
  if (actor.role === "teacher" && row.group.teacher_id === actor.id) return row;
  return null;
}

export async function closeOpenAssignment(
  actor: Actor,
  assignmentId: number,
  nowMs = Date.now()
): Promise<{ ok: true } | { ok: false; error: "forbidden" | "notOpen" }> {
  const managed = await getManagedAssignment(actor, assignmentId);
  if (!managed) return { ok: false, error: "forbidden" };
  if (managed.assignment.kind !== "open") return { ok: false, error: "notOpen" };
  await db
    .update(test_assignments)
    .set({ closed_at: managed.assignment.closed_at ?? nowMs })
    .where(eq(test_assignments.id, assignmentId));
  return { ok: true };
}

export async function deleteAssignment(
  actor: Actor,
  assignmentId: number
): Promise<{ ok: true } | { ok: false; error: "forbidden" }> {
  const managed = await getManagedAssignment(actor, assignmentId);
  if (!managed) return { ok: false, error: "forbidden" };
  await db.delete(test_assignments).where(eq(test_assignments.id, assignmentId));
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

type AttemptRow = typeof test_attempts.$inferSelect;

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Counts the answers and closes the attempt. No-op if it is already finished. */
export async function finalizeAttempt(attemptId: number, finishedAtMs: number): Promise<void> {
  const rows = await db.select().from(test_attempts).where(eq(test_attempts.id, attemptId)).limit(1);
  const attempt = rows[0];
  if (!attempt || attempt.finished_at != null) return;

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(test_attempt_answers)
    .where(
      and(eq(test_attempt_answers.attempt_id, attemptId), eq(test_attempt_answers.is_correct, true))
    );
  const total = parseJson<number[]>(attempt.question_order_json, []).length;

  await db
    .update(test_attempts)
    .set({ finished_at: finishedAtMs, correct: Number(n), total })
    .where(and(eq(test_attempts.id, attemptId), isNull(test_attempts.finished_at)));
}

/**
 * Auto-finishes every attempt whose deadline has passed, even if the student never
 * pressed "finish". finished_at is set to the deadline (not to the time of the sweep).
 */
export async function sweepExpiredAttempts(nowMs = Date.now()): Promise<void> {
  const expired = await db
    .select({ id: test_attempts.id, deadline_at: test_attempts.deadline_at })
    .from(test_attempts)
    .where(and(isNull(test_attempts.finished_at), lte(test_attempts.deadline_at, nowMs)));
  for (const a of expired) {
    await finalizeAttempt(a.id, a.deadline_at);
  }
}

export type EnterResult =
  | { ok: true; attemptId: number; resumed: boolean; finished: boolean; deadlineAt: number }
  | {
      ok: false;
      error: "notFound" | "notMember" | "ended" | "closed" | "emptyTest";
    };

/**
 * A student enters (or resumes) an assignment.
 * - live: one attempt per student per assignment; only before ends_at; a late student
 *   gets the remaining time (deadline = ends_at).
 * - open: unlimited attempts, each with the full test duration from its own start; an
 *   unfinished attempt is resumed instead of starting a new one.
 */
export async function enterAssignment(
  studentId: number,
  assignmentId: number,
  nowMs = Date.now(),
  rng: () => number = Math.random
): Promise<EnterResult> {
  await sweepExpiredAttempts(nowMs);

  const rows = await db
    .select({ assignment: test_assignments, test: tests })
    .from(test_assignments)
    .innerJoin(tests, eq(test_assignments.test_id, tests.id))
    .where(eq(test_assignments.id, assignmentId))
    .limit(1);
  if (rows.length === 0) return { ok: false, error: "notFound" };
  const { assignment, test } = rows[0];

  const membership = await db
    .select({ s: group_members.student_id })
    .from(group_members)
    .where(
      and(eq(group_members.group_id, assignment.group_id), eq(group_members.student_id, studentId))
    )
    .limit(1);
  if (membership.length === 0) return { ok: false, error: "notMember" };

  const existing = await db
    .select()
    .from(test_attempts)
    .where(
      and(eq(test_attempts.assignment_id, assignmentId), eq(test_attempts.student_id, studentId))
    )
    .orderBy(desc(test_attempts.attempt_no));

  const isLive = assignment.kind === "live";

  if (isLive) {
    const mine = existing[0];
    if (mine) {
      // One attempt per student: continue the same unfinished attempt (or view the result).
      const over = isAttemptOver(nowMs, mine.deadline_at, mine.finished_at);
      if (over && mine.finished_at == null) await finalizeAttempt(mine.id, mine.deadline_at);
      return {
        ok: true,
        attemptId: mine.id,
        resumed: true,
        finished: over,
        deadlineAt: mine.deadline_at,
      };
    }
    if (assignment.ends_at == null || !canEnterLive(nowMs, assignment.ends_at)) {
      return { ok: false, error: "ended" };
    }
  } else {
    const running = existing.find((a) => !isAttemptOver(nowMs, a.deadline_at, a.finished_at));
    if (running) {
      // An unfinished attempt is always resumed (also after the test was closed).
      return {
        ok: true,
        attemptId: running.id,
        resumed: true,
        finished: false,
        deadlineAt: running.deadline_at,
      };
    }
    if (assignment.closed_at != null) return { ok: false, error: "closed" };
  }

  // Build a fresh attempt: random question order AND random answer order, stored server-side.
  const testQuestionRows = await db
    .select({ id: test_questions.question_id })
    .from(test_questions)
    .innerJoin(questions, eq(test_questions.question_id, questions.id))
    .where(and(eq(test_questions.test_id, test.id), eq(questions.status, "published")))
    .orderBy(asc(test_questions.sort));
  if (testQuestionRows.length === 0) return { ok: false, error: "emptyTest" };

  const qIds = testQuestionRows.map((r) => r.id);
  const answerRows = await db
    .select({ id: answers.id, question_id: answers.question_id, sort: answers.sort })
    .from(answers)
    .where(inArray(answers.question_id, qIds))
    .orderBy(asc(answers.sort), asc(answers.id));

  const order = buildAttemptOrder(
    qIds.map((id) => ({
      id,
      answerIds: answerRows.filter((a) => a.question_id === id).map((a) => a.id),
    })),
    rng
  );

  const deadline = attemptDeadline({
    kind: assignment.kind,
    nowMs,
    durationMinutes: test.duration_minutes,
    assignmentEndsAt: assignment.ends_at,
  });
  const nextNo = (existing[0]?.attempt_no ?? 0) + 1;

  try {
    const [created] = await db
      .insert(test_attempts)
      .values({
        assignment_id: assignmentId,
        student_id: studentId,
        attempt_no: nextNo,
        question_order_json: JSON.stringify(order.questionOrder),
        answer_order_json: JSON.stringify(order.answerOrder),
        started_at: nowMs,
        deadline_at: deadline,
        total: order.questionOrder.length,
      })
      .returning({ id: test_attempts.id });
    return { ok: true, attemptId: created.id, resumed: false, finished: false, deadlineAt: deadline };
  } catch (err) {
    // Unique (assignment, student, attempt_no): a concurrent request created it first.
    const message = err instanceof Error ? err.message : String(err);
    if (!/UNIQUE/i.test(message)) throw err;
    const again = await db
      .select()
      .from(test_attempts)
      .where(
        and(eq(test_attempts.assignment_id, assignmentId), eq(test_attempts.student_id, studentId))
      )
      .orderBy(desc(test_attempts.attempt_no))
      .limit(1);
    return {
      ok: true,
      attemptId: again[0].id,
      resumed: true,
      finished: isAttemptOver(nowMs, again[0].deadline_at, again[0].finished_at),
      deadlineAt: again[0].deadline_at,
    };
  }
}

export type SubmitAnswerResult =
  | { ok: true; remainingSeconds: number }
  | {
      ok: false;
      error: "notFound" | "expired" | "finished" | "invalidQuestion" | "invalidAnswer";
    };

/**
 * Saves one answer (unique per attempt+question; the student may change it until the deadline).
 * Rejected after the deadline (`ends_at` for live tests); the attempt is then finalized.
 */
export async function submitTestAnswer(
  studentId: number,
  input: { attemptId: number; questionId: number; answerId: number },
  nowMs = Date.now()
): Promise<SubmitAnswerResult> {
  const rows = await db
    .select()
    .from(test_attempts)
    .where(and(eq(test_attempts.id, input.attemptId), eq(test_attempts.student_id, studentId)))
    .limit(1);
  const attempt = rows[0];
  if (!attempt) return { ok: false, error: "notFound" };

  if (attempt.finished_at != null) return { ok: false, error: "finished" };
  if (!canAcceptAnswer(nowMs, attempt.deadline_at, attempt.finished_at)) {
    await finalizeAttempt(attempt.id, attempt.deadline_at);
    return { ok: false, error: "expired" };
  }

  const questionOrder = parseJson<number[]>(attempt.question_order_json, []);
  if (!questionOrder.includes(input.questionId)) {
    return { ok: false, error: "invalidQuestion" };
  }
  const answerOrder = parseJson<Record<string, number[]>>(attempt.answer_order_json, {});
  if (!(answerOrder[String(input.questionId)] ?? []).includes(input.answerId)) {
    return { ok: false, error: "invalidAnswer" };
  }

  const ansRows = await db
    .select({ is_correct: answers.is_correct })
    .from(answers)
    .where(and(eq(answers.id, input.answerId), eq(answers.question_id, input.questionId)))
    .limit(1);
  if (ansRows.length === 0) return { ok: false, error: "invalidAnswer" };

  await db
    .insert(test_attempt_answers)
    .values({
      attempt_id: attempt.id,
      question_id: input.questionId,
      answer_id: input.answerId,
      is_correct: ansRows[0].is_correct,
    })
    .onConflictDoUpdate({
      target: [test_attempt_answers.attempt_id, test_attempt_answers.question_id],
      set: { answer_id: input.answerId, is_correct: ansRows[0].is_correct },
    });

  return { ok: true, remainingSeconds: Math.max(0, Math.ceil((attempt.deadline_at - nowMs) / 1000)) };
}

/** Student pressed "finish" (or the timer hit zero in the browser). */
export async function finishTestAttempt(
  studentId: number,
  attemptId: number,
  nowMs = Date.now()
): Promise<{ ok: true } | { ok: false; error: "notFound" }> {
  const rows = await db
    .select()
    .from(test_attempts)
    .where(and(eq(test_attempts.id, attemptId), eq(test_attempts.student_id, studentId)))
    .limit(1);
  const attempt = rows[0];
  if (!attempt) return { ok: false, error: "notFound" };
  await finalizeAttempt(attempt.id, Math.min(nowMs, attempt.deadline_at));
  return { ok: true };
}

/** The student's unfinished live-test attempt that has not timed out (blocks practice pages). */
export async function getActiveLiveTestAttempt(
  studentId: number,
  nowMs = Date.now()
): Promise<AttemptRow | null> {
  const rows = await db
    .select({ attempt: test_attempts })
    .from(test_attempts)
    .innerJoin(test_assignments, eq(test_attempts.assignment_id, test_assignments.id))
    .where(
      and(
        eq(test_attempts.student_id, studentId),
        isNull(test_attempts.finished_at),
        gt(test_attempts.deadline_at, nowMs),
        eq(test_assignments.kind, "live")
      )
    )
    .orderBy(desc(test_attempts.started_at))
    .limit(1);
  return rows[0]?.attempt ?? null;
}

// ---------------------------------------------------------------------------
// Reading attempts for the student UI
// ---------------------------------------------------------------------------

export interface RunAnswer {
  id: number;
  text_uz: string;
  text_ru: string;
}

export interface RunQuestion {
  id: number;
  text_uz: string;
  text_ru: string;
  image_path: string | null;
  answers: RunAnswer[];
}

/** Questions + answers in the attempt's stored order. Never contains `is_correct`. */
export async function loadAttemptRunData(attempt: AttemptRow): Promise<{
  questions: RunQuestion[];
  selected: Record<number, number>;
}> {
  const questionOrder = parseJson<number[]>(attempt.question_order_json, []);
  const answerOrder = parseJson<Record<string, number[]>>(attempt.answer_order_json, {});

  const [qRows, aRows, savedRows] = await Promise.all([
    questionOrder.length
      ? db.select().from(questions).where(inArray(questions.id, questionOrder))
      : Promise.resolve([]),
    questionOrder.length
      ? db.select().from(answers).where(inArray(answers.question_id, questionOrder))
      : Promise.resolve([]),
    db.select().from(test_attempt_answers).where(eq(test_attempt_answers.attempt_id, attempt.id)),
  ]);

  const qMap = new Map(qRows.map((q) => [q.id, q]));
  const aMap = new Map(aRows.map((a) => [a.id, a]));

  const result: RunQuestion[] = [];
  for (const qId of questionOrder) {
    const q = qMap.get(qId);
    if (!q) continue;
    const ordered = (answerOrder[String(qId)] ?? [])
      .map((id) => aMap.get(id))
      .filter((a): a is NonNullable<typeof a> => !!a);
    result.push({
      id: q.id,
      text_uz: q.text_uz,
      text_ru: q.text_ru,
      image_path: q.image_path,
      answers: ordered.map((a) => ({ id: a.id, text_uz: a.text_uz, text_ru: a.text_ru })),
    });
  }

  const selected: Record<number, number> = {};
  for (const s of savedRows) selected[s.question_id] = s.answer_id;
  return { questions: result, selected };
}

export interface ReviewQuestion extends RunQuestion {
  explanation_uz: string;
  explanation_ru: string;
  selectedAnswerId: number | null;
  correctAnswerId: number | null;
  isCorrect: boolean;
}

/** Full review of a FINISHED attempt (includes the correct answers). */
export async function loadAttemptReview(attempt: AttemptRow): Promise<ReviewQuestion[]> {
  const run = await loadAttemptRunData(attempt);
  const qIds = run.questions.map((q) => q.id);
  if (qIds.length === 0) return [];

  const [qRows, aRows] = await Promise.all([
    db.select().from(questions).where(inArray(questions.id, qIds)),
    db.select().from(answers).where(inArray(answers.question_id, qIds)),
  ]);
  const qMap = new Map(qRows.map((q) => [q.id, q]));
  const correctByQuestion = new Map<number, number>();
  for (const a of aRows) if (a.is_correct) correctByQuestion.set(a.question_id, a.id);

  return run.questions.map((q) => {
    const selectedAnswerId = run.selected[q.id] ?? null;
    const correctAnswerId = correctByQuestion.get(q.id) ?? null;
    return {
      ...q,
      explanation_uz: qMap.get(q.id)?.explanation_uz ?? "",
      explanation_ru: qMap.get(q.id)?.explanation_ru ?? "",
      selectedAnswerId,
      correctAnswerId,
      isCorrect: selectedAnswerId != null && selectedAnswerId === correctAnswerId,
    };
  });
}

export async function getOwnAttempt(studentId: number, attemptId: number) {
  const rows = await db
    .select({ attempt: test_attempts, assignment: test_assignments, test: tests })
    .from(test_attempts)
    .innerJoin(test_assignments, eq(test_attempts.assignment_id, test_assignments.id))
    .innerJoin(tests, eq(test_assignments.test_id, tests.id))
    .where(and(eq(test_attempts.id, attemptId), eq(test_attempts.student_id, studentId)))
    .limit(1);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Student dashboard overview
// ---------------------------------------------------------------------------

export interface StudentAssignmentItem {
  assignmentId: number;
  kind: TestKind;
  title: string;
  durationMinutes: number;
  groupName: string;
  endsAt: number | null;
  /** an attempt that is still running right now */
  runningAttemptId: number | null;
  /** live only: the single attempt is finished (result available) */
  finishedAttemptId: number | null;
  attemptsCount: number;
}

export interface StudentTestHistoryItem {
  attemptId: number;
  title: string;
  kind: TestKind;
  finishedAt: number;
  correct: number;
  total: number;
  percent: number;
}

export async function getStudentTestOverview(studentId: number, nowMs = Date.now()) {
  await sweepExpiredAttempts(nowMs);

  const memberships = await db
    .select({ groupId: group_members.group_id })
    .from(group_members)
    .where(eq(group_members.student_id, studentId));
  const groupIds = memberships.map((m) => m.groupId);

  const assignmentRows = groupIds.length
    ? await db
        .select({ assignment: test_assignments, test: tests, group: groups })
        .from(test_assignments)
        .innerJoin(tests, eq(test_assignments.test_id, tests.id))
        .innerJoin(groups, eq(test_assignments.group_id, groups.id))
        .where(inArray(test_assignments.group_id, groupIds))
        .orderBy(desc(test_assignments.created_at))
    : [];

  const attemptRows = await db
    .select()
    .from(test_attempts)
    .where(eq(test_attempts.student_id, studentId))
    .orderBy(desc(test_attempts.started_at));

  const live: StudentAssignmentItem[] = [];
  const open: StudentAssignmentItem[] = [];

  for (const { assignment, test, group } of assignmentRows) {
    const mine = attemptRows.filter((a) => a.assignment_id === assignment.id);
    const running = mine.find((a) => !isAttemptOver(nowMs, a.deadline_at, a.finished_at));
    const item: StudentAssignmentItem = {
      assignmentId: assignment.id,
      kind: assignment.kind,
      title: test.title,
      durationMinutes: test.duration_minutes,
      groupName: group.name,
      endsAt: assignment.ends_at,
      runningAttemptId: running?.id ?? null,
      finishedAttemptId: mine.find((a) => a.finished_at != null)?.id ?? null,
      attemptsCount: mine.length,
    };
    if (assignment.kind === "live") {
      if (assignment.ends_at != null && assignment.ends_at > nowMs) live.push(item);
    } else if (assignment.closed_at == null) {
      open.push(item);
    }
  }

  const titleByAssignment = new Map(
    assignmentRows.map((r) => [r.assignment.id, { title: r.test.title, kind: r.assignment.kind }])
  );
  const history: StudentTestHistoryItem[] = attemptRows
    .filter((a) => a.finished_at != null)
    .map((a) => {
      const meta = titleByAssignment.get(a.assignment_id);
      const score = computeScore(a.correct, a.total);
      return {
        attemptId: a.id,
        title: meta?.title ?? "—",
        kind: meta?.kind ?? ("open" as TestKind),
        finishedAt: a.finished_at as number,
        correct: score.correct,
        total: score.total,
        percent: score.percent,
      };
    });

  return { live, open, history };
}

// ---------------------------------------------------------------------------
// Teacher results
// ---------------------------------------------------------------------------

export interface ParticipantRow {
  studentId: number;
  fullName: string;
  login: string;
  status: ParticipantStatus;
  correct: number;
  total: number;
  percent: number;
  attempts: Array<{
    attemptId: number;
    attemptNo: number;
    startedAt: number;
    finishedAt: number | null;
    correct: number;
    total: number;
    percent: number;
    over: boolean;
  }>;
  bestPercent: number | null;
}

export interface AssignmentResults {
  assignment: typeof test_assignments.$inferSelect;
  test: typeof tests.$inferSelect;
  group: typeof groups.$inferSelect;
  questionCount: number;
  rows: ParticipantRow[];
}

/**
 * Result table of one assignment.
 * live: every group member that was in the group when the test started is listed —
 *   finished (score), in progress, or "Kelmadi" (never started before ends_at, score 0).
 * open: every member with all their attempts and the best score.
 */
export async function getAssignmentResults(
  assignmentId: number,
  nowMs = Date.now()
): Promise<AssignmentResults | null> {
  await sweepExpiredAttempts(nowMs);

  const head = await db
    .select({ assignment: test_assignments, test: tests, group: groups })
    .from(test_assignments)
    .innerJoin(tests, eq(test_assignments.test_id, tests.id))
    .innerJoin(groups, eq(test_assignments.group_id, groups.id))
    .where(eq(test_assignments.id, assignmentId))
    .limit(1);
  if (head.length === 0) return null;
  const { assignment, test, group } = head[0];

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(test_questions)
    .where(eq(test_questions.test_id, test.id));
  const questionCount = Number(n);

  const members = await db
    .select({
      studentId: users.id,
      fullName: users.full_name,
      login: users.login,
      joinedAt: group_members.joined_at,
    })
    .from(group_members)
    .innerJoin(users, eq(group_members.student_id, users.id))
    .where(eq(group_members.group_id, assignment.group_id))
    .orderBy(asc(users.full_name));

  const attempts = await db
    .select()
    .from(test_attempts)
    .where(eq(test_attempts.assignment_id, assignmentId))
    .orderBy(asc(test_attempts.attempt_no));

  const rows: ParticipantRow[] = [];
  for (const m of members) {
    const mine = attempts.filter((a) => a.student_id === m.studentId);

    if (
      assignment.kind === "live" &&
      !isCountedInLiveResults({
        joinedAtMs: m.joinedAt,
        liveStartedAtMs: assignment.started_at ?? 0,
        hasAttempt: mine.length > 0,
      })
    ) {
      continue;
    }

    const status = classifyParticipant({
      kind: assignment.kind,
      attempts: mine,
      nowMs,
      liveEndsAt: assignment.ends_at,
    });

    const attemptItems = mine.map((a) => {
      const score = computeScore(a.correct, a.total || questionCount);
      return {
        attemptId: a.id,
        attemptNo: a.attempt_no,
        startedAt: a.started_at,
        finishedAt: a.finished_at,
        correct: score.correct,
        total: score.total,
        percent: score.percent,
        over: isAttemptOver(nowMs, a.deadline_at, a.finished_at),
      };
    });

    const finishedAttempts = attemptItems.filter((a) => a.over);
    const best = pickBestAttempt(finishedAttempts.map((a) => ({ ...a })));
    const shown = assignment.kind === "live" ? finishedAttempts[0] : best;

    const total = shown?.total ?? questionCount;
    const correct = shown?.correct ?? 0; // absent => 0
    rows.push({
      studentId: m.studentId,
      fullName: m.fullName,
      login: m.login,
      status,
      correct,
      total,
      percent: computeScore(correct, total).percent,
      attempts: attemptItems,
      bestPercent: best ? best.percent : null,
    });
  }

  return { assignment, test, group, questionCount, rows };
}

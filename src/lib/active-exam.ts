import { db } from "@/db";
import { exam_attempts } from "@/db/schema";
import { getAppSettings } from "./settings";
import { getActiveLiveTestAttempt } from "./test-service";
import { eq, and, isNull, desc } from "drizzle-orm";

/**
 * Checks whether the student currently has an unfinished `exam` attempt
 * that has not timed out (`started_at + exam_minutes` in the future).
 */
export async function getActiveExamAttempt(studentId: number, nowMs = Date.now()) {
  const [settings, unfinishedExams] = await Promise.all([
    getAppSettings(),
    db
      .select()
      .from(exam_attempts)
      .where(
        and(
          eq(exam_attempts.student_id, studentId),
          eq(exam_attempts.mode, "exam"),
          isNull(exam_attempts.finished_at)
        )
      )
      .orderBy(desc(exam_attempts.started_at)),
  ]);

  const durationMs = settings.exam_minutes * 60 * 1000;

  for (const attempt of unfinishedExams) {
    if (attempt.started_at + durationMs > nowMs) {
      return attempt;
    }
  }

  return null;
}

export interface ActiveBlock {
  kind: "exam" | "test";
  /** where the student should go to get back to the running activity */
  href: string;
}

/**
 * Practice / knowledge pages are blocked while the student is inside the GAI exam
 * OR inside a running live test. Returns what is blocking, or null.
 */
export async function getActiveBlock(
  studentId: number,
  nowMs = Date.now()
): Promise<ActiveBlock | null> {
  const exam = await getActiveExamAttempt(studentId, nowMs);
  if (exam) return { kind: "exam", href: "/student/exam/run" };

  const liveTest = await getActiveLiveTestAttempt(studentId, nowMs);
  if (liveTest) return { kind: "test", href: `/student/tests/run/${liveTest.id}` };

  return null;
}

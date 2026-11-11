import { db } from "@/db";
import { exam_attempts } from "@/db/schema";
import { getAppSettings } from "./settings";
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

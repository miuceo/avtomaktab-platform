import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { topics } from "@/db/schema";
import { QuestionSchema, insertQuestion } from "@/lib/question-schema";

/**
 * Teachers (and admins) can add questions to the bank; they are published directly.
 * Topics stay admin-only: the topic must already exist.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = QuestionSchema.safeParse(body?.payload ?? body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "invalidInput" },
      { status: 400 }
    );
  }

  const topic = await db.select({ id: topics.id }).from(topics).where(eq(topics.id, parsed.data.topic_id)).limit(1);
  if (topic.length === 0) {
    return NextResponse.json({ error: "topicNotFound" }, { status: 400 });
  }

  // New questions from teachers are always created as new rows (no editing) and published.
  const id = await insertQuestion({ ...parsed.data, id: undefined, status: "published" });
  return NextResponse.json({ ok: true, id });
}

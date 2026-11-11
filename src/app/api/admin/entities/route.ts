import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { setAppSetting } from "@/lib/settings";
import { chunkQuestionsIntoTickets } from "@/lib/exam-logic";
import { db } from "@/db";
import {
  topics,
  questions,
  answers,
  tickets,
  ticket_questions,
  chapters,
  road_signs,
  videos,
  users,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const TopicSchema = z.object({
  id: z.number().int().positive().optional(),
  name_uz: z.string().min(1),
  name_ru: z.string().optional().default(""),
  ru_reviewed: z.boolean().optional().default(false),
});

const AnswerItemSchema = z.object({
  id: z.number().int().positive().optional(),
  text_uz: z.string().min(1),
  text_ru: z.string().optional().default(""),
  is_correct: z.boolean(),
});

const QuestionSchema = z
  .object({
    id: z.number().int().positive().optional(),
    topic_id: z.number().int().positive(),
    text_uz: z.string().min(1),
    text_ru: z.string().optional().default(""),
    image_path: z.string().nullable().optional().default(null),
    explanation_uz: z.string().optional().default(""),
    explanation_ru: z.string().optional().default(""),
    ru_reviewed: z.boolean().optional().default(false),
    status: z.enum(["draft", "published"]).default("published"),
    answers: z.array(AnswerItemSchema).min(2).max(5),
  })
  .refine((q) => q.answers.filter((a) => a.is_correct).length === 1, {
    message: "Aynan 1 ta to'g'ri javob bo'lishi shart (2–5 javob ichida)",
  });

const TicketManualSchema = z.object({
  id: z.number().int().positive().optional(),
  number: z.number().int().positive(),
  question_ids: z.array(z.number().int().positive()).min(1),
});

const ChapterSchema = z.object({
  id: z.number().int().positive().optional(),
  sort: z.number().int().default(1),
  title_uz: z.string().min(1),
  title_ru: z.string().optional().default(""),
  body_uz: z.string().min(1),
  body_ru: z.string().optional().default(""),
  topic_id: z.number().int().positive().nullable().optional().default(null),
  ru_reviewed: z.boolean().optional().default(false),
});

const RoadSignSchema = z.object({
  id: z.number().int().positive().optional(),
  code: z.string().min(1),
  group_uz: z.string().min(1),
  group_ru: z.string().optional().default(""),
  name_uz: z.string().min(1),
  name_ru: z.string().optional().default(""),
  description_uz: z.string().optional().default(""),
  description_ru: z.string().optional().default(""),
  image_path: z.string().min(1),
  ru_reviewed: z.boolean().optional().default(false),
});

const VideoSchema = z.object({
  id: z.number().int().positive().optional(),
  chapter_id: z.number().int().positive().nullable().optional().default(null),
  title_uz: z.string().min(1),
  title_ru: z.string().optional().default(""),
  youtube_url: z.string().min(1),
  ru_reviewed: z.boolean().optional().default(false),
});

const UserSchema = z.object({
  id: z.number().int().positive().optional(),
  login: z.string().min(2).max(80),
  password: z.string().optional(),
  full_name: z.string().min(2).max(120),
  role: z.enum(["admin", "teacher", "student"]),
});

const SettingsSchema = z.object({
  center_name: z.string().min(1).max(120),
  logo_path: z.string().optional().default("/seed/logo.svg"),
  exam_question_count: z.number().int().min(1).max(100),
  exam_minutes: z.number().int().min(1).max(180),
  exam_max_wrong: z.number().int().min(0).max(50),
});

const TranslationApproveSchema = z.object({
  entityType: z.enum(["question", "topic", "chapter", "road_sign", "video"]),
  id: z.number().int().positive(),
  text_ru: z.string().optional(),
  explanation_ru: z.string().optional(),
  name_ru: z.string().optional(),
  group_ru: z.string().optional(),
  description_ru: z.string().optional(),
  title_ru: z.string().optional(),
  body_ru: z.string().optional(),
  answers_ru: z
    .array(
      z.object({
        id: z.number().int().positive(),
        text_ru: z.string(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { entity, action, payload } = body as {
      entity: string;
      action?: string;
      payload: unknown;
    };

    if (entity === "topic") {
      const data = TopicSchema.parse(payload);
      if (data.id) {
        await db
          .update(topics)
          .set({
            name_uz: data.name_uz,
            name_ru: data.name_ru,
            ru_reviewed: data.ru_reviewed,
          })
          .where(eq(topics.id, data.id));
      } else {
        await db.insert(topics).values({
          name_uz: data.name_uz,
          name_ru: data.name_ru,
          ru_reviewed: data.ru_reviewed,
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (entity === "question") {
      if (action === "toggleStatus") {
        const { id, status } = z
          .object({ id: z.number().int().positive(), status: z.enum(["draft", "published"]) })
          .parse(payload);
        await db.update(questions).set({ status }).where(eq(questions.id, id));
        return NextResponse.json({ ok: true });
      }

      const data = QuestionSchema.parse(payload);
      let questionId = data.id;
      if (questionId) {
        await db
          .update(questions)
          .set({
            topic_id: data.topic_id,
            text_uz: data.text_uz,
            text_ru: data.text_ru,
            image_path: data.image_path || null,
            explanation_uz: data.explanation_uz,
            explanation_ru: data.explanation_ru,
            ru_reviewed: data.ru_reviewed,
            status: data.status,
          })
          .where(eq(questions.id, questionId));
        await db.delete(answers).where(eq(answers.question_id, questionId));
      } else {
        const res = await db
          .insert(questions)
          .values({
            topic_id: data.topic_id,
            text_uz: data.text_uz,
            text_ru: data.text_ru,
            image_path: data.image_path || null,
            explanation_uz: data.explanation_uz,
            explanation_ru: data.explanation_ru,
            ru_reviewed: data.ru_reviewed,
            status: data.status,
          })
          .returning();
        questionId = res[0].id;
      }

      await db.insert(answers).values(
        data.answers.map((a, idx) => ({
          question_id: questionId!,
          text_uz: a.text_uz,
          text_ru: a.text_ru,
          is_correct: a.is_correct,
          sort: idx + 1,
        }))
      );

      return NextResponse.json({ ok: true, id: questionId });
    }

    if (entity === "ticket") {
      if (action === "autoGenerate") {
        const published = await db
          .select({ id: questions.id })
          .from(questions)
          .where(eq(questions.status, "published"))
          .orderBy(asc(questions.id));

        const chunks = chunkQuestionsIntoTickets(
          published.map((q) => q.id),
          20
        );

        await db.delete(ticket_questions);
        await db.delete(tickets);

        for (let i = 0; i < chunks.length; i++) {
          const tRes = await db
            .insert(tickets)
            .values({ number: i + 1 })
            .returning();
          const tId = tRes[0].id;
          await db.insert(ticket_questions).values(
            chunks[i].map((qId, idx) => ({
              ticket_id: tId,
              question_id: qId,
              sort: idx + 1,
            }))
          );
        }

        return NextResponse.json({ ok: true, count: chunks.length });
      }

      const data = TicketManualSchema.parse(payload);
      let ticketId = data.id;
      if (ticketId) {
        await db
          .update(tickets)
          .set({ number: data.number })
          .where(eq(tickets.id, ticketId));
        await db.delete(ticket_questions).where(eq(ticket_questions.ticket_id, ticketId));
      } else {
        const tRes = await db.insert(tickets).values({ number: data.number }).returning();
        ticketId = tRes[0].id;
      }

      const uniqueQIds = Array.from(new Set(data.question_ids));
      await db.insert(ticket_questions).values(
        uniqueQIds.map((qId, idx) => ({
          ticket_id: ticketId!,
          question_id: qId,
          sort: idx + 1,
        }))
      );

      return NextResponse.json({ ok: true });
    }

    if (entity === "chapter") {
      const data = ChapterSchema.parse(payload);
      if (data.id) {
        await db
          .update(chapters)
          .set({
            sort: data.sort,
            title_uz: data.title_uz,
            title_ru: data.title_ru,
            body_uz: data.body_uz,
            body_ru: data.body_ru,
            topic_id: data.topic_id,
            ru_reviewed: data.ru_reviewed,
          })
          .where(eq(chapters.id, data.id));
      } else {
        await db.insert(chapters).values({
          sort: data.sort,
          title_uz: data.title_uz,
          title_ru: data.title_ru,
          body_uz: data.body_uz,
          body_ru: data.body_ru,
          topic_id: data.topic_id,
          ru_reviewed: data.ru_reviewed,
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (entity === "road_sign") {
      const data = RoadSignSchema.parse(payload);
      if (data.id) {
        await db
          .update(road_signs)
          .set({
            code: data.code,
            group_uz: data.group_uz,
            group_ru: data.group_ru,
            name_uz: data.name_uz,
            name_ru: data.name_ru,
            description_uz: data.description_uz,
            description_ru: data.description_ru,
            image_path: data.image_path,
            ru_reviewed: data.ru_reviewed,
          })
          .where(eq(road_signs.id, data.id));
      } else {
        await db.insert(road_signs).values({
          code: data.code,
          group_uz: data.group_uz,
          group_ru: data.group_ru,
          name_uz: data.name_uz,
          name_ru: data.name_ru,
          description_uz: data.description_uz,
          description_ru: data.description_ru,
          image_path: data.image_path,
          ru_reviewed: data.ru_reviewed,
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (entity === "video") {
      const data = VideoSchema.parse(payload);
      if (data.id) {
        await db
          .update(videos)
          .set({
            chapter_id: data.chapter_id,
            title_uz: data.title_uz,
            title_ru: data.title_ru,
            youtube_url: data.youtube_url,
            ru_reviewed: data.ru_reviewed,
          })
          .where(eq(videos.id, data.id));
      } else {
        await db.insert(videos).values({
          chapter_id: data.chapter_id,
          title_uz: data.title_uz,
          title_ru: data.title_ru,
          youtube_url: data.youtube_url,
          ru_reviewed: data.ru_reviewed,
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (entity === "user") {
      const data = UserSchema.parse(payload);
      if (data.id) {
        const updateFields: Record<string, unknown> = {
          login: data.login.trim(),
          full_name: data.full_name.trim(),
          role: data.role,
        };
        if (data.password && data.password.trim().length > 0) {
          updateFields.password_hash = await hashPassword(data.password.trim());
        }
        await db.update(users).set(updateFields).where(eq(users.id, data.id));
      } else {
        if (!data.password || data.password.trim().length < 3) {
          return NextResponse.json({ error: "Parol kamida 3 belgidan iborat bo'lsin" }, { status: 400 });
        }
        const passwordHash = await hashPassword(data.password.trim());
        await db.insert(users).values({
          login: data.login.trim(),
          password_hash: passwordHash,
          full_name: data.full_name.trim(),
          role: data.role,
          created_at: Date.now(),
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (entity === "settings") {
      const data = SettingsSchema.parse(payload);
      await setAppSetting("center_name", data.center_name);
      await setAppSetting("logo_path", data.logo_path);
      await setAppSetting("exam_question_count", String(data.exam_question_count));
      await setAppSetting("exam_minutes", String(data.exam_minutes));
      await setAppSetting("exam_max_wrong", String(data.exam_max_wrong));
      return NextResponse.json({ ok: true });
    }

    if (entity === "translation") {
      const data = TranslationApproveSchema.parse(payload);
      if (data.entityType === "question") {
        await db
          .update(questions)
          .set({
            text_ru: data.text_ru ?? "",
            explanation_ru: data.explanation_ru ?? "",
            ru_reviewed: true,
          })
          .where(eq(questions.id, data.id));

        if (data.answers_ru) {
          for (const ans of data.answers_ru) {
            await db
              .update(answers)
              .set({ text_ru: ans.text_ru })
              .where(eq(answers.id, ans.id));
          }
        }
      } else if (data.entityType === "topic") {
        await db
          .update(topics)
          .set({ name_ru: data.name_ru ?? "", ru_reviewed: true })
          .where(eq(topics.id, data.id));
      } else if (data.entityType === "chapter") {
        await db
          .update(chapters)
          .set({
            title_ru: data.title_ru ?? "",
            body_ru: data.body_ru ?? "",
            ru_reviewed: true,
          })
          .where(eq(chapters.id, data.id));
      } else if (data.entityType === "road_sign") {
        await db
          .update(road_signs)
          .set({
            group_ru: data.group_ru ?? "",
            name_ru: data.name_ru ?? "",
            description_ru: data.description_ru ?? "",
            ru_reviewed: true,
          })
          .where(eq(road_signs.id, data.id));
      } else if (data.entityType === "video") {
        await db
          .update(videos)
          .set({ title_ru: data.title_ru ?? "", ru_reviewed: true })
          .where(eq(videos.id, data.id));
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  } catch (err) {
    console.error("Admin entity POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { entity, id } = z
      .object({
        entity: z.enum(["topic", "question", "ticket", "chapter", "road_sign", "video", "user"]),
        id: z.number().int().positive(),
      })
      .parse(body);

    if (entity === "topic") await db.delete(topics).where(eq(topics.id, id));
    if (entity === "question") await db.delete(questions).where(eq(questions.id, id));
    if (entity === "ticket") await db.delete(tickets).where(eq(tickets.id, id));
    if (entity === "chapter") await db.delete(chapters).where(eq(chapters.id, id));
    if (entity === "road_sign") await db.delete(road_signs).where(eq(road_signs.id, id));
    if (entity === "video") await db.delete(videos).where(eq(videos.id, id));
    if (entity === "user") {
      if (id === user.id) {
        return NextResponse.json({ error: "O'z hisobingizni o'chira olmaysiz" }, { status: 400 });
      }
      await db.delete(users).where(eq(users.id, id));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 400 }
    );
  }
}

import { z } from "zod";
import { db } from "@/db";
import { answers, questions } from "@/db/schema";

export const AnswerItemSchema = z.object({
  id: z.number().int().positive().optional(),
  text_uz: z.string().min(1),
  text_ru: z.string().optional().default(""),
  is_correct: z.boolean(),
});

export const QuestionSchema = z
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

export type QuestionInput = z.infer<typeof QuestionSchema>;

/** Inserts a brand-new question with its answers and returns its id. */
export async function insertQuestion(data: QuestionInput): Promise<number> {
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
  const questionId = res[0].id;

  await db.insert(answers).values(
    data.answers.map((a, idx) => ({
      question_id: questionId,
      text_uz: a.text_uz,
      text_ru: a.text_ru,
      is_correct: a.is_correct,
      sort: idx + 1,
    }))
  );
  return questionId;
}

import { z } from "zod";
import { db } from "@/db";
import { topics, questions, answers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const ImportAnswerSchema = z.object({
  text_uz: z.string().min(1, "text_uz majburiy"),
  text_ru: z.string().optional().default(""),
  is_correct: z.boolean(),
});

export const ImportQuestionItemSchema = z
  .object({
    topic_id: z.number().int().positive().optional(),
    topic_name_uz: z.string().optional(),
    topic_name_ru: z.string().optional().default(""),
    text_uz: z.string().min(1, "Savol matni (text_uz) majburiy"),
    text_ru: z.string().optional().default(""),
    image_path: z.string().nullable().optional().default(null),
    explanation_uz: z.string().optional().default(""),
    explanation_ru: z.string().optional().default(""),
    ru_reviewed: z.boolean().optional().default(false),
    status: z.enum(["draft", "published"]).optional().default("published"),
    answers: z
      .array(ImportAnswerSchema)
      .min(2, "Kamida 2 ta javob bo'lishi shart")
      .max(5, "Ko'pi bilan 5 ta javob bo'lishi mumkin"),
  })
  .refine((item) => item.answers.filter((a) => a.is_correct).length === 1, {
    message: "Aynan bitta to'g'ri javob (is_correct: true) bo'lishi shart",
  });

export const ImportQuestionsPayloadSchema = z.union([
  z.array(ImportQuestionItemSchema),
  z.object({
    questions: z.array(ImportQuestionItemSchema),
  }),
]);

export async function importQuestionsFromJson(rawJson: unknown): Promise<{
  importedCount: number;
  createdTopicsCount: number;
}> {
  const parsed = ImportQuestionsPayloadSchema.parse(rawJson);
  const items = Array.isArray(parsed) ? parsed : parsed.questions;

  let importedCount = 0;
  let createdTopicsCount = 0;

  const existingTopics = await db.select().from(topics);
  let defaultTopicId = existingTopics[0]?.id;

  for (const item of items) {
    let topicId = item.topic_id;

    if (!topicId && item.topic_name_uz) {
      const found = existingTopics.find(
        (t) => t.name_uz.toLowerCase() === item.topic_name_uz!.trim().toLowerCase()
      );
      if (found) {
        topicId = found.id;
      } else {
        const inserted = await db
          .insert(topics)
          .values({
            name_uz: item.topic_name_uz.trim(),
            name_ru: item.topic_name_ru?.trim() || "",
            ru_reviewed: Boolean(item.topic_name_ru),
          })
          .returning();
        topicId = inserted[0].id;
        existingTopics.push(inserted[0]);
        createdTopicsCount++;
      }
    }

    if (!topicId) {
      if (!defaultTopicId) {
        const inserted = await db
          .insert(topics)
          .values({
            name_uz: "Umumiy savollar",
            name_ru: "Общие вопросы",
            ru_reviewed: true,
          })
          .returning();
        defaultTopicId = inserted[0].id;
        existingTopics.push(inserted[0]);
        createdTopicsCount++;
      }
      topicId = defaultTopicId;
    }

    const qRes = await db
      .insert(questions)
      .values({
        topic_id: topicId!,
        text_uz: item.text_uz,
        text_ru: item.text_ru || "",
        image_path: item.image_path || null,
        explanation_uz: item.explanation_uz || "",
        explanation_ru: item.explanation_ru || "",
        ru_reviewed: item.ru_reviewed ?? false,
        status: item.status || "published",
      })
      .returning();

    const questionId = qRes[0].id;

    await db.insert(answers).values(
      item.answers.map((a, idx) => ({
        question_id: questionId,
        text_uz: a.text_uz,
        text_ru: a.text_ru || "",
        is_correct: a.is_correct,
        sort: idx + 1,
      }))
    );

    importedCount++;
  }

  return { importedCount, createdTopicsCount };
}

import { describe, it, expect } from "vitest";
import { checkLoginRateLimit, resetLoginRateLimit } from "./rate-limit";
import { ImportQuestionsPayloadSchema } from "./import-questions";
import { localizedText, t } from "./i18n";

describe("Security, i18n, and JSON import validation", () => {
  it("rate limits login attempts after 10 tries within window", () => {
    const key = "127.0.0.1:testuser";
    resetLoginRateLimit(key);
    const now = 1_700_000_000_000;

    for (let i = 0; i < 10; i++) {
      const r = checkLoginRateLimit(key, now);
      expect(r.allowed).toBe(true);
    }

    const blocked = checkLoginRateLimit(key, now + 1000);
    expect(blocked.allowed).toBe(false);

    // Allowed again after 5 minute window
    const afterWindow = checkLoginRateLimit(key, now + 6 * 60 * 1000);
    expect(afterWindow.allowed).toBe(true);
  });

  it("falls back to Uzbek when Russian translation is empty", () => {
    expect(localizedText("ru", "Asosiy yo'l", "")).toBe("Asosiy yo'l");
    expect(localizedText("ru", "Asosiy yo'l", "Главная дорога")).toBe("Главная дорога");
    expect(localizedText("uz", "Asosiy yo'l", "Главная дорога")).toBe("Asosiy yo'l");
    expect(t("uz", "student.ticketNum", { num: 2 })).toBe("2-bilet");
    expect(t("ru", "student.ticketNum", { num: 2 })).toBe("Билет №2");
  });

  it("validates JSON import schema requiring 2-5 answers and exactly 1 correct", () => {
    const valid = ImportQuestionsPayloadSchema.safeParse({
      questions: [
        {
          text_uz: "Savol?",
          answers: [
            { text_uz: "Ha", is_correct: true },
            { text_uz: "Yo'q", is_correct: false },
          ],
        },
      ],
    });
    expect(valid.success).toBe(true);

    const twoCorrect = ImportQuestionsPayloadSchema.safeParse({
      questions: [
        {
          text_uz: "Savol?",
          answers: [
            { text_uz: "A", is_correct: true },
            { text_uz: "B", is_correct: true },
          ],
        },
      ],
    });
    expect(twoCorrect.success).toBe(false);
  });
});

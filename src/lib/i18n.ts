import uz from "../../messages/uz.json";
import ru from "../../messages/ru.json";

export type Lang = "uz" | "ru";

const dictionaries = { uz, ru };

export function t(lang: Lang, key: string, params?: Record<string, string | number>): string {
  const parts = key.split(".");
  let current: unknown = dictionaries[lang] || dictionaries.uz;
  for (const part of parts) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      // Fallback to uz
      let fallback: unknown = dictionaries.uz;
      for (const p of parts) {
        if (fallback && typeof fallback === "object" && p in (fallback as Record<string, unknown>)) {
          fallback = (fallback as Record<string, unknown>)[p];
        } else {
          return key;
        }
      }
      current = fallback;
      break;
    }
  }
  let result = typeof current === "string" ? current : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replaceAll(`{${k}}`, String(v));
    }
  }
  return result;
}

/**
 * Helper for database records with *_uz and *_ru fields.
 * If lang === 'ru' and the ru value is non-empty, returns ru; otherwise falls back to uz.
 */
export function localizedText(
  lang: Lang,
  uzText: string | null | undefined,
  ruText: string | null | undefined
): string {
  if (lang === "ru" && ruText && ruText.trim().length > 0) {
    return ruText;
  }
  return uzText || "";
}

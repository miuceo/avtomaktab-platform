import crypto from "crypto";

// Uzbek (Latin transliteration of Cyrillic) + Russian letters -> lowercase latin
const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
  ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  // Uzbek Cyrillic extras
  ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

const APOSTROPHES = /[ʻʼ'`’‘´ʹ′]/g;

/** Transliterates any Uzbek/Russian/latin text to lowercase [a-z0-9]. */
export function transliterate(input: string): string {
  const lower = input.toLowerCase().replace(APOSTROPHES, "");
  let out = "";
  for (const ch of lower) {
    if (ch in CYRILLIC_MAP) {
      out += CYRILLIC_MAP[ch];
    } else {
      out += ch;
    }
  }
  return out
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Base login for a full name written as "Surname Name [Patronymic]":
 * transliterated surname + name, lowercase latin, no separators (e.g. "aliyevjasur").
 */
export function baseLoginFromName(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .map(transliterate)
    .filter((p) => p.length > 0);
  const base = parts.slice(0, 2).join("").slice(0, 24);
  return base || "student";
}

/**
 * Returns a login that is not in `taken` (case-insensitive) and registers it there.
 * If the base login is taken a number is appended: aliyevjasur, aliyevjasur2, aliyevjasur3...
 */
export function generateUniqueLogin(fullName: string, taken: Set<string>): string {
  const base = baseLoginFromName(fullName);
  let candidate = base;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${base}${n}`;
    n++;
  }
  taken.add(candidate);
  return candidate;
}

// No ambiguous characters: 0 O o 1 l I are excluded.
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
export const GENERATED_PASSWORD_LENGTH = 8;

export function generatePassword(length = GENERATED_PASSWORD_LENGTH): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_ALPHABET[crypto.randomInt(PASSWORD_ALPHABET.length)];
  }
  return out;
}

export const MAX_BULK_STUDENTS = 100;

/** Parses a pasted list: one full name per line, blank lines ignored, list numbering stripped. */
export function parseNameList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+\s*[.)-]\s*/, "").replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0);
}

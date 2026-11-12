import { describe, it, expect } from "vitest";
import {
  transliterate,
  baseLoginFromName,
  generateUniqueLogin,
  generatePassword,
  parseNameList,
  GENERATED_PASSWORD_LENGTH,
} from "./credentials";

describe("Credentials & Login Generation (Brief 2)", () => {
  describe("transliterate", () => {
    it("converts Cyrillic Russian & Uzbek to lowercase Latin without spaces or special characters", () => {
      expect(transliterate("Алиев Жасур")).toBe("alievjasur");
      expect(transliterate("Aliyev Jasur")).toBe("aliyevjasur");
      expect(transliterate("Ғофуров Қаҳҳор Ўкtam ўғли")).toBe("gofurovqahhoroktamogli");
      expect(transliterate("O'quvchi G'aniyev")).toBe("oquvchiganiyev");
      expect(transliterate("Yo'ldoshev Bo'ri")).toBe("yoldoshevbori");
    });

    it("strips various apostrophe types and punctuation", () => {
      expect(transliterate("Oʻktamov Neʼmat")).toBe("oktamovnemat");
      expect(transliterate("Nurmamatov!@#$%^&*()_+")).toBe("nurmamatov");
    });
  });

  describe("baseLoginFromName", () => {
    it("extracts transliterated surname and first name", () => {
      expect(baseLoginFromName("Aliyev Jasur Komilovich")).toBe("aliyevjasur");
      expect(baseLoginFromName("Каримова Нигора Бахтиёровна")).toBe("karimovanigora");
      expect(baseLoginFromName("  Sobirov   Aziz   ")).toBe("sobirovaziz");
    });

    it("handles single name gracefully", () => {
      expect(baseLoginFromName("Jasur")).toBe("jasur");
      expect(baseLoginFromName("")).toBe("student");
    });
  });

  describe("generateUniqueLogin", () => {
    it("returns base login if not taken, registers it in taken set", () => {
      const taken = new Set<string>();
      const login = generateUniqueLogin("Aliyev Jasur", taken);
      expect(login).toBe("aliyevjasur");
      expect(taken.has("aliyevjasur")).toBe(true);
    });

    it("appends incrementing number if base login is already taken", () => {
      const taken = new Set<string>(["aliyevjasur"]);
      const login1 = generateUniqueLogin("Aliyev Jasur", taken);
      expect(login1).toBe("aliyevjasur2");
      expect(taken.has("aliyevjasur2")).toBe(true);

      const login2 = generateUniqueLogin("Aliyev Jasur", taken);
      expect(login2).toBe("aliyevjasur3");
      expect(taken.has("aliyevjasur3")).toBe(true);
    });
  });

  describe("generatePassword", () => {
    it("generates 8-character password without ambiguous characters (0, O, o, 1, l, I)", () => {
      const ambiguousChars = ["0", "O", "o", "1", "l", "I"];
      for (let i = 0; i < 100; i++) {
        const pass = generatePassword();
        expect(pass.length).toBe(GENERATED_PASSWORD_LENGTH);
        for (const amb of ambiguousChars) {
          expect(pass.includes(amb)).toBe(false);
        }
      }
    });
  });

  describe("parseNameList", () => {
    it("parses lines, strips numbering, ignores blank lines and trims whitespace", () => {
      const input = `
        1. Aliyev Jasur Komilovich
        2) Karimova Nigora
        
        3 - Sobirov Sardor
        Xolmatov Dilshod
        
      `;
      const result = parseNameList(input);
      expect(result).toEqual([
        "Aliyev Jasur Komilovich",
        "Karimova Nigora",
        "Sobirov Sardor",
        "Xolmatov Dilshod",
      ]);
    });
  });
});

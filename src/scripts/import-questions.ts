import fs from "fs/promises";
import path from "path";
import { runMigrations } from "../db/migrate";
import { importQuestionsFromJson } from "../lib/import-questions";

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const filePathArg = args[0];

  if (!filePathArg) {
    console.error("Foydalanish / Usage: npm run import:questions -- <file.json>");
    process.exit(1);
  }

  const fullPath = path.resolve(process.cwd(), filePathArg);
  const content = await fs.readFile(fullPath, "utf-8");
  const json = JSON.parse(content);

  await runMigrations();
  const result = await importQuestionsFromJson(json);
  console.log(
    `✅ Muvaffaqiyatli yuklandi: ${result.importedCount} ta savol (${result.createdTopicsCount} ta yangi mavzu yaratildi).`
  );
}

main().catch((err) => {
  console.error("Import xatosi / Import error:", err);
  process.exit(1);
});

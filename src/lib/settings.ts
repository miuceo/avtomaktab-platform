import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AppSettings {
  center_name: string;
  logo_path: string;
  exam_question_count: number;
  exam_minutes: number;
  exam_max_wrong: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  center_name: "Avtomaktab",
  logo_path: "/seed/logo.svg",
  exam_question_count: 20,
  exam_minutes: 25,
  exam_max_wrong: 2,
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const rows = await db.select().from(settings);
    const map = new Map<string, string>();
    for (const r of rows) {
      map.set(r.key, r.value);
    }

    return {
      center_name: map.get("center_name") || DEFAULT_SETTINGS.center_name,
      logo_path: map.get("logo_path") ?? DEFAULT_SETTINGS.logo_path,
      exam_question_count: Number(map.get("exam_question_count") || DEFAULT_SETTINGS.exam_question_count),
      exam_minutes: Number(map.get("exam_minutes") || DEFAULT_SETTINGS.exam_minutes),
      exam_max_wrong: Number(map.get("exam_max_wrong") ?? DEFAULT_SETTINGS.exam_max_wrong),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

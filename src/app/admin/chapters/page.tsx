import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { chapters, topics } from "@/db/schema";
import { asc } from "drizzle-orm";
import { AdminChaptersClient } from "./AdminChaptersClient";

export default async function AdminChaptersPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);
  const [allChapters, allTopics] = await Promise.all([
    db.select().from(chapters).orderBy(asc(chapters.sort)),
    db.select().from(topics).orderBy(asc(topics.id)),
  ]);

  return (
    <AdminChaptersClient
      lang={lang}
      chapters={allChapters}
      topics={allTopics}
    />
  );
}

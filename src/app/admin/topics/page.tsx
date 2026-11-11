import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { topics } from "@/db/schema";
import { asc } from "drizzle-orm";
import { AdminTopicsClient } from "./AdminTopicsClient";

export default async function AdminTopicsPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);
  const allTopics = await db.select().from(topics).orderBy(asc(topics.id));

  return <AdminTopicsClient lang={lang} topics={allTopics} />;
}

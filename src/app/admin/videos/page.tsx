import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { videos, chapters } from "@/db/schema";
import { asc } from "drizzle-orm";
import { AdminVideosClient } from "./AdminVideosClient";

export default async function AdminVideosPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);
  const [allVideos, allChapters] = await Promise.all([
    db.select().from(videos).orderBy(asc(videos.id)),
    db.select({ id: chapters.id, title_uz: chapters.title_uz }).from(chapters).orderBy(asc(chapters.sort)),
  ]);

  return (
    <AdminVideosClient
      lang={lang}
      videos={allVideos}
      chapters={allChapters}
    />
  );
}

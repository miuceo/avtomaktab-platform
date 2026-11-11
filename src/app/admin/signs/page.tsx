import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { road_signs } from "@/db/schema";
import { asc } from "drizzle-orm";
import { AdminSignsClient } from "./AdminSignsClient";

export default async function AdminSignsPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);
  const signs = await db.select().from(road_signs).orderBy(asc(road_signs.id));

  return <AdminSignsClient lang={lang} signs={signs} />;
}

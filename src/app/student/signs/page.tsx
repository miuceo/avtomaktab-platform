import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { road_signs } from "@/db/schema";
import { asc } from "drizzle-orm";
import { SignsCatalogClient } from "./SignsCatalogClient";

export default async function StudentSignsPage() {
  const [, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const signs = await db.select().from(road_signs).orderBy(asc(road_signs.id));

  return <SignsCatalogClient lang={lang} signs={signs} />;
}

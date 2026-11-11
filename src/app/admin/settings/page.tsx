import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { AdminSettingsClient } from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const [, lang, settings] = await Promise.all([
    requireRole(["admin"]),
    getLang(),
    getAppSettings(),
  ]);

  return <AdminSettingsClient lang={lang} initialSettings={settings} />;
}

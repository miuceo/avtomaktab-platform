import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { db } from "@/db";
import {
  questions,
  topics,
  tickets,
  chapters,
  road_signs,
  videos,
  users,
} from "@/db/schema";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Languages,
  ListChecks,
  Settings,
  Users,
  Video,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);

  const [
    allQuestions,
    allTopics,
    allTickets,
    allChapters,
    allSigns,
    allVideos,
    allUsers,
  ] = await Promise.all([
    db.select().from(questions),
    db.select().from(topics),
    db.select().from(tickets),
    db.select().from(chapters),
    db.select().from(road_signs),
    db.select().from(videos),
    db.select().from(users),
  ]);

  const unreviewedCount =
    allQuestions.filter((x) => !x.ru_reviewed).length +
    allTopics.filter((x) => !x.ru_reviewed).length +
    allChapters.filter((x) => !x.ru_reviewed).length +
    allSigns.filter((x) => !x.ru_reviewed).length +
    allVideos.filter((x) => !x.ru_reviewed).length;

  const cards = [
    {
      href: "/admin/questions",
      title: t(lang, "nav.adminQuestions"),
      count: allQuestions.length,
      sub: `${allQuestions.filter((q) => q.status === "published").length} faol`,
      icon: <HelpCircle className="w-6 h-6 text-blue-700" />,
    },
    {
      href: "/admin/topics",
      title: t(lang, "nav.adminTopics"),
      count: allTopics.length,
      sub: "Mavzular",
      icon: <BookOpen className="w-6 h-6 text-indigo-700" />,
    },
    {
      href: "/admin/tickets",
      title: t(lang, "nav.adminTickets"),
      count: allTickets.length,
      sub: "20 tadan savol",
      icon: <ListChecks className="w-6 h-6 text-emerald-700" />,
    },
    {
      href: "/admin/translations",
      title: t(lang, "nav.adminTranslations"),
      count: unreviewedCount,
      sub: t(lang, "admin.unreviewed"),
      icon: <Languages className="w-6 h-6 text-amber-600" />,
    },
    {
      href: "/admin/chapters",
      title: t(lang, "nav.adminChapters"),
      count: allChapters.length,
      sub: "O'quv qo'llanma",
      icon: <BookOpen className="w-6 h-6 text-teal-700" />,
    },
    {
      href: "/admin/signs",
      title: t(lang, "nav.adminSigns"),
      count: allSigns.length,
      sub: "SVG / Rasm",
      icon: <CheckCircle2 className="w-6 h-6 text-rose-700" />,
    },
    {
      href: "/admin/videos",
      title: t(lang, "nav.adminVideos"),
      count: allVideos.length,
      sub: "YouTube",
      icon: <Video className="w-6 h-6 text-purple-700" />,
    },
    {
      href: "/admin/users",
      title: t(lang, "nav.adminUsers"),
      count: allUsers.length,
      sub: "Admin, O'qituvchi, O'quvchi",
      icon: <Users className="w-6 h-6 text-sky-700" />,
    },
    {
      href: "/admin/settings",
      title: t(lang, "nav.adminSettings"),
      count: "⚙️",
      sub: "Markaz va imtihon sozlamalari",
      icon: <Settings className="w-6 h-6 text-slate-700" />,
    },
  ];

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Administrator boshqaruv paneli</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Barcha ma&apos;lumotlar, savollar, biletlar va foydalanuvchilar boshqaruvi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/teacher"
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            O&apos;qituvchi oynasi →
          </Link>
          <Link
            href="/student"
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            O&apos;quvchi oynasi →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-700 transition-all flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {c.title}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {c.count}
              </div>
              <div className="text-xs text-slate-500">{c.sub}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
              {c.icon}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

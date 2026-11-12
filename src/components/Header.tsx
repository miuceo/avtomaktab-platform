"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import type { UserRole } from "@/lib/auth";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Monitor,
  Settings,
  ShieldAlert,
  Sun,
  Users,
  Video,
  Languages,
  ListChecks,
  HelpCircle,
} from "lucide-react";

interface HeaderProps {
  user: {
    id: number;
    login: string;
    full_name: string;
    role: UserRole;
  } | null;
  lang: Lang;
  initialTheme: "light" | "dark" | "system";
  centerName: string;
  logoPath: string;
}

export function Header({ user, lang, initialTheme, centerName, logoPath }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark" | "system">(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (mode: "light" | "dark" | "system") => {
      if (mode === "dark") {
        root.classList.add("dark");
      } else if (mode === "light") {
        root.classList.remove("dark");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
      }
    };
    applyTheme(theme);

    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
      };
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
  }, [theme]);

  // Hide header on distraction-free active exam screen
  if (pathname === "/student/exam/run") {
    return null;
  }

  async function handleLangChange(newLang: Lang) {
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: newLang }),
    });
    router.refresh();
  }

  async function handleThemeChange(newTheme: "light" | "dark" | "system") {
    setTheme(newTheme);
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navItems: Array<{ href: string; label: string; icon: React.ReactNode }> = [];

  if (user?.role === "student") {
    navItems.push(
      { href: "/student", label: t(lang, "nav.dashboard"), icon: <LayoutDashboard className="w-4 h-4" /> },
      { href: "/student/tests", label: t(lang, "nav.tests"), icon: <ClipboardCheck className="w-4 h-4" /> },
      { href: "/student/tickets", label: t(lang, "nav.tickets"), icon: <ListChecks className="w-4 h-4" /> },
      { href: "/student/topics", label: t(lang, "nav.topics"), icon: <BookOpen className="w-4 h-4" /> },
      { href: "/student/exam", label: t(lang, "nav.exam"), icon: <GraduationCap className="w-4 h-4" /> },
      { href: "/student/mistakes", label: t(lang, "nav.mistakes"), icon: <ShieldAlert className="w-4 h-4" /> },
      { href: "/student/knowledge", label: t(lang, "nav.knowledge"), icon: <BookOpen className="w-4 h-4" /> },
      { href: "/student/signs", label: t(lang, "nav.signs"), icon: <CheckCircle2 className="w-4 h-4" /> }
    );
  } else if (user?.role === "teacher") {
    navItems.push(
      { href: "/teacher", label: t(lang, "nav.groups"), icon: <Users className="w-4 h-4" /> },
      { href: "/teacher/tests", label: t(lang, "nav.tests"), icon: <ClipboardCheck className="w-4 h-4" /> },
      { href: "/teacher/results", label: t(lang, "nav.results"), icon: <FileSpreadsheet className="w-4 h-4" /> }
    );
  } else if (user?.role === "admin") {
    navItems.push(
      { href: "/admin", label: t(lang, "nav.dashboard"), icon: <LayoutDashboard className="w-4 h-4" /> },
      { href: "/admin/groups", label: t(lang, "nav.groups"), icon: <Users className="w-4 h-4" /> },
      { href: "/teacher/tests", label: t(lang, "nav.tests"), icon: <ClipboardCheck className="w-4 h-4" /> },
      { href: "/admin/questions", label: t(lang, "nav.adminQuestions"), icon: <HelpCircle className="w-4 h-4" /> },
      { href: "/admin/topics", label: t(lang, "nav.adminTopics"), icon: <BookOpen className="w-4 h-4" /> },
      { href: "/admin/tickets", label: t(lang, "nav.adminTickets"), icon: <ListChecks className="w-4 h-4" /> },
      { href: "/admin/chapters", label: t(lang, "nav.adminChapters"), icon: <BookOpen className="w-4 h-4" /> },
      { href: "/admin/signs", label: t(lang, "nav.adminSigns"), icon: <CheckCircle2 className="w-4 h-4" /> },
      { href: "/admin/videos", label: t(lang, "nav.adminVideos"), icon: <Video className="w-4 h-4" /> },
      { href: "/admin/translations", label: t(lang, "nav.adminTranslations"), icon: <Languages className="w-4 h-4" /> },
      { href: "/admin/users", label: t(lang, "nav.adminUsers"), icon: <Users className="w-4 h-4" /> },
      { href: "/admin/settings", label: t(lang, "nav.adminSettings"), icon: <Settings className="w-4 h-4" /> }
    );
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link
            href={user ? (user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/student") : "/login"}
            className="flex items-center gap-3 font-bold text-lg text-blue-800 dark:text-blue-300 shrink-0"
          >
            {logoPath && (
              <img
                src={logoPath}
                alt={centerName}
                className="w-9 h-9 rounded-lg object-contain bg-blue-800/10"
              />
            )}
            <span className="tracking-tight">{centerName}</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div
              role="group"
              aria-label="Language switcher"
              className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800"
            >
              <button
                type="button"
                onClick={() => handleLangChange("uz")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 ease-out-expo ${
                  lang === "uz"
                    ? "bg-blue-800 text-white shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                O&apos;Z
              </button>
              <button
                type="button"
                onClick={() => handleLangChange("ru")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 ease-out-expo ${
                  lang === "ru"
                    ? "bg-blue-800 text-white shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                РУ
              </button>
            </div>

            {/* Theme Switcher */}
            <div
              role="group"
              aria-label="Theme switcher"
              className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800"
            >
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                title={t(lang, "theme.light")}
                aria-label={t(lang, "theme.light")}
                className={`p-1.5 rounded-md transition-all duration-150 ease-out-expo ${
                  theme === "light"
                    ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                title={t(lang, "theme.dark")}
                aria-label={t(lang, "theme.dark")}
                className={`p-1.5 rounded-md transition-all duration-150 ease-out-expo ${
                  theme === "dark"
                    ? "bg-white dark:bg-slate-700 text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("system")}
                title={t(lang, "theme.system")}
                aria-label={t(lang, "theme.system")}
                className={`p-1.5 rounded-md transition-all duration-150 ease-out-expo ${
                  theme === "system"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="hidden md:flex flex-col text-right leading-tight">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {user.full_name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t(lang, `roles.${user.role}`)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label={t(lang, "auth.logout")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t(lang, "auth.logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation bar */}
        {user && navItems.length > 0 && (
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 no-scrollbar"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/student" || item.href === "/teacher" || item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 ease-out-expo ${
                    isActive
                      ? "bg-blue-800 text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

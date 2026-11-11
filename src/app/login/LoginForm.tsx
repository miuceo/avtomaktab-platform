"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { KeyRound, LogIn, User } from "lucide-react";

interface LoginFormProps {
  lang: Lang;
  centerName: string;
  logoPath: string;
}

export function LoginForm({ lang, centerName, logoPath }: LoginFormProps) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "rateLimited") {
          setError(t(lang, "auth.rateLimited"));
        } else {
          setError(t(lang, "auth.invalidCredentials"));
        }
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || "/student");
      router.refresh();
    } catch {
      setError(t(lang, "auth.invalidCredentials"));
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8 space-y-6 animate-enter">
      <div className="text-center space-y-2">
        {logoPath && (
          <img
            src={logoPath}
            alt={centerName}
            className="w-16 h-16 mx-auto rounded-2xl object-contain bg-blue-800/10 p-1"
          />
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t(lang, "auth.loginTitle")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {centerName} — {t(lang, "auth.loginSubtitle")}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-input"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {t(lang, "auth.login")}
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-input"
              type="text"
              required
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder={t(lang, "auth.login")}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password-input"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {t(lang, "auth.password")}
          </label>
          <div className="relative">
            <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="password-input"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-blue-800 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base shadow-sm transition-all duration-150 ease-out-expo flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <LogIn className="w-5 h-5" />
          <span>{loading ? t(lang, "app.loading") : t(lang, "auth.submit")}</span>
        </button>
      </form>
    </div>
  );
}

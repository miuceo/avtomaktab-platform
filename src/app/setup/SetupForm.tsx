"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { KeyRound, ShieldCheck, User, UserCog } from "lucide-react";

const inputClass =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium";
const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
const iconClass = "w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2";

export function SetupForm({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t(lang, "setup.passwordTooShort"));
      return;
    }
    if (password !== repeatPassword) {
      setError(t(lang, "setup.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, login, password, repeatPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 404) {
        router.push("/login");
        router.refresh();
        return;
      }
      if (!res.ok) {
        if (data.error === "loginTaken") setError(t(lang, "setup.loginTaken"));
        else if (data.error === "passwordMismatch") setError(t(lang, "setup.passwordMismatch"));
        else setError(t(lang, "setup.invalidInput"));
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || "/admin");
      router.refresh();
    } catch {
      setError(t(lang, "setup.invalidInput"));
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8 space-y-6 animate-enter">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-800/10 flex items-center justify-center">
          <ShieldCheck className="w-9 h-9 text-blue-800 dark:text-blue-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t(lang, "setup.title")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t(lang, "setup.subtitle")}</p>
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
          <label htmlFor="setup-fullname" className={labelClass}>
            {t(lang, "setup.fullName")}
          </label>
          <div className="relative">
            <UserCog className={iconClass} />
            <input
              id="setup-fullname"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="setup-login" className={labelClass}>
            {t(lang, "auth.login")}
          </label>
          <div className="relative">
            <User className={iconClass} />
            <input
              id="setup-login"
              type="text"
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9._\-]+"
              title={t(lang, "setup.loginHint")}
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className={inputClass}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{t(lang, "setup.loginHint")}</p>
        </div>

        <div>
          <label htmlFor="setup-password" className={labelClass}>
            {t(lang, "auth.password")}
          </label>
          <div className="relative">
            <KeyRound className={iconClass} />
            <input
              id="setup-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{t(lang, "setup.passwordHint")}</p>
        </div>

        <div>
          <label htmlFor="setup-repeat" className={labelClass}>
            {t(lang, "setup.repeatPassword")}
          </label>
          <div className="relative">
            <KeyRound className={iconClass} />
            <input
              id="setup-repeat"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-blue-800 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{loading ? t(lang, "app.loading") : t(lang, "setup.submit")}</span>
        </button>
      </form>
    </div>
  );
}

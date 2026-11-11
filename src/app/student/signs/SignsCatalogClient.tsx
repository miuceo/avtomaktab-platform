"use client";

import React, { useState, useMemo } from "react";
import { Lang, localizedText, t } from "@/lib/i18n";
import { Search } from "lucide-react";

interface RoadSignRow {
  id: number;
  code: string;
  group_uz: string;
  group_ru: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  image_path: string;
}

interface SignsCatalogClientProps {
  lang: Lang;
  signs: RoadSignRow[];
}

export function SignsCatalogClient({ lang, signs }: SignsCatalogClientProps) {
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const groups = useMemo(() => {
    const set = new Set<string>();
    for (const s of signs) {
      set.add(localizedText(lang, s.group_uz, s.group_ru));
    }
    return Array.from(set);
  }, [lang, signs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return signs.filter((s) => {
      const grp = localizedText(lang, s.group_uz, s.group_ru);
      if (selectedGroup !== "all" && grp !== selectedGroup) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.name_uz.toLowerCase().includes(q) ||
        s.name_ru.toLowerCase().includes(q) ||
        s.description_uz.toLowerCase().includes(q) ||
        s.description_ru.toLowerCase().includes(q)
      );
    });
  }, [lang, query, selectedGroup, signs]);

  const groupedSigns = useMemo(() => {
    const map = new Map<string, RoadSignRow[]>();
    for (const s of filtered) {
      const grp = localizedText(lang, s.group_uz, s.group_ru);
      const arr = map.get(grp) || [];
      arr.push(s);
      map.set(grp, arr);
    }
    return Array.from(map.entries());
  }, [filtered, lang]);

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t(lang, "nav.signs")}</h1>

        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(lang, "app.search")}
            aria-label={t(lang, "app.search")}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
      </div>

      {/* Group filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedGroup("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedGroup === "all"
              ? "bg-blue-800 text-white"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          }`}
        >
          {t(lang, "app.all")} ({signs.length})
        </button>
        {groups.map((grp) => (
          <button
            key={grp}
            type="button"
            onClick={() => setSelectedGroup(grp)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedGroup === grp
                ? "bg-blue-800 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Grouped Grid */}
      {groupedSigns.map(([groupTitle, items]) => (
        <section key={groupTitle} className="space-y-3">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 border-b border-slate-200 dark:border-slate-800 pb-2">
            {groupTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((sign) => (
              <div
                key={sign.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center text-center gap-3 shadow-sm"
              >
                <div className="w-28 h-28 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl p-2">
                  <img
                    src={sign.image_path}
                    alt={`${sign.code} - ${localizedText(lang, sign.name_uz, sign.name_ru)}`}
                    className="max-h-24 max-w-24 object-contain"
                  />
                </div>
                <span className="px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-xs font-bold">
                  {sign.code}
                </span>
                <h3 className="font-bold text-base leading-snug">
                  {localizedText(lang, sign.name_uz, sign.name_ru)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {localizedText(lang, sign.description_uz, sign.description_ru)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

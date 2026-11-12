"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton({ label = "Chop etish" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

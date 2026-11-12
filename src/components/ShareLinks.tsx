"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ShareLinks({ links, copyLabel }: { links: string[]; copyLabel: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(url: string, input: HTMLInputElement | null) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API is blocked on plain-http LAN addresses: fall back to the old copy command.
      input?.select();
      document.execCommand("copy");
    }
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-2">
      {links.map((url) => (
        <div key={url} className="flex gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-sm"
          />
          <button
            type="button"
            onClick={(e) => copy(url, e.currentTarget.previousElementSibling as HTMLInputElement)}
            className="px-3 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold flex items-center gap-1"
          >
            {copied === url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copyLabel}
          </button>
        </div>
      ))}
    </div>
  );
}

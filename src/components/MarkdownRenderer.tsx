import React from "react";

interface MarkdownRendererProps {
  content: string;
}

function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listItems: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = (keyPrefix: string) => {
    if (!listItems) return;
    if (listItems.type === "ul") {
      elements.push(
        <ul
          key={`${keyPrefix}-ul`}
          className="list-disc pl-6 space-y-1.5 my-3 text-slate-800 dark:text-slate-200"
        >
          {listItems.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol
          key={`${keyPrefix}-ol`}
          className="list-decimal pl-6 space-y-1.5 my-3 text-slate-800 dark:text-slate-200"
        >
          {listItems.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ol>
      );
    }
    listItems = null;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(`line-${index}`);
      return;
    }

    if (line.startsWith("### ")) {
      flushList(`line-${index}`);
      elements.push(
        <h3
          key={index}
          className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-2"
        >
          {formatInline(line.slice(4))}
        </h3>
      );
      return;
    }

    if (line.startsWith("#### ")) {
      flushList(`line-${index}`);
      elements.push(
        <h4
          key={index}
          className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2"
        >
          {formatInline(line.slice(5))}
        </h4>
      );
      return;
    }

    if (line.startsWith("> ")) {
      flushList(`line-${index}`);
      elements.push(
        <blockquote
          key={index}
          className="border-l-4 border-blue-700 bg-blue-50/70 dark:bg-blue-950/40 px-4 py-3 my-4 rounded-r-lg text-slate-800 dark:text-slate-200"
        >
          {formatInline(line.slice(2))}
        </blockquote>
      );
      return;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!listItems || listItems.type !== "ul") {
        flushList(`line-${index}`);
        listItems = { type: "ul", items: [] };
      }
      listItems.items.push(line.slice(2));
      return;
    }

    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!listItems || listItems.type !== "ol") {
        flushList(`line-${index}`);
        listItems = { type: "ol", items: [] };
      }
      listItems.items.push(olMatch[1]);
      return;
    }

    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushList(`line-${index}`);
      elements.push(
        <div key={index} className="my-4">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1] || "Chapter illustration"}
            className="max-h-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-2"
          />
        </div>
      );
      return;
    }

    flushList(`line-${index}`);
    elements.push(
      <p key={index} className="my-2.5 leading-relaxed text-slate-800 dark:text-slate-200">
        {formatInline(line)}
      </p>
    );
  });

  flushList("end");

  return <div className="space-y-1">{elements}</div>;
}

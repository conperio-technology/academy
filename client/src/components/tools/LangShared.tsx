import { useState } from "react";
import type { Lang } from "../../langTrack/types";

// Pieces shared by the "Programming in C# & Python" lessons and cheat sheets: the
// language switch (remembered per browser), a labelled code box, and a copy button.

export type LangView = "both" | Lang;

const VIEW_KEY = "lang-track:view";

function loadView(): LangView {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return v === "csharp" || v === "python" || v === "both" ? v : "both";
  } catch {
    return "both";
  }
}

export function useLangView(): [LangView, (v: LangView) => void] {
  const [view, setView] = useState<LangView>(loadView);
  function change(v: LangView) {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // Blocked storage: the choice just isn't remembered.
    }
  }
  return [view, change];
}

export const LANG_LABEL: Record<Lang, string> = { csharp: "C#", python: "Python" };

export function shows(view: LangView, lang: Lang): boolean {
  return view === "both" || view === lang;
}

export function LangViewToggle({ view, onChange }: { view: LangView; onChange: (v: LangView) => void }) {
  const options: [LangView, string][] = [
    ["both", "Side by side"],
    ["csharp", "C# only"],
    ["python", "Python only"],
  ];
  return (
    <div className="lt-toggle" role="group" aria-label="Which language to show">
      {options.map(([v, label]) => (
        <button key={v} className={view === v ? "active" : ""} aria-pressed={view === v} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable (plain http on a LAN address, say): fall back to a
    // hidden textarea and the old copy command.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <button
      className="lt-copy"
      onClick={async () => {
        setState((await copyText(text)) ? "done" : "failed");
        setTimeout(() => setState("idle"), 1500);
      }}
      aria-label={`${label} code`}
    >
      {state === "done" ? "Copied" : state === "failed" ? "Copy failed" : label}
    </button>
  );
}

export function CodePane({ lang, code, caption }: { lang: Lang; code: string; caption?: string }) {
  return (
    <div className={`lt-pane lt-${lang}`}>
      <div className="lt-pane-head">
        <span className="lt-lang">{caption ?? LANG_LABEL[lang]}</span>
        <CopyButton text={code} />
      </div>
      <pre className="algo-code lt-code">{code}</pre>
    </div>
  );
}

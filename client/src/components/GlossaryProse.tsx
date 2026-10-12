import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { openLesson } from "../api";
import type { GlossaryTerm } from "../glossaryData";
import { annotate, GLOSSARY_LESSON_ID, setPendingGlossaryFocus } from "../glossaryMatch";

// Lesson prose with glossary terms marked: the first time a term from glossaryData.ts appears
// in a lesson's explanation it gets a dotted underline, and hovering, tapping or pressing Enter
// on it shows the definition in a small popover. `backticked` spans render as inline code and
// are never marked, the same convention as inlineCode.tsx. Paragraphs are separated by a blank
// line ("\n\n") in the lesson text.

interface Props {
  text: string;
  title: string;
}

export function GlossaryProse({ text, title }: Props) {
  const paragraphs = useMemo(() => annotate(text.split("\n\n"), title), [text, title]);
  return (
    <section className="explanation">
      {paragraphs.map((pieces, i) => (
        <p key={i}>
          {pieces.map((p, j) =>
            typeof p === "string" ? (
              <Fragment key={j}>{p}</Fragment>
            ) : "code" in p ? (
              <code key={j}>{p.code}</code>
            ) : (
              <TermTip key={j} word={p.word} term={p.term} />
            ),
          )}
        </p>
      ))}
    </section>
  );
}

const POPOVER_WIDTH = 300;
const GAP = 6;
const MARGIN = 8;

function TermTip({ word, term }: { word: string; term: GlossaryTerm }): ReactNode {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const id = useId();

  function show(pin: boolean) {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
    if (pin) setPinned(true);
  }
  function hide() {
    window.clearTimeout(closeTimer.current);
    setOpen(false);
    setPinned(false);
  }
  function hideSoon() {
    if (pinned) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  }

  // Position with fixed coordinates, clamped to the viewport, so a term near the right edge of
  // a 390px screen still gets a fully visible popover. Flips above the term when there's no
  // room below.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const width = Math.min(POPOVER_WIDTH, vw - 2 * MARGIN);
    const left = Math.max(MARGIN, Math.min(r.left, vw - width - MARGIN));
    const height = popRef.current?.offsetHeight ?? 120;
    const below = r.bottom + GAP;
    const top = below + height > window.innerHeight - MARGIN && r.top - GAP - height > MARGIN ? r.top - GAP - height : below;
    setPos({ left, top, width });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !popRef.current?.contains(t)) hide();
    };
    // Fixed coordinates go stale when the page moves, so close rather than drift.
    const onScroll = () => hide();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <span className="gl-tip-wrap" onMouseLeave={hideSoon}>
      <button
        ref={buttonRef}
        type="button"
        className="gl-tip"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={`${word}: glossary definition`}
        onPointerEnter={(e) => e.pointerType === "mouse" && show(false)}
        onClick={() => (open && pinned ? hide() : show(true))}
        onBlur={(e) => {
          if (e.relatedTarget && !popRef.current?.contains(e.relatedTarget as Node)) hide();
        }}
      >
        {word}
      </button>
      {open && (
        <span
          ref={popRef}
          id={id}
          role="dialog"
          aria-label={term.term}
          className="gl-pop"
          style={pos ? { left: pos.left, top: pos.top, width: pos.width } : { visibility: "hidden" }}
          onMouseEnter={() => window.clearTimeout(closeTimer.current)}
          onBlur={(e) => {
            const next = e.relatedTarget as Node | null;
            if (next && !popRef.current?.contains(next) && next !== buttonRef.current) hide();
          }}
        >
          <span className="gl-pop-term">{term.term}</span>
          <span className="gl-pop-def">{term.definition}</span>
          <button
            type="button"
            className="link-button gl-pop-link"
            onClick={() => {
              setPendingGlossaryFocus(term.term);
              hide();
              openLesson(GLOSSARY_LESSON_ID);
            }}
          >
            See in glossary
          </button>
        </span>
      )}
    </span>
  );
}

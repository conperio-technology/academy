import { useEffect, useMemo, useState } from "react";
import { openLesson } from "../../api";
import { categoryLabel, GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryCategory, type GlossaryTerm } from "../../glossaryData";
import { clearPendingGlossaryFocus, pendingGlossaryFocusTerm } from "../../glossaryMatch";
import { shuffle } from "../../random";

// The three Glossary tools. Everything is client-side: the terms live in glossaryData.ts,
// and flash card progress (Leitner boxes) stays in this browser's localStorage.

const ALL_CATEGORIES = GLOSSARY_CATEGORIES.map((c) => c.id);
const byTerm = (a: GlossaryTerm, b: GlossaryTerm) => a.term.localeCompare(b.term, undefined, { sensitivity: "base" });

function anchorId(term: string) {
  return `gl-${term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function firstLetter(term: string) {
  const c = term[0].toUpperCase();
  return c >= "A" && c <= "Z" ? c : "#";
}

// Hides a term's own name inside its definition (e.g. "Priority queue: a queue where items
// come out in order of priority"), so definition-side prompts don't give the answer away.
function maskTerm(t: GlossaryTerm) {
  const names = [t.term.replace(/\s*\(.*\)$/, ""), ...[...t.term.matchAll(/\(([^)]+)\)/g)].map((m) => m[1])];
  let text = t.definition;
  // Acronyms open with their expansion ("TLS" -> "Transport Layer Security: ..."), which
  // would give the acronym away. Drop that lead-in entirely rather than blanking it, so in
  // the term-to-definition quiz the acronym options don't stand out from the rest.
  if (/^[A-Za-z0-9/.-]{2,8}$/.test(names[0])) {
    text = text.replace(/^[^:.]{3,60}: (.)/, (_, c: string) => c.toUpperCase());
  }
  for (const name of names.filter((n) => n.length > 1)) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`(^|[^A-Za-z])${escaped}(?![A-Za-z])`, "gi"), "$1____");
  }
  return text;
}

function CategoryPicker({
  selected,
  onToggle,
  onAll,
  counts,
}: {
  selected: GlossaryCategory[];
  onToggle: (id: GlossaryCategory) => void;
  onAll: () => void;
  counts?: Partial<Record<GlossaryCategory, number>>;
}) {
  const all = selected.length === ALL_CATEGORIES.length;
  return (
    <div className="sql-presets">
      <button className={all ? "active" : ""} onClick={onAll}>
        All topics
      </button>
      {GLOSSARY_CATEGORIES.map((c) => (
        <button key={c.id} className={!all && selected.includes(c.id) ? "active" : ""} onClick={() => onToggle(c.id)}>
          {c.label}
          {counts && counts[c.id] !== undefined ? ` (${counts[c.id]})` : ""}
        </button>
      ))}
    </div>
  );
}

// ---- 1. Glossary --------------------------------------------------------------------------

export function GlossaryList() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory | "all">("all");
  // A "See in glossary" link in a lesson's prose leaves the term to jump to.
  const [focus, setFocus] = useState<string | null>(pendingGlossaryFocusTerm);
  useEffect(clearPendingGlossaryFocus, []);

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      GLOSSARY.filter((t) => category === "all" || t.category === category)
        .filter((t) => !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q))
        // Name matches first, then definition-only matches, each alphabetical.
        .sort((a, b) => {
          if (q) {
            const an = a.term.toLowerCase().includes(q) ? 0 : 1;
            const bn = b.term.toLowerCase().includes(q) ? 0 : 1;
            if (an !== bn) return an - bn;
          }
          return byTerm(a, b);
        }),
    [q, category],
  );

  useEffect(() => {
    if (!focus) return;
    document.getElementById(anchorId(focus))?.scrollIntoView({ behavior: "smooth", block: "center" });
    const id = window.setTimeout(() => setFocus(null), 2000);
    return () => window.clearTimeout(id);
  }, [focus]);

  function jumpTo(term: string) {
    setQuery("");
    setCategory("all");
    setFocus(term);
  }

  // Letter headings only make sense for a plain alphabetical list (not search results).
  const headings = shown.map((t, i) =>
    !q && (i === 0 || firstLetter(shown[i - 1].term) !== firstLetter(t.term)) ? firstLetter(t.term) : null,
  );

  return (
    <div className="tool-widget">
      <input
        type="search"
        className="gl-search"
        placeholder={`Search ${GLOSSARY.length} terms, e.g. idempotent, SCADA, p99`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search the glossary"
      />
      <div className="sql-presets">
        <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>
          All topics
        </button>
        {GLOSSARY_CATEGORIES.map((c) => (
          <button key={c.id} className={category === c.id ? "active" : ""} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <p className="status-text gl-count">
        {shown.length === GLOSSARY.length ? `${shown.length} terms` : `${shown.length} of ${GLOSSARY.length} terms`}
      </p>

      {shown.length === 0 && <p className="gate-note">No terms match. Try a shorter search or another topic.</p>}

      <dl className="gl-list">
        {shown.map((t, i) => {
          const heading = headings[i];
          return (
            <div key={t.term}>
              {heading && <h3 className="gl-letter">{heading}</h3>}
              <div id={anchorId(t.term)} className={focus === t.term ? "gl-entry gl-focus" : "gl-entry"}>
                <dt>
                  <span className="gl-term">{t.term}</span>
                  {category === "all" && <span className="gl-cat">{categoryLabel(t.category)}</span>}
                </dt>
                <dd>
                  <p>{t.definition}</p>
                  {(t.seeAlso?.length || t.lessonId) && (
                    <p className="gl-links">
                      {t.seeAlso && t.seeAlso.length > 0 && (
                        <span>
                          See also:{" "}
                          {t.seeAlso.map((s, i) => (
                            <span key={s}>
                              {i > 0 && ", "}
                              <button className="link-button" onClick={() => jumpTo(s)}>
                                {s}
                              </button>
                            </span>
                          ))}
                        </span>
                      )}
                      {t.lessonId && (
                        <button className="link-button" onClick={() => openLesson(t.lessonId!)}>
                          Open the lesson
                        </button>
                      )}
                    </p>
                  )}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

// ---- 2. Flash cards -----------------------------------------------------------------------

const CARDS_KEY = "glossary:cards";
const MAX_BOX = 5;
// Days until a card in each box is due again. Box 1 is every day.
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
const SESSION_SIZE = 20;

interface CardState {
  box: number;
  due: number; // local day number, see today()
}
type CardStore = Record<string, CardState>;

function today() {
  const now = new Date();
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
}

function loadCards(): CardStore {
  try {
    const parsed = JSON.parse(localStorage.getItem(CARDS_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveCards(cards: CardStore) {
  try {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  } catch {
    // Blocked storage: progress lasts until the page is closed.
  }
}

const isDue = (cards: CardStore, term: string, day: number) => !cards[term] || cards[term].due <= day;

export function GlossaryFlashCards() {
  const [cards, setCards] = useState<CardStore>(loadCards);
  const [selected, setSelected] = useState<GlossaryCategory[]>(ALL_CATEGORIES);
  const [reverse, setReverse] = useState(false);
  const [deck, setDeck] = useState<GlossaryTerm[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ got: 0, notYet: 0 });
  const [requeued, setRequeued] = useState<Set<string>>(new Set());
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => saveCards(cards), [cards]);

  const day = today();
  const pool = GLOSSARY.filter((t) => selected.includes(t.category));
  const due = pool.filter((t) => isDue(cards, t.term, day));
  const dueNew = due.filter((t) => !cards[t.term]).length;
  const dueCounts = Object.fromEntries(
    GLOSSARY_CATEGORIES.map((c) => [c.id, GLOSSARY.filter((t) => t.category === c.id && isDue(cards, t.term, day)).length]),
  ) as Record<GlossaryCategory, number>;
  const boxes = [1, 2, 3, 4, 5].map((b) => pool.filter((t) => cards[t.term]?.box === b).length);

  function toggle(id: GlossaryCategory) {
    setSelected((s) => {
      if (s.length === ALL_CATEGORIES.length) return [id];
      const next = s.includes(id) ? s.filter((x) => x !== id) : [...s, id];
      return next.length === 0 ? ALL_CATEGORIES : next;
    });
  }

  function start(cram: boolean) {
    // Cards you've seen before come first, so reviews don't get crowded out by new cards.
    const source = cram ? pool : due;
    const seen = shuffle(source.filter((t) => cards[t.term]));
    const fresh = shuffle(source.filter((t) => !cards[t.term]));
    setDeck([...seen, ...fresh].slice(0, SESSION_SIZE));
    setIndex(0);
    setFlipped(false);
    setTally({ got: 0, notYet: 0 });
    setRequeued(new Set());
  }

  function grade(gotIt: boolean) {
    if (!deck) return;
    const card = deck[index];
    const box = gotIt ? Math.min((cards[card.term]?.box ?? 1) + 1, MAX_BOX) : 1;
    setCards((c) => ({ ...c, [card.term]: { box, due: day + INTERVAL_DAYS[box] } }));
    setTally((t) => (gotIt ? { ...t, got: t.got + 1 } : { ...t, notYet: t.notYet + 1 }));
    // A missed card comes round once more at the end of this session.
    if (!gotIt && !requeued.has(card.term)) {
      setDeck([...deck, card]);
      setRequeued(new Set(requeued).add(card.term));
    }
    setIndex(index + 1);
    setFlipped(false);
  }

  function resetSelected() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setCards((c) => Object.fromEntries(Object.entries(c).filter(([term]) => !pool.some((t) => t.term === term))));
    setConfirmReset(false);
  }

  if (deck === null) {
    return (
      <div className="tool-widget">
        <h3>Topics</h3>
        <CategoryPicker selected={selected} onToggle={toggle} onAll={() => setSelected(ALL_CATEGORIES)} counts={dueCounts} />
        <p className="gate-note">Numbers in brackets are cards due today. Pick several topics by tapping each one.</p>
        <h3>Direction</h3>
        <div className="sql-presets">
          <button className={!reverse ? "active" : ""} onClick={() => setReverse(false)}>
            Term, then definition
          </button>
          <button className={reverse ? "active" : ""} onClick={() => setReverse(true)}>
            Definition, then term (harder)
          </button>
        </div>
        <div className="tool-readout gl-readout">
          <div className="readout-cell">
            <span className="readout-label">Due today</span>
            <span className="readout-value">{due.length}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Never seen</span>
            <span className="readout-value">{dueNew}</span>
          </div>
          {boxes.map((n, i) => (
            <div key={i} className="readout-cell">
              <span className="readout-label">Box {i + 1}</span>
              <span className="readout-value">{n}</span>
            </div>
          ))}
        </div>
        <div className="darr-actions gl-actions">
          <button onClick={() => start(false)} disabled={due.length === 0}>
            {due.length === 0 ? "Nothing due" : `Study ${Math.min(due.length, SESSION_SIZE)} due cards`}
          </button>
          <button onClick={() => start(true)}>Practise anyway</button>
          <button className="sdi-reset" onClick={resetSelected} onBlur={() => setConfirmReset(false)}>
            {confirmReset ? "Click again to reset" : "Reset these topics"}
          </button>
        </div>
        {due.length === 0 && <p className="constraint-ok">All caught up for these topics. Come back tomorrow, or practise anyway.</p>}
      </div>
    );
  }

  if (index >= deck.length) {
    const nextDue = pool.map((t) => cards[t.term]?.due).filter((d): d is number => d !== undefined && d > day);
    const soonest = nextDue.length ? Math.min(...nextDue) - day : null;
    return (
      <div className="tool-widget">
        <h3>Session done</h3>
        <p className="drill-statement">
          {tally.got} got it, {tally.notYet} not yet.
        </p>
        <p className="gate-note">
          {due.length > 0
            ? `${due.length} more ${due.length === 1 ? "card is" : "cards are"} due today in these topics.`
            : soonest !== null
              ? `Nothing else is due today. The next cards come back in ${soonest} ${soonest === 1 ? "day" : "days"}.`
              : "Nothing else is due today."}
        </p>
        <div className="darr-actions gl-actions">
          {due.length > 0 && <button onClick={() => start(false)}>Keep going</button>}
          <button onClick={() => setDeck(null)}>Back to topics</button>
        </div>
      </div>
    );
  }

  const card = deck[index];
  const box = cards[card.term]?.box;
  const front = reverse ? maskTerm(card) : card.term;
  const back = reverse ? card.term : card.definition;

  return (
    <div className="tool-widget">
      <p className="drill-progress">
        Card {index + 1} of {deck.length} · {categoryLabel(card.category)} · {box ? `box ${box}` : "new"}
      </p>
      <button className={flipped ? "gl-card flipped" : "gl-card"} onClick={() => setFlipped(!flipped)} aria-live="polite">
        <span className={reverse ? "gl-card-front gl-card-def" : "gl-card-front"}>{front}</span>
        {flipped ? (
          <span className={reverse ? "gl-card-back" : "gl-card-back gl-card-def"}>{back}</span>
        ) : (
          <span className="gl-card-hint">Say the {reverse ? "term" : "definition"}, then tap to flip</span>
        )}
      </button>
      <div className="darr-actions gl-actions">
        {!flipped ? (
          <button onClick={() => setFlipped(true)}>Flip</button>
        ) : (
          <>
            <button className="gl-got" onClick={() => grade(true)}>
              Got it
            </button>
            <button className="gl-not-yet" onClick={() => grade(false)}>
              Not yet
            </button>
          </>
        )}
        <button className="sdi-reset" onClick={() => setDeck(null)}>
          End session
        </button>
      </div>
    </div>
  );
}

// ---- 3. Term quiz -------------------------------------------------------------------------

const QUIZ_LENGTH = 10;
type Direction = "termToDef" | "defToTerm" | "mixed";

interface Question {
  answer: GlossaryTerm;
  options: GlossaryTerm[];
  askTerm: boolean; // true: show the term, pick the definition
}

function buildQuiz(category: GlossaryCategory | "all", direction: Direction): Question[] {
  const pool = GLOSSARY.filter((t) => category === "all" || t.category === category);
  return shuffle(pool)
    .slice(0, QUIZ_LENGTH)
    .map((answer) => {
      // Wrong options always come from the answer's own topic, so they're plausible.
      const distractors = shuffle(GLOSSARY.filter((t) => t.category === answer.category && t.term !== answer.term)).slice(0, 3);
      const askTerm = direction === "termToDef" || (direction === "mixed" && Math.random() < 0.5);
      return { answer, options: shuffle([answer, ...distractors]), askTerm };
    });
}

// With onlyCategory set (the AI section's quiz) the topic is fixed and its picker is hidden.
export function GlossaryQuiz({ onlyCategory }: { onlyCategory?: GlossaryCategory } = {}) {
  const [category, setCategory] = useState<GlossaryCategory | "all">(onlyCategory ?? "all");
  const [direction, setDirection] = useState<Direction>("termToDef");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(string | null)[]>([]);

  function start() {
    const qs = buildQuiz(category, direction);
    setQuestions(qs);
    setPicks(qs.map(() => null));
    setIndex(0);
  }

  if (questions === null) {
    return (
      <div className="tool-widget">
        {onlyCategory ? (
          <p className="gate-note">
            {GLOSSARY.filter((t) => t.category === onlyCategory).length} terms in {categoryLabel(onlyCategory)}.
          </p>
        ) : (
          <>
            <h3>Topic</h3>
            <div className="sql-presets">
              <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>
                All topics
              </button>
              {GLOSSARY_CATEGORIES.map((c) => (
                <button key={c.id} className={category === c.id ? "active" : ""} onClick={() => setCategory(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
        <h3>Direction</h3>
        <div className="sql-presets">
          <button className={direction === "termToDef" ? "active" : ""} onClick={() => setDirection("termToDef")}>
            Term to definition
          </button>
          <button className={direction === "defToTerm" ? "active" : ""} onClick={() => setDirection("defToTerm")}>
            Definition to term
          </button>
          <button className={direction === "mixed" ? "active" : ""} onClick={() => setDirection("mixed")}>
            Mixed
          </button>
        </div>
        <button onClick={start}>Start the quiz</button>
      </div>
    );
  }

  if (index >= questions.length) {
    const misses = questions.filter((q, i) => picks[i] !== q.answer.term);
    const score = questions.length - misses.length;
    return (
      <div className="tool-widget">
        <h3>Your score</h3>
        <p className="drill-statement">
          {score} out of {questions.length}
        </p>
        {misses.length === 0 ? (
          <p className="constraint-ok">A clean sweep. Try another topic, or the other direction.</p>
        ) : (
          <>
            <p className="gate-note">The ones you missed:</p>
            <dl className="gl-list">
              {misses.map((q) => (
                <div key={q.answer.term} className="gl-entry">
                  <dt>
                    <span className="gl-term">{q.answer.term}</span>
                    <span className="gl-cat">{categoryLabel(q.answer.category)}</span>
                  </dt>
                  <dd>
                    <p>{q.answer.definition}</p>
                    {q.answer.lessonId && (
                      <p className="gl-links">
                        <button className="link-button" onClick={() => openLesson(q.answer.lessonId!)}>
                          Open the lesson
                        </button>
                      </p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
        <div className="darr-actions gl-actions">
          <button onClick={start}>Another quiz</button>
          <button onClick={() => setQuestions(null)}>Change settings</button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const picked = picks[index];

  return (
    <div className="tool-widget">
      <p className="drill-progress">
        Question {index + 1} of {questions.length} · {categoryLabel(q.answer.category)}
      </p>
      <p className="gate-note">{q.askTerm ? "Which definition fits this term?" : "Which term does this describe?"}</p>
      <p className={q.askTerm ? "drill-statement gl-prompt-term" : "drill-statement"}>{q.askTerm ? q.answer.term : maskTerm(q.answer)}</p>
      <div className={q.askTerm ? "gl-options" : "drill-options"}>
        {q.options.map((o) => {
          const state = picked === null ? "" : o.term === q.answer.term ? "correct" : o.term === picked ? "wrong" : "dim";
          return (
            <button
              key={o.term}
              className={`drill-option ${state}`}
              disabled={picked !== null}
              onClick={() => setPicks(picks.map((p, i) => (i === index ? o.term : p)))}
            >
              {q.askTerm ? maskTerm(o) : o.term}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="drill-feedback">
          <p>
            <strong>{picked === q.answer.term ? "Correct." : "Not quite."}</strong> {q.answer.term}: {q.answer.definition}
          </p>
          <div className="darr-actions">
            <button onClick={() => setIndex(index + 1)}>{index === questions.length - 1 ? "See your score" : "Next question"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

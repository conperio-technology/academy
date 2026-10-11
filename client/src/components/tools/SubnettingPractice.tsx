import { useState } from "react";
import { SPECIAL_RANGES, ipToString, maskFromPrefix, totalAddresses } from "../../netMath";
import { DRILL_TOPICS, checkAnswer, generateQuestion, type Difficulty, type DrillQuestion, type DrillTopic } from "../../subnetDrill";
import { LessonLink, readJson, writeJson } from "./netSecShared";

// Unlimited generated subnetting questions. Every question explains itself with the block
// size method, and per-topic accuracy is kept in this browser.

const STATS_KEY = "history:subnet-drill";
type Stats = Partial<Record<DrillTopic, { seen: number; correct: number }>>;

const DIFFICULTIES: { id: Difficulty; label: string; note: string }[] = [
  { id: "easy", label: "Easy", note: "/8, /16 and /24 only: whole octets" },
  { id: "normal", label: "Normal", note: "/24 to /30: the last octet splits" },
  { id: "hard", label: "Hard", note: "/9 to /30, any octet" },
];

export function SubnettingPractice() {
  const [topics, setTopics] = useState<DrillTopic[]>(DRILL_TOPICS.map((t) => t.id));
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [question, setQuestion] = useState<DrillQuestion>(() => generateQuestion(DRILL_TOPICS.map((t) => t.id), "normal"));
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"right" | "wrong" | "shown" | null>(null);
  const [session, setSession] = useState({ seen: 0, correct: 0, streak: 0, best: 0 });
  const [stats, setStats] = useState<Stats>(() => readJson<Stats>(STATS_KEY, {}));

  function next(t = topics, d = difficulty) {
    setQuestion(generateQuestion(t, d));
    setInput("");
    setResult(null);
  }

  function record(correct: boolean) {
    const s = stats[question.topic] ?? { seen: 0, correct: 0 };
    const updated = { ...stats, [question.topic]: { seen: s.seen + 1, correct: s.correct + (correct ? 1 : 0) } };
    setStats(updated);
    writeJson(STATS_KEY, updated);
    setSession((x) => {
      const streak = correct ? x.streak + 1 : 0;
      return { seen: x.seen + 1, correct: x.correct + (correct ? 1 : 0), streak, best: Math.max(x.best, streak) };
    });
  }

  function submit(value = input) {
    if (result !== null || value.trim() === "") return;
    const ok = checkAnswer(question, value);
    setInput(value);
    setResult(ok ? "right" : "wrong");
    record(ok);
  }

  function reveal() {
    if (result !== null) return;
    setResult("shown");
    record(false);
  }

  function toggleTopic(id: DrillTopic) {
    const t = topics.includes(id) ? topics.filter((x) => x !== id) : [...topics, id];
    const chosen = t.length === 0 ? [id] : t;
    setTopics(chosen);
    if (!chosen.includes(question.topic)) next(chosen);
  }

  const placeholder =
    question.answerType === "address" ? "e.g. 192.168.1.0" : question.answerType === "prefix" ? "e.g. /26" : "a number";

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Questions about</h3>
        <div className="sql-presets">
          {DRILL_TOPICS.map((t) => (
            <button key={t.id} className={topics.includes(t.id) ? "active" : ""} aria-pressed={topics.includes(t.id)} onClick={() => toggleTopic(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="sql-presets">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              className={d.id === difficulty ? "active" : ""}
              onClick={() => {
                setDifficulty(d.id);
                next(topics, d.id);
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="gate-note">{DIFFICULTIES.find((d) => d.id === difficulty)!.note}. Questions are generated at random, so there's always another one.</p>
      </div>

      <div className="drill-card">
        <p className="drill-progress">
          {DRILL_TOPICS.find((t) => t.id === question.topic)!.label} · this session {session.correct}/{session.seen} right · streak {session.streak} (best{" "}
          {session.best})
        </p>
        <p className="drill-statement">{question.prompt}</p>

        {question.answerType === "choice" ? (
          <div className="drill-options">
            {question.choices!.map((c) => {
              const cls =
                result === null ? "" : c === question.answer ? "correct" : c === input ? "wrong" : "dim";
              return (
                <button key={c} className={`drill-option ${cls}`} disabled={result !== null} onClick={() => submit(c)}>
                  {c}
                </button>
              );
            })}
          </div>
        ) : (
          <form
            className="tool-inputs ns-answer-row"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label>
              Your answer
              <input
                type="text"
                inputMode={question.answerType === "number" ? "numeric" : "decimal"}
                value={input}
                placeholder={placeholder}
                disabled={result !== null}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Your answer"
              />
            </label>
            <div className="ns-answer-buttons">
              <button type="submit" disabled={result !== null || input.trim() === ""}>
                Check
              </button>
              <button type="button" disabled={result !== null} onClick={reveal}>
                Show answer
              </button>
            </div>
          </form>
        )}

        {result !== null && (
          <div className="drill-feedback">
            <p className={result === "right" ? "constraint-ok" : "constraint-fail"}>
              {result === "right" ? "Right: " : result === "wrong" ? `Not quite. You said ${input.trim()}; the answer is ` : "The answer is "}
              <strong>{question.answer}</strong>.
            </p>
            <ol>
              {question.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <button onClick={() => next()} autoFocus>
              Next question
            </button>
          </div>
        )}
      </div>

      {Object.keys(stats).length > 0 && (
        <div className="crypto-section">
          <h3>Your accuracy in this browser</h3>
          <div className="cm-scroll">
            <table className="bigo-table">
              <tbody>
                {DRILL_TOPICS.filter((t) => stats[t.id]).map((t) => {
                  const s = stats[t.id]!;
                  return (
                    <tr key={t.id}>
                      <td>{t.label}</td>
                      <td className="mono">
                        {s.correct}/{s.seen}
                      </td>
                      <td className="mono">{Math.round((100 * s.correct) / s.seen)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            className="link-button"
            onClick={() => {
              setStats({});
              writeJson(STATS_KEY, {});
            }}
          >
            Reset these numbers
          </button>
        </div>
      )}

      <div className="crypto-section">
        <h3>Cheat sheet: the last octet</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Prefix</th>
                <th>Mask</th>
                <th>Block size</th>
                <th>Addresses</th>
                <th>Usable hosts</th>
              </tr>
            </thead>
            <tbody>
              {[24, 25, 26, 27, 28, 29, 30].map((p) => (
                <tr key={p}>
                  <td className="mono">/{p}</td>
                  <td className="mono">{ipToString(maskFromPrefix(p))}</td>
                  <td className="mono">{256 - (maskFromPrefix(p) & 0xff)}</td>
                  <td className="mono">{totalAddresses(p)}</td>
                  <td className="mono">{totalAddresses(p) - 2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          The same pattern repeats one octet to the left: /16 to /23 split the third octet with the same masks and block sizes (a /20 is 255.255.240.0, blocks of
          16 in the third octet, 4,096 addresses). Learn the seven mask values 128, 192, 224, 240, 248, 252, 254 and the rest is arithmetic.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Special address ranges</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Range</th>
                <th>What it is</th>
                <th>What it means in practice</th>
              </tr>
            </thead>
            <tbody>
              {SPECIAL_RANGES.map((r) => (
                <tr key={r.cidr}>
                  <td className="mono">{r.cidr}</td>
                  <td>{r.label}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Want to check your own network instead? The calculator is in <LessonLink id="ip-subnetting">IP Addressing &amp; Subnetting</LessonLink>.
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { CodeListing, CodeTabs } from "./concurrencyShared";

// Part 1: a red-green-refactor stepper for a leap-year function. Each step's tests are
// actually run against a JS twin of that step's C# code, so the results are computed.
// Part 2: pick tests for a shipping-fee function and compare line coverage, branch
// coverage and the mutation score (how many deliberately broken versions the chosen
// tests catch). Part 3: flaky-test causes and fixes.

type Phase = "red" | "green" | "refactor";

interface TddStep {
  phase: Phase;
  title: string;
  tests: [number, boolean][];
  impl: ((y: number) => boolean) | null;
  code: string;
  testCode: string;
  note: string;
}

const factLines = (cases: [number, boolean][]) =>
  cases
    .map(
      ([y, e]) => `[Fact] public void Year${y}_Is${e ? "" : "Not"}Leap()
    => Assert.${e ? "True" : "False"}(Calendar.IsLeap(${y}));`,
    )
    .join("\n\n");

const R1: [number, boolean][] = [[2023, false]];
const R2: [number, boolean][] = [...R1, [2024, true]];
const R3: [number, boolean][] = [...R2, [1900, false]];
const R4: [number, boolean][] = [...R3, [2000, true]];

const TDD: TddStep[] = [
  {
    phase: "red",
    title: "Red: the first test",
    tests: R1,
    impl: null,
    code: "// Calendar.IsLeap doesn't exist yet",
    testCode: factLines(R1),
    note: "Start with the simplest case. It doesn't even compile, which counts as red. Seeing it fail proves the test is actually able to fail.",
  },
  {
    phase: "green",
    title: "Green: the least code that passes",
    tests: R1,
    impl: () => false,
    code: "public static bool IsLeap(int year) => false;",
    testCode: factLines(R1),
    note: "Deliberately naive. Returning a constant feels silly, but it means every line of real logic will be written because a test demanded it.",
  },
  {
    phase: "red",
    title: "Red: a case the constant can't satisfy",
    tests: R2,
    impl: () => false,
    code: "public static bool IsLeap(int year) => false;",
    testCode: factLines(R2),
    note: "2024 is a leap year. The new test fails for the right reason: the logic is missing, not a typo in the test.",
  },
  {
    phase: "green",
    title: "Green: divisible by 4",
    tests: R2,
    impl: (y) => y % 4 === 0,
    code: "public static bool IsLeap(int year) => year % 4 == 0;",
    testCode: factLines(R2),
    note: "The obvious rule. Both tests pass.",
  },
  {
    phase: "red",
    title: "Red: the century rule",
    tests: R3,
    impl: (y) => y % 4 === 0,
    code: "public static bool IsLeap(int year) => year % 4 == 0;",
    testCode: factLines(R3),
    note: "1900 is divisible by 4 but wasn't a leap year: century years are excluded. A good edge case comes from the spec, not from the code you've already written.",
  },
  {
    phase: "green",
    title: "Green: except centuries",
    tests: R3,
    impl: (y) => y % 4 === 0 && y % 100 !== 0,
    code: "public static bool IsLeap(int year) =>\n    year % 4 == 0 && year % 100 != 0;",
    testCode: factLines(R3),
    note: "Three tests pass.",
  },
  {
    phase: "red",
    title: "Red: the 400-year exception",
    tests: R4,
    impl: (y) => y % 4 === 0 && y % 100 !== 0,
    code: "public static bool IsLeap(int year) =>\n    year % 4 == 0 && year % 100 != 0;",
    testCode: factLines(R4),
    note: "2000 was a leap year, because centuries divisible by 400 are back in. This is exactly the bug many real systems had to patch before 2000.",
  },
  {
    phase: "green",
    title: "Green: the full rule",
    tests: R4,
    impl: (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0,
    code: "public static bool IsLeap(int year) =>\n    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;",
    testCode: factLines(R4),
    note: "All four pass. The code is correct but the tests are repetitive.",
  },
  {
    phase: "refactor",
    title: "Refactor: tidy up while staying green",
    tests: R4,
    impl: (y) => y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0),
    code: "public static bool IsLeap(int year) =>\n    year % 400 == 0 || (year % 4 == 0 && year % 100 != 0);",
    testCode: `[Theory]
[InlineData(2023, false)]
[InlineData(2024, true)]
[InlineData(1900, false)]   // century
[InlineData(2000, true)]    // divisible by 400
public void IsLeap_FollowsGregorianRules(int year, bool expected)
    => Assert.Equal(expected, Calendar.IsLeap(year));`,
    note: "Four facts become one theory, and the expression is reordered to read like the rule. Nothing about behaviour changed, and the tests prove it. Refactoring is only safe because the earlier steps left this net behind.",
  },
];

// ---- Coverage vs mutation ----

const SHIP_LINES = [
  "public static int ShippingCents(int totalCents, bool isMember)",
  "{",
  "    int fee = 600;",
  "    if (totalCents >= 5000)",
  "        fee = 0;",
  "    if (isMember)",
  "        fee = fee / 2;",
  "    return fee;",
  "}",
];
const STATEMENT_LINES = [2, 3, 4, 5, 6, 7];

interface Variant {
  id: string;
  label: string;
  fn: (total: number, member: boolean) => number;
}

// The real implementation and five mutants of it.
const REAL = (t: number, m: boolean) => {
  let fee = 600;
  if (t >= 5000) fee = 0;
  if (m) fee = Math.trunc(fee / 2);
  return fee;
};
const MUTANTS: Variant[] = [
  { id: "M1", label: ">= becomes >", fn: (t, m) => { let f = 600; if (t > 5000) f = 0; if (m) f = Math.trunc(f / 2); return f; } },
  { id: "M2", label: "fee = 0 deleted", fn: (_t, m) => { let f = 600; if (m) f = Math.trunc(f / 2); return f; } },
  { id: "M3", label: "isMember becomes !isMember", fn: (t, m) => { let f = 600; if (t >= 5000) f = 0; if (!m) f = Math.trunc(f / 2); return f; } },
  { id: "M4", label: "fee / 2 becomes fee - 2", fn: (t, m) => { let f = 600; if (t >= 5000) f = 0; if (m) f = f - 2; return f; } },
  { id: "M5", label: "600 becomes 0", fn: (t, m) => { let f = 0; if (t >= 5000) f = 0; if (m) f = Math.trunc(f / 2); return f; } },
];

interface ShipTest {
  id: string;
  total: number;
  member: boolean;
  expected: number | null; // null: the test calls the method but asserts nothing
}

const SHIP_TESTS: ShipTest[] = [
  { id: "A", total: 2000, member: false, expected: 600 },
  { id: "B", total: 8000, member: false, expected: 0 },
  { id: "C", total: 2000, member: true, expected: 300 },
  { id: "D", total: 5000, member: false, expected: 0 },
  { id: "E", total: 8000, member: true, expected: null },
];

function covered(t: ShipTest) {
  const lines = [2, 3, 5, 7];
  const branches: string[] = [];
  if (t.total >= 5000) { lines.push(4); branches.push("L4 true"); } else branches.push("L4 false");
  if (t.member) { lines.push(6); branches.push("L6 true"); } else branches.push("L6 false");
  return { lines, branches };
}

const testName = (t: ShipTest) =>
  t.expected === null
    ? `ShippingCents(${t.total}, ${t.member}) with no assert`
    : `ShippingCents(${t.total}, ${t.member}) == ${t.expected}`;

const FLAKY = [
  {
    label: "Clock: flaky",
    code: `public bool IsWeekend() =>
    DateTime.Now.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;

[Fact]
public void IsWeekend_IsFalse()          // passes Monday to Friday only
    => Assert.False(new Schedule().IsWeekend());`,
    note: "The result depends on when (and in which time zone) the test runs.",
  },
  {
    label: "Clock: fixed",
    code: `public class Schedule(TimeProvider time)
{
    public bool IsWeekend() =>
        time.GetLocalNow().DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;
}

[Fact]
public void IsWeekend_OnSaturday_IsTrue()
{
    var time = new FakeTimeProvider(new DateTimeOffset(2026, 10, 10, 12, 0, 0, TimeSpan.Zero));

    Assert.True(new Schedule(time).IsWeekend());
}`,
    note: "Inject TimeProvider (built into .NET 8) and pass TimeProvider.System in production. FakeTimeProvider (Microsoft.Extensions.TimeProvider.Testing) fixes the time, and Advance() moves it.",
  },
  {
    label: "Sleep: flaky",
    code: `queue.Enqueue(job);
Thread.Sleep(500);                       // usually long enough...
Assert.True(worker.HasProcessed(job));`,
    note: "Too short on a busy CI machine, and wasted time everywhere else.",
  },
  {
    label: "Sleep: fixed",
    code: `queue.Enqueue(job);
await worker.Processed(job).WaitAsync(TimeSpan.FromSeconds(5));   // completes as soon as it's done
Assert.True(worker.HasProcessed(job));`,
    note: "Wait for the condition itself (a Task, an event, a polling helper with a timeout), not for a guessed duration.",
  },
];

export function TddCoverage() {
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<string[]>(["A"]);
  const s = TDD[step];

  const results = s.tests.map(([y, e]) => ({ y, e, ok: s.impl ? s.impl(y) === e : false }));
  const allGreen = s.impl !== null && results.every((r) => r.ok);

  const active = SHIP_TESTS.filter((t) => chosen.includes(t.id));
  const lineSet = new Set(active.flatMap((t) => covered(t).lines));
  const branchSet = new Set(active.flatMap((t) => covered(t).branches));
  const linePct = Math.round((STATEMENT_LINES.filter((l) => lineSet.has(l)).length / STATEMENT_LINES.length) * 100);
  const branchPct = Math.round((branchSet.size / 4) * 100);
  const killedBy = (m: Variant) => active.filter((t) => t.expected !== null && m.fn(t.total, t.member) !== t.expected).map((t) => t.id);
  const killed = MUTANTS.filter((m) => killedBy(m).length > 0).length;
  const allPass = active.every((t) => t.expected === null || REAL(t.total, t.member) === t.expected);

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Red, green, refactor: a leap-year function</h3>
        <div className="tdd-steps" role="list">
          {TDD.map((t, i) => (
            <button key={i} role="listitem" className={`tdd-dot tdd-${t.phase} ${i === step ? "active" : ""}`} onClick={() => setStep(i)} aria-label={`Step ${i + 1}: ${t.phase}`}>
              {i + 1}
            </button>
          ))}
        </div>
        <div className={`tdd-phase tdd-${s.phase}`}>
          <strong>{s.title}</strong>
        </div>
        <div className="tdd-cols">
          <div>
            <span className="readout-label">Tests</span>
            <pre className="algo-code">{s.testCode}</pre>
          </div>
          <div>
            <span className="readout-label">Production code</span>
            <pre className="algo-code">{s.code}</pre>
            <span className="readout-label">dotnet test</span>
            <div className="cm-status-list">
              {s.impl === null ? (
                <span className="cm-status cm-status-blocked">build failed: IsLeap does not exist</span>
              ) : (
                results.map((r) => (
                  <span key={r.y} className={`cm-status ${r.ok ? "cm-status-running" : "cm-status-blocked"}`}>
                    {r.y}: {r.ok ? "pass" : "FAIL"}
                  </span>
                ))
              )}
            </div>
            <p className={allGreen ? "constraint-ok" : "constraint-fail"}>{allGreen ? "All green." : "Red."}</p>
          </div>
        </div>
        <p className="gate-note">{s.note}</p>
        <div className="cm-actions">
          <button disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </button>
          <button disabled={step === TDD.length - 1} onClick={() => setStep(step + 1)}>
            Next step
          </button>
        </div>
      </div>

      <div className="crypto-section">
        <h3>Coverage vs what your tests actually check</h3>
        <p className="gate-note">
          Spec: orders of $50 (5000 cents) or more ship free; members pay half the shipping fee. The code below is correct. Choose which tests to
          include. Highlighted lines are covered.
        </p>
        <CodeListing lines={SHIP_LINES} active={[...lineSet]} />
        <div className="tc-tests">
          {SHIP_TESTS.map((t) => (
            <label key={t.id} className="tool-checkbox">
              <input
                type="checkbox"
                checked={chosen.includes(t.id)}
                onChange={(e) => setChosen(e.target.checked ? [...chosen, t.id] : chosen.filter((c) => c !== t.id))}
              />
              <span>
                <strong>{t.id}</strong> <code>{testName(t)}</code>
              </span>
            </label>
          ))}
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Line coverage</span>
            <span className="readout-value">{linePct}%</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Branch coverage</span>
            <span className="readout-value">{branchPct}%</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Mutants killed</span>
            <span className={`readout-value ${killed < MUTANTS.length && linePct === 100 ? "cm-yes" : ""}`}>
              {killed} of {MUTANTS.length}
            </span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Tests</span>
            <span className="readout-value">{active.length === 0 ? "none" : allPass ? "all pass" : "failing"}</span>
          </div>
        </div>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Mutant</th>
                <th>Change</th>
                <th>Caught by</th>
              </tr>
            </thead>
            <tbody>
              {MUTANTS.map((m) => {
                const by = killedBy(m);
                return (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td className="mono">{m.label}</td>
                    <td className={by.length ? "cm-no" : "cm-yes"}>{by.length ? `killed by ${by.join(", ")}` : "survives"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Try A and E: 100% line and branch coverage, yet three of five bugs would ship, because E runs code without checking anything. Then try A,
          B and C: every line and branch is checked, but M1 survives. Only D, the exact boundary at 5000, tells {">="} from {">"}. Mutation testing
          tools such as Stryker.NET generate mutants like these automatically.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Flaky tests: two classic causes</h3>
        <CodeTabs samples={FLAKY} />
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Cause</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Real clock, time zones, culture</td><td>inject TimeProvider; set culture explicitly in tests that format</td></tr>
              <tr><td>Sleeping instead of waiting</td><td>await the condition with a timeout</td></tr>
              <tr><td>Shared static state or database rows</td><td>fresh data per test; unique ids; transactions rolled back</td></tr>
              <tr><td>Test order dependence</td><td>no test relies on another having run</td></tr>
              <tr><td>Unseeded randomness</td><td>fixed seed, and log it when a test fails</td></tr>
              <tr><td>Real network or third-party APIs</td><td>doubles in unit tests; local containers in integration tests</td></tr>
              <tr><td>Races in concurrent code</td><td>deterministic scheduling, or test the logic without threads</td></tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Automatic retries turn a flaky test green and hide a real race just as easily. Quarantine it, find the nondeterminism, remove it.
        </p>
      </div>
    </div>
  );
}

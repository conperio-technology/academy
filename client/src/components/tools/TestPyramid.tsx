import { useState } from "react";
import { CodeTabs } from "./concurrencyShared";

// Part 1: a suite-shape calculator. Each level has an assumed time per test and an
// assumed chance that one run of one test fails for a reason unrelated to the code
// (a flake). Runtime adds up; the chance the whole build goes red for no reason is
// 1 - product of (1 - p)^n. Part 2: "which level is this test?". Part 3: xUnit code.

interface Level {
  key: "unit" | "integration" | "e2e";
  name: string;
  ms: number;
  flake: number;
  max: number;
}

const LEVELS: Level[] = [
  { key: "e2e", name: "End-to-end", ms: 6000, flake: 0.005, max: 300 },
  { key: "integration", name: "Integration", ms: 250, flake: 0.0005, max: 800 },
  { key: "unit", name: "Unit", ms: 5, flake: 0.00001, max: 3000 },
];

type Counts = Record<Level["key"], number>;

const SHAPES: { name: string; counts: Counts; note: string }[] = [
  { name: "Pyramid", counts: { unit: 1500, integration: 200, e2e: 15 }, note: "Most checks are fast unit tests; integration tests cover each boundary; a few E2E tests cover the journeys that must never break." },
  { name: "Ice-cream cone", counts: { unit: 100, integration: 150, e2e: 200 }, note: "Most checks are E2E. The build takes over 20 minutes, goes red for no reason most of the time, and people start rerunning instead of reading failures." },
  { name: "Trophy", counts: { unit: 400, integration: 600, e2e: 15 }, note: "Kent C. Dodds' shape weights integration tests most, on the argument that they test the way the code is really used. It works when they're fast and isolated; otherwise the cost shows up in run time and flakiness." },
];

function duration(ms: number) {
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m} min ${s} s`;
}

type Answer = "unit" | "integration" | "e2e";

const QUIZ: { q: string; answer: Answer; why: string }[] = [
  { q: "DiscountCalculator gives 10% off orders over $100. The test builds an Order in memory and checks the total.", answer: "unit", why: "Pure logic, no I/O, milliseconds. This is where most of your edge cases belong." },
  { q: "OrderRepository's LINQ query returns only unshipped orders, run against a real PostgreSQL started in a container (Testcontainers).", answer: "integration", why: "The thing that can be wrong is the SQL EF Core generates and how the real database runs it. A fake repository couldn't catch that." },
  { q: "POST /api/orders with quantity 0 returns 400, called through WebApplicationFactory.", answer: "integration", why: "It runs the real ASP.NET Core pipeline (routing, model binding, validation, filters) in memory. Not E2E: there's no deployed system or browser." },
  { q: "A browser signs in, adds an item, pays with a test card and sees \"Order confirmed\".", answer: "e2e", why: "The whole deployed system through its real UI. Worth having for the checkout path, too slow and fragile for every rule." },
  { q: "OrderService sends one confirmation email after a successful order. The test uses an in-memory repository and a mock IEmailSender.", answer: "unit", why: "Doubles replace both dependencies, so only OrderService's own logic runs. See the test doubles lesson for which double is which." },
  { q: "After each deploy, check that staging's login page loads and /health returns 200.", answer: "e2e", why: "A smoke test of a deployed environment. It proves the build and configuration work together, which no lower-level test can." },
];

const CODE = [
  {
    label: "[Fact] with AAA",
    code: `public class AccountTests
{
    [Fact]
    public void Withdraw_LessThanBalance_ReducesBalance()
    {
        // Arrange
        var account = new Account(balance: 100m);

        // Act
        account.Withdraw(30m);

        // Assert
        Assert.Equal(70m, account.Balance);
    }

    [Fact]
    public void Withdraw_MoreThanBalance_ThrowsAndLeavesBalance()
    {
        var account = new Account(balance: 100m);

        Assert.Throws<InvalidOperationException>(() => account.Withdraw(150m));
        Assert.Equal(100m, account.Balance);
    }
}`,
    note: "One behaviour per test, named Method_Scenario_Expected. Assert.Equal takes the expected value first, so failure messages read correctly.",
  },
  {
    label: "[Theory]",
    code: `[Theory]
[InlineData(0, false)]
[InlineData(7, false)]
[InlineData(8, true)]     // exactly at the limit
[InlineData(64, true)]
public void IsLongEnough_RequiresEightCharacters(int length, bool expected)
{
    var password = new string('x', length);

    bool result = PasswordRules.IsLongEnough(password);

    Assert.Equal(expected, result);
}`,
    note: "A theory runs once per row and reports each row separately. Boundary values (7 and 8) catch off-by-one bugs.",
  },
  {
    label: "Integration",
    code: `public class OrdersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public OrdersApiTests(WebApplicationFactory<Program> factory)
        => _client = factory.CreateClient();

    [Fact]
    public async Task PostOrder_ZeroQuantity_Returns400()
    {
        var order = new { ProductId = 42, Quantity = 0 };

        var response = await _client.PostAsJsonAsync("/api/orders", order);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}`,
    note: "WebApplicationFactory (Microsoft.AspNetCore.Mvc.Testing) hosts the real app in memory. With top-level statements, add public partial class Program { } so the test project can see Program. The fixture is shared by the class, so the app starts once.",
  },
  {
    label: "End-to-end",
    code: `[Fact]
public async Task Checkout_HappyPath()
{
    using var playwright = await Playwright.CreateAsync();
    await using var browser = await playwright.Chromium.LaunchAsync();
    var page = await browser.NewPageAsync();

    await page.GotoAsync(StagingUrl);
    await page.GetByLabel("Email").FillAsync("e2e-user@example.com");
    await page.GetByLabel("Password").FillAsync(TestPassword);
    await page.GetByRole(AriaRole.Button, new() { Name = "Sign in" }).ClickAsync();
    // ... add to cart, pay with a test card ...

    await Assertions.Expect(page.GetByText("Order confirmed")).ToBeVisibleAsync();
}`,
    note: "Playwright waits automatically for elements to be ready, which removes the biggest source of E2E flakiness (sleeps and races with the UI). It's still slow, and it depends on staging data and every service being up.",
  },
];

export function TestPyramid() {
  const [counts, setCounts] = useState<Counts>(SHAPES[0].counts);
  const [shape, setShape] = useState(0);
  const [picked, setPicked] = useState<(Answer | null)[]>(() => QUIZ.map(() => null));

  const total = LEVELS.reduce((n, l) => n + counts[l.key], 0);
  const ms = LEVELS.reduce((n, l) => n + counts[l.key] * l.ms, 0);
  const pClean = LEVELS.reduce((p, l) => p * Math.pow(1 - l.flake, counts[l.key]), 1);
  const pFlaky = 1 - pClean;
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.filter((p, i) => p === QUIZ[i].answer).length;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Shape a test suite</h3>
        <div className="sql-presets">
          {SHAPES.map((s, i) => (
            <button key={s.name} className={shape === i ? "active" : ""} onClick={() => { setCounts(s.counts); setShape(i); }}>
              {s.name}
            </button>
          ))}
        </div>
        <div className="tp-pyramid" aria-label="Number of tests at each level">
          {LEVELS.map((l) => (
            <div key={l.key} className="tp-row">
              <span className="tp-label">{l.name}</span>
              <div className="tp-track">
                <div className={`tp-bar tp-${l.key}`} style={{ width: `${total ? Math.max(2, (counts[l.key] / total) * 100) : 0}%` }}>
                  {counts[l.key]}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cache-controls">
          {LEVELS.map((l) => (
            <label key={l.key}>
              {l.name} tests: <strong>{counts[l.key]}</strong>
              <input
                type="range"
                min={0}
                max={l.max}
                step={l.max >= 1000 ? 50 : 5}
                value={counts[l.key]}
                onChange={(e) => { setCounts({ ...counts, [l.key]: Number(e.target.value) }); setShape(-1); }}
              />
            </label>
          ))}
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Tests</span>
            <span className="readout-value">{total}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Run time, serial</span>
            <span className="readout-value">{duration(ms)}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Red for no reason</span>
            <span className={`readout-value ${pFlaky > 0.3 ? "cm-yes" : ""}`}>{(pFlaky * 100).toFixed(1)}% of runs</span>
          </div>
        </div>
        {shape >= 0 && <p className="gate-note">{SHAPES[shape].note}</p>}
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Assumed time</th>
                <th>Assumed flake rate</th>
                <th>A failure tells you</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Unit</td><td>5 ms</td><td>1 in 100,000</td><td>which rule broke, almost to the line</td></tr>
              <tr><td>Integration</td><td>250 ms</td><td>1 in 2,000</td><td>which boundary broke</td></tr>
              <tr><td>End-to-end</td><td>6 s</td><td>1 in 200</td><td>something, somewhere, maybe</td></tr>
            </tbody>
          </table>
        </div>
        <p className="bigo-table-footnote">
          Illustrative numbers, not measurements; real ones vary by team. The shape of the result holds anyway: flake rates multiply across a suite,
          so a few hundred slightly flaky tests make a build that fails most of the time. Parallel runners cut wall-clock time but not flakiness.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Which level is this test?</h3>
        <ol className="cm-quiz">
          {QUIZ.map((q, i) => (
            <li key={i}>
              <p>{q.q}</p>
              <div className="sql-presets">
                {(["unit", "integration", "e2e"] as const).map((a) => (
                  <button
                    key={a}
                    className={picked[i] === a ? (a === q.answer ? "active" : "cm-wrong") : ""}
                    onClick={() => setPicked(picked.map((p, k) => (k === i ? a : p)))}
                  >
                    {a === "e2e" ? "End-to-end" : a === "unit" ? "Unit" : "Integration"}
                  </button>
                ))}
              </div>
              {picked[i] !== null && (
                <p className={picked[i] === q.answer ? "constraint-ok" : "constraint-fail"}>
                  {picked[i] === q.answer ? "Right. " : "Not quite. "}
                  {q.why}
                </p>
              )}
            </li>
          ))}
        </ol>
        {answered > 0 && (
          <p className="gate-note">
            {score} of {QUIZ.length} right{answered < QUIZ.length ? ` so far (${answered} answered)` : ""}.
          </p>
        )}
      </div>

      <div className="crypto-section">
        <h3>What each looks like in C#</h3>
        <CodeTabs samples={CODE} />
      </div>
    </div>
  );
}

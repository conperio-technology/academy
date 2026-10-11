import { useState } from "react";
import { openLesson } from "../../api";

// Part 1: review an AI-generated diff with planted problems. Part 2: everyday situations with
// a recommended choice and the reasoning. No model is called; everything is fixed content.

interface DiffLine {
  sign: "+" | "-" | " ";
  code: string;
  issue?: string; // what is wrong with this line
  fine?: string; // why a suspicious-looking line is actually fine
}

const PROMPT =
  "Add an endpoint that returns a customer's orders, optionally filtered by status, newest first, 20 per page. Pages start at 1.";

const DIFF: DiffLine[] = [
  { sign: " ", code: "// OrdersEndpoints.cs" },
  { sign: " ", code: "public static class OrdersEndpoints" },
  { sign: " ", code: "{" },
  { sign: "-", code: "    private const int MaxPageSize = 100;" },
  {
    sign: "+",
    code: "    private const int MaxPageSize = 1000;",
    issue: "An unrelated change nobody asked for. Raising a limit used by other endpoints tenfold can let one request pull 1,000 rows. Assistants make drive-by edits like this; review the whole diff, not just the new function.",
  },
  { sign: " ", code: "" },
  { sign: " ", code: "    public static void Map(WebApplication app)" },
  { sign: " ", code: "    {" },
  {
    sign: "+",
    code: '        app.MapGet("/customers/{customerId}/orders", async (',
    issue: "No authorization at all: no RequireAuthorization() and no check that customerId belongs to the signed-in user. Anyone can read anyone's orders by changing the number in the URL (an insecure direct object reference). The prompt didn't mention it, so the assistant didn't either.",
  },
  { sign: "+", code: "            int customerId, string? status, int page," },
  { sign: "+", code: "            IDbConnection db, ILogger<Program> logger) =>" },
  { sign: "+", code: "        {" },
  { sign: "+", code: "            // page is 1-based: page=1 is the first page" },
  {
    sign: "+",
    code: "            var offset = page * 20;",
    issue: "Off by one: with 1-based pages, page 1 should skip 0 rows, but this skips 20, so the first page of results is never returned. It should be (page - 1) * 20, with page validated to be at least 1. The comment above it is right; the code isn't, and a quick read trusts the comment.",
  },
  {
    sign: "+",
    code: '            var sql = "SELECT Id, Total, Status, CreatedAt FROM Orders " +',
    fine: "Selecting named columns instead of SELECT * is good practice.",
  },
  {
    sign: "+",
    code: "                $\"WHERE CustomerId = @customerId AND Status = '{status}' \" +",
    issue: "SQL injection: status comes straight from the query string and is pasted into the SQL text. ?status=x' OR '1'='1 returns every customer's orders. Pass it as a parameter (@status) like customerId. It is also wrong when status is omitted: it becomes Status = '' and matches nothing, though the filter was meant to be optional.",
  },
  {
    sign: "+",
    code: '                "ORDER BY CreatedAt DESC OFFSET @offset ROWS FETCH NEXT 20 ROWS ONLY";',
    fine: "OFFSET ... FETCH NEXT is valid SQL Server paging syntax, and the offset is a parameter.",
  },
  { sign: "+", code: "            try" },
  { sign: "+", code: "            {" },
  {
    sign: "+",
    code: "                var orders = await db.QueryPagedAsync<OrderDto>(sql, new { customerId, offset });",
    issue: "Dapper has no QueryPagedAsync method. It is a plausible-sounding invention; the real call is QueryAsync<OrderDto>. The build would catch this one, but invented methods that do exist under a similar name with different behaviour won't be caught. Check every unfamiliar API against the docs.",
  },
  {
    sign: "+",
    code: '                logger.LogInformation("Returned {Count} orders", orders.Count());',
    fine: "Structured logging of a count, with no personal data, is fine.",
  },
  { sign: "+", code: "                return Results.Ok(orders);" },
  { sign: "+", code: "            }" },
  { sign: "+", code: "            catch (Exception)" },
  { sign: "+", code: "            {" },
  {
    sign: "+",
    code: "                return Results.Ok(Array.Empty<OrderDto>());",
    issue: "Swallows every exception and returns 200 OK with an empty list. A database outage now looks like a customer with no orders: no error in the logs, no alert, wrong data shown to the user. Let it fail (the framework returns 500 and logs it) or catch only what you can handle.",
  },
  { sign: "+", code: "            }" },
  { sign: "+", code: "        });" },
  { sign: " ", code: "    }" },
  { sign: " ", code: "}" },
  { sign: " ", code: "" },
  { sign: " ", code: "// OrdersEndpointsTests.cs" },
  { sign: "+", code: "    [Fact]" },
  { sign: "+", code: "    public async Task ReturnsOrders()" },
  { sign: "+", code: "    {" },
  { sign: "+", code: '        var response = await _client.GetAsync("/customers/7/orders?page=1");' },
  { sign: "+", code: "        var body = await response.Content.ReadAsStringAsync();" },
  {
    sign: "+",
    code: "        Assert.NotNull(body);",
    issue: "A test that can't fail: the body is never null, even for an error page. It doesn't check the status code, the orders returned, their order or the paging, which is how the off-by-one above got through. Ask for tests of specific behaviour (page 1 returns the newest 20; another customer's id returns 403) and read them.",
  },
  { sign: "+", code: "    }" },
];

function DiffReview() {
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const issues = DIFF.map((l, i) => (l.issue ? i : -1)).filter((i) => i >= 0);
  const found = issues.filter((i) => flags.has(i)).length;
  const falseFlags = [...flags].filter((i) => !DIFF[i].issue).length;
  const toggle = (i: number) => {
    if (checked) return;
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  return (
    <div className="crypto-section">
      <h3>Part 1: review the assistant&apos;s change</h3>
      <p className="gate-note">
        The prompt was: &quot;{PROMPT}&quot; The assistant&apos;s summary says &quot;Added the endpoint with paging and a test.&quot; Click every line you would comment on in review, then check. There are {issues.length} real problems.
      </p>
      <div className="ae-diff" role="list">
        {DIFF.map((l, i) => {
          const flagged = flags.has(i);
          let cls = `ae-line ae-${l.sign === "+" ? "add" : l.sign === "-" ? "del" : "ctx"}`;
          if (flagged) cls += " ae-flagged";
          if (checked && l.issue) cls += flagged ? " ae-hit" : " ae-miss";
          if (checked && flagged && !l.issue) cls += " ae-false";
          return (
            <div key={i} role="listitem">
              <button className={cls} onClick={() => toggle(i)} aria-pressed={flagged}>
                <span className="ae-sign">{l.sign}</span>
                <code>{l.code || " "}</code>
              </button>
              {checked && l.issue && <p className={flagged ? "ae-note" : "ae-note ae-note-miss"}>{flagged ? "Found: " : "Missed: "}{l.issue}</p>}
              {checked && flagged && !l.issue && (
                <p className="ae-note ae-note-false">{l.fine ?? "This line is fine as it stands."}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="darr-actions">
        {!checked ? (
          <button onClick={() => setChecked(true)}>Check my review</button>
        ) : (
          <button
            onClick={() => {
              setChecked(false);
              setFlags(new Set());
            }}
          >
            Start over
          </button>
        )}
      </div>
      {checked && (
        <p className={found === issues.length ? "gate-note" : "constraint-fail"}>
          You found {found} of {issues.length}
          {falseFlags ? `, with ${falseFlags} line${falseFlags === 1 ? "" : "s"} flagged that ${falseFlags === 1 ? "is" : "are"} fine` : ""}.{" "}
          {found === issues.length
            ? "Every one of these would have shipped if the review had been \"looks right, tests pass\"."
            : "None of the misses are exotic: they are what generated code gets wrong most often (security left out of the prompt, edge cases, invented APIs, swallowed errors, weak tests, unrequested edits)."}
        </p>
      )}
    </div>
  );
}

// ---- Part 2: what would you do? ----

interface Situation {
  situation: string;
  options: string[];
  best: number;
  why: string;
}

const SITUATIONS: Situation[] = [
  {
    situation: "You're new to a large codebase and need to find where invoices get their tax rate.",
    options: [
      "Ask the assistant to find where it happens and explain it, citing files, then read those files yourself",
      "Ask the assistant to change the tax rate logic directly",
      "Never use the assistant for this; read the code from the top",
    ],
    best: 0,
    why: "Searching and explaining unfamiliar code is one of the best uses of an assistant. The citations let you verify the explanation against the real code, which is the step that makes it trustworthy. Changing logic you don't understand yet is the risky option.",
  },
  {
    situation: "The assistant's fix makes the failing test pass. Looking at the diff, it changed the expected value in the test.",
    options: ["Accept it: the tests are green", "Reject it and find out why the code returns the wrong value", "Delete the test, it was flaky anyway"],
    best: 1,
    why: "A test encodes a requirement. Changing the expectation to match the output proves nothing about whether the code is right. Sometimes the test really is wrong, but that is a decision you make deliberately, not one an assistant makes to get to green.",
  },
  {
    situation: "Production is failing. You have a stack trace that includes a database connection string with a password.",
    options: [
      "Paste the whole trace into whatever AI chat is open",
      "Remove the secret first and use a tool your company has approved; if a secret was already pasted, rotate it",
      "Don't use any AI tools during incidents",
    ],
    best: 1,
    why: "Anything pasted can leave your machine and may be stored. Strip credentials, tokens and customer data, and use approved tools. A secret that has been pasted, committed or logged is leaked: rotate it rather than just deleting the message.",
  },
  {
    situation: "You're preparing for a coding interview next week and practising a graph problem.",
    options: ["Have the assistant write the solution so you can read it", "Solve it yourself first, then ask the assistant to review or explain alternatives", "Skip practice; you'll have AI at work"],
    best: 1,
    why: "The struggle is the practice: interviews have no assistant, and reading a solution feels like understanding without building the skill. Afterwards, an assistant is a good reviewer: ask about edge cases, complexity and other approaches.",
  },
  {
    situation: "To fix a parsing bug the assistant suggests adding a package called fast-json-validatorz.",
    options: [
      "Install it, the assistant knows the ecosystem",
      "Check that the package exists, is the one you think, and is maintained, and whether an existing dependency already does this",
      "Copy the package's code into the repo instead",
    ],
    best: 1,
    why: "Models sometimes invent package names, and attackers register those names with malicious code. Every new dependency is supply-chain risk and maintenance cost; often the library you already use can do the job.",
  },
  {
    situation: "You've pasted the same error back to the assistant three times and got three different confident fixes, none of which work.",
    options: ["Try a fourth time with more exclamation marks", "Stop and debug it yourself: reproduce, read the error, form a hypothesis, test it", "Revert everything and rewrite the feature"],
    best: 1,
    why: "After two failed attempts the assistant is guessing. Debugging normally usually turns up the missing fact (a config value, a version, a wrong assumption) that you can then supply, or that makes the fix obvious.",
  },
  {
    situation: "You need fifteen nearly identical mapping methods between DTOs and entities.",
    options: ["Have the assistant generate them, then read the diff and run the tests", "Type all fifteen by hand to stay sharp", "Generate them and commit without reading, it's boilerplate"],
    best: 0,
    why: "Repetitive boilerplate is where assistants save the most time with the least risk, but boilerplate is also where a swapped field hides. Skim every mapping and let tests cover them.",
  },
  {
    situation: "You need to store user passwords.",
    options: [
      "Ask the assistant to write a password hashing function",
      "Use the framework's vetted implementation (for example ASP.NET Core Identity's PasswordHasher) and read up on why it works",
      "Encrypt the passwords with AES",
    ],
    best: 1,
    why: "Security-critical code is where you write, or choose, deliberately. Generated crypto code often looks right and is subtly weak. Passwords are hashed with a slow, salted algorithm, never encrypted; see the Security section's hashing lesson.",
  },
];

function Situations() {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const right = Object.entries(picks).filter(([i, p]) => SITUATIONS[Number(i)].best === p).length;
  return (
    <div className="crypto-section">
      <h3>Part 2: what would you do?</h3>
      <div className="ob-quiz">
        {SITUATIONS.map((s, i) => {
          const p = picks[i];
          return (
            <div key={i} className="ob-q">
              <strong>{s.situation}</strong>
              <div className="ae-options">
                {/* Rotate the order per situation so the recommended answer isn't always in the same place. */}
                {s.options.map((_, k) => (k + i) % s.options.length).map((j) => (
                  <button
                    key={j}
                    className={p === j ? (j === s.best ? "active" : "ai-wrong") : ""}
                    onClick={() => setPicks((prev) => ({ ...prev, [i]: j }))}
                  >
                    {s.options[j]}
                  </button>
                ))}
              </div>
              {p !== undefined && <span className={p === s.best ? "cache-small" : "constraint-fail"}>{p === s.best ? s.why : `Consider again. ${s.why}`}</span>}
            </div>
          );
        })}
      </div>
      <p className="gate-note">
        {right} of {Object.keys(picks).length} answered as recommended ({SITUATIONS.length} situations).
      </p>
    </div>
  );
}

export function AiAssistedEngineering() {
  return (
    <div className="tool-widget">
      <DiffReview />
      <Situations />
      <p className="gate-note">
        Related:{" "}
        <button className="link-button" onClick={() => openLesson("ai-using-llms")}>
          Using LLMs Well
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("ai-risks-limits")}>
          Risks and Limits
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("security-sql-injection")}>
          SQL Injection
        </button>{" "}
        ·{" "}
        <button className="link-button" onClick={() => openLesson("tdd-coverage")}>
          TDD, What to Test, Flaky Tests and Coverage
        </button>
      </p>
    </div>
  );
}

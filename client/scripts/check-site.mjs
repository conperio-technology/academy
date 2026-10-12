// End-to-end check of the built site served by a plain static file server under a subpath,
// in headless Chromium:
//
//   npm run build && node scripts/serve.mjs --port 5802      (serves dist/ at /academy/)
//   node scripts/check-site.mjs --base http://localhost:5802/academy/
//
// Checks: the lesson list loads and every request to the site stays under its base path; a
// tool lesson and a graded lesson open; a C# reference solution passes in the browser and is
// recorded; progress survives a reload; a pass after opening the reference counts as
// assisted, one without as independent; the review queue shows a lesson once it is due;
// export, reset all and import restore progress; a deep link survives a reload; without the
// C# runtime the page says C# can't be graded. Monaco comes from jsdelivr in the app; when
// that is blocked the local monaco-editor package (client/node_modules) is served in its
// place. Playwright is found via NODE_PATH (see playwright.mjs).
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { arg, findPackageDir, loadPlaywright } from "./playwright.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const base = arg("base", "http://localhost:5802/academy/").replace(/\/?$/, "/");
const failures = [];
const ok = (msg) => console.log(`ok   ${msg}`);
const fail = (msg) => {
  failures.push(msg);
  console.log(`FAIL ${msg}`);
};
const check = (cond, msg, detail = "") => (cond ? ok(msg) : fail(detail ? `${msg}: ${detail}` : msg));

const getJson = (path) => fetch(new URL(path, base)).then((r) => {
  if (!r.ok) throw new Error(`GET ${path}: ${r.status}`);
  return r.json();
});
const nav = await getJson("content/lessons.json");
const tool = nav.find((n) => n.kind === "tool");
// Graded lessons with a C# reference that offer the bare starter (not the language track).
const graded = [];
for (const n of nav.filter((n) => n.kind === "practice" && n.section === "Data Structures & Algorithms")) {
  const l = await getJson(`content/lessons/${n.id}.json`);
  if (l.referenceSolutions.csharp && l.cSharpCallTemplate) graded.push(l);
  if (graded.length === 2) break;
}
const [first, second] = graded;
console.log(`${nav.length} lessons in content/lessons.json; tool ${tool.id}, graded ${first.id} and ${second.id}`);

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const context = await browser.newContext({ acceptDownloads: true });
// Requests to the site's own origin outside its base path: a fetch with a leading "/" (which
// breaks under a subpath) or a call to a server that doesn't exist.
const basePath = new URL(base).pathname;
const strayRequests = [];
const watchStray = (r) => {
  const url = new URL(r.url());
  if (url.origin === new URL(base).origin && !url.pathname.startsWith(basePath)) strayRequests.push(r.url());
};
const failedRequests = [];
context.on("request", watchStray);
context.on("requestfailed", (r) => failedRequests.push(`${r.url()} (${r.failure()?.errorText})`));
context.on("response", (r) => {
  if (r.status() >= 400) failedRequests.push(`${r.url()} (${r.status()})`);
});
const monacoDir = findPackageDir("monaco-editor", "package.json") ?? join(here, "..", "node_modules", "monaco-editor");
await context.route(/https:\/\/cdn\.jsdelivr\.net\/npm\/monaco-editor@[^/]+\/min\/(.*)/, (route) => {
  const rel = route.request().url().match(/\/min\/([^?#]*)/)[1];
  try {
    const body = readFileSync(join(monacoDir, "min", rel));
    route.fulfill({ body, contentType: rel.endsWith(".css") ? "text/css" : "application/javascript" });
  } catch {
    route.fulfill({ status: 404, body: "" });
  }
});

const page = await context.newPage();
page.on("pageerror", (e) => fail(`page error: ${e.message}`));

// ---- helpers that run in the page ----
const idb = (op, rows) =>
  page.evaluate(
    ({ op, rows }) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("conperio-academy", 1);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("progress", op === "read" ? "readonly" : "readwrite");
          const store = tx.objectStore("progress");
          let result;
          if (op === "read") store.getAll().onsuccess = (e) => (result = e.target.result);
          else for (const r of rows) store.put(r);
          tx.oncomplete = () => {
            db.close();
            resolve(result);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { op, rows },
  );
const waitTitle = (t) => page.waitForFunction((t) => [...document.querySelectorAll(".main-content h1")].some((h) => h.textContent === t), t, { timeout: 30000 });
const open = async (id, t) => {
  await page.evaluate((id) => window.dispatchEvent(new CustomEvent("academy:open-lesson", { detail: id })), id);
  await waitTitle(t);
};
async function solveInCSharp(lesson) {
  // The runner's editor (not the reference solution's). @monaco-editor/react starts passing
  // edits to the runner's state a moment after the editor appears, so give it that moment.
  await page.locator(".code-runner-actions button:visible", { hasText: "Run Tests" }).waitFor({ timeout: 30000 });
  await page.waitForFunction(() => window.monaco?.editor.getEditors().length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate((code) => {
    const editor = window.monaco.editor
      .getEditors()
      .find((e) => e.getModel()?.getLanguageId() === "csharp" && !e.getContainerDomNode().closest(".reference-solution"));
    editor.setValue("");
    editor.setValue(code);
  }, lesson.referenceSolutions.csharp);
  await page.waitForTimeout(300);
  await page.locator(".code-runner-actions button:visible", { hasText: "Run Tests" }).click();
  const outcome = await Promise.race([
    page.locator(".all-passed").waitFor({ timeout: 240000 }).then(() => "passed"),
    page.locator(".compile-error, .test-result.fail").first().waitFor({ timeout: 240000 }).then(() => "failed"),
  ]);
  const where = await page.locator(".run-in-browser-metrics").textContent().catch(() => "");
  return { outcome, where };
}
const rowsFor = async (id) => (await idb("read")).filter((r) => r.conceptId === id);

// ---- 1. Lesson list ----
await page.goto(base);
await page.waitForFunction(() => document.querySelectorAll(".lesson-list .section-toggle").length > 3, null, { timeout: 30000 });
const dashboardText = await page.locator(".main-content").textContent();
check(dashboardText.includes(`of ${nav.filter((n) => n.kind === "practice").length} practice lessons`), "dashboard counts every graded lesson");
check(await page.locator(".progress-backup").isVisible(), "dashboard shows the progress export/import panel");
check(!(await page.locator(".sidebar").textContent()).includes("Couldn't load"), "no 'couldn't load the lesson list' error");

// ---- 2. A tool lesson and a graded lesson open ----
await open(tool.id, tool.title);
ok(`tool lesson opens (${tool.id})`);
check(page.url().endsWith(`#/${tool.id}`), "the open lesson is in the URL hash", page.url());
await open(first.id, first.title);
ok(`graded lesson opens (${first.id})`);

// ---- 3. C# reference solution passes in the browser, recorded; bare without reveal = independent ----
await page.evaluate(() => localStorage.setItem("exercise-mode", "bare"));
await page.reload();
await waitTitle(first.title);
const run1 = await solveInCSharp(first);
check(run1.outcome === "passed", `C# reference solution for ${first.id} passes`, run1.where);
check(/Ran in your browser/.test(run1.where ?? ""), "graded in the browser", run1.where);
let rows = await rowsFor(first.id);
check(rows.length === 1 && rows[0].completedAt && rows[0].attempts === 1, "the pass is recorded in IndexedDB", JSON.stringify(rows));
check(rows[0]?.independentPassedAt && !rows[0]?.assistedPassedAt, "a bare pass without the reference counts as independent", JSON.stringify(rows[0]));

// ---- 4. Survives a reload ----
await page.reload();
await waitTitle(first.title);
check(await page.locator(".reset-control").isVisible(), "after a reload the lesson still shows as completed");
const sidebarMark = await page.locator(".lesson-list-item", { hasText: first.title }).first().textContent();
check(sidebarMark.includes("✅"), "after a reload the sidebar marks it completed", sidebarMark);

// ---- 5. Reveal, then pass = assisted ----
await open(second.id, second.title);
await page.locator(".reference-solution button:visible", { hasText: "Show it anyway" }).click();
await page.waitForFunction(async (id) => {
  const rows = await new Promise((res) => {
    const r = indexedDB.open("conperio-academy", 1);
    r.onsuccess = () => {
      const q = r.result.transaction("progress").objectStore("progress").getAll();
      q.onsuccess = () => {
        res(q.result);
        r.result.close();
      };
    };
  });
  return rows.some((x) => x.conceptId === id && x.solutionRevealedAt);
}, second.id, { timeout: 10000 });
ok("opening the reference solution is recorded");
const run2 = await solveInCSharp(second);
check(run2.outcome === "passed", `C# reference solution for ${second.id} passes`);
rows = await rowsFor(second.id);
check(rows[0]?.assistedPassedAt && !rows[0]?.independentPassedAt, "reveal then a bare pass counts as assisted", JSON.stringify(rows[0]));

// ---- 6. Review queue: make the first lesson due two days ago ----
rows = await rowsFor(first.id);
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
await idb("write", rows.map((r) => ({ ...r, nextReviewAt: twoDaysAgo })));
await page.goto(base);
await page.locator(".review-panel").waitFor({ timeout: 15000 });
const reviewText = await page.locator(".review-panel").textContent();
check(reviewText.includes(first.title) && reviewText.includes("2 days overdue") && !reviewText.includes(second.title), "review queue lists the due lesson, 2 days overdue", reviewText);

// ---- 7. Export, reset all, import ----
const before = (await idb("read")).sort((a, b) => a.id - b.id);
const dir = mkdtempSync(join(tmpdir(), "academy-site-"));
try {
  const [download] = await Promise.all([page.waitForEvent("download"), page.locator("button", { hasText: "Export progress" }).click()]);
  const file = join(dir, "progress.json");
  await download.saveAs(file);
  const exported = JSON.parse(readFileSync(file, "utf8"));
  check(exported.format === "conperio-academy-progress" && exported.entries.length === before.length, `export has ${before.length} entries`, JSON.stringify(exported).slice(0, 200));
  check(exported.localStorage?.["exercise-mode"] === "bare", "export carries the app's browser storage too");

  await page.locator(".sidebar button", { hasText: "Reset all progress" }).click();
  await page.locator(".sidebar button", { hasText: "Yes, reset" }).click();
  await page.waitForFunction(() => !document.querySelector(".review-panel"));
  check((await idb("read")).length === 0, "reset all empties the store");
  check(!(await page.locator(".lesson-list").textContent()).includes("✅"), "reset all clears the sidebar marks");

  page.once("dialog", (d) => d.accept());
  await page.locator(".progress-backup input[type=file]").setInputFiles(file);
  await page.locator(".progress-backup", { hasText: "Imported" }).waitFor({ timeout: 10000 });
  const after = (await idb("read")).sort((a, b) => a.id - b.id);
  check(JSON.stringify(after) === JSON.stringify(before), "import restores every entry exactly");
  await page.locator(".review-panel").waitFor({ timeout: 10000 });
  ok("after import the review queue is back");
  check((await page.locator(".lesson-list").textContent()).includes("✅"), "after import the sidebar marks are back");
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// ---- 8. Deep link and refresh in a fresh tab ----
const deep = await context.newPage();
await deep.goto(`${base}#/${tool.id}`);
await deep.waitForFunction((t) => [...document.querySelectorAll(".main-content h1")].some((h) => h.textContent === t), tool.title, { timeout: 30000 });
await deep.reload();
await deep.waitForFunction((t) => [...document.querySelectorAll(".main-content h1")].some((h) => h.textContent === t), tool.title, { timeout: 30000 });
ok(`deep link ${base}#/${tool.id} opens the lesson, also after a reload`);
// Opening another lesson in the app adds a history entry; Back returns to the first.
await deep.evaluate((id) => window.dispatchEvent(new CustomEvent("academy:open-lesson", { detail: id })), first.id);
await deep.waitForFunction((t) => [...document.querySelectorAll(".main-content h1")].some((h) => h.textContent === t), first.title, { timeout: 30000 });
await deep.goBack();
await deep.waitForFunction((t) => [...document.querySelectorAll(".main-content h1")].some((h) => h.textContent === t), tool.title, { timeout: 30000 });
ok("Back returns to the previous lesson");

check(strayRequests.length === 0, `every request to the site stayed under ${basePath}`, strayRequests.slice(0, 5).join(", "));
// jsdelivr (Monaco, Pyodide, sql.js) is the CDN the app always uses; a stand-in copy of
// Monaco may be a different version, so its misses say nothing about the site.
const unexpected = failedRequests.filter((u) => !u.startsWith("https://cdn.jsdelivr.net/"));
check(unexpected.length === 0, "no failed requests to the site itself", unexpected.slice(0, 5).join(", "));

// ---- 9. Without the C# runtime: a clear message ----
const bare = await browser.newContext();
await bare.route(/\/csharp-wasm\//, (route) => route.fulfill({ status: 404, body: "" }));
bare.on("request", watchStray);
const noWasm = await bare.newPage();
await noWasm.goto(`${base}#/${first.id}`);
await noWasm.locator(".run-in-browser-status", { hasText: "can't be graded" }).waitFor({ timeout: 30000 });
await noWasm.locator(".code-runner-actions button:visible", { hasText: "Run Tests" }).click();
await noWasm.locator(".compile-error").waitFor({ timeout: 30000 });
const message = await noWasm.locator(".compile-error").textContent();
check(message.includes("can't be graded") && !(await noWasm.locator(".all-passed").count()), "without the C# runtime a run says C# can't be graded here", message);
await bare.close();

check(strayRequests.length === 0, `still every request stayed under ${basePath}`, strayRequests.slice(0, 5).join(", "));
await browser.close();
console.log(failures.length ? `\n${failures.length} check(s) failed` : "\nAll site checks passed");
process.exit(failures.length ? 1 : 0);

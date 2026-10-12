// Runs every graded exercise's reference solution (content/Solutions/<id>.csx and .py)
// through the same grader a learner's code goes through, and checks each exercise's
// "Name the complexity" answers are selectable in the client.
//
//   node scripts/verify-solutions.mjs --base http://localhost:5802/academy/ [--only id1,id2]
//       [--lang csharp,python]
//
// Needs a served build of the site (npm run build, then scripts/serve.mjs; ../scripts/verify.sh
// does both), because both languages are graded by the built client's own workers in headless
// Chromium via Playwright:
//   - C# goes through csharpWasmWorker (Roslyn on .NET WebAssembly, built by
//     wasm-csharp/build.sh) with the same timeouts as csharpWasmRunner.ts. It also checks that
//     code breaking CodePolicy is rejected with the policy's message, and that an infinite loop
//     times out and the next run works in a fresh worker;
//   - Python goes through pythonWorker (Pyodide, loaded from jsdelivr), exactly as
//     PythonRunner.tsx does it.
// Pyodide isn't a dependency of the repo (the client loads it from a CDN); a local copy can
// stand in for the CDN, see below. Playwright is found via NODE_PATH (see playwright.mjs).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { jsonEquals } from "../src/jsonEquals.ts";
import { arg, findPackageDir, loadPlaywright } from "./playwright.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const base = arg("base", "http://localhost:5802/academy/").replace(/\/?$/, "/");
const at = (path) => new URL(path, base).href;
const only = arg("only", "")?.split(",").filter(Boolean) ?? [];
const langs = arg("lang", "csharp,python").split(",");
if (langs.includes("csharp") && !existsSync(join(here, "..", "dist", "csharp-wasm", "_framework", "dotnet.js"))) {
  throw new Error("client/dist has no csharp-wasm runtime, so C# can't be graded: run ../wasm-csharp/build.sh, then npm run build");
}
const PY_TIMEOUT_MS = Number(arg("py-timeout", "5000")); // PythonRunner.tsx's TEST_TIMEOUT_MS

// The answers the client's dropdown offers (components/ComplexityCheck.tsx).
const complexitySource = readFileSync(join(here, "..", "src", "components", "ComplexityCheck.tsx"), "utf8");
const optionsBlock = complexitySource.match(/const OPTIONS = \[([\s\S]*?)\];/)?.[1] ?? "";
const OPTIONS = new Set([...optionsBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]));

async function getJson(path) {
  const res = await fetch(at(path));
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  return res.json();
}

const failures = [];
const warnings = [];
const counts = { csharp: { pass: 0, fail: 0 }, python: { pass: 0, fail: 0 } };

const nav = await getJson("content/lessons.json");
const ids = nav.filter((n) => n.kind === "practice" && (only.length === 0 || only.includes(n.id))).map((n) => n.id);
const lessons = [];
for (const id of ids) lessons.push(await getJson(`content/lessons/${id}.json`));
for (const id of only) if (!ids.includes(id)) failures.push(`${id}: no graded exercise with this id`);
console.log(`${lessons.length} graded exercises, ${OPTIONS.size} complexity options in the client`);

// ---- Metadata: complexity entry and solutions for every offered language ----
for (const l of lessons) {
  if (!l.complexity) warnings.push(`${l.id}: no ComplexityCatalog entry`);
  else {
    const answers = [l.complexity.time, l.complexity.space, ...(l.complexity.alsoTime ?? []), ...(l.complexity.alsoSpace ?? [])];
    for (const a of answers) if (!OPTIONS.has(a)) failures.push(`${l.id}: complexity "${a}" is not in ComplexityCheck OPTIONS`);
  }
  for (const lang of Object.keys(l.functionNames)) {
    if (!l.referenceSolutions[lang]) warnings.push(`${l.id}: no ${lang} reference solution`);
  }
}

async function builtClientPage() {
  const html = await fetch(base).then((r) => r.text());
  if (!html.includes('id="root"')) throw new Error(`${base} is not serving the built client (npm run build, then node scripts/serve.mjs)`);
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const context = await browser.newContext();
  return { browser, context };
}

// The hashed name of one of the built client's worker chunks, from the build being served.
function workerChunk(prefix) {
  const file = readdirSync(join(here, "..", "dist", "assets")).find((f) => f.startsWith(`${prefix}-`) && f.endsWith(".js"));
  if (!file) throw new Error(`No ${prefix} chunk in client/dist/assets; run npm run build first`);
  return at(`assets/${file}`);
}

// ---- C#: the built client's csharpWasmWorker in headless Chromium ----
const csLessons = lessons.filter((l) => l.referenceSolutions.csharp && l.cSharpCallTemplate);
for (const l of lessons) if (l.referenceSolutions.csharp && !l.cSharpCallTemplate) failures.push(`${l.id} [C#]: a C# reference solution but no C# call template`);
if (langs.includes("csharp") && csLessons.length) {
  const { browser, context } = await builtClientPage();
  const page = await context.newPage();
  await page.goto(base);
  // Mirrors runInWorker() in csharpWasmRunner.ts: one shared worker that warms up first,
  // 60 s to compile, 5 s per test, and a fresh worker after a timeout or crash.
  await page.evaluate(({ workerUrl }) => {
    let worker = null;
    window.__csharpLoadMs = null;
    window.__runCSharp = (request) =>
      new Promise((resolve) => {
        if (!worker) {
          worker = new Worker(workerUrl, { type: "module" });
          worker.postMessage({ type: "warm" });
        }
        const w = worker;
        const outputs = [];
        let compileError = null;
        let compileMs = null;
        let timer;
        const finish = (kill) => {
          clearTimeout(timer);
          w.onmessage = w.onerror = null;
          if (kill) {
            w.terminate();
            if (worker === w) worker = null;
          }
        };
        const arm = (ms, what) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            finish(true);
            outputs.push({ actualJson: null, error: `Timed out ${what}` });
            resolve({ outputs, compileError, compileMs, timedOut: true });
          }, ms);
        };
        w.onerror = (e) => {
          finish(true);
          resolve({ outputs, fatal: e.message || "worker failed to start" });
        };
        w.onmessage = (e) => {
          const m = e.data;
          if (m.type === "loaded") window.__csharpLoadMs = m.loadMs;
          else if (m.type === "unavailable") {
            finish(true);
            resolve({ outputs, fatal: m.error });
          } else if (m.type === "ready") arm(60000, "compiling");
          else if (m.type === "compiled") {
            compileMs = m.compileMs;
            if (m.compileError !== null) {
              compileError = m.compileError;
              finish(false);
              resolve({ outputs, compileError, compileMs });
            } else arm(5000, "(infinite loop?)");
          } else if (m.type === "result") {
            outputs.push(m);
            arm(5000, "(infinite loop?)");
          } else if (m.type === "done") {
            finish(false);
            resolve({ outputs, compileError, compileMs });
          } else if (m.type === "failed") {
            finish(true);
            resolve({ outputs, fatal: m.error });
          }
        };
        w.postMessage({ type: "run", ...request });
      });
  }, { workerUrl: workerChunk("csharpWasmWorker") });

  const csRequest = (l, code) => ({
    code: (l.cSharpHarnessPreamble ? l.cSharpHarnessPreamble + "\n" : "") + code,
    calls: l.testCases.map((t) => l.cSharpCallTemplate.replace("{input}", t.inputDisplay)),
  });
  const compileTimes = [];
  const started = Date.now();
  for (const l of csLessons) {
    const { outputs, fatal, compileError, compileMs } = await page.evaluate((req) => window.__runCSharp(req), csRequest(l, l.referenceSolutions.csharp));
    if (compileMs != null) compileTimes.push(compileMs);
    const bad = l.testCases
      .map((t, i) => ({ t, o: outputs[i] }))
      .filter(({ t, o }) => !(o?.actualJson != null && jsonEquals(o.actualJson, t.expectedJson)));
    if (fatal || compileError || bad.length) {
      counts.csharp.fail++;
      failures.push(`${l.id} [C#]: ${fatal ?? compileError ?? bad.slice(0, 2).map(({ t, o }) => `${t.inputDisplay} -> ${o?.actualJson ?? o?.error ?? "skipped"}, want ${t.expectedJson}`).join("; ")}`);
      process.stdout.write("x");
    } else {
      counts.csharp.pass++;
      process.stdout.write(".");
    }
  }
  const sorted = [...compileTimes].sort((a, b) => a - b);
  const loadMs = await page.evaluate(() => window.__csharpLoadMs);
  console.log(`\nC#: ${counts.csharp.pass} passed, ${counts.csharp.fail} failed in ${((Date.now() - started) / 1000).toFixed(1)} s` +
    ` (runtime load ${Math.round(loadMs ?? 0)} ms, compile median ${Math.round(sorted[sorted.length >> 1] ?? 0)} ms, max ${Math.round(sorted.at(-1) ?? 0)} ms)`);

  // Negative checks on the first lesson: CodePolicy rejects code that touches the file
  // system with its own message, and a runaway loop is stopped without breaking the next run.
  const probe = csLessons[0];
  const banned = `${probe.referenceSolutions.csharp}\nstatic string Leak() { System.IO.File.WriteAllText("x.txt", "hi"); return ""; }\n`;
  const rejected = await page.evaluate((req) => window.__runCSharp(req), csRequest(probe, banned));
  // CodePolicy's message for a blocked type, plus where it was found.
  const wantPolicy = "'System.IO.File' isn't available in lessons -- stick to collections, LINQ, strings, and math.";
  if (!rejected.compileError?.startsWith(wantPolicy)) {
    failures.push(`[C#] CodePolicy: System.IO.File was not rejected as expected (got ${JSON.stringify(rejected).slice(0, 200)})`);
  } else {
    console.log(`CodePolicy: rejected: ${rejected.compileError}`);
  }
  const loop = `${probe.referenceSolutions.csharp}\nstatic int Spin() { while (true) { } }\nint _spin = Spin();\n`;
  const loopStart = Date.now();
  const looped = await page.evaluate((req) => window.__runCSharp(req), csRequest(probe, loop));
  const loopMs = Date.now() - loopStart;
  const after = await page.evaluate((req) => window.__runCSharp(req), csRequest(probe, probe.referenceSolutions.csharp));
  const afterOk = !after.fatal && probe.testCases.every((t, i) => after.outputs[i]?.actualJson != null && jsonEquals(after.outputs[i].actualJson, t.expectedJson));
  if (!looped.timedOut) failures.push(`[C#] infinite loop was not stopped: ${JSON.stringify(looped).slice(0, 200)}`);
  else if (!afterOk) failures.push(`[C#] the run after a timeout failed: ${JSON.stringify(after).slice(0, 200)}`);
  else console.log(`Infinite loop in the browser: stopped after ${(loopMs / 1000).toFixed(1)} s; the next run passed in a fresh worker`);
  await browser.close();
}

// ---- Python: the built client's worker in headless Chromium ----
const pyLessons = lessons.filter((l) => l.referenceSolutions.python && l.functionNames.python);
if (langs.includes("python") && pyLessons.length) {
  const { browser, context } = await builtClientPage();
  // Pyodide normally comes from jsdelivr (see src/pyodideLoader.ts). Where that's blocked,
  // install the same version outside the repo (npm install --prefix <dir> pyodide@<version>)
  // and put <dir>/node_modules on NODE_PATH: the CDN requests are then answered from it.
  const pyVersion = readFileSync(join(here, "..", "src", "pyodideLoader.ts"), "utf8").match(/PYODIDE_VERSION = "([^"]+)"/)?.[1];
  const localPyodide = findPackageDir("pyodide", "pyodide.mjs");
  if (localPyodide) {
    const localVersion = JSON.parse(readFileSync(join(localPyodide, "package.json"), "utf8")).version;
    if (localVersion === pyVersion) {
      console.log(`Serving Pyodide ${pyVersion} from ${localPyodide}`);
      await context.route(`https://cdn.jsdelivr.net/npm/pyodide@${pyVersion}/**`, (route) => {
        const file = new URL(route.request().url()).pathname.split("/").pop();
        route.fulfill({ path: join(localPyodide, file) }).catch(() => route.abort());
      });
    } else {
      console.log(`Ignoring local Pyodide ${localVersion} (the client loads ${pyVersion})`);
    }
  }
  const page = await context.newPage();
  await page.goto(base);
  // Mirrors runInWorker() in PythonRunner.tsx: one shared worker, a per-call timeout that
  // starts once the runtime is loaded, and a fresh worker after a timeout.
  await page.evaluate(({ workerUrl, timeoutMs }) => {
    let worker = null;
    window.__runPython = (request) =>
      new Promise((resolve) => {
        worker ??= new Worker(workerUrl, { type: "module" });
        const w = worker;
        const outputs = [];
        let timer;
        const finish = (kill) => {
          clearTimeout(timer);
          w.onmessage = w.onerror = null;
          if (kill) {
            w.terminate();
            if (worker === w) worker = null;
          }
        };
        const arm = () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            finish(true);
            outputs.push({ actualJson: null, error: "Timed out" });
            resolve({ outputs });
          }, timeoutMs);
        };
        w.onerror = (e) => {
          finish(true);
          resolve({ outputs, fatal: e.message || "worker failed to start" });
        };
        w.onmessage = (e) => {
          const m = e.data;
          if (m.type === "ready") arm();
          else if (m.type === "result") {
            outputs.push(m);
            arm();
          } else if (m.type === "done") {
            finish(false);
            resolve({ outputs });
          } else {
            finish(true);
            resolve({ outputs, fatal: m.error });
          }
        };
        w.postMessage(request);
      });
  }, { workerUrl: workerChunk("pythonWorker"), timeoutMs: PY_TIMEOUT_MS });

  for (const l of pyLessons) {
    const preamble = l.pythonHarnessPreamble ? l.pythonHarnessPreamble + "\n" : "";
    const template = l.pythonCallTemplate ?? "{input}";
    const calls = l.testCases.map((t) => template.replace("{input}", t.inputDisplay));
    const { outputs, fatal } = await page.evaluate((req) => window.__runPython(req), { preamble, code: l.referenceSolutions.python, calls });
    const bad = l.testCases
      .map((t, i) => ({ t, o: outputs[i] }))
      .filter(({ t, o }) => !(o?.actualJson != null && jsonEquals(o.actualJson, t.expectedJson)));
    if (fatal || bad.length) {
      counts.python.fail++;
      failures.push(`${l.id} [Python]: ${fatal ?? bad.slice(0, 2).map(({ t, o }) => `${t.inputDisplay} -> ${o?.actualJson ?? o?.error ?? "skipped"}, want ${t.expectedJson}`).join("; ")}`);
      process.stdout.write("x");
    } else {
      counts.python.pass++;
      process.stdout.write(".");
    }
  }
  console.log(`\nPython: ${counts.python.pass} passed, ${counts.python.fail} failed`);
  await browser.close();
}

if (warnings.length) console.log(`\n${warnings.length} warning(s):\n${warnings.join("\n")}`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("\nAll reference solutions pass.");

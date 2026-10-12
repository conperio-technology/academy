# In-browser C# prototype: results

*A historical record. The prototype measured here became the default C# grader
(docs/adr/0012), and later the only one when the server, its runner and the "Run on server"
fallback were removed (docs/adr/0013). See [README.md](README.md) for how it works today. The
numbers and file paths below are from the prototype and refer to the retired server.*

**Verdict: it works.** On a fast connection the first run costs about 2 s, and every
run after that takes about 0.2 s. The server path takes 1.7 to 2.0 s on every run.
Results matched the server exactly in every case tested. All **147/147** C# reference
solutions also pass in the browser runtime unchanged.

**Recommendation:** move C# grading to the browser and keep the server runner as a
fallback during the switch. Details are under "Recommendation" at the end.

Branch: `csharp-wasm-prototype`. How it's built and wired: [README.md](README.md).

## Setup measured

- .NET SDK 10.0.112 (Ubuntu build). The `wasm-tools` workload was **not installed and not
  needed**: plain `Microsoft.NET.Sdk.WebAssembly`, Mono interpreter (with the default
  jiterpreter), no AOT, trimmed publish. Roslyn is `Microsoft.CodeAnalysis.CSharp` 5.9.0,
  the same version the server runner uses.
- Headless Chromium (Playwright 1.56.1) on a 4-vCPU Xeon 2.1 GHz VM with 15 GB RAM. The
  API ran on the same machine, so server numbers include no network latency.
- Lesson: `hashmap-two-sum` (4 tests), opened by dispatching `academy:open-lesson`.
- Production-like hosting: the built `client/dist` was served by a small static server
  that sends the precompressed `.br` files, and `/api` was proxied to the API.
  Throttling used CDP `Network.emulateNetworkConditions` (40 ms RTT). Every cold run
  started with an empty cache.
- jsDelivr is blocked in this sandbox, so the measurement script served Monaco from
  `node_modules`. That affects only the editor, not the C# runtime.

## Numbers

### Download

| | Bytes |
| --- | --- |
| Uncompressed (what `build.sh` copies; 54 files) | **18.6 MB** |
| Brotli (measured on the wire) | **5.44 MB** |
| Gzip | 6.70 MB |

The largest brotli files: `Microsoft.CodeAnalysis.CSharp` 1.60 MB, `System.Private.CoreLib`
1.20 MB (rooted, untrimmed), `dotnet.native.wasm` 0.98 MB, `Microsoft.CodeAnalysis`
0.40 MB, `System.Private.Xml` 0.20 MB (pulled in by Roslyn), `System.Text.Json` 0.19 MB.

For comparison, the Python path downloads Pyodide from a CDN, which is roughly 10 MB.

### Time

All times are in milliseconds. A "cold" run is the first run in a fresh tab: worker
start, runtime download and start, first compile, then 4 tests. A "warm" run is any
later run in the same tab.

| | Unthrottled (localhost) | 50 Mbps | 10 Mbps |
| --- | --- | --- | --- |
| Runtime load to ready (download + start) | 450–660 | 1,219 | 4,736 |
| First compile (cold Roslyn, interpreted) | 1,430–1,540 | 1,533 | 1,445 |
| Tests (4 tests, first one includes first-call JIT warm-up) | 10–12 / ~1 / ~1 / ~1 | same | same |
| **Cold click to results (wall)** | **~2,000–2,300** | **2,894** | **6,328** |
| Warm compile | 100–220 (median ~110) | | |
| Warm run, all 4 tests | ~3–5 | | |
| **Warm click to results (wall)** | **~150–260** | | |
| Server `/api/execute/csharp`, every run | **1,620–2,100** | | |

Across all 147 lessons in one runtime, compile times were: first 2,196 ms, median
109 ms, p90 193 ms, max 2,196 ms (the first one).

CPU-heavy code ran at about 30 ms per test. The test body was 5 million loop iterations
plus 200,000 dictionary inserts, run under the Mono interpreter with the jiterpreter. On
the server, the same code was lost in the ~1.9 s fixed cost of each run. Code that needs
seconds of CPU will be several times slower in the browser than on the server. None of
the current lessons comes close.

### Memory (inside the worker, after a run)

- WebAssembly linear memory: **83.7 MB** (the whole runtime plus Roslyn; it didn't grow
  over repeated runs).
- Managed heap (`GC.GetTotalMemory`): **6.8 MB**.

## Correctness: browser vs server

The same code went through both paths for `hashmap-two-sum`. Results are listed per
test.

| Case | Browser | Server | Match |
| --- | --- | --- | --- |
| Reference solution (`Solutions/hashmap-two-sum.csx`) | 4/4 pass | 4/4 pass | yes |
| Wrong solution (pairs an element with itself) | pass, `[0,0]`, `[0,0]`, `[1,1]` | same | yes |
| Throws on some inputs | pass, error `boom 3`, error `boom 2`, pass | same | yes |
| Static counter (are statics fresh per test?) | `[1,1]` ×4 | `[1,1]` ×4 | yes |
| Compile error | `(5,21): error CS1061: 'int[]' does not contain…` | identical text | yes |
| `System.IO.File.WriteAllText` | `'System.IO.File' isn't available in lessons… (line 5)` | identical | yes |
| `new System.Threading.Thread(...)` | `'System.Threading.Thread' isn't available…` | identical | yes |
| `typeof(string).GetMethods()` | `'System.Type' isn't available…` | identical | yes |
| `while (true) {}` | "Timed out (infinite loop?)", then 3× "Skipped" after **~5.1 s** | same messages after **~20 s** (the server gives the first test 20 s) | yes |
| Recursion 10 million deep | "The run crashed (very deep recursion…)", then 3× "Skipped" | same | yes |
| Next run after a timeout or crash | works (fresh worker, cold load ~1.8–1.9 s) | n/a | — |

Wider checks:

- **All 147 C# lessons**: every reference solution, with its preamble and call template
  from the lesson API, was compiled and run in the browser runtime. 147/147 matched the
  expected JSON.
- A feature check also passed in the browser, and the same code compiles on the server.
  It covered records with `with`, tuples and deconstruction, switch expressions,
  `PriorityQueue`, `SortedDictionary`, `LinkedList`, `HashSet`, `BigInteger`, `Regex`,
  `StringBuilder`, `stackalloc`/`Span`, LINQ `GroupBy`, interpolation formats, and
  serializing anonymous objects.

### Layout

The toggle sits in the existing actions row, which now wraps. At **390 px** and
**1300 px**, `scrollWidth == clientWidth`, so there's no horizontal page overflow. At
390 px the toggle sits next to "Run Tests" and the metrics line wraps under it.

## What worked

- No workload needed. The plain WebAssembly SDK in the .NET 10 SDK publishes fine.
- Roslyn is trimmed, and it still compiled everything we tried.
- `CodePolicy.cs` is linked from `runner/` and runs unchanged on the browser
  compilation, so both paths give the same rejection messages from the same source file.
- Compile metadata comes from `Assembly.TryGetRawMetadata` on the loaded BCL
  assemblies. That works on Mono/wasm, so there's no separate reference-assembly
  download. The webcil format doesn't matter either, because nothing is read from files.
- Timeout and crash handling copy the Python runner: terminate the worker and start a
  fresh one on the next run.

## What didn't work at first (all fixed)

1. **The runtime hung in the worker.** `dotnet.js` treats any worker as one of its own
   multithreading helper threads and waits forever. Setting
   `self.dotnetSidecar = true` before the import fixes it.
2. **Trimming removed metadata that reflection needed.** Our own assembly is now rooted,
   and the BCL assemblies learner code compiles against are rooted too.
3. **Exception messages showed as resource keys** (`Arg_NullReferenceException`).
   Fixed with `UseSystemResourceKeys=false`.
4. **The script class name.** `CreateScriptCompilation` defaults to `Script`; it's set to
   `Submission#0`, which is what scripting (the server) uses.

## Caveats

- **First run costs a download.** Expect ~1 s of extra load at 50 Mbps and ~4.7 s at
  10 Mbps, with brotli. Without brotli it's 3.4× more (18.6 MB). File names are
  fingerprinted, so they can be cached as immutable, and repeat visits skip the download.
  Two things are needed:
  - Real static hosting, or `MapStaticAssets`, that serves the `.br` files. Today's
    `UseStaticFiles` doesn't.
  - Fetching the runtime when a C# lesson opens rather than on the first click. That
    hides most of the cost.
- **Each timeout or crash means another cold start** (~2 s; the files come from the HTTP
  cache).
- **The grade is client-side and can be faked**, the same as Python today. Fine for an
  internal learning app, but the server no longer sees a run, only the pass/fail the
  client reports.
- **CodePolicy in the browser is only a learning guardrail.** The code runs in the
  learner's own tab, so there's no host to protect. That's a security improvement over
  running untrusted code on the server.
- **A stack overflow dumps a long stack trace** into the browser console. It's harmless
  but noisy.
- **CPU-bound code runs slower** than on the server (interpreter). This doesn't matter
  for the current lessons.
- **The Docker image doesn't build the runtime yet.** It would need a .NET publish
  step for `wasm-csharp/` before `npm run build` (or a build stage that copies into
  `client/public/csharp-wasm`).

## Recommendation

Move all C# to the browser. Keep the server runner as a fallback, with the toggle
reversed, for one release.

- **Speed:** warm runs are ~8–10× faster (~0.2 s against ~1.8 s).
- **Correctness:** identical in every case tested, and all 147 reference solutions pass.
- **Operations:** C# execution leaves the server entirely. No runner processes, memory
  caps or concurrency slots, and no untrusted code on the host.
- **Cost:** a one-time ~5.4 MB brotli download (comparable to Pyodide), plus ~1.5 s for
  the first compile in a tab.

### Rough effort

**Browser C# as the default for all ~147 exercises: about 2–4 days.** The runner is
already generic: it takes the same preamble, call template and test cases as the server.

- Remove the `BROWSER_CSHARP_LESSONS` allowlist and flip the default.
- Prefetch and start the runtime when a C# lesson opens.
- Serve brotli with long cache headers (`MapStaticAssets` or a static host).
- Add the .NET publish step to the Dockerfile/CI.
- Add a bulk parity script that runs reference and wrong solutions for every lesson
  through both paths, extending the 147/147 check done here.
- Polish the cold-load message.

**Turning the app into a static site: an additional ~1–2 weeks.** This is separate
work, and the runner isn't what blocks it.

- **Lesson content.** It lives in C# classes (`ConceptRegistry`, `BuildVisualizationSteps`)
  and would be exported to JSON at build time.
- **Progress.** Spaced repetition and per-user progress use SQLite plus the Entra identity
  header. They would need either browser storage, which loses cross-device progress and
  the identity, or a small API kept just for progress.

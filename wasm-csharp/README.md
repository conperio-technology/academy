# wasm-csharp: grading C# in the browser

Compiles and runs learner C# **in the browser**: Roslyn (`Microsoft.CodeAnalysis.CSharp`)
on the .NET WebAssembly runtime (Mono, interpreted, no AOT), inside a Web Worker. Learner
code is compiled as a C# script (fixed imports, `return JsonSerializer.Serialize(call)` per
test), checked against `CodePolicy.cs` before anything runs, then run one test at a time.

This is the only C# grader: the site has no server (docs/adr/0013). When the runtime can't
be used (the bundle was never built, the browser has no WebAssembly or Web Workers, the
worker fails to start, or the runtime takes over 2 min to load) the exercise page says C#
can't be graded here; Python still works. The worker finds the runtime under the site's
base path, so it also loads when the site lives under a subpath such as `/academy/`.
How browser grading was chosen: [PROTOTYPE-RESULTS.md](PROTOTYPE-RESULTS.md) (a historical
measurement against the retired server runner) and docs/adr/0012.

## The safety rules: CodePolicy.cs

`CodePolicy.cs` is the allowlist. Only these namespaces: `System`, `System.Collections`,
`System.Collections.Generic`, `System.Linq`, `System.Numerics`, `System.Text`,
`System.Text.Json`, `System.Text.RegularExpressions` (child namespaces are not included).
Blocked inside them: `Activator`, `AppContext`, `AppDomain`, `Console`, `Environment`, `GC`,
`Type`. Also rejected: `#r`/`#load`, `dynamic`. `Check` gives the first violation, the
message a run reports; `FindViolations` gives every violation with its location, for the
editor's live squiggles; `IsAllowed`/`IsAllowedNamespace` let autocomplete offer only what
`Check` accepts.

Consequences for content: graded exercises can't use `System.Threading`,
`System.Threading.Tasks` (no async/await, Task, Parallel), `System.Collections.Concurrent`,
`System.Reflection`, `System.IO`, or `Console.WriteLine`. Those topics are taught in tool
lessons, not graded. Exercises return a value; they don't print.

CodePolicy is a learning guardrail, not a security boundary: the code runs in the learner's
own tab. Changing the allowlist still changes what every exercise may use: say so explicitly
in the PR, rebuild with `build.sh`, and run `scripts/verify.sh`.

`RunnerProtocol.cs` holds the result record sent back to the page (`RunLine`) and
`RunnerLimits.MaxResultChars`. (Both files came from the retired `runner/` project; the
`DsaAcademy.Runner` namespace is kept from there.)

## Build

```sh
./wasm-csharp/build.sh              # or, from client/: npm run build:csharp-wasm
cd client && npm run build          # copies public/csharp-wasm into dist/
```

`build.sh` publishes the project (Release, trimmed) and copies the runtime into
`client/public/csharp-wasm/_framework/` (18.6 MB in 54 files), and the runtime's licence and
third-party notices next to it (`csharp-wasm/dotnet-LICENSE.TXT`,
`dotnet-THIRD-PARTY-NOTICES.TXT`; see `THIRD_PARTY_NOTICES.md` at the repo root). Vite serves
that folder in dev and copies it into `dist/` on `npm run build`. The output is gitignored.
`build.sh` skips the ~1 minute publish when its inputs (`Program.cs`, the `.csproj`,
`CodePolicy.cs`, `RunnerProtocol.cs`) are older than the output; `FORCE=1` rebuilds anyway.

Requires only the .NET 10 SDK; the `wasm-tools` workload is **not** needed (it's only for
AOT/native relinking). `scripts/verify.sh` runs `build.sh` before the client build
(`SKIP_WASM=1` skips it).

## Serving and caching

- File names are fingerprinted (`System.Linq.<hash>.wasm`) except `dotnet.js`, which
  holds the list of the others with their hashes.
- The worker starts the runtime with `disableNoCacheFetch`, so the loader lets the HTTP
  cache answer instead of revalidating every file.
- Static hosts serve the plain files; GitHub Pages compresses them in transit (about 5.5 MB
  with brotli, a little more with gzip).

## When it loads

Opening any C# exercise starts the worker in the background (`warmCSharpRuntime`): it
loads the runtime, then compiles a small snippet so Roslyn's first, slow compile is out of
the way. "Loading the C# compiler…" shows next to "Run Tests" meanwhile. A run clicked
before that finishes simply waits for it ("Loading C# compiler (first run only)…").

## Limits

| | |
| --- | --- |
| Per test | 5 s, then the worker is terminated and a fresh one starts loading |
| Compile | 60 s |
| Result size | `RunnerLimits.MaxResultChars` (64K characters) |
| Code length | 20,000 characters |
| Memory | no cap of our own: the WebAssembly heap grows to the browser's limit, then the test fails with "Out of memory" (tried with a loop allocating 40 MB arrays; the next run is fine) |
| Deep recursion | crashes the worker: "The run crashed (very deep recursion...)" |

After a timeout the test shows "Timed out after 5 s (infinite loop?)", the remaining
tests "Skipped", and the line under the buttons says the C# runtime was restarted. The
next run uses the new worker (about 2 s to start, from the HTTP cache).

The grade is computed in the browser and recorded in the browser's progress
(`client/src/api.ts` `recordProgress`), exactly like Python.

## Autocomplete

The C# editors get completions from the same Roslyn (`Runner.Complete` in `Program.cs`,
`client/src/csharpCompletion.ts`): after `expr.` the members of `expr`'s type including
LINQ and other extension methods (static members after a type name, child namespaces after
a namespace), otherwise every symbol in scope plus C# keywords. The lesson's hidden
preamble is included, so helper types like `ListNode` complete too. Anything
`CodePolicy` would reject (`Console`, `File`, `Thread`, `Type`, ...) is left out. It uses
the semantic model's `LookupSymbols`, not `Microsoft.CodeAnalysis.Features`, so it added
about 12 KB (7 KB brotli) to the bundle. There's no signature help, no snippets and no
ranking beyond alphabetical; without the bundle, Monaco keeps its word-based suggestions.

## Live error squiggles

While the learner types, the C# editor underlines what a run would reject
(`Runner.Diagnose` in `Program.cs`, `client/src/csharpDiagnostics.ts`). 600 ms after the
last keystroke the worker builds the same script a run compiles (lesson preamble, learner
code, then one lambda per test call) and returns its compile errors and warnings plus every
`CodePolicy` violation (`CodePolicy.FindViolations`, the same rules `Check` applies; the
innermost node per line, so `File.ReadAllText` is marked once, on `File`). Nothing is
emitted or run. Offsets are into the learner's code, so markers land on their lines; an
error in the hidden preamble goes on the first line, and one in the appended test calls (a
renamed method, a missing brace) on the last, with a note saying so. CS8632 (a `?`
annotation outside a nullable context) is left out: scripts compile with nullable off, and
lesson starters use `Node?`.

It only runs while the runtime is warm; without the bundle it does nothing and clears the
markers. Each editor has at most one check in flight, edits made meanwhile are checked when
it returns (the stale answer is dropped), and no check is sent while a run is in progress,
so a run waits at most for the one check already compiling. A check takes about 60 to
450 ms in headless Chromium (median 80 to 250 ms across eight lessons, more with a large
preamble such as the linked list harnesses), so squiggles appear about 0.7 to 1.3 s after
typing stops.

## How it fits together

| Piece | Role |
| --- | --- |
| `Program.cs` | `[JSExport]` `Compile(code, calls)` / `RunTest(i)` / `Complete(code, position)` / `Diagnose(prefix, code, calls)` / `ManagedHeapBytes()` |
| `CodePolicy.cs` | The allowlist (above) |
| `RunnerProtocol.cs` | `RunLine` (one result) and `RunnerLimits` |
| `CSharpWasm.csproj` | WebAssembly SDK; roots the BCL assemblies learner code may use (see below) |
| `client/src/csharpWasmWorker.ts` | Loads `dotnet.js` in a worker; handles `warm`, `run`, `complete` and `diagnose` one at a time |
| `client/src/csharpWasmRunner.ts` | Page side: status for the loading indicator, timeouts (terminates the worker), result shaping, the unavailable signal |
| `client/src/csharpCompletion.ts` | The Monaco completion provider |
| `client/src/csharpDiagnostics.ts` | Debounced live diagnostics as Monaco markers |
| `client/src/components/CSharpRunner.tsx` | The C# editor, Run Tests, results, and the "can't be graded here" message |

Details worth knowing:

- **Reference metadata** comes from the assemblies already loaded in the runtime
  (`Assembly.TryGetRawMetadata`), so there's no separate reference-assembly download. The
  roots (CoreLib, System.Runtime, Linq, Collections, Collections.NonGeneric, Numerics,
  RegularExpressions, Text.Json, Memory) are `TrimmerRootAssembly`, so their metadata isn't
  trimmed, and whatever they reference is added transitively.
- **One compile per run, fresh state per test.** The script returns one lambda per test.
  Each test loads the compiled bytes again with `Assembly.Load`, so statics and top-level
  statements reset per test.
- **`self.dotnetSidecar = true`** has to be set before importing `dotnet.js` in a worker.
  Otherwise the runtime assumes it's a multithreading helper thread and never finishes
  starting.
- `UseSystemResourceKeys=false` keeps real exception messages (learners see `ex.Message`).
  `InvariantGlobalization` drops the ICU data.
- Code naming `System.Net.Http` types is rejected with a "does not exist" message rather
  than CodePolicy's, because that assembly isn't in the bundle.

## Checking it

`client/scripts/verify-solutions.mjs` (run by `scripts/verify.sh`) grades every C#
reference solution through the built site's worker, checks a `System.IO.File` call is
rejected with CodePolicy's message, and checks an infinite loop is stopped and the next run
passes. `client/scripts/check-site.mjs` checks the page's message when the runtime is
missing.

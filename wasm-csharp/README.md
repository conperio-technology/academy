# wasm-csharp: grading C# in the browser

Compiles and runs learner C# **in the browser**: Roslyn (`Microsoft.CodeAnalysis.CSharp`)
on the .NET WebAssembly runtime (Mono, interpreted, no AOT), inside a Web Worker. It is
the browser twin of `runner/`: same script semantics, same imports, the same reference
closure, the same `JsonSerializer.Serialize(call)` per test, and the **same**
`runner/CodePolicy.cs` and `runner/RunnerProtocol.cs` (linked into this project, not
copied), so the same code is accepted or rejected with the same message on both paths.

This is the **default** for every graded C# exercise. The server runner
(`POST /api/execute/csharp`) is the fallback:

- automatically, when the runtime can't be used: the bundle was never built, the browser
  has no WebAssembly or Web Workers, the worker fails to start, or a run waits over 2 min
  for the runtime to load;
- by choice, with the **Run on server** checkbox next to "Run Tests" (remembered in this
  browser's `localStorage` as `academy.csharpRunMode`).

The line under the buttons says where each run was graded, and why when it fell back.

The static site (`npm run build:static`, docs/adr/0010) has no server: there the browser is the
only grader, the checkbox is hidden, and when the runtime can't load the page says C# can't
be graded here. Static hosts serve the plain runtime files; the `.br` copies are only used by
the server below. The worker finds the runtime under the site's base path, so it also loads
when the site lives under a subpath such as `/academy/`.
How the switch was decided: [PROTOTYPE-RESULTS.md](PROTOTYPE-RESULTS.md).

## Build

```sh
./wasm-csharp/build.sh              # or, from client/: npm run build:csharp-wasm
cd client && npm run build          # copies public/csharp-wasm into dist/
```

`build.sh` publishes the project (Release, trimmed) and copies the runtime into
`client/public/csharp-wasm/_framework/`: 18.6 MB in 54 files, plus their precompressed
`.br` copies (5.5 MB), and the runtime's licence and third-party notices next to it
(`csharp-wasm/dotnet-LICENSE.TXT`, `dotnet-THIRD-PARTY-NOTICES.TXT`; see
`THIRD_PARTY_NOTICES.md` at the repo root). Vite serves that folder in dev and copies it into `dist/` on
`npm run build`. The output is gitignored. `build.sh` skips the ~1 minute publish when
its inputs (`Program.cs`, the `.csproj`, `CodePolicy.cs`, `RunnerProtocol.cs`) are older
than the output; `FORCE=1` rebuilds anyway.

Requires only the .NET 10 SDK; the `wasm-tools` workload is **not** needed (it's only for
AOT/native relinking). `scripts/verify.sh` runs `build.sh` before the client build
(`SKIP_WASM=1` skips it), and the Dockerfile has a `csharp-wasm` stage that runs it and
copies the result into the client stage.

**Without the bundle the app still works**: the first C# exercise opened notices the
runtime is missing, shows "In-browser C# isn't available here, so runs use the server",
and every run goes to the server as before.

## Serving and caching

- File names are fingerprinted (`System.Linq.<hash>.wasm`) except `dotnet.js`, which
  holds the list of the others with their hashes.
- The API (`server/Execution/CSharpWasmFiles.cs`) sends the `.br` file when the browser
  accepts brotli, marks fingerprinted files `Cache-Control: public, max-age=31536000,
  immutable` and `dotnet.js` `no-cache` (a 304 while it hasn't changed).
- The worker starts the runtime with `disableNoCacheFetch`, so the loader lets the HTTP
  cache answer instead of revalidating every file. A second visit downloads nothing but
  the `dotnet.js` revalidation.
- Vite's dev server sends the plain files without those headers; that's fine locally.

## When it loads

Opening any C# exercise starts the worker in the background (`warmCSharpRuntime`): it
loads the runtime, then compiles a small snippet so Roslyn's first, slow compile is out of
the way. "Loading the C# compiler…" shows next to "Run Tests" meanwhile. A run clicked
before that finishes simply waits for it ("Loading C# compiler (first run only)…"). In
"Run on server" mode nothing is downloaded.

## Limits (the same as the server's where possible)

| | Browser | Server |
| --- | --- | --- |
| Per test | 5 s, then the worker is terminated and a fresh one starts loading | 5 s (first test 20 s), process killed |
| Compile | 60 s | inside the first test's 20 s |
| Result size | `RunnerLimits.MaxResultChars` (64K characters), same constant | same |
| Code length | 20,000 characters | `MaxCodeLength` 20,000 |
| Memory | no cap of our own: the WebAssembly heap grows to the browser's limit, then the test fails with "Out of memory" (tried with a loop allocating 40 MB arrays; the next run is fine) | 256 MB GC heap cap |
| Deep recursion | crashes the worker: "The run crashed (very deep recursion...)" | same message |

After a timeout the test shows "Timed out after 5 s (infinite loop?)", the remaining
tests "Skipped", and the line under the buttons says the C# runtime was restarted. The
next run uses the new worker (about 2 s to start, from the HTTP cache).

The grade is computed in the browser and recorded with `POST /api/progress/record`,
exactly like Python. CodePolicy in the browser is a learning guardrail (the same rules as
the server), not a security boundary: the code runs in the learner's own tab.

## Autocomplete

The C# editors get completions from the same Roslyn (`Runner.Complete` in `Program.cs`,
`client/src/csharpCompletion.ts`): after `expr.` the members of `expr`'s type including
LINQ and other extension methods (static members after a type name, child namespaces after
a namespace), otherwise every symbol in scope plus C# keywords. The lesson's hidden
preamble is included, so helper types like `ListNode` complete too. Anything
`CodePolicy` would reject (`Console`, `File`, `Thread`, `Type`, ...) is left out. It uses
the semantic model's `LookupSymbols`, not `Microsoft.CodeAnalysis.Features`, so it added
about 12 KB (7 KB brotli) to the bundle. There's no signature help, no snippets and no
ranking beyond alphabetical; in "Run on server" mode, or without the bundle, Monaco keeps
its word-based suggestions.

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
annotation outside a nullable context) is left out: scripts compile with nullable off, as
on the server, and lesson starters use `Node?`.

It only runs while in-browser C# is on and the runtime is warm; with "Run on server" or no
bundle it does nothing and clears the markers. Each editor has at most one check in
flight, edits made meanwhile are checked when it returns (the stale answer is dropped),
and no check is sent while a run is in progress, so a run waits at most for the one check
already compiling. A check takes about 60 to 450 ms in headless Chromium (median 80 to 250
ms across eight lessons, more with a large preamble such as the linked list harnesses), so
squiggles appear about 0.7 to 1.3 s after typing stops. It added about 9 KB (3 KB brotli)
to `CSharpWasm.wasm` and about 2 KB to the client's JavaScript.

## How it fits together

| Piece | Role |
| --- | --- |
| `Program.cs` | `[JSExport]` `Compile(code, calls)` / `RunTest(i)` / `Complete(code, position)` / `Diagnose(prefix, code, calls)` / `ManagedHeapBytes()` |
| `CSharpWasm.csproj` | WebAssembly SDK; roots the BCL assemblies learner code may use (see below) |
| `client/src/csharpWasmWorker.ts` | Loads `dotnet.js` in a worker; handles `warm`, `run`, `complete` and `diagnose` one at a time |
| `client/src/csharpWasmRunner.ts` | Page side: status for the loading indicator, run mode, timeouts (terminates the worker), result shaping, fallback signal |
| `client/src/csharpCompletion.ts` | The Monaco completion provider |
| `client/src/csharpDiagnostics.ts` | Debounced live diagnostics as Monaco markers |
| `client/src/components/CSharpRunner.tsx` | Browser first, server on `CSharpWasmUnavailable` or in "Run on server" mode |
| `server/Execution/CSharpWasmFiles.cs` | Brotli and cache headers for `/csharp-wasm/_framework/` |

Details worth knowing:

- **Reference metadata** comes from the assemblies already loaded in the runtime
  (`Assembly.TryGetRawMetadata`), so there's no separate reference-assembly download. The
  roots (CoreLib, System.Runtime, Linq, Collections, Collections.NonGeneric, Numerics,
  RegularExpressions, Text.Json, Memory) are `TrimmerRootAssembly`, so their metadata isn't
  trimmed, and whatever they reference is added transitively, the way the server's Roslyn
  scripting resolves references.
- **One compile per run, fresh state per test.** The script returns one lambda per test.
  Each test loads the compiled bytes again with `Assembly.Load`, so statics and top-level
  statements reset per test, the same as the server's one script per test.
- **`self.dotnetSidecar = true`** has to be set before importing `dotnet.js` in a worker.
  Otherwise the runtime assumes it's a multithreading helper thread and never finishes
  starting.
- `UseSystemResourceKeys=false` keeps real exception messages (learners see `ex.Message`).
  `InvariantGlobalization` drops the ICU data.
- Known wording difference: code naming `System.Net.Http` types is rejected on both paths,
  but with a different "does not exist" message, because that assembly isn't in the bundle.

## Checking it

`client/scripts/verify-solutions.mjs` (run by `scripts/verify.sh`) grades every C#
reference solution in the browser too (`--lang csharp-browser`, on by default when
`client/dist` has the runtime), checks a `System.IO.File` call is rejected with the same
message as on the server, and checks an infinite loop is stopped and the next run passes.

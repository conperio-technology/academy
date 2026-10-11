# 0012. In-browser C# is the default grader, the server runner the fallback

Status: Accepted (supersedes [0005](0005-in-browser-csharp-prototype.md))
Date: 2026-10-11 (merged in PR #47, branch `csharp-browser-all`)

## Context

[0005](0005-in-browser-csharp-prototype.md) enabled the WebAssembly C# grader for one lesson
behind an opt-in checkbox. The prototype measured warm runs of about 0.2 seconds against
about 1.8 seconds on the server, identical results, and every reference solution passing
(`wasm-csharp/PROTOTYPE-RESULTS.md`). It recommended moving all C# grading to the browser.

## Decision

- Every graded C# exercise is compiled and run in the learner's browser by default
  (`wasm-csharp/`, `client/src/csharpWasmRunner.ts`). It links the same
  `runner/CodePolicy.cs` and `RunnerProtocol.cs` as the server runner.
- The server runner ([0003](0003-sandboxed-csharp-runner.md)) stays as the fallback: used
  automatically when the runtime can't load (not built, no WebAssembly or workers, worker
  fails, load takes over 2 minutes), or by choice with the "Run on server" checkbox.
- The static site ([0010](0010-static-hosting-mode.md)) has only the browser grader.
- The runtime is built by `wasm-csharp/build.sh` and is not committed.

## Consequences

- C# runs are fast and untrusted code mostly stays off the host.
- First use downloads about 5.4 MB (brotli) of runtime; static hosts serve the plain files
  (about 18.6 MB).
- A change to `CodePolicy.cs` affects both graders; `verify-solutions.mjs` checks both.
- The browser runtime ships .NET and Roslyn files (MIT); they are listed in
  `THIRD_PARTY_NOTICES.md`.

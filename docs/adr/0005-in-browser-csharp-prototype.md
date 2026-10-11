# 0005. In-browser C# (WebAssembly) as an opt-in prototype

Status: Superseded by [0012](0012-in-browser-csharp-by-default.md): in-browser C# is now the
default for every exercise, with the server runner as the fallback. Kept as the record of the
prototype.
Date: 2026-10-11 (merged in PR #38; `wasm-csharp/PROTOTYPE-RESULTS.md`)

## Context

Server C# grading takes about 1.8 seconds per run and keeps untrusted code on the host. Roslyn
can also run on the .NET WebAssembly runtime inside a browser worker.

## Decision

The server runner (ADR 0003) stays the default. `wasm-csharp/` builds a browser twin of the
runner that links the same `runner/CodePolicy.cs` and `RunnerProtocol.cs`. It is enabled for
one lesson (`hashmap-two-sum`, the `BROWSER_CSHARP_LESSONS` set in
`client/src/csharpWasmRunner.ts`) behind a "Run in browser (beta)" checkbox, off by default.
Its build output is gitignored and produced by `wasm-csharp/build.sh`.

## Consequences

- Measured: warm runs take about 0.2 seconds, results are identical, and all 147 reference
  solutions pass. The cost is a download of about 5.4 MB (brotli) on first use.
- The prototype report recommends moving all C# to the browser with the server as a
  fallback. That needs an owner decision and a new ADR before anyone builds it.
- A change to `CodePolicy.cs` affects both paths.

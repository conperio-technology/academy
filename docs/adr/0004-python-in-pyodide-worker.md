# 0004. Grade Python in the browser with Pyodide in a Web Worker

Status: Accepted
Date: 2026-10-11 (decided at project start)

## Context

Python exercises need a real interpreter. Running learner Python on the server would need a
second sandbox.

## Decision

Run Python entirely in the browser: Pyodide (CPython compiled to WebAssembly), loaded from
jsDelivr, inside a Web Worker (`client/src/pythonWorker.ts`), with fresh globals per test and
a 5 second per-test timeout that terminates the worker. The version is pinned in
`client/src/pyodideLoader.ts`.

## Consequences

- No server-side execution risk and no server load for Python.
- The first Python run in a tab downloads Pyodide. Where jsDelivr is blocked, Python grading
  doesn't work (the verify script can serve a local copy instead).
- Python progress is reported by the browser, so learners could misreport their own
  progress. Acceptable for an internal learning app.
- Pyodide is never added to `client/package.json`.

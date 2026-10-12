# 0003. Grade C# in a separate, sandboxed runner process

Status: Superseded by [0013](0013-static-only.md) (the runner was removed; C# is graded only in the browser, [0012](0012-in-browser-csharp-by-default.md))
Date: 2026-10-11 (implemented 2026-10-09)

## Context

Learner C# used to run inside the API process with Roslyn scripting. Any submission could
read files or start processes, a stack overflow killed the whole API, and the timeout never
stopped a CPU-bound loop. More than one person now uses the app.

## Decision

Run each submission in a short-lived `runner/` process. Before running, `runner/CodePolicy.cs`
checks every referenced symbol against a namespace allowlist (`System`, `System.Collections`
and `.Generic`, `System.Linq`, `System.Numerics`, `System.Text` with `.Json` and
`.RegularExpressions`), blocks `Console`, `Environment`, `Type`, `GC` and a few other types
inside them, and rejects `dynamic`, `#r` and `#load`; `unsafe` code doesn't compile. The API kills the process on a per-test timeout, caps its heap, limits
how many run at once, and caps the output it reads (see `runner/CLAUDE.md` and
`server/Execution/`).

## Consequences

- A hang, crash or runaway allocation only takes down the runner, never the API.
- Graded exercises can't use threads, tasks, async, files or printing. Those topics are taught
  in tool lessons instead.
- Changing the allowlist is a security decision and must be called out in the PR.

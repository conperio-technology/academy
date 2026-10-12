# Architecture decision records

Short notes on decisions that shape the app: what was decided, why, and what it costs. Read
them before proposing to change one of these things. If you still want to, write a new ADR
that supersedes the old one, in the same PR as the change.

| # | Decision | Status |
| --- | --- | --- |
| [0001](0001-record-decisions.md) | Record architecture decisions here | Accepted |
| [0002](0002-sqlite-progress-store.md) | Progress in one SQLite file via EF Core, no migrations | Superseded by 0013 |
| [0003](0003-sandboxed-csharp-runner.md) | Grade C# in a separate, sandboxed runner process | Superseded by 0013 |
| [0004](0004-python-in-pyodide-worker.md) | Grade Python in the browser with Pyodide in a Web Worker | Accepted |
| [0005](0005-in-browser-csharp-prototype.md) | In-browser C# (WebAssembly) as an opt-in prototype | Superseded by 0012 |
| [0006](0006-trusted-header-identity.md) | Identity from a trusted proxy header, no login in the app | Superseded by 0013 |
| [0007](0007-linux-vm-in-browser.md) | Linux lessons run a v86 VM in the browser | Accepted |
| [0008](0008-check-scripts-as-tests.md) | Check scripts are the test suite | Accepted |
| [0009](0009-no-deploy-no-ci-yet.md) | Not deployed, no CI yet | Accepted; for the static site, deploying is superseded by 0011 (the Dockerfile is gone, 0013) |
| [0010](0010-static-hosting-mode.md) | A static hosting mode next to the server (content exported as JSON, progress in the browser) | Accepted; the server mode was removed by 0013 |
| [0011](0011-static-site-on-github-pages.md) | Publish the static site on GitHub Pages from `gh-pages`, by hand with the owner's go | Accepted |
| [0012](0012-in-browser-csharp-by-default.md) | In-browser C# is the default grader, the server runner the fallback | Accepted; the fallback was removed by 0013 |
| [0013](0013-static-only.md) | Static only: remove the server mode | Accepted |

0001 to 0009 were written down on 2026-10-11 for decisions made earlier.

## Writing a new one

Copy the shape below to `NNNN-short-title.md` with the next number, add it to the table, and
keep it to a page. Don't edit an accepted ADR's decision; supersede it with a new one.

```markdown
# NNNN. Title

Status: Proposed | Accepted | Superseded by NNNN
Date: YYYY-MM-DD

## Context
The problem, the forces, the options.

## Decision
What we do.

## Consequences
What gets easier, what gets harder, what is still open.
```

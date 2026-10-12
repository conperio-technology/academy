# Security policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue or pull request.

Use GitHub's private reporting: open the repository's **Security** tab and choose
**Report a vulnerability**. Only the maintainers can see the report. Include what you found,
how to reproduce it, and what you think the impact is.

We aim to reply within a week. Once a fix is out we are happy to credit you, unless you
would rather stay anonymous.

## What is in scope

- **The published site** (GitHub Pages, built from `master`). It is static: lessons are JSON
  files, progress lives in the visitor's own browser (IndexedDB), and code is graded in the
  browser (Pyodide for Python, Roslyn on WebAssembly for C#). There is no server, account or
  shared database behind it. Problems such as script injection through lesson content, an
  import file that can break out of its data, or a third-party script we load that could be
  swapped are in scope.
- **This repository's code**: the lesson content and its exporter (`content/`), the
  in-browser C# grader (`wasm-csharp/`), the site (`client/`) and the scripts. A way around
  the C# grader's allowlist (`wasm-csharp/CodePolicy.cs`) is worth reporting, although that
  code only ever runs in the learner's own browser tab.

## Supported versions

Only the current `master` and the site built from it get fixes.

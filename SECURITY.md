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
- **This repository's code**, including the optional server mode in `server/` and `runner/`.

## Known limits of the server mode

The server mode is built for a single machine or a trusted network, and is not deployed
anywhere. Two of its limits are by design, so reports of them alone are not vulnerabilities:

- It has no login. It trusts an identity header set by a reverse proxy in front of it
  ([ADR 0006](docs/adr/0006-trusted-header-identity.md)), so anyone who can reach it directly
  can claim any user id.
- The C# runner restricts submitted code with an allowlist and resource limits in a separate
  process ([ADR 0003](docs/adr/0003-sandboxed-csharp-runner.md)), but it is not a hardened
  sandbox such as a container or VM per run. Don't expose it to untrusted users.

A way around the runner's allowlist (`runner/CodePolicy.cs`) is still worth reporting.

## Supported versions

Only the current `master` and the site built from it get fixes.

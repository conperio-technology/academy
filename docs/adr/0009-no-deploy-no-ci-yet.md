# 0009. Not deployed, no CI yet

Status: Accepted. For the static site only, the no-deploy rule is superseded by
[0011](0011-static-site-on-github-pages.md): it is published on GitHub Pages by hand with the
owner's go. Everything else below still holds.
Date: 2026-10-11

## Context

The `Dockerfile` exists, and the owner has not approved a deploy or a CI service. The
Kubernetes manifests that once sat next to it were cluster specific and were removed from the
public repo.

## Decision

- Nobody deploys: no `docker push`, no `kubectl apply`.
- No GitHub Actions or other CI, and no branch protection changes, for now. Checks run on the
  contributor's machine (`scripts/verify.sh`, the optional pre-commit hook) and the PR
  checklist records them. A reviewer other than the author approves every PR.

## Consequences

- Only the reviewer stands between an unchecked PR and master, so reviewers spot check the
  checklist (`docs/code-review.md`).
- When CI is approved it should run `scripts/verify.sh`, which already runs headless on
  Linux. That decision gets its own ADR.

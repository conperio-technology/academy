# 0011. Publish the static site on GitHub Pages, by hand

Status: Accepted (supersedes the "nobody deploys" part of [0009](0009-no-deploy-no-ci-yet.md) for the static site only). Since [0013](0013-static-only.md) the build output is `client/dist/` (`npm run build`), with no `.br` copies to drop.
Date: 2026-10-11

## Context

[0010](0010-static-hosting-mode.md) added a static build that needs no server, and left
publishing it to a later decision. The owner approved putting it on GitHub Pages so people
can use the app without running anything. There is still no CI ([0009](0009-no-deploy-no-ci-yet.md)).

## Decision

- The static site is served by GitHub Pages from the `gh-pages` branch of this repo:
  https://conperio-technology.github.io/academy/
- `gh-pages` holds only build output: the contents of `client/dist-static/` from a clean
  `master` checkout, without the `.br` copies (Pages does not use them). Each publish is one
  commit on top of the previous one, titled "Static site build from master <short sha>".
- Publishing is manual and needs the owner's go each time. The steps are in README.md,
  "Publishing to GitHub Pages". Nobody else, and no agent, pushes to `gh-pages` on their own.
- The site is built with the default relative base (`./`), so the same files work under
  `/academy/`.
- Everything else in 0009 stands: no container or cluster deploys, no CI.

## Consequences

- Anyone with the link can use the app. Progress stays in each visitor's browser.
- The site is a public distribution of the bundled third-party software, including the
  GPL-2.0 Linux kernel and BusyBox in the Linux lab. `THIRD_PARTY_NOTICES.md` lists every
  component with its licence and source, and each build serves it as
  `THIRD_PARTY_NOTICES.txt`, linked from the sidebar and the Linux lab.
- The live site lags `master` until someone publishes again.
- Every publish adds about 30 MB of changed build files to the repository's history on
  `gh-pages`. Moving to the GitHub Actions Pages flow would avoid that, but needs CI, which
  is a separate decision.

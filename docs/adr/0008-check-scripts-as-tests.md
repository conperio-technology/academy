# 0008. Check scripts are the test suite

Status: Accepted
Date: 2026-10-11

## Context

Most of the repo is content: lessons, exercises, reference solutions, glossary data. The bugs
that matter are a wrong expected value, a solution that fails its own tests, a broken glossary
link or a page that scrolls sideways on a phone. Unit tests of the plumbing would miss them.

## Decision

There is no unit test project. The checks are scripts: `client/scripts/check-*.mjs` for data,
`verify-solutions.mjs` (every reference solution through the real graders) and
`check-overflow.mjs` (every page at 390px and 1300px), all run by `scripts/verify.sh`.
Playwright, which the last two need, is found outside the repo rather than added as a
dependency.

## Consequences

- One command checks what actually breaks. It takes a few minutes and needs Playwright.
- Logic with many branches (the PLC interpreter, for example) gets its own check script. Add
  a unit test project if server logic grows enough to need one.

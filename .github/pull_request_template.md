## What and why

<!-- One or two sentences: what this changes and why. Link an issue or ADR if there is one. -->

## How it was checked

<!-- Paste the verify.sh summary line (e.g. "verify: all steps passed", C# x/y, Python x/y),
     or list the checks you ran and why the others didn't apply. -->

## Definition of done

Tick what applies; strike through (`~~like this~~`) and say why for anything that doesn't.

- [ ] `scripts/verify.sh` passes, or every check from CONTRIBUTING.md section 5 that applies passed (listed above)
- [ ] Lesson prose has no en/em dashes and no spaced ` - ` dashes
- [ ] Every code sample and predicted output was actually run; the output shown is real
- [ ] Looked at the changed pages at 390px wide: no sideways scroll
- [ ] New lessons: section and `Order` fit their neighbours, wired into `studyPathData.ts` / `prepPlanData.ts`, glossary terms added
- [ ] Graded C# uses only what `runner/CodePolicy.cs` allows (a change to the allowlist is called out as a security change)
- [ ] Docs updated where they describe this (README.md lesson list, CLAUDE.md, an ADR for a big decision)
- [ ] No secrets, `.env`, `server/progress.db*`, `client/dist/` or temporary Vite configs committed

## AI assistance

<!-- None / Claude Code wrote some or most of it. If AI wrote content, say how you checked it
     (see docs/ai-usage.md). Every PR needs a human reviewer who is not the author. -->

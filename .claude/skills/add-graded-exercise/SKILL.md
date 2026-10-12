---
name: add-graded-exercise
description: Add a graded coding exercise (an IConcept with starter code, test cases, visualizer steps, complexity answer and C#/Python reference solutions) to Conperio Academy and prove the reference solutions pass. Use when asked to add a practice problem, coding exercise, LeetCode-style problem or graded lesson.
---

# Add a graded exercise

A graded exercise is an `IConcept`: explanation, step-through visualization, starter code and
test cases in C# and Python, a "name the complexity" answer and reference solutions.
C# is graded in the browser (Roslyn on .NET WebAssembly, `wasm-csharp/`), Python in the
browser with Pyodide. There is no server.

## 1. Placement and id

Same rules as the `add-lesson` skill: section from `content/SectionOrder.cs` (default for
concepts is "Data Structures & Algorithms"), a `Track`, an `Order` in that track's band (an
exercise that practises a lesson takes the next numbers after it, e.g. lesson 1000, exercises
1001, 1002), and a unique lowercase-hyphenated id.

## 2. The concept class

`content/Concepts/<Name>.cs`, copied from a neighbour in the same track
(e.g. `BasicsCountVowels.cs`, `MathPow.cs`). Required members:

- `Id`, `Track`, `Title`, `OneLiner`, `KeyTakeaway`, `Explanation` (`\n\n` between paragraphs);
  `Section`/`Order` when not the defaults. Track helper classes (`BasicsHelpers.cs`,
  `IntermediateHelpers.cs`, ...) hold shared constants.
- `StarterCode` and `FunctionNames`, both keyed `"csharp"` and `"python"`. A language is offered
  only if it has both.
- `CSharpCallTemplate` / `PythonCallTemplate`, e.g. `"Solution.CountVowels({input})"` and
  `"count_vowels({input})"`. `{input}` is replaced by the test's input literal.
- `TestCases`: `new TestCase(Lit.Str("hello"), "2")`. Build inputs with `Lit.IntArray`,
  `Lit.Str`, `Lit.Int`, `Lit.Args(a, b)` so one literal is valid C#, Python and JSON.
  Expected values are JSON and compared as parsed JSON. Include edge cases (empty, one item,
  duplicates, negatives) and at least one input big enough to punish a too-slow approach when
  the exercise is about complexity.
- `VisualizerKind` + `BuildVisualizationSteps()`: steps whose `State` keys match the client
  visualizer (e.g. Array uses `array`, `tracker`, `trackerLabel`; see
  `client/src/components/*Visualizer.tsx`).
- Optional: `CSharpHarnessPreamble` / `PythonHarnessPreamble` (helper types such as a ListNode),
  and for the patterns track `RecognitionSignals`, `Gotchas`, `ConfusableWith`.

C# code (starter, preamble, solution) must stay inside `wasm-csharp/CodePolicy.cs`: only `System`,
`System.Collections(.Generic)`, `System.Linq`, `System.Numerics`, `System.Text(.Json,
.RegularExpressions)`; no `Console`, Tasks, threads, reflection, IO, `dynamic`. Return values,
don't print.

## 3. Register and describe

1. `content/ConceptRegistry.cs`: add `new <Name>(),` near its track.
2. `content/ComplexityCatalog.cs`: add
   `["<id>"] = new("O(n)", "O(1)", "<why>", AlsoTime: [...], AlsoSpace: [...]),`
   listing every defensible alternative. Every string must already be in `OPTIONS` in
   `client/src/components/ComplexityCheck.tsx`; add it there if it is genuinely new.
3. Reference solutions: `content/Solutions/<id>.csx` and `content/Solutions/<id>.py`
   (embedded automatically). Same function names/signatures as the starter code; readable,
   idiomatic, the approach the explanation teaches.
4. Plans: add the id to the right family in `client/src/studyPathData.ts` and, for interview
   topics, `client/src/prepPlanData.ts`.
5. README.md: mention it under its section.

## 4. Prove it

1. `dotnet build content/content.csproj` and `cd client && npm run build`.
2. Run both reference solutions through the real graders. Quickest: serve the build and run
   only this exercise (see the `verify` skill):
   `node client/scripts/serve.mjs --dir client/dist --port 5495 &` (note the PID), then
   `node client/scripts/verify-solutions.mjs --base http://localhost:5495/academy/ --only <id>`.
   It fails if either solution fails a test or a complexity string isn't selectable.
3. Also confirm the starter code fails (it should not pass as shipped): open the lesson
   (`npm run dev`, or the served build at `#/<id>`), click Run Tests on the untouched starter
   in each language, and expect failing tests without a compile error.
4. Overflow at 390px: `node client/scripts/check-overflow.mjs --base <url> --only <id>`.
   Stop the static server by its PID when done.

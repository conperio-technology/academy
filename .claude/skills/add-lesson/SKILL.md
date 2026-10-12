---
name: add-lesson
description: Add a new tool (reference/interactive widget) lesson to Conperio Academy, wiring the C# ITool class, ToolKind enum, ToolRegistry, client ToolKind union and ToolView render line, then placing it in its section and study plans. Use when asked to add, create or write a lesson, tool, simulator, calculator or explainer page that has no graded code editor.
---

# Add a tool lesson

A tool lesson is an explanation, a key takeaway and an interactive React widget, with no
pass/fail. (For a lesson with a code editor and tests, use the `add-graded-exercise` skill.)

## 1. Decide placement first

1. Pick the section from `content/SectionOrder.cs` (18 sections, 0 "Start Here" to 17
   "Industrial & Embedded Systems"). A brand-new section also needs a `SectionOrder` entry and a
   blurb in `client/src/sectionInfo.ts`.
2. Pick a `Track` and an `Order`. List the neighbours:
   `grep -l 'Section => "<Section>"' content/Tools/*.cs content/Concepts/*.cs | xargs grep -h -E 'Track =>|Order =>'`
   The sidebar sorts by `Order` (default 100) within a section, ties in registry order, and
   groups tracks in order of their first item, so keep a track's numbers in one band and
   continue its sequence (e.g. Linux terminal 1-4, scripting 6-8; Programming basics 0-99,
   intermediate 1000s, advanced 2000s).
3. Pick an id: lowercase-hyphenated, unique across all tools and concepts
   (`grep -rn '"<id>"' content` must return nothing).

## 2. Content (C#)

1. `content/ITool.cs`: add a `ToolKind` value (PascalCase), next to its track's kinds.
2. `content/Tools/<Name>Tool.cs` (copy a neighbour such as `DataTypesTool.cs`):

   ```csharp
   namespace DsaAcademy.Content.Tools;

   public class <Name>Tool : ITool
   {
       public string Id => "<id>";
       public string Section => "<Section>";
       public string Track => "<track>";
       public int Order => <n>;
       public string Title => "<Title>";
       public string OneLiner => "<one sentence for the sidebar and dashboard>";
       public string KeyTakeaway => "<the one rule worth remembering>";
       public ToolKind ToolKind => ToolKind.<Kind>;
       public string Explanation =>
           "<paragraph>\n\n" +
           "<paragraph>";
   }
   ```

   Paragraphs are separated by `\n\n`. No en/em dashes or spaced hyphens in the text.
3. `content/ToolRegistry.cs`: add `new <Name>Tool(),` (near its track's other tools).

## 3. Client

1. `client/src/types.ts`: add the camelCase kind (`"<kind>"`) to the `ToolKind` union. The
   exporter serializes enums camelCase, so `DesignChat` becomes `"designChat"`.
2. `client/src/components/tools/<Widget>.tsx`: the interactive part. Keep state in React;
   no new dependencies. Reuse existing CSS variables and classes; append any new CSS as one
   block at the end of `client/src/index.css` with a prefix unique to the widget.
3. `client/src/components/ToolView.tsx`: import the widget and add
   `{tool.toolKind === "<kind>" && <Widget />}` next to its track's lines.
   Exception: lessons that are pure data (Programming in C# & Python via `src/langTrack/`,
   Linux/Windows/cloud via `src/opsTrack/`, PLC via `src/plc/`) are added to that track's
   data map instead and need no `ToolView` line.
4. Wire into plans where it belongs: `client/src/studyPathData.ts` (IT & CS path families) and,
   if interview-relevant, `client/src/prepPlanData.ts`. Glossary terms it introduces go in
   `client/src/glossaryData.ts` (optionally with `lessonId: "<id>"`).
5. Mobile: nothing may overflow horizontally at 390px. Wrap wide tables, SVGs and code in an
   `overflow-x: auto` box, use `overflow-wrap: anywhere` on long tokens, `minmax(0, 1fr)` in grids.

## 4. Document and verify

1. Add a bullet for the lesson in README.md under its section.
2. `dotnet build content/content.csproj` and `cd client && npm run build`.
3. If glossary data changed: `cd client && node scripts/check-glossary.mjs`.
4. Run the `verify` skill, or at least the overflow check for the new id:
   `node client/scripts/check-overflow.mjs --base <url> --only <id>` against a running copy
   (`npm run dev` gives `http://localhost:5173/`; the `verify` skill shows how to serve a
   build on a spare port).

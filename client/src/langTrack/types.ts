// Shapes for the "Programming in C# & Python" section. Each lesson is plain data (see the
// files next to this one) rendered by components/tools/LangLesson.tsx, so later stages
// (intermediate, advanced) add a data file and a ToolKind instead of a new component.
// Every code sample and predict-the-output item is written to run as is: C# as a
// file-based console program (top-level statements), Python as a script.

export type Lang = "csharp" | "python";

// Tagged template that keeps backslashes as typed (so "\n" in a code sample stays the
// two characters a programmer would write) and trims the leading and trailing newline.
export function src(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values).replace(/^\n/, "").replace(/\s+$/, "");
}

export interface CodePart {
  kind: "code";
  title: string;
  csharp: string;
  python: string;
  // Paragraphs; `backticks` render as inline code.
  notes: string[];
  // A sample that is meant to fail shows what failure looks like. The snippet checker
  // expects this compiler error id (C#) or exception name (either language) instead of
  // a clean run.
  expectError?: Partial<Record<Lang, string>>;
  // Pane labels other than the language name, e.g. "C# output".
  captions?: Partial<Record<Lang, string>>;
  // Not a whole program (for example a lone method). Shown, but skipped by the checker.
  fragment?: Partial<Record<Lang, boolean>>;
}

export interface TextPart {
  kind: "text";
  title?: string;
  paragraphs: string[];
}

export interface TermsPart {
  kind: "terms";
  title: string;
  terms: { term: string; meaning: string }[];
}

export interface TablePart {
  kind: "table";
  title: string;
  head: string[];
  rows: string[][];
  notes?: string[];
}

export interface StepsPart {
  kind: "steps";
  title: string;
  steps: string[];
}

export type LessonPart = CodePart | TextPart | TermsPart | TablePart | StepsPart;

// One "what does this print?" question. `output` is the program's exact output; the
// options shown are `output` plus the distractors, shuffled.
export interface PredictItem {
  lang: Lang;
  code: string;
  output: string;
  distractors: string[];
  why: string;
}

export interface LessonLink {
  id: string;
  label: string;
}

export interface LangLessonData {
  parts: LessonPart[];
  predict: PredictItem[];
  pitfalls: string[];
  next: LessonLink[];
}

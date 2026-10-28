// Shapes for the IT operations lessons: the Linux administration lessons, Windows &
// PowerShell, and Cloud & DevOps. Each lesson is plain data (see the folders next to this
// file) rendered by components/tools/OpsLesson.tsx, the same idea as the C# & Python track.
// Bespoke simulators are named by `widget` and live in components/tools/ops/.
//
// Accuracy rule: every bash sample with an `output` was run on Ubuntu 24.04 (bash 5.2) to
// get that output, unless the block says `unverified`. PowerShell, Windows, Docker,
// Kubernetes and Terraform output can't be run in the Linux container this was written in,
// so those blocks carry `unverified` and are written against the documented behaviour.

export type CodeLang =
  | "bash"
  | "sh"
  | "powershell"
  | "cmd"
  | "yaml"
  | "hcl"
  | "bicep"
  | "dockerfile"
  | "ini"
  | "text"
  | "json"
  | "sql"
  | "csharp"
  | "python"
  | "http";

// Tagged template that keeps backslashes as typed and trims the leading and trailing newline.
export function src(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values).replace(/^\n/, "").replace(/\s+$/, "");
}

export interface CodeBlock {
  lang: CodeLang;
  // Pane label other than the language name, e.g. "deploy.sh" or "/etc/fstab".
  label?: string;
  code: string;
  // What running it printed. Shown under the code, labelled "Output".
  output?: string;
  // The output couldn't be run where this was written (no Windows, no cluster); it follows
  // the documented format. Shown as a small note so nobody mistakes it for a capture.
  unverified?: boolean;
}

export interface CodePart {
  kind: "code";
  title: string;
  blocks: CodeBlock[];
  // Paragraphs; `backticks` render as inline code.
  notes?: string[];
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

// A step-through: one step on screen at a time, with Back and Next.
export interface WalkthroughPart {
  kind: "walkthrough";
  title: string;
  intro?: string;
  steps: { title: string; body: string; code?: string; lang?: CodeLang }[];
}

export type OpsWidgetName =
  | "wordSplitting"
  | "strictMode"
  | "textToolbox"
  | "systemdService"
  | "aptSimulator"
  | "cronExplainer"
  | "sshLogin"
  | "diskFull"
  | "winServices"
  | "eventLog"
  | "ntfsAccess"
  | "psPipeline"
  | "psVerbNoun"
  | "executionPolicy"
  | "adExplorer"
  | "gpoPrecedence"
  | "bashVsPs"
  | "sharedResponsibility"
  | "availabilityZones"
  | "imageTags"
  | "k8sSelectors"
  | "cicdPipeline"
  | "iacPlan"
  | "observability"
  | "gitTeamFlow"
  | "isolationLab"
  | "lsmTree"
  | "nPlusOne"
  | "partitionKey"
  | "toyRsa"
  | "diffieHellman"
  | "jwtLab"
  | "corsChecker"
  | "raftSim"
  | "logicalClocks"
  | "raidCalc"
  | "backupChain"
  | "ipv6Drill"
  | "emailAuth"
  | "iamPolicy"
  | "birthdayParadox";

export interface WidgetPart {
  kind: "widget";
  widget: OpsWidgetName;
  title: string;
  intro?: string;
}

// The in-browser Linux machine with a task list (components/tools/LinuxLab.tsx).
export interface LabPart {
  kind: "lab";
  title: string;
  lesson: string; // a key of LINUX_LESSONS
}

// A live SQL editor over one of the shared sample databases (components/tools/SqlPlayground.tsx).
// "sample" is the employees and departments database of the first SQL lessons; "shop" is the
// customers, orders and products database in sqlPracticeData.ts.
export interface SqlPart {
  kind: "sql";
  title: string;
  intro?: string;
  query: string;
  schema?: "sample" | "shop";
}

// A set of SQL problems checked by running the learner's query and the reference query on the
// same data and comparing the rows (components/tools/SqlPractice.tsx, data in sqlPracticeData.ts).
export interface SqlPracticePart {
  kind: "sqlPractice";
  title: string;
  set: string;
}

export type OpsPart = SqlPart | SqlPracticePart | CodePart | TextPart | TermsPart | TablePart | StepsPart | WalkthroughPart | WidgetPart | LabPart;

// A multiple-choice check. `answer` plus the distractors are shown shuffled.
export interface QuizItem {
  question: string;
  code?: string;
  lang?: CodeLang;
  answer: string;
  distractors: string[];
  why: string;
}

export interface LessonLink {
  id: string;
  label: string;
}

export interface OpsLessonData {
  parts: OpsPart[];
  quiz: QuizItem[];
  pitfalls: string[];
  next: LessonLink[];
}

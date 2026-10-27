// Badges and path certificates, all worked out from progress already kept in this browser
// (no server, docs/adr/0013), so they are self-issued and for fun. Shown on the dashboard
// (components/Badges.tsx); App.tsx toasts newly earned ones.
import { blockStats, BUILDING_BLOCKS, repDayCount } from "./buildingBlocksData.ts";
import { faangNext, LEARN_LESSONS, walkthroughDone } from "./pathProgress.ts";
import { loadBlockReps, loadBugLog, loadMixedHistory, loadStoryCompetencies } from "./practiceHistory.ts";
import { SYSTEM_DESIGN_WALKTHROUGHS } from "./prepPlanData.ts";
import { IT_CS_FAMILIES } from "./studyPathData.ts";
import type { LessonEvidence, NavItem } from "./types.ts";

export interface Badge {
  id: string;
  group: "Sections" | "Habits" | "Milestones";
  name: string;
  how: string; // what earns it
  progress: string; // where the learner is, e.g. "12 of 15"
  earned: boolean;
}

// Plan and log tools have nothing to finish, so sections count only lessons.
export const STUDY_AID_IDS = new Set(["interview-prep-plan", "it-cs-study-path", "faang-study-path", "bug-log"]);

const SECTION_BADGE_NAMES: Record<string, string> = {
  "Start Here": "First Steps",
  "Computer Fundamentals": "Bare Metal",
  "Programming in C# & Python": "Polyglot",
  "Concurrency & Memory": "Race Winner",
  "Data Structures & Algorithms": "Algorithmist",
  "Software Design & OOP": "Architect",
  "Professional Dev Skills": "Professional",
  "Linux & the Command Line": "Shell Wizard",
  "Windows & PowerShell": "Admin Rights",
  Networking: "Packet Pusher",
  "System Design": "Scale Builder",
  "Cloud & DevOps": "Cloud Hand",
  "AI & Machine Learning": "Model Citizen",
  "Behavioral Interviews": "Storyteller",
  Glossary: "Wordsmith",
  Security: "Defender",
  "Industrial & Embedded Systems": "Line Runner",
};

function localDay(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// The longest run of consecutive days with at least one rep.
function longestStreak(isoDates: string[]): number {
  const days = new Set(isoDates.map((iso) => localDay(new Date(iso))));
  let best = 0;
  for (const iso of isoDates) {
    const start = new Date(iso);
    const prev = new Date(start);
    prev.setDate(prev.getDate() - 1);
    if (days.has(localDay(prev))) continue; // not the start of a run
    let n = 0;
    const d = new Date(start);
    while (days.has(localDay(d))) {
      n++;
      d.setDate(d.getDate() + 1);
    }
    best = Math.max(best, n);
  }
  return best;
}

const count = (n: number, of: number) => `${Math.min(n, of)} of ${of}`;

export function computeBadges(items: NavItem[], evidence: LessonEvidence[]): Badge[] {
  const badges: Badge[] = [];
  const lessons = items.filter((i) => !STUDY_AID_IDS.has(i.id));
  const independent = new Set(evidence.filter((e) => e.independentPass).map((e) => e.conceptId));

  for (const section of [...new Set(lessons.map((i) => i.section))]) {
    const inSection = lessons.filter((i) => i.section === section);
    if (inSection.length < 3) continue;
    const name = SECTION_BADGE_NAMES[section] ?? section;
    const done = inSection.filter((i) => i.completed).length;
    const half = Math.ceil(inSection.length / 2);
    const key = section.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    badges.push({ id: `section-${key}-bronze`, group: "Sections", name: `${name} (bronze)`, how: `Finish half of ${section}`, progress: count(done, half), earned: done >= half });
    badges.push({ id: `section-${key}-silver`, group: "Sections", name: `${name} (silver)`, how: `Finish every lesson in ${section}`, progress: count(done, inSection.length), earned: done === inSection.length });
    const graded = inSection.filter((i) => i.kind === "practice");
    if (graded.length > 0) {
      const own = graded.filter((i) => independent.has(i.id)).length;
      badges.push({
        id: `section-${key}-gold`,
        group: "Sections",
        name: `${name} (gold)`,
        how: `Pass every graded exercise in ${section} from the bare starter, without the reference`,
        progress: count(own, graded.length),
        earned: own === graded.length,
      });
    }
  }

  const reps = loadBlockReps();
  if (items.some((i) => i.id === "building-block-reps")) {
    const repDays = repDayCount(reps);
    const streak = longestStreak(reps.map((r) => r.at));
    const stats = blockStats(reps);
    const fluent = BUILDING_BLOCKS.filter((b) => stats[b.id].fluent).length;
    badges.push(
      { id: "reps-first", group: "Habits", name: "Warm-up", how: "Do your first building-block rep", progress: count(reps.length, 1), earned: reps.length > 0 },
      { id: "reps-streak-7", group: "Habits", name: "Seven Straight", how: "Do reps seven days in a row", progress: count(streak, 7), earned: streak >= 7 },
      { id: "reps-days-30", group: "Habits", name: "Thirty Days", how: "Do reps on 30 different days", progress: count(repDays, 30), earned: repDays >= 30 },
      { id: "blocks-fluent-10", group: "Habits", name: "Ten Fluent", how: "Make 10 building blocks fluent", progress: count(fluent, 10), earned: fluent >= 10 },
      {
        id: "blocks-fluent-all",
        group: "Habits",
        name: "Full Toolkit",
        how: `Make all ${BUILDING_BLOCKS.length} building blocks fluent`,
        progress: count(fluent, BUILDING_BLOCKS.length),
        earned: fluent === BUILDING_BLOCKS.length,
      },
    );
  }
  if (items.some((i) => i.id === "bug-log")) {
    const bugs = loadBugLog().length;
    badges.push(
      { id: "bugs-first", group: "Habits", name: "Bug Spotter", how: "Log your first bug", progress: count(bugs, 1), earned: bugs >= 1 },
      { id: "bugs-25", group: "Habits", name: "Know Your Bugs", how: "Log 25 bugs", progress: count(bugs, 25), earned: bugs >= 25 },
    );
  }

  const passed = items.filter((i) => i.kind === "practice" && i.completed).length;
  const done = lessons.filter((i) => i.completed).length;
  const timedSolved = loadMixedHistory().filter((m) => m.solved).length;
  const designs = Object.keys(SYSTEM_DESIGN_WALKTHROUGHS).filter(walkthroughDone).length;
  const stories = loadStoryCompetencies().length;
  badges.push(
    { id: "first-pass", group: "Milestones", name: "Hello, World", how: "Pass a graded exercise", progress: count(passed, 1), earned: passed >= 1 },
    { id: "first-independent", group: "Milestones", name: "No Training Wheels", how: "Pass an exercise from the bare starter without the reference", progress: count(independent.size, 1), earned: independent.size >= 1 },
    { id: "lessons-100", group: "Milestones", name: "Century", how: "Finish 100 lessons", progress: count(done, 100), earned: done >= 100 },
    { id: "timed-solve", group: "Milestones", name: "Against the Clock", how: "Solve a problem in the timed mixed interview set", progress: count(timedSolved, 1), earned: timedSolved >= 1 },
    { id: "design-first", group: "Milestones", name: "Whiteboard Ready", how: "Compare every stage of a system design walk-through", progress: count(designs, 1), earned: designs >= 1 },
    { id: "stories-8", group: "Milestones", name: "Story Bank", how: "Write 8 stories in the behavioral story bank", progress: count(stories, 8), earned: stories >= 8 },
  );
  return badges;
}

export interface PathCertificate {
  id: string;
  path: string;
  done: number;
  total: number;
  earned: boolean;
}

export function computeCertificates(items: NavItem[]): PathCertificate[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const cert = (id: string, path: string, ids: string[]): PathCertificate => {
    const present = [...new Set(ids)].filter((x) => byId.has(x));
    const done = present.filter((x) => byId.get(x)!.completed).length;
    return { id, path, done, total: present.length, earned: present.length > 0 && done === present.length };
  };
  const faang = faangNext(items);
  return [
    cert("learn", "Learn to Program", LEARN_LESSONS),
    cert(
      "it-cs",
      "Well-rounded IT & CS",
      IT_CS_FAMILIES.flatMap((f) => f.lessons),
    ),
    // The FAANG plan has tasks that aren't lessons, so its certificate is "every task done".
    { id: "faang", path: "FAANG Interview Prep", done: faang === null ? 1 : 0, total: 1, earned: faang === null },
  ];
}

// ---- Which badges the learner has already been told about, and the name on certificates ----

const SEEN_KEY = "badges:seen";
const NAME_KEY = "badges:name";

// null before the first check, so a returning learner isn't shown every badge at once.
export function loadSeenBadges(): string[] | null {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

export function saveSeenBadges(ids: string[]) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // Blocked storage: badges may be announced again next visit.
  }
}

export function loadCertificateName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveCertificateName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // Blocked storage: the name lasts until the page closes.
  }
}

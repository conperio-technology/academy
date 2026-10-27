// "Plan first": before the bare editor opens, write the steps in plain English; they go into the
// starter as comments to fill in under, and after a pass they sit next to the lesson's own steps.

const PLAN_FIRST_KEY = "plan-first";

export function loadPlanFirst(): boolean {
  try {
    return localStorage.getItem(PLAN_FIRST_KEY) === "on";
  } catch {
    return false;
  }
}

export function savePlanFirst(on: boolean) {
  try {
    localStorage.setItem(PLAN_FIRST_KEY, on ? "on" : "off");
  } catch {
    // Blocked storage: the choice lasts until the page closes.
  }
}

// One step per non-empty line, with any numbering or bullet the learner typed removed.
export function parsePlan(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, "").trim())
    .filter((line) => line.length > 0);
}

// The bare starter with the plan as numbered comments above its return stub (or `pass`), at the
// stub's indentation. A starter without one gets the plan at the top.
export function insertPlan(starter: string, steps: string[], language: string): string {
  if (steps.length === 0) return starter;
  const marker = language === "python" ? "#" : "//";
  const lines = starter.split("\n");
  let at = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^\s+(return\b|pass\s*$)/.test(lines[i])) {
      at = i;
      break;
    }
  }
  const indent = at >= 0 ? lines[at].match(/^\s*/)![0] : "";
  const comments = steps.map((s, i) => `${indent}${marker} ${i + 1}. ${s}`);
  lines.splice(at >= 0 ? at : 0, 0, ...comments);
  return lines.join("\n");
}

// The lesson's own steps to compare against: the guided starter's whole-line comments, minus
// "TODO:" and numbering, and minus the lines that only describe a provided type.
export function lessonSteps(guided: string, language: string): string[] {
  const marker = language === "python" ? "#" : "//";
  return guided
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith(marker) && !/\(provided\)/i.test(line))
    .map((line) =>
      line
        .slice(marker.length)
        .replace(/^\s*TODO:?\s*/i, "")
        .replace(/^\s*\d+[.)]\s*/, "")
        .trim(),
    )
    .filter((line) => line.length > 0);
}

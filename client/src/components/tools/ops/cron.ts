// A small cron expression parser for the scheduling lesson: the five standard fields with
// Vixie cron's rules (the cron on Debian, Ubuntu and RHEL). Lists, ranges, steps, month
// and day names, 0 or 7 for Sunday, and the @ shortcuts. One quirk is kept on purpose:
// when both day-of-month and day-of-week are restricted, a day matching EITHER one runs
// the job; a field counts as unrestricted when it starts with "*".

export interface CronField {
  values: Set<number>;
  star: boolean;
}

export interface CronSchedule {
  minute: CronField;
  hour: CronField;
  dom: CronField;
  month: CronField;
  dow: CronField;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

interface Spec {
  name: string;
  min: number;
  max: number;
  names?: string[];
  nameBase?: number;
}

const SPECS: Spec[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day of month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, names: MONTHS, nameBase: 1 },
  { name: "day of week", min: 0, max: 7, names: DAYS, nameBase: 0 },
];

function num(text: string, spec: Spec): number {
  const lower = text.toLowerCase();
  if (spec.names) {
    const i = spec.names.indexOf(lower);
    if (i >= 0) return i + (spec.nameBase ?? 0);
  }
  if (!/^\d+$/.test(text)) throw new Error(`"${text}" isn't a number in the ${spec.name} field`);
  const n = Number(text);
  if (n < spec.min || n > spec.max) throw new Error(`${n} is out of range for ${spec.name} (${spec.min} to ${spec.max})`);
  return n;
}

function parseField(text: string, spec: Spec): CronField {
  const values = new Set<number>();
  for (const item of text.split(",")) {
    if (item === "") throw new Error(`empty item in the ${spec.name} field`);
    const [range, stepText, extra] = item.split("/");
    if (extra !== undefined) throw new Error(`"${item}" has more than one /`);
    let step = 1;
    if (stepText !== undefined) {
      if (!/^\d+$/.test(stepText) || Number(stepText) === 0) throw new Error(`"/${stepText}" isn't a valid step`);
      step = Number(stepText);
    }
    let lo: number;
    let hi: number;
    if (range === "*") {
      lo = spec.min;
      hi = spec.name === "day of week" ? 6 : spec.max;
    } else if (range.includes("-")) {
      const [a, b] = range.split("-");
      lo = num(a, spec);
      hi = num(b, spec);
      if (hi < lo) throw new Error(`range ${range} runs backwards`);
    } else {
      if (stepText !== undefined) throw new Error(`"${item}": a step needs * or a range in front of it, like */${stepText} or 0-30/${stepText}`);
      lo = hi = num(range, spec);
    }
    for (let v = lo; v <= hi; v += step) values.add(spec.name === "day of week" && v === 7 ? 0 : v);
  }
  return { values, star: text.startsWith("*") };
}

export function parseCron(expr: string): CronSchedule {
  let text = expr.trim().replace(/\s+/g, " ");
  if (text.toLowerCase() === "@reboot") throw new Error("@reboot runs once when cron starts, at boot, rather than on a clock schedule");
  if (text.startsWith("@")) {
    const m = MACROS[text.toLowerCase()];
    if (!m) throw new Error(`unknown shortcut ${text}`);
    text = m;
  }
  const parts = text.split(" ");
  if (parts.length !== 5) throw new Error(`a schedule has 5 fields (minute hour day-of-month month day-of-week); this has ${parts.length}`);
  const [minute, hour, dom, month, dow] = parts.map((p, i) => parseField(p, SPECS[i]));
  return { minute, hour, dom, month, dow };
}

function dayMatches(s: CronSchedule, d: Date): boolean {
  if (!s.month.values.has(d.getMonth() + 1)) return false;
  const domOk = s.dom.values.has(d.getDate());
  const dowOk = s.dow.values.has(d.getDay());
  if (s.dom.star || s.dow.star) return domOk && dowOk;
  return domOk || dowOk;
}

// The next `count` run times strictly after `from`, looking at most `years` ahead.
export function nextRuns(s: CronSchedule, from: Date, count: number, years = 5): Date[] {
  const out: Date[] = [];
  const hours = [...s.hour.values].sort((a, b) => a - b);
  const minutes = [...s.minute.values].sort((a, b) => a - b);
  const day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const limit = new Date(from.getFullYear() + years, from.getMonth(), from.getDate());
  while (out.length < count && day < limit) {
    if (dayMatches(s, day)) {
      for (const h of hours) {
        for (const m of minutes) {
          const t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
          if (t > from && out.length < count) out.push(t);
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return out;
}

function list(values: Set<number>, label: (n: number) => string): string {
  const v = [...values].sort((a, b) => a - b);
  // Collapse runs of consecutive values into "a through b".
  const groups: string[] = [];
  for (let i = 0; i < v.length; ) {
    let j = i;
    while (j + 1 < v.length && v[j + 1] === v[j] + 1) j++;
    groups.push(j - i >= 2 ? `${label(v[i])} through ${label(v[j])}` : v.slice(i, j + 1).map(label).join(", "));
    i = j + 1;
  }
  return groups.join(", ");
}

const pad = (n: number) => String(n).padStart(2, "0");
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function every(field: CronField, size: number): boolean {
  return field.values.size === size;
}

// A plain-English reading of a schedule.
export function describe(s: CronSchedule): string {
  let time: string;
  const allMin = every(s.minute, 60);
  const allHour = every(s.hour, 24);
  if (allMin && allHour) time = "every minute";
  else if (allMin) time = `every minute of hour ${list(s.hour.values, pad)}`;
  else if (allHour) time = s.minute.values.size === 1 ? `at minute ${[...s.minute.values][0]} of every hour` : `at minutes ${list(s.minute.values, String)} of every hour`;
  else if (s.minute.values.size * s.hour.values.size <= 6) {
    const times: string[] = [];
    for (const h of [...s.hour.values].sort((a, b) => a - b)) for (const m of [...s.minute.values].sort((a, b) => a - b)) times.push(`${pad(h)}:${pad(m)}`);
    time = `at ${times.join(", ")}`;
  } else time = `at minutes ${list(s.minute.values, String)} past hours ${list(s.hour.values, pad)}`;

  const days: string[] = [];
  const domRestricted = !every(s.dom, 31);
  const dowRestricted = !every(s.dow, 7);
  const domText = `on day ${list(s.dom.values, String)} of the month`;
  const dowText = `on ${list(s.dow.values, (n) => DAY_NAMES[n])}`;
  if (domRestricted && dowRestricted && !s.dom.star && !s.dow.star) days.push(`${domText}, and also ${dowText}`);
  else {
    if (domRestricted) days.push(domText);
    if (dowRestricted) days.push(dowText);
  }
  if (!every(s.month, 12)) days.push(`in ${list(s.month.values, (n) => MONTH_NAMES[n - 1])}`);
  return [time, ...days].join(" ");
}

export function formatRun(d: Date): string {
  return `${DAY_NAMES[d.getDay()].slice(0, 3)} ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

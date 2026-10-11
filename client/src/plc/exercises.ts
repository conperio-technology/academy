// Graded Structured Text exercises for the PLC programming track. Each one lists its I/O,
// the requirements in plain words, starter code, a reference solution and a scripted
// test: input changes over simulated time, with outputs checked on every scan.
// scripts/check-plc-st.mjs proves each reference solution passes and each starter fails.
// The prose for each exercise (the "why") is in its server ITool file; the requirements
// live here, next to the tests that enforce them, so the two can't drift apart.

import { runsOf, seconds, type TestStep } from "./grader.ts";
import { tankPlant, type IoDef, type Plant, type TraceRow } from "./sim.ts";

export interface PlcExerciseData {
  id: string;
  title: string; // short name for links (the page title comes from the server)
  lessonId: string; // the lesson this practises
  io: IoDef[];
  scanMs: number;
  requirements: string[];
  starter: string;
  solution: string;
  hints: string[];
  tests: TestStep[];
  trend: string[]; // signals for the timing chart
  extra?: string[]; // extra signals to record (FB members)
  plant?: Plant; // optional machine model for "try it in the simulator"
  afterword?: string; // shown with the reference solution
  alsoPasses?: string[]; // other correct answers (checked by the script)
  shouldFail?: string[]; // plausible wrong answers the tests must catch
}

const SCAN = 10;

// ---- Custom checks ----

function ensure(rows: TraceRow[], pred: (r: TraceRow) => boolean, msg: (r: TraceRow) => string): string | null {
  for (const r of rows) if (!pred(r)) return msg(r);
  return null;
}

// Each complete on and off period of `name` must last between lo and hi ms, there must be
// at least `minOn` on periods, and the first on period must begin within `firstWithin` ms.
function flashCheck(name: string, lo: number, hi: number, minOn: number, firstWithin: number) {
  return (rows: TraceRow[]): string | null => {
    const runs = runsOf(rows, name, SCAN);
    const start = rows[0].t;
    const firstOn = runs.find((r) => r.value);
    if (!firstOn) return `${name} never turned on.`;
    if (firstOn.start - start > firstWithin) return `${name} first turned on at ${seconds(firstOn.start)}, ${firstOn.start - start} ms after Enable. It should come on within ${firstWithin} ms.`;
    const complete = runs.slice(runs.indexOf(firstOn), -1);
    for (const r of complete) {
      const d = r.end - r.start;
      if (d < lo || d > hi) return `${name} was ${r.value ? "on" : "off"} for ${d} ms (from ${seconds(r.start)}). Each on and off period should be ${lo} to ${hi} ms.`;
    }
    const ons = runs.filter((r) => r.value).length;
    if (ons < minOn) return `${name} only came on ${ons} time${ons === 1 ? "" : "s"} in ${seconds(rows.length * SCAN)}. Expected at least ${minOn} flashes.`;
    return null;
  };
}

function changesOf(rows: TraceRow[], name: string, before: boolean) {
  let n = 0;
  let prev = before;
  for (const r of rows) {
    if (r.values[name] !== prev) n++;
    prev = r.values[name] as boolean;
  }
  return n;
}

const LIGHTS = ["Red", "Green", "Yellow"] as const;
const CYCLE: [string, number][] = [["Red", 4000], ["Green", 3000], ["Yellow", 1000]];
const SLACK = 30; // each traffic light phase may run up to 3 scans long

function oneLight(rows: TraceRow[]) {
  return ensure(
    rows,
    (r) => LIGHTS.filter((l) => r.values[l]).length === 1,
    (r) => `At ${seconds(r.t)}: ${LIGHTS.filter((l) => r.values[l]).join(" and ") || "no light"} ${LIGHTS.filter((l) => r.values[l]).length > 1 ? "were" : "was"} on. Exactly one light must be on at any time.`,
  );
}

function trafficCycleCheck(rows: TraceRow[]): string | null {
  const bad = oneLight(rows);
  if (bad) return bad;
  const colorRuns: { color: string; start: number; end: number }[] = [];
  for (const r of rows) {
    const c = LIGHTS.find((l) => r.values[l])!;
    const last = colorRuns[colorRuns.length - 1];
    if (last && last.color === c) last.end = r.t + SCAN;
    else colorRuns.push({ color: c, start: r.t, end: r.t + SCAN });
  }
  for (let i = 0; i < colorRuns.length; i++) {
    const run = colorRuns[i];
    const [color, ms] = CYCLE[i % 3];
    if (run.color !== color) return `At ${seconds(run.start)} the light went to ${run.color}, but ${i === 0 ? "the cycle should start with" : `after ${CYCLE[(i + 2) % 3][0]} it should go to`} ${color}. The order is red, green, yellow.`;
    const d = run.end - run.start;
    const complete = i < colorRuns.length - 1;
    if ((complete && d < ms) || d > ms + SLACK)
      return `${color} was on for ${d} ms (from ${seconds(run.start)}). It should be on for ${ms} ms (up to ${SLACK} ms longer is fine).`;
  }
  return null;
}

const RED_ONLY = { Red: true, Yellow: false, Green: false };

// ---- Debounce helpers ----

function bounce(pattern: [boolean, number][], hold: Record<string, boolean>, what: string): TestStep[] {
  return pattern.map(([v, ms]) => ({ label: `${what}: RawSwitch ${v ? "TRUE" : "FALSE"} for ${ms} ms`, set: { RawSwitch: v }, ms, hold, why: "Blips shorter than 50 ms are bounce and must not change Clean." }));
}

// ---- Exercises ----

export const PLC_EXERCISES: PlcExerciseData[] = [
  {
    id: "plc-ex-seal-in",
    title: "Start/stop motor seal-in",
    lessonId: "plc-contacts-seal-in",
    scanMs: SCAN,
    io: [
      { name: "Start", type: "BOOL", dir: "in", label: "Start (NO pushbutton)", widget: "button" },
      { name: "Stop_NC", type: "BOOL", dir: "in", label: "Stop (NC pushbutton)", widget: "nc-button" },
      { name: "Motor", type: "BOOL", dir: "out", label: "Motor starter", widget: "motor" },
    ],
    requirements: [
      "Pressing Start starts the motor, and it keeps running after Start is released.",
      "Pressing Stop stops the motor. Stop_NC is wired normally closed: it reads TRUE while the button is NOT pressed, and FALSE while it is pressed (or if its wire breaks).",
      "Stop wins: with Start and Stop both held, the motor is off.",
      "Releasing Stop must not restart the motor by itself.",
      "If the stop circuit is open (Stop_NC FALSE, for example a broken wire), Start must not start the motor.",
    ],
    starter: `(* Start/stop motor. Start is a normally open pushbutton,
   Stop_NC a normally closed one (TRUE when NOT pressed). *)
Motor := Start;
`,
    solution: `(* Seal-in: once running, Motor holds itself on through its own
   contact. Stop_NC is TRUE while healthy, so it is used as-is:
   pressing Stop, or a broken wire, makes it FALSE and drops Motor. *)
Motor := (Start OR Motor) AND Stop_NC;
`,
    hints: [
      "Motor := Start; only runs while Start is held. The motor needs to remember that it's running: use Motor itself in the expression.",
      "In ladder this is a Start contact with a Motor contact in parallel (OR), in series with the Stop contact (AND).",
      "Stop_NC is already TRUE when things are fine. Don't invert it with NOT: AND it in as it is.",
    ],
    tests: [
      { label: "Power up, nothing pressed", ms: 100, hold: { Motor: false } },
      { label: "Press Start", set: { Start: true }, ms: 50, end: { Motor: true }, why: "Start must start the motor." },
      { label: "Release Start", set: { Start: false }, ms: 500, hold: { Motor: true }, why: "The motor must seal itself in and keep running after Start is released." },
      { label: "Press Stop", set: { Stop_NC: false }, ms: 50, end: { Motor: false }, why: "Pressing Stop (Stop_NC goes FALSE) must stop the motor." },
      { label: "Release Stop", set: { Stop_NC: true }, ms: 300, hold: { Motor: false }, why: "Releasing Stop must not restart the motor." },
      { label: "Hold Start and Stop together", set: { Start: true, Stop_NC: false }, ms: 200, hold: { Motor: false }, why: "Stop must win over Start." },
      { label: "Release Stop while still holding Start", set: { Stop_NC: true }, ms: 50, end: { Motor: true } },
      { label: "Release Start", set: { Start: false }, ms: 100, hold: { Motor: true } },
      { label: "The stop circuit's wire breaks", set: { Stop_NC: false }, ms: 50, end: { Motor: false }, why: "An open stop circuit must stop the motor, just like pressing Stop." },
      { label: "Press Start with the stop wire still broken", set: { Start: true }, ms: 200, hold: { Motor: false }, why: "With the stop circuit open, Start must not start the motor." },
    ],
    trend: ["Start", "Stop_NC", "Motor"],
    afterword:
      "Ladder people call this a seal-in or latching rung: the Motor contact in parallel with Start. The same thing written with IF statements also works (set on Start, then reset on NOT Stop_NC, in that order so Stop wins), but the one-line form is the direct copy of the rung.",
    alsoPasses: [
      "IF Start THEN Motor := TRUE; END_IF;\nIF NOT Stop_NC THEN Motor := FALSE; END_IF;",
      "VAR latch : RS; END_VAR\nlatch(S := Start, R1 := NOT Stop_NC);\nMotor := latch.Q1;",
    ],
    shouldFail: [
      "Motor := (Start OR Motor) AND NOT Stop_NC;",
      "IF NOT Stop_NC THEN Motor := FALSE; END_IF;\nIF Start THEN Motor := TRUE; END_IF;",
    ],
  },
  {
    id: "plc-ex-flasher",
    title: "Flashing beacon with TON",
    lessonId: "plc-timers",
    scanMs: SCAN,
    io: [
      { name: "Enable", type: "BOOL", dir: "in", label: "Enable switch", widget: "switch" },
      { name: "Lamp", type: "BOOL", dir: "out", label: "Beacon", widget: "lamp", color: "amber" },
    ],
    requirements: [
      "While Enable is TRUE, Lamp flashes: about 0.5 s on, then about 0.5 s off, repeating. Each on and off period may be 450 to 560 ms.",
      "Lamp comes on within 0.1 s of Enable turning on (start with an on period).",
      "While Enable is FALSE, Lamp is off. Turning Enable on again starts with a fresh on period.",
    ],
    starter: `(* Flash the beacon while Enable is on. *)
Lamp := Enable;
`,
    solution: `VAR
  OnTimer : TON;    (* times the on half *)
  OffTimer : TON;   (* times the off half *)
END_VAR

(* Two timers chase each other: OnTimer runs until done, then
   OffTimer runs; when OffTimer finishes it resets OnTimer,
   which resets OffTimer, and the cycle starts over. *)
OnTimer(IN := Enable AND NOT OffTimer.Q, PT := T#500ms);
OffTimer(IN := OnTimer.Q, PT := T#500ms);

Lamp := Enable AND NOT OnTimer.Q;
`,
    hints: [
      "A TON's Q goes TRUE when its IN has been TRUE for PT. If a timer's own Q feeds back to reset its IN, it restarts itself.",
      "One approach uses two TONs: one times the on half, the other the off half, and the second one's Q resets the first.",
      "Another uses one TON with PT := T#1s that restarts itself, and turns the lamp on while its ET is under T#500ms.",
    ],
    tests: [
      { label: "Enable off", ms: 300, hold: { Lamp: false } },
      { label: "Turn Enable on and watch for 4 s", set: { Enable: true }, ms: 4000, check: flashCheck("Lamp", 450, 560, 3, 100), why: "The lamp should flash with about 0.5 s on and 0.5 s off." },
      { label: "Turn Enable off", set: { Enable: false }, ms: 500, hold: { Lamp: false }, why: "With Enable off the lamp must stay off." },
      {
        label: "Turn Enable on again",
        set: { Enable: true },
        ms: 150,
        check: (rows) => (rows.slice(0, 10).some((r) => r.values.Lamp) ? null : "Lamp didn't come on within 0.1 s of Enable. Each enable should start with an on period."),
      },
    ],
    trend: ["Enable", "Lamp", "OnTimer.Q", "OffTimer.Q"],
    extra: ["OnTimer.Q", "OffTimer.Q"],
    afterword:
      "Two timers that reset each other are the classic PLC flasher. Each half lasts PT plus about one scan, because a timer only notices it has finished, and the other only starts, when the program is next scanned. That's why the grader allows a little slack.",
    alsoPasses: [
      "VAR t : TON; END_VAR\nt(IN := Enable AND NOT t.Q, PT := T#1s);\nLamp := Enable AND t.ET < T#500ms;",
    ],
  },
  {
    id: "plc-ex-debounce",
    title: "Debounce a bouncy contact",
    lessonId: "plc-timers",
    scanMs: SCAN,
    io: [
      { name: "RawSwitch", type: "BOOL", dir: "in", label: "Raw contact (bouncy)", widget: "switch" },
      { name: "Clean", type: "BOOL", dir: "out", label: "Debounced signal", widget: "lamp", color: "green" },
    ],
    requirements: [
      "Clean turns TRUE only after RawSwitch has been TRUE without a break for 50 ms.",
      "Clean turns FALSE only after RawSwitch has been FALSE without a break for 50 ms.",
      "Blips shorter than that, in either direction, don't change Clean.",
    ],
    starter: `(* Filter contact bounce out of RawSwitch. *)
Clean := RawSwitch;
`,
    solution: `VAR
  OnFilter : TON;    (* RawSwitch steady TRUE for 50 ms *)
  OffFilter : TON;   (* RawSwitch steady FALSE for 50 ms *)
END_VAR

OnFilter(IN := RawSwitch, PT := T#50ms);
OffFilter(IN := NOT RawSwitch, PT := T#50ms);

IF OnFilter.Q THEN
  Clean := TRUE;
ELSIF OffFilter.Q THEN
  Clean := FALSE;
END_IF;
(* Otherwise Clean keeps its last value. *)
`,
    hints: [
      "A TON on RawSwitch is only done once RawSwitch has stayed TRUE for the whole PT: any blip to FALSE resets it.",
      "You need that in both directions: one timer for steady TRUE, another for steady FALSE (IN := NOT RawSwitch).",
      "An IF that sets Clean in one case and clears it in another, and does nothing otherwise, keeps the old value in between.",
    ],
    tests: [
      { label: "Idle", ms: 100, hold: { Clean: false } },
      ...bounce([[true, 20], [false, 10], [true, 30], [false, 20], [true, 10], [false, 20]], { Clean: false }, "Contact bounces while closing"),
      { label: "Contact settles closed: first 40 ms", set: { RawSwitch: true }, ms: 40, hold: { Clean: false }, why: "Clean must wait until RawSwitch has been TRUE for 50 ms." },
      { label: "Still closed at 70 ms", ms: 30, end: { Clean: true }, why: "After 50 ms of steady TRUE, Clean must be TRUE." },
      { label: "Stays closed", ms: 500, hold: { Clean: true } },
      ...bounce([[false, 20], [true, 10], [false, 30], [true, 20]], { Clean: true }, "Contact bounces while opening"),
      { label: "Contact settles open: first 40 ms", set: { RawSwitch: false }, ms: 40, hold: { Clean: true }, why: "Clean must wait until RawSwitch has been FALSE for 50 ms." },
      { label: "Still open at 70 ms", ms: 30, end: { Clean: false }, why: "After 50 ms of steady FALSE, Clean must be FALSE." },
      { label: "Stays open", ms: 300, hold: { Clean: false } },
      { label: "A 40 ms blip", set: { RawSwitch: true }, ms: 40, hold: { Clean: false }, why: "40 ms is shorter than the 50 ms filter, so it's ignored." },
      { label: "After the blip", set: { RawSwitch: false }, ms: 200, hold: { Clean: false } },
    ],
    trend: ["RawSwitch", "Clean", "OnFilter.Q", "OffFilter.Q"],
    extra: ["OnFilter.Q", "OffFilter.Q"],
    afterword:
      "This filters both edges. Many input cards also have a configurable hardware input filter for the same job; a software filter like this is for slower bounce or chatter, such as a float switch on a sloshing tank.",
    shouldFail: ["VAR t : TON; END_VAR\nt(IN := RawSwitch, PT := T#50ms);\nClean := t.Q;"],
  },
  {
    id: "plc-ex-toggle",
    title: "Push-on, push-off toggle",
    lessonId: "plc-edge-detection",
    scanMs: SCAN,
    io: [
      { name: "Button", type: "BOOL", dir: "in", label: "Pushbutton", widget: "button" },
      { name: "Lamp", type: "BOOL", dir: "out", label: "Lamp", widget: "lamp", color: "yellow" },
    ],
    requirements: [
      "Each press of Button toggles Lamp: off to on, or on to off.",
      "Holding the button down counts as one press, however long it's held.",
      "Releasing the button changes nothing.",
    ],
    starter: `(* Push on, push off. *)
IF Button THEN
  Lamp := NOT Lamp;
END_IF;
`,
    solution: `VAR
  Pressed : R_TRIG;   (* TRUE for one scan per press *)
END_VAR

Pressed(CLK := Button);
IF Pressed.Q THEN
  Lamp := NOT Lamp;
END_IF;
`,
    hints: [
      "The starter flips Lamp on every scan the button is held, hundreds of times a second. You want to act once per press.",
      "An R_TRIG's Q is TRUE for exactly one scan when its CLK goes from FALSE to TRUE.",
    ],
    tests: [
      { label: "Idle", ms: 100, hold: { Lamp: false } },
      {
        label: "Press the button",
        set: { Button: true },
        ms: 50,
        end: { Lamp: true },
        check: (rows) => (changesOf(rows, "Lamp", false) === 1 ? null : `Lamp changed ${changesOf(rows, "Lamp", false)} times during one press. It should change exactly once.`),
        why: "One press, one toggle.",
      },
      { label: "Keep holding it for 1 s", ms: 1000, hold: { Lamp: true }, why: "Holding the button is still one press." },
      { label: "Release", set: { Button: false }, ms: 300, hold: { Lamp: true }, why: "Releasing changes nothing." },
      {
        label: "Press again",
        set: { Button: true },
        ms: 300,
        end: { Lamp: false },
        check: (rows) => (changesOf(rows, "Lamp", true) === 1 ? null : `Lamp changed ${changesOf(rows, "Lamp", true)} times during one press. It should change exactly once.`),
      },
      { label: "Release", set: { Button: false }, ms: 200, hold: { Lamp: false } },
      { label: "A quick tap, one scan long", set: { Button: true }, ms: 10, end: { Lamp: true }, why: "Even a one-scan press is a press." },
      { label: "Release", set: { Button: false }, ms: 200, hold: { Lamp: true } },
    ],
    trend: ["Button", "Lamp", "Pressed.Q"],
    extra: ["Pressed.Q"],
    afterword: "The same thing written by hand: IF Button AND NOT ButtonPrev THEN ... END_IF; ButtonPrev := Button; with ButtonPrev updated after the test. R_TRIG is that pattern packaged up, with its own memory per instance.",
    alsoPasses: ["VAR ButtonPrev : BOOL; END_VAR\nIF Button AND NOT ButtonPrev THEN\n  Lamp := NOT Lamp;\nEND_IF;\nButtonPrev := Button;"],
  },
  {
    id: "plc-ex-part-counter",
    title: "Part counter with reset",
    lessonId: "plc-counters",
    scanMs: SCAN,
    io: [
      { name: "PartSensor", type: "BOOL", dir: "in", label: "Part sensor (photo-eye)", widget: "switch" },
      { name: "ResetBtn", type: "BOOL", dir: "in", label: "Reset", widget: "button" },
      { name: "Count", type: "INT", dir: "out", label: "Parts counted", widget: "value" },
      { name: "BatchDone", type: "BOOL", dir: "out", label: "Batch of 10 done", widget: "lamp", color: "green" },
    ],
    requirements: [
      "Count goes up by 1 each time a part arrives, that is each time PartSensor goes from FALSE to TRUE. A part sitting in front of the sensor counts once.",
      "BatchDone is on whenever Count is 10 or more.",
      "Pressing ResetBtn sets Count back to 0. While ResetBtn is held, arriving parts are not counted.",
    ],
    starter: `(* Count parts in batches of 10. *)
IF PartSensor THEN
  Count := Count + 1;
END_IF;
BatchDone := Count >= 10;
`,
    solution: `VAR
  PartCounter : CTU;
END_VAR

PartCounter(CU := PartSensor, R := ResetBtn, PV := 10);
Count := PartCounter.CV;
BatchDone := PartCounter.Q;
`,
    hints: [
      "The starter adds 1 on every scan the sensor is blocked, about 100 times a second.",
      "A CTU counts rising edges of CU, resets on R, and sets Q when CV >= PV.",
    ],
    tests: [
      { label: "Idle", ms: 100, hold: { Count: 0, BatchDone: false } },
      { label: "First part sits in front of the sensor for 1 s", set: { PartSensor: true }, ms: 1000, hold: { Count: 1 }, why: "One part counts once, however long it blocks the sensor." },
      { label: "Part leaves", set: { PartSensor: false }, ms: 100, hold: { Count: 1 } },
      ...Array.from({ length: 8 }, (_, i): TestStep[] => [
        { label: `Part ${i + 2} arrives (50 ms)`, set: { PartSensor: true }, ms: 50, hold: { BatchDone: false }, end: { Count: i + 2 } },
        { label: `Part ${i + 2} leaves`, set: { PartSensor: false }, ms: 50, hold: { Count: i + 2 } },
      ]).flat(),
      { label: "Part 10 arrives", set: { PartSensor: true }, ms: 50, end: { Count: 10, BatchDone: true }, why: "BatchDone turns on at 10 parts." },
      { label: "Part 10 leaves", set: { PartSensor: false }, ms: 50, hold: { BatchDone: true } },
      { label: "Part 11 arrives", set: { PartSensor: true }, ms: 50, end: { Count: 11, BatchDone: true } },
      { label: "Part 11 leaves", set: { PartSensor: false }, ms: 50 },
      { label: "Press Reset", set: { ResetBtn: true }, ms: 50, end: { Count: 0, BatchDone: false }, why: "Reset clears the count." },
      { label: "A part arrives while Reset is held", set: { PartSensor: true }, ms: 100, hold: { Count: 0 }, why: "While Reset is held, parts are not counted." },
      { label: "Release Reset (that part is still there)", set: { ResetBtn: false }, ms: 100, hold: { Count: 0 }, why: "That part arrived during the reset, so it isn't counted afterwards either." },
      { label: "It leaves and the next part arrives", set: { PartSensor: false }, ms: 50 },
      { label: "Next part", set: { PartSensor: true }, ms: 50, end: { Count: 1 } },
    ],
    trend: ["PartSensor", "ResetBtn", "BatchDone"],
    afterword:
      "CTU's CV is an INT, so it stops at 32767 rather than wrapping round to a negative number. Counting edges by hand works too, but the counter block makes the intent obvious to the next person who reads the program.",
    alsoPasses: [
      "VAR Prev : BOOL; END_VAR\nIF ResetBtn THEN\n  Count := 0;\nELSIF PartSensor AND NOT Prev THEN\n  Count := Count + 1;\nEND_IF;\nPrev := PartSensor;\nBatchDone := Count >= 10;",
    ],
  },
  {
    id: "plc-ex-traffic-light",
    title: "Traffic light state machine",
    lessonId: "plc-state-machines",
    scanMs: SCAN,
    io: [
      { name: "Run", type: "BOOL", dir: "in", label: "Run", widget: "switch" },
      { name: "Red", type: "BOOL", dir: "out", label: "Red", widget: "lamp", color: "red" },
      { name: "Yellow", type: "BOOL", dir: "out", label: "Yellow", widget: "lamp", color: "yellow" },
      { name: "Green", type: "BOOL", dir: "out", label: "Green", widget: "lamp", color: "green" },
    ],
    requirements: [
      "While Run is FALSE, only Red is on.",
      "While Run is TRUE the lights cycle: red for 4 s, green for 3 s, yellow for 1 s, then back to red, forever. Each phase may run up to 30 ms (3 scans) long.",
      "Exactly one light is on at any time.",
      "Turning Run off at any point goes straight to red. When Run comes back on, the cycle starts with a fresh 4 s of red.",
    ],
    starter: `VAR
  State : INT := 0;   (* 0 = red, 1 = green, 2 = yellow *)
END_VAR

(* Add the timed sequence. *)
Red := TRUE;
Yellow := FALSE;
Green := FALSE;
`,
    solution: `VAR
  State : INT := 0;      (* 0 = red, 1 = green, 2 = yellow *)
  RedTimer : TON;
  GreenTimer : TON;
  YellowTimer : TON;
END_VAR

IF NOT Run THEN
  State := 0;
END_IF;

(* Each timer runs only while its state is active, so it
   starts from zero every time the state is entered. *)
RedTimer(IN := Run AND State = 0, PT := T#4s);
GreenTimer(IN := State = 1, PT := T#3s);
YellowTimer(IN := State = 2, PT := T#1s);

CASE State OF
  0: IF RedTimer.Q THEN State := 1; END_IF;
  1: IF GreenTimer.Q THEN State := 2; END_IF;
  2: IF YellowTimer.Q THEN State := 0; END_IF;
END_CASE;

(* Outputs come from the state, in one place. *)
Red := State = 0;
Green := State = 1;
Yellow := State = 2;
`,
    hints: [
      "Keep a State number for which light is on. A CASE on State decides when to move to the next state.",
      "Give each state its own TON with IN := (State = n). It starts from zero on entering the state and resets on leaving it.",
      "Set the three outputs from State once, after the CASE, rather than inside each branch. Then exactly one is on, always.",
    ],
    tests: [
      { label: "Run off", ms: 500, hold: RED_ONLY, why: "With Run off, only red is on." },
      { label: "Run on: watch two full cycles (16 s)", set: { Run: true }, ms: 16000, check: trafficCycleCheck, why: "Red 4 s, green 3 s, yellow 1 s, repeating." },
      { label: "Run off", set: { Run: false }, ms: 300, hold: RED_ONLY, why: "Turning Run off goes straight to red." },
      { label: "Run on for 5 s", set: { Run: true }, ms: 5000, check: trafficCycleCheck, why: "Turning Run back on starts with a fresh 4 s of red." },
      { label: "Run off during green", set: { Run: false }, ms: 300, hold: RED_ONLY, why: "Turning Run off goes straight to red, even from green." },
      { label: "Run on again", set: { Run: true }, ms: 4500, check: trafficCycleCheck, why: "A fresh 4 s of red after Run comes back." },
    ],
    trend: ["Run", "Red", "Green", "Yellow"],
    afterword:
      "Notice the outputs are written in exactly one place each, from State. If each CASE branch set lamps itself, it's easy to forget to switch the previous one off. Each phase after the first comes out one scan long, because a new state's timer starts on the scan after the state changes.",
    shouldFail: [
      "VAR State : INT; T1 : TON; END_VAR\nT1(IN := Run, PT := T#4s);\nIF T1.Q THEN State := 1; END_IF;\nRed := State = 0; Green := State = 1; Yellow := FALSE;",
    ],
  },
  {
    id: "plc-ex-conveyor-jam",
    title: "Conveyor jam detection",
    lessonId: "plc-state-machines",
    scanMs: SCAN,
    io: [
      { name: "Start", type: "BOOL", dir: "in", label: "Start", widget: "button" },
      { name: "Stop_NC", type: "BOOL", dir: "in", label: "Stop (NC)", widget: "nc-button" },
      { name: "PhotoEye", type: "BOOL", dir: "in", label: "Photo-eye blocked", widget: "switch" },
      { name: "ResetBtn", type: "BOOL", dir: "in", label: "Reset jam", widget: "button" },
      { name: "Motor", type: "BOOL", dir: "out", label: "Conveyor motor", widget: "motor" },
      { name: "JamLamp", type: "BOOL", dir: "out", label: "Jam", widget: "lamp", color: "red" },
    ],
    requirements: [
      "Start and Stop work as a seal-in, as in the start/stop exercise (Stop_NC is wired normally closed).",
      "If PhotoEye stays blocked (TRUE) for 2 s while the motor is running, a part has jammed: latch JamLamp on and stop the motor.",
      "A blocked eye while the motor is stopped is not a jam.",
      "ResetBtn clears JamLamp, but only once PhotoEye is clear (FALSE).",
      "Clearing the jam must not restart the motor by itself, and while JamLamp is on, Start does nothing.",
    ],
    starter: `(* Conveyor with start/stop. Add jam detection. *)
Motor := (Start OR Motor) AND Stop_NC;
`,
    solution: `VAR
  JamTimer : TON;
END_VAR

(* A jam: the eye stays blocked for 2 s while the belt moves. *)
JamTimer(IN := Motor AND PhotoEye, PT := T#2s);
IF JamTimer.Q THEN
  JamLamp := TRUE;
END_IF;

(* Reset only once the part has been cleared. *)
IF ResetBtn AND NOT PhotoEye THEN
  JamLamp := FALSE;
END_IF;

(* Seal-in. A jam drops the seal, so Start is needed again. *)
Motor := (Start OR Motor) AND Stop_NC AND NOT JamLamp;
`,
    hints: [
      "A TON whose IN is Motor AND PhotoEye only times while the belt is moving and the eye is blocked.",
      "Latch the jam with IF ... THEN JamLamp := TRUE; and clear it in a separate IF that checks ResetBtn AND NOT PhotoEye.",
      "Put NOT JamLamp into the seal-in rung. That stops the motor and also breaks the seal, so it stays off until Start is pressed again.",
    ],
    tests: [
      { label: "Idle", ms: 100, hold: { Motor: false, JamLamp: false } },
      { label: "Press Start", set: { Start: true }, ms: 50, end: { Motor: true } },
      { label: "Release Start", set: { Start: false }, ms: 200, hold: { Motor: true } },
      ...Array.from({ length: 3 }, (_, i): TestStep[] => [
        { label: `Part ${i + 1} passes the eye (0.8 s)`, set: { PhotoEye: true }, ms: 800, hold: { Motor: true, JamLamp: false }, why: "A part passing normally is not a jam." },
        { label: `Gap after part ${i + 1}`, set: { PhotoEye: false }, ms: 400, hold: { Motor: true, JamLamp: false } },
      ]).flat(),
      { label: "A part jams: eye blocked, first 1.9 s", set: { PhotoEye: true }, ms: 1900, hold: { Motor: true, JamLamp: false }, why: "The jam alarm needs 2 s of blocked eye." },
      { label: "Eye still blocked at 2.5 s", ms: 600, end: { Motor: false, JamLamp: true }, why: "After 2 s blocked with the motor running: latch the jam and stop the motor." },
      { label: "Press Start while jammed", set: { Start: true }, ms: 200, hold: { Motor: false }, why: "Start does nothing while the jam is active." },
      { label: "Release Start", set: { Start: false }, ms: 100, hold: { Motor: false, JamLamp: true } },
      { label: "Press Reset with the part still there", set: { ResetBtn: true }, ms: 200, hold: { JamLamp: true }, why: "Reset only works once the eye is clear." },
      { label: "Release Reset", set: { ResetBtn: false }, ms: 100, hold: { JamLamp: true } },
      { label: "Clear the part", set: { PhotoEye: false }, ms: 200, hold: { JamLamp: true }, why: "Clearing the part alone doesn't reset the alarm; the operator presses Reset." },
      { label: "Press Reset", set: { ResetBtn: true }, ms: 100, end: { JamLamp: false, Motor: false } },
      { label: "Release Reset", set: { ResetBtn: false }, ms: 300, hold: { Motor: false }, why: "Clearing a jam must not restart the motor by itself." },
      { label: "Press Start", set: { Start: true }, ms: 50, end: { Motor: true } },
      { label: "Release Start", set: { Start: false }, ms: 200, hold: { Motor: true } },
      { label: "Press Stop", set: { Stop_NC: false }, ms: 50, end: { Motor: false } },
      { label: "Release Stop, then block the eye for 3 s with the motor stopped", set: { Stop_NC: true, PhotoEye: true }, ms: 3000, hold: { JamLamp: false, Motor: false }, why: "A blocked eye on a stopped belt is not a jam." },
    ],
    trend: ["Start", "PhotoEye", "ResetBtn", "Motor", "JamLamp"],
    afterword:
      "Jam detection by timeout is common because it needs no extra hardware: the eye that counts parts also notices when one stops moving. The time limit has to be longer than the slowest normal part and shorter than the time a pile-up takes to cause damage.",
    shouldFail: [
      "VAR JamTimer : TON; END_VAR\nJamTimer(IN := PhotoEye, PT := T#2s);\nIF JamTimer.Q THEN JamLamp := TRUE; END_IF;\nIF ResetBtn AND NOT PhotoEye THEN JamLamp := FALSE; END_IF;\nMotor := (Start OR Motor) AND Stop_NC AND NOT JamLamp;",
      "VAR JamTimer : TON; END_VAR\nJamTimer(IN := Motor AND PhotoEye, PT := T#2s);\nIF JamTimer.Q THEN JamLamp := TRUE; END_IF;\nIF ResetBtn AND NOT PhotoEye THEN JamLamp := FALSE; END_IF;\nMotor := ((Start OR Motor) AND Stop_NC AND NOT JamLamp) OR (Stop_NC AND NOT JamLamp AND Motor);\nIF JamLamp THEN Motor := FALSE; END_IF;\nIF ResetBtn AND NOT PhotoEye THEN Motor := TRUE; END_IF;",
    ],
  },
  {
    id: "plc-ex-analog-scaling",
    title: "Scale a 4 to 20 mA pressure signal",
    lessonId: "plc-analog-alarms",
    scanMs: SCAN,
    io: [
      { name: "PressureRaw", type: "INT", dir: "in", label: "Pressure transmitter (raw counts)", widget: "slider", min: 0, max: 32767, step: 1, init: 6400 },
      { name: "Pressure", type: "REAL", dir: "out", label: "Pressure", widget: "value", unit: "bar" },
      { name: "WireBreak", type: "BOOL", dir: "out", label: "Wire break", widget: "lamp", color: "red" },
    ],
    requirements: [
      "The analog input card reads the 4 to 20 mA transmitter as counts: 6400 at 4 mA and 32000 at 20 mA (1600 counts per mA). These are this exercise's numbers; real cards each have their own.",
      "Scale linearly into Pressure in bar: 6400 counts is 0.0 bar and 32000 counts is 10.0 bar.",
      "Below 5760 counts (3.6 mA) the signal means a broken wire or a failed transmitter: WireBreak is TRUE and Pressure is 0.0.",
      "From 5760 up to 6400 counts (slightly under 4 mA) it is not a fault: WireBreak is FALSE and Pressure is clamped to 0.0, never negative. Above 32000 counts Pressure is clamped to 10.0.",
    ],
    starter: `(* Scale the raw counts to bar. *)
Pressure := INT_TO_REAL(PressureRaw) / 3200.0;
`,
    solution: `VAR
  RawReal : REAL;
END_VAR

RawReal := INT_TO_REAL(PressureRaw);
WireBreak := PressureRaw < 5760;   (* below 3.6 mA *)

IF WireBreak THEN
  Pressure := 0.0;
ELSE
  (* 6400 counts = 0 bar, 32000 counts = 10 bar *)
  Pressure := (RawReal - 6400.0) * 10.0 / (32000.0 - 6400.0);
  Pressure := LIMIT(0.0, Pressure, 10.0);
END_IF;
`,
    hints: [
      "Linear scaling: eng = (raw - rawMin) * (engMax - engMin) / (rawMax - rawMin) + engMin.",
      "Convert to REAL first with INT_TO_REAL(...), so the division keeps its fraction. ST won't mix INT and REAL by itself.",
      "LIMIT(0.0, x, 10.0) clamps x into the range.",
    ],
    tests: [
      { label: "4 mA (6400 counts)", set: { PressureRaw: 6400 }, ms: 30, end: { Pressure: { approx: 0, tol: 0.01 }, WireBreak: false } },
      { label: "20 mA (32000 counts)", set: { PressureRaw: 32000 }, ms: 30, end: { Pressure: { approx: 10, tol: 0.01 }, WireBreak: false } },
      { label: "12 mA (19200 counts)", set: { PressureRaw: 19200 }, ms: 30, end: { Pressure: { approx: 5, tol: 0.01 } } },
      { label: "8 mA (12800 counts)", set: { PressureRaw: 12800 }, ms: 30, end: { Pressure: { approx: 2.5, tol: 0.01 } } },
      { label: "4.4 mA (7040 counts)", set: { PressureRaw: 7040 }, ms: 30, end: { Pressure: { approx: 0.25, tol: 0.01 } } },
      { label: "3.75 mA (6000 counts): slightly under range", set: { PressureRaw: 6000 }, ms: 30, end: { Pressure: { approx: 0, tol: 0.001 }, WireBreak: false }, why: "Under range but above 3.6 mA: clamp to 0.0, no fault." },
      { label: "Over range (32767 counts)", set: { PressureRaw: 32767 }, ms: 30, end: { Pressure: { approx: 10, tol: 0.001 } }, why: "Clamp to 10.0 above 20 mA." },
      { label: "3.1 mA (5000 counts): wire break", set: { PressureRaw: 5000 }, ms: 30, end: { WireBreak: true, Pressure: { approx: 0, tol: 0.001 } }, why: "Below 3.6 mA is a fault." },
      { label: "0 mA: wire cut", set: { PressureRaw: 0 }, ms: 30, end: { WireBreak: true } },
      { label: "Back to 12 mA", set: { PressureRaw: 19200 }, ms: 30, end: { WireBreak: false, Pressure: { approx: 5, tol: 0.01 } } },
    ],
    trend: ["PressureRaw", "Pressure", "WireBreak"],
    afterword:
      "The live zero is why 4 to 20 mA is so common: 0 mA can't be mistaken for a reading of zero. The exact fault thresholds vary (3.6 mA follows the NAMUR NE 43 recommendation many transmitters use), and many analog cards can do this scaling and wire-break detection for you if configured to.",
    shouldFail: [
      "Pressure := (INT_TO_REAL(PressureRaw) - 6400.0) * 10.0 / 25600.0;\nWireBreak := PressureRaw < 5760;",
    ],
  },
  {
    id: "plc-ex-tank-level",
    title: "Tank level with hysteresis and alarm",
    lessonId: "plc-analog-alarms",
    scanMs: SCAN,
    io: [
      { name: "Level", type: "REAL", dir: "in", label: "Tank level", widget: "slider", min: 0, max: 100, step: 0.1, unit: "%", init: 50 },
      { name: "Auto", type: "BOOL", dir: "in", label: "Auto", widget: "switch" },
      { name: "Pump", type: "BOOL", dir: "out", label: "Fill pump", widget: "motor" },
      { name: "HighAlarm", type: "BOOL", dir: "out", label: "High level alarm", widget: "lamp", color: "red" },
    ],
    requirements: [
      "In Auto, the fill pump starts when Level falls to 20.0 % or below, and stops when Level reaches 80.0 % or above. In between it keeps doing what it was doing (hysteresis).",
      "With Auto off, the pump is off.",
      "HighAlarm turns on when Level reaches 90.0 % or more, and turns off only once Level drops below 85.0 % (a 5 % deadband).",
    ],
    starter: `(* Keep the tank between 20 % and 80 %. *)
Pump := Auto AND Level < 50.0;
HighAlarm := Level >= 90.0;
`,
    solution: `(* Pump with hysteresis: start at 20 %, stop at 80 %. *)
IF NOT Auto OR Level >= 80.0 THEN
  Pump := FALSE;
ELSIF Level <= 20.0 THEN
  Pump := TRUE;
END_IF;
(* Between 20 % and 80 %: no assignment, so Pump keeps its value. *)

(* High alarm with a 5 % deadband. *)
IF Level >= 90.0 THEN
  HighAlarm := TRUE;
ELSIF Level < 85.0 THEN
  HighAlarm := FALSE;
END_IF;
`,
    hints: [
      "A single threshold (Pump := Level < 50.0) makes the pump chatter on and off around 50 %. Use two thresholds and remember the state in between.",
      "IF ... THEN Pump := FALSE; ELSIF ... THEN Pump := TRUE; END_IF; with no ELSE leaves Pump unchanged in the band between.",
      "Use REAL literals (80.0, not 80): Level is a REAL.",
    ],
    tests: [
      { label: "Auto off, tank half full", set: { Level: 50, Auto: false }, ms: 200, hold: { Pump: false, HighAlarm: false } },
      { label: "Auto on at 50 %", set: { Auto: true }, ms: 300, hold: { Pump: false }, why: "Between the thresholds the pump keeps its state, which was off." },
      { label: "Level drops to 20 %", set: { Level: 20 }, ms: 100, end: { Pump: true }, why: "At 20 % or below the pump starts." },
      { label: "Level rises to 50 %", set: { Level: 50 }, ms: 300, hold: { Pump: true }, why: "Hysteresis: the pump keeps running until 80 %." },
      { label: "Level 79.9 %", set: { Level: 79.9 }, ms: 100, hold: { Pump: true } },
      { label: "Level reaches 80 %", set: { Level: 80 }, ms: 100, end: { Pump: false }, why: "At 80 % or above the pump stops." },
      { label: "Level falls back to 60 %", set: { Level: 60 }, ms: 300, hold: { Pump: false }, why: "Hysteresis: it stays off until 20 %." },
      { label: "Level 25 %", set: { Level: 25 }, ms: 100, hold: { Pump: false } },
      { label: "Level 19 %", set: { Level: 19 }, ms: 100, end: { Pump: true } },
      { label: "Auto off", set: { Auto: false }, ms: 200, hold: { Pump: false }, why: "With Auto off the pump is off." },
      { label: "Auto back on at 19 %", set: { Auto: true }, ms: 100, end: { Pump: true } },
      { label: "Level 89.9 %", set: { Level: 89.9 }, ms: 100, hold: { HighAlarm: false } },
      { label: "Level reaches 90 %", set: { Level: 90 }, ms: 100, end: { HighAlarm: true }, why: "The alarm comes on at 90 %." },
      { label: "Level 86 %", set: { Level: 86 }, ms: 200, hold: { HighAlarm: true }, why: "Deadband: the alarm stays on until the level is below 85 %." },
      { label: "Level 85 %", set: { Level: 85 }, ms: 200, hold: { HighAlarm: true }, why: "85 % is not below 85 %, so the alarm stays on." },
      { label: "Level 84.9 %", set: { Level: 84.9 }, ms: 100, end: { HighAlarm: false }, why: "Below 85 % the alarm clears." },
      { label: "Level 88 %", set: { Level: 88 }, ms: 200, hold: { HighAlarm: false }, why: "Deadband: it doesn't come back until 90 %." },
    ],
    trend: ["Level", "Auto", "Pump", "HighAlarm"],
    plant: tankPlant({ level: "Level", pump: "Pump", fillPerS: 8, drainPerS: 3, start: 50 }),
    afterword:
      "Hysteresis (two switching points) and deadband (a gap before an alarm clears) are the same idea: don't let a noisy signal near one threshold make an output chatter. Real level signals ripple, and a pump started and stopped every second wears out its contactor and motor.",
    shouldFail: ["Pump := Auto AND Level <= 20.0;\nHighAlarm := Level >= 90.0;"],
  },
  {
    id: "plc-ex-two-hand",
    title: "Two-hand start",
    lessonId: "plc-good-practice",
    scanMs: SCAN,
    io: [
      { name: "LeftBtn", type: "BOOL", dir: "in", label: "Left hand", widget: "button" },
      { name: "RightBtn", type: "BOOL", dir: "in", label: "Right hand", widget: "button" },
      { name: "Press", type: "BOOL", dir: "out", label: "Press stroke", widget: "motor" },
    ],
    requirements: [
      "Press runs only while both LeftBtn and RightBtn are held.",
      "Both buttons must be pressed within 0.5 s of each other. If the second press comes later, Press stays off.",
      "Releasing either button stops Press. To run again, the operator must release BOTH buttons and start over, so tying one button down doesn't work.",
      "This is logic practice only. A real two-hand control must use a safety-rated two-hand control relay or safety controller, as the lesson explains.",
    ],
    starter: `(* Two-hand start. *)
Press := LeftBtn AND RightBtn;
`,
    solution: `VAR
  Window : TON;   (* runs from the first hand's press *)
END_VAR

(* The window resets only when both hands are off the buttons. *)
Window(IN := LeftBtn OR RightBtn, PT := T#500ms);

(* Start only inside the window; once running, keep running
   while both are held. *)
Press := LeftBtn AND RightBtn AND (Press OR NOT Window.Q);
`,
    hints: [
      "Time the window with a TON whose IN is LeftBtn OR RightBtn: it starts at the first press and only resets when both are released.",
      "The press may start only while that timer is not done yet. Once started, it may keep running past the window: a seal-in on Press.",
    ],
    tests: [
      { label: "Idle", ms: 200, hold: { Press: false } },
      { label: "Left pressed", set: { LeftBtn: true }, ms: 300, hold: { Press: false }, why: "One hand isn't enough." },
      { label: "Right pressed 0.3 s later", set: { RightBtn: true }, ms: 100, end: { Press: true }, why: "Both within 0.5 s: run." },
      { label: "Both held", ms: 500, hold: { Press: true }, why: "Keeps running while both are held." },
      { label: "Release right", set: { RightBtn: false }, ms: 100, hold: { Press: false }, why: "Releasing either button stops it." },
      { label: "Press right again, left still held", set: { RightBtn: true }, ms: 500, hold: { Press: false }, why: "Both buttons must be released before a new start, or one could be tied down." },
      { label: "Release both", set: { LeftBtn: false, RightBtn: false }, ms: 300, hold: { Press: false } },
      { label: "Right pressed", set: { RightBtn: true }, ms: 700, hold: { Press: false } },
      { label: "Left pressed 0.7 s later", set: { LeftBtn: true }, ms: 300, hold: { Press: false }, why: "More than 0.5 s apart: no start." },
      { label: "Release both", set: { LeftBtn: false, RightBtn: false }, ms: 300, hold: { Press: false } },
      { label: "Both pressed together", set: { LeftBtn: true, RightBtn: true }, ms: 100, end: { Press: true } },
      { label: "Both held", ms: 300, hold: { Press: true } },
      { label: "Release both", set: { LeftBtn: false, RightBtn: false }, ms: 300, hold: { Press: false } },
      { label: "Left pressed", set: { LeftBtn: true }, ms: 450, hold: { Press: false } },
      { label: "Right pressed 0.45 s later", set: { RightBtn: true }, ms: 100, end: { Press: true }, why: "0.45 s apart is inside the window." },
    ],
    trend: ["LeftBtn", "RightBtn", "Press", "Window.Q"],
    extra: ["Window.Q"],
    afterword:
      "The 0.5 s figure comes from the two-hand control standard (ISO 13851). The standard also covers things logic alone can't guarantee, such as button spacing and shrouding, and requires the control to be built from safety-rated parts. That's why on a real press this logic lives in a certified two-hand relay or a safety PLC, not a standard program.",
    shouldFail: ["VAR W : TON; END_VAR\nW(IN := LeftBtn AND NOT RightBtn, PT := T#500ms);\nPress := LeftBtn AND RightBtn AND NOT W.Q;"],
  },
];

export const PLC_EXERCISE_BY_ID: Record<string, PlcExerciseData> = Object.fromEntries(PLC_EXERCISES.map((e) => [e.id, e]));

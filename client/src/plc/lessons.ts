// Interactive content for the PLC programming lessons (IEC 61131-3, Structured Text
// with ladder alongside). Each lesson's introductory prose is in its server ITool file;
// this is what renders under "Try it": simulators, ladder vs ST pairs, tables, quick
// questions and links to the exercises. scripts/check-plc-st.mjs compiles and runs every
// simulator program and checks every live ladder diagram against its program.

import { ladderVars, type Rung } from "./ladder.ts";
import { tankPlant, type IoDef, type Plant } from "./sim.ts";

export { ladderVars };

export type LessonBlock =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string } // `backticks` render as code
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "pair"; title: string; ladder: Rung[]; st: string; note?: string } // static ladder next to ST
  | { kind: "code"; title: string; code: string }
  | { kind: "sim"; title: string; intro?: string; source: string; io: IoDef[]; scanMs?: number; plant?: Plant; ladder?: Rung[]; trend?: string[] }
  | { kind: "quiz"; q: string; code?: string; options: string[]; answer: number; why: string }
  | { kind: "callout"; tone: "warn" | "info"; text: string }
  | { kind: "practice"; ids: string[] }
  | { kind: "links"; items: [string, string][] } // [lesson id, label]
  | { kind: "diagram"; which: "fbd-seal-in" | "sfc-tank" };

export interface PlcLessonData {
  id: string;
  blocks: LessonBlock[];
}

// ---- Shared pieces ----

const SEAL_IN_ST = `(* Start/stop seal-in *)
Motor := (Start OR Motor) AND Stop_NC;
`;

const SEAL_IN_LADDER: Rung[] = [
  {
    comment: "Start, or the motor's own contact (the seal), in series with Stop",
    nodes: [{ k: "par", branches: [[{ k: "no", v: "Start" }], [{ k: "no", v: "Motor" }]] }, { k: "no", v: "Stop_NC" }],
    coils: [{ k: "coil", v: "Motor" }],
  },
];

const START: IoDef = { name: "Start", type: "BOOL", dir: "in", label: "Start (NO pushbutton)", widget: "button" };
const STOP_NC: IoDef = { name: "Stop_NC", type: "BOOL", dir: "in", label: "Stop (NC pushbutton)", widget: "nc-button", breakable: true };
const MOTOR: IoDef = { name: "Motor", type: "BOOL", dir: "out", label: "Motor", widget: "motor" };

// A level that ripples around a base value the learner sets, for the alarm chatter demo.
function noisyLevel(): Plant {
  let t = 0;
  return {
    drives: ["Level"],
    init: () => {
      t = 0;
      return { Level: 88 };
    },
    step: (inputs, _outputs, dt) => {
      t += dt;
      const base = inputs.BaseLevel as number;
      inputs.Level = Math.round((base + 1.2 * Math.sin(t / 170) + 0.5 * Math.sin(t / 43)) * 100) / 100;
    },
    note: "The measured level is the base level plus a ripple of about 1.7 % either way, like a real level signal on a sloshing tank.",
  };
}

// ---- Lessons ----

export const PLC_LESSONS: PlcLessonData[] = [
  {
    id: "plc-iec-languages",
    blocks: [
      { kind: "h", text: "The five languages" },
      {
        kind: "table",
        head: ["Language", "Kind", "Looks like", "Typical use"],
        rows: [
          ["Ladder Diagram (LD)", "Graphical", "Relay rungs: contacts and coils between two power rails", "Discrete on/off logic, interlocks; easy for electricians to troubleshoot"],
          ["Function Block Diagram (FBD)", "Graphical", "Blocks wired together, signals flowing left to right", "Continuous and analog control, signal chains, PID loops"],
          ["Structured Text (ST)", "Textual", "A Pascal-like language: IF, CASE, FOR, :=", "Calculations, data handling, state machines, anything with loops"],
          ["Sequential Function Chart (SFC)", "Graphical", "Steps and transitions, like a flowchart", "Sequences: machine cycles, batch phases; the steps' actions are written in the other languages"],
          ["Instruction List (IL)", "Textual", "Assembly-like: one operation per line", "Legacy only. Deprecated in the third edition of the standard (2013)"],
        ],
      },
      {
        kind: "p",
        text: "All five share the same common elements: the same data types, the same variables and the same standard function blocks. A timer called `TON` behaves the same whether you draw it in ladder or call it in ST, and most tools let different parts of one project use different languages.",
      },
      { kind: "h", text: "One rung, four ways" },
      {
        kind: "p",
        text: "Here is the classic start/stop circuit (the next lessons take it apart properly). Press Start and the motor runs; it keeps running after you let go; Stop stops it. First as ladder and as Structured Text:",
      },
      { kind: "pair", title: "Start/stop seal-in", ladder: SEAL_IN_LADDER, st: SEAL_IN_ST },
      { kind: "p", text: "The same logic as a function block diagram: an OR block feeding an AND block, with the output fed back." },
      { kind: "diagram", which: "fbd-seal-in" },
      {
        kind: "code",
        title: "And in Instruction List (for recognition only)",
        code: `LD   Start     (* load Start into the accumulator *)
OR   Motor     (* OR it with Motor's own state *)
AND  Stop_NC   (* AND it with the stop circuit *)
ST   Motor     (* store the result in Motor *)`,
      },
      {
        kind: "sim",
        title: "Run it",
        intro: "This simulator runs the ST program in a scan loop and lights up the ladder as the variables change. Press Start, let go, then press Stop. Buttons are momentary while the simulator runs; while it's paused, a click holds a button down until you click again.",
        source: SEAL_IN_ST,
        io: [START, STOP_NC, MOTOR],
        ladder: SEAL_IN_LADDER,
        trend: ["Start", "Stop_NC", "Motor"],
      },
      { kind: "h", text: "Programs, function blocks and functions" },
      {
        kind: "table",
        head: ["Unit", "Has memory between calls?", "Example"],
        rows: [
          ["Program", "Yes", "The main logic a task runs every scan. All the exercises here are one program."],
          ["Function block", "Yes, one set per instance", "TON, CTU, R_TRIG. You declare an instance (`DelayTimer : TON;`) and call it; it remembers its own state."],
          ["Function", "No: same inputs, same result", "ABS, LIMIT, INT_TO_REAL. Used inside expressions."],
        ],
      },
      { kind: "h", text: "Data types used in this track" },
      {
        kind: "table",
        head: ["Type", "Holds", "Literals"],
        rows: [
          ["BOOL", "TRUE or FALSE (one bit: an input, an output, a flag)", "`TRUE`, `FALSE`"],
          ["INT", "Whole number, 16 bit: -32768 to 32767", "`42`, `-7`, `16#FF`, `2#1010`"],
          ["DINT", "Whole number, 32 bit: about plus or minus 2.1 billion", "`100000`"],
          ["REAL", "32-bit floating point number", "`3.5`, `80.0`, `1.0E3`"],
          ["TIME", "A duration", "`T#500ms`, `T#2s`, `T#1m30s`"],
        ],
      },
      { kind: "h", text: "Structured Text in one screen" },
      {
        kind: "code",
        title: "The syntax you need for this track",
        code: `VAR                          (* internal variables, declared first *)
  Count : INT := 0;          (* name : type := initial value; *)
  Ready : BOOL;
  DelayTimer : TON;          (* a function block instance *)
END_VAR

Ready := Count > 5 AND NOT Fault;      (* := assigns, = compares *)

IF Level >= 80.0 THEN                  (* every statement ends with ; *)
  Pump := FALSE;
ELSIF Level <= 20.0 THEN
  Pump := TRUE;
END_IF;

CASE State OF
  0: Lamp := FALSE;
  1, 2: Lamp := TRUE;
END_CASE;

DelayTimer(IN := Ready, PT := T#2s);   (* call a block, naming its inputs *)
Motor := DelayTimer.Q;                 (* then read its outputs *)
(* Comments go in brackets and stars. Names ignore case: MOTOR = Motor. *)`,
      },
      {
        kind: "p",
        text: "In the exercises the inputs and outputs are already declared, the way a vendor tool's I/O configuration declares them; you add your own internal variables in a `VAR ... END_VAR` block at the top. Many vendor tools have you enter variables in a table instead of typing a VAR block, but the names, types and code are the same.",
      },
      {
        kind: "list",
        items: [
          "Supported here: BOOL, INT, DINT, REAL and TIME; IF, CASE, FOR, WHILE and REPEAT; arithmetic, comparisons, AND, OR, XOR and NOT; ABS, MIN, MAX, LIMIT, SEL, SQRT and conversions such as INT_TO_REAL; and the standard blocks TON, TOF, TP, CTU, CTD, CTUD, R_TRIG, F_TRIG, SR and RS.",
          "Not supported: strings, arrays, structures, your own function blocks, and vendor-specific instructions.",
          "Typing is strict, like a real IEC compiler: an INT doesn't silently become a REAL, and a number isn't a BOOL. The error messages say what to write instead.",
          "A loop that runs more than 10,000 times in one scan stops the simulated PLC, the way a real watchdog timer would.",
        ],
      },
      {
        kind: "quiz",
        q: "You need to program a machine cycle: clamp, drill, unclamp, eject, each step waiting for a sensor. Which language is designed for exactly this structure?",
        options: ["Ladder Diagram", "Function Block Diagram", "Sequential Function Chart", "Instruction List"],
        answer: 2,
        why: "SFC draws a sequence as steps and the transitions between them. The actions inside each step are still written in LD, FBD or ST. Lesson 7 builds the same structure in ST with CASE.",
      },
      {
        kind: "quiz",
        q: "In ST, what is the difference between `Motor := Start;` and `Motor = Start`?",
        options: ["None, both assign", "The first assigns; the second is a comparison that gives TRUE or FALSE", "The first compares; the second assigns", "The second is a syntax error in every case"],
        answer: 1,
        why: "`:=` stores a value. A single `=` compares two values and produces a BOOL, so it belongs in conditions like `IF State = 3 THEN`.",
      },
      {
        kind: "links",
        items: [
          ["plc-overview", "PLCs: how they're different from a normal computer"],
          ["ladder-logic-basics", "Ladder Logic: reading rungs"],
          ["plc-memory-addressing", "PLC memory addressing"],
        ],
      },
    ],
  },
  {
    id: "plc-st-scan-cycle",
    blocks: [
      {
        kind: "sim",
        title: "One scan, one phase at a time",
        intro: "The simulator starts paused. Click the button to hold it down, then use Step phase and watch the field input, the input image and the output change at different moments. Change the button between Read inputs and Write outputs and see that the program never notices until the next scan.",
        source: "Lamp := Button;\n",
        io: [
          { name: "Button", type: "BOOL", dir: "in", label: "Pushbutton", widget: "button" },
          { name: "Lamp", type: "BOOL", dir: "out", label: "Lamp", widget: "lamp", color: "green" },
        ],
        trend: ["Button", "Lamp"],
      },
      { kind: "h", text: "Order matters" },
      {
        kind: "p",
        text: "The program runs from top to bottom once per scan. A statement that reads a variable written further down sees the value from the previous scan, so it lags by one scan. Step one scan at a time after flipping A: SameScan follows A in the same scan, NextScan one scan later.",
      },
      {
        kind: "sim",
        title: "Statement order and a one-scan lag",
        source: `VAR
  Copy1 : BOOL;
  Later : BOOL;
END_VAR

(* Rung 1 *) Copy1 := A;
(* Rung 2 *) SameScan := Copy1;   (* Copy1 was written just above *)
(* Rung 3 *) NextScan := Later;   (* Later is written below, so this
                                     sees the value from last scan *)
(* Rung 4 *) Later := A;
`,
        io: [
          { name: "A", type: "BOOL", dir: "in", label: "A", widget: "switch" },
          { name: "SameScan", type: "BOOL", dir: "out", label: "SameScan", widget: "lamp", color: "green" },
          { name: "NextScan", type: "BOOL", dir: "out", label: "NextScan", widget: "lamp", color: "amber" },
        ],
        trend: ["A", "SameScan", "NextScan"],
      },
      {
        kind: "p",
        text: "A one-scan lag is usually harmless, but it's the PLC version of a race condition: two pieces of logic that only work in a particular order. It bites when a one-scan pulse is set below the logic that reads it (that logic never sees it), or when two sequences hand over to each other.",
      },
      { kind: "h", text: "Last write wins" },
      {
        kind: "p",
        text: "Outputs are copied to the field once, at the end of the scan. If the program assigns the same output in two places, only the last assignment reaches the real device, and the first one silently does nothing. In ladder this is the \"double coil\" mistake: the same output coil on two rungs.",
      },
      {
        kind: "sim",
        title: "The same output written twice",
        intro: "Flip Switch1: nothing happens. Its rung runs, but the rung below overwrites Lamp before the scan ends.",
        source: `(* Rung 1: the lamp should follow Switch1 ... *)
Lamp := Switch1;

(* ... and a hundred rungs later someone adds: *)
Lamp := Switch2;
`,
        io: [
          { name: "Switch1", type: "BOOL", dir: "in", label: "Switch1", widget: "switch" },
          { name: "Switch2", type: "BOOL", dir: "in", label: "Switch2", widget: "switch" },
          { name: "Lamp", type: "BOOL", dir: "out", label: "Lamp", widget: "lamp", color: "yellow" },
        ],
        ladder: [
          { comment: "Rung 1", nodes: [{ k: "no", v: "Switch1" }], coils: [{ k: "coil", v: "Lamp" }] },
          { comment: "Rung 2: same coil again", nodes: [{ k: "no", v: "Switch2" }], coils: [{ k: "coil", v: "Lamp" }] },
        ],
      },
      { kind: "p", text: "The fix is a rule: write every output in exactly one place. If several conditions should turn it on, OR them together on that one line or rung." },
      { kind: "h", text: "One-scan pulses" },
      {
        kind: "sim",
        title: "A pulse that lasts one scan",
        intro: "Hold the button for a moment. ScansHeld counts every scan the button is down; Presses counts once per press, using a pulse that is TRUE for exactly one scan. Look for the Pulse line in the chart: one scan wide, far too short to see on the lamp.",
        source: `VAR
  ButtonPrev : BOOL;
END_VAR

Pulse := Button AND NOT ButtonPrev;   (* TRUE for one scan per press *)
ButtonPrev := Button;                 (* remember for next scan *)

IF Pulse THEN
  Presses := Presses + 1;
END_IF;
IF Button THEN
  ScansHeld := ScansHeld + 1;
END_IF;
`,
        io: [
          { name: "Button", type: "BOOL", dir: "in", label: "Pushbutton", widget: "button" },
          { name: "Pulse", type: "BOOL", dir: "out", label: "Pulse", widget: "lamp", color: "white" },
          { name: "Presses", type: "INT", dir: "out", label: "Presses", widget: "value" },
          { name: "ScansHeld", type: "INT", dir: "out", label: "Scans held", widget: "value" },
        ],
        trend: ["Button", "Pulse"],
      },
      {
        kind: "quiz",
        q: "What does the real lamp do with this program?",
        code: "Lamp := TRUE;\nLamp := FALSE;",
        options: ["Flickers on and off every scan", "Stays off", "Stays on", "Depends on the scan time"],
        answer: 1,
        why: "The physical output is written once, at the end of the scan, from whatever the variable holds then. The TRUE in the middle never leaves the PLC.",
      },
      {
        kind: "quiz",
        q: "A sensor gives a 3 ms pulse and the scan takes 10 ms. Will an ordinary program see the pulse?",
        options: ["Always", "Sometimes, only if an input read happens during the pulse", "Never", "Yes, but one scan late"],
        answer: 1,
        why: "Inputs are only sampled once per scan. A pulse shorter than the scan can fall entirely between two reads. Fast signals need hardware help, such as a high-speed counter input.",
      },
      {
        kind: "quiz",
        q: "A program waits for a button like this. What happens?",
        code: "WHILE NOT StartButton DO\n  (* wait *)\nEND_WHILE;",
        options: ["It waits until the button is pressed", "It never ends, and the watchdog faults the PLC", "It skips the loop", "It waits for one scan"],
        answer: 1,
        why: "Inputs only update between scans, so inside the loop StartButton never changes. PLC programs never wait inside a scan; they check a condition each scan and act when it's true.",
      },
      {
        kind: "links",
        items: [
          ["plc-overview", "PLCs: the scan cycle introduced"],
          ["race-conditions", "Race conditions in multithreaded software, for comparison"],
        ],
      },
    ],
  },
  {
    id: "plc-contacts-seal-in",
    blocks: [
      { kind: "h", text: "Contacts and coils" },
      {
        kind: "table",
        head: ["Ladder", "Name", "Passes power when", "ST equivalent"],
        rows: [
          ["-| |-", "Normally open contact (examine if closed)", "the bit is TRUE", "`X`"],
          ["-|/|-", "Normally closed contact (examine if open)", "the bit is FALSE", "`NOT X`"],
          ["-( )-", "Coil", "writes TRUE if the rung has power, FALSE if not", "`Y := rung;`"],
          ["-(/)-", "Negated coil", "writes the opposite of the rung", "`Y := NOT rung;`"],
          ["-(S)-", "Set coil (Allen-Bradley: latch, OTL)", "writes TRUE only when the rung has power", "`IF rung THEN Y := TRUE; END_IF;`"],
          ["-(R)-", "Reset coil (Allen-Bradley: unlatch, OTU)", "writes FALSE only when the rung has power", "`IF rung THEN Y := FALSE; END_IF;`"],
        ],
      },
      {
        kind: "callout",
        tone: "info",
        text: "A contact in the program tests a bit in memory. It says nothing about whether the physical switch is normally open or normally closed. That distinction lives in the field wiring, and keeping the two apart is the whole trick of this lesson.",
      },
      { kind: "h", text: "The seal-in" },
      { kind: "pair", title: "Start/stop seal-in", ladder: SEAL_IN_LADDER, st: SEAL_IN_ST, note: "Power reaches the coil through Start, or through the Motor contact once the motor is already on: that parallel branch is the seal. Stop is in series with both, so it breaks the rung whatever the other contacts do." },
      {
        kind: "sim",
        title: "Seal-in with a normally closed stop",
        intro: "Start the motor, then press Stop. Then start it again and cut the stop button's wire: the input drops to FALSE and the motor stops, exactly as if Stop had been pressed. With the wire cut, Start can't start it. That's the fail-safe behavior you want.",
        source: SEAL_IN_ST,
        io: [START, STOP_NC, MOTOR],
        ladder: SEAL_IN_LADDER,
        trend: ["Start", "Stop_NC", "Motor"],
      },
      { kind: "h", text: "Why the stop button is wired normally closed" },
      {
        kind: "p",
        text: "A normally closed (NC) stop button conducts until it is pressed, so the PLC input is TRUE while everything is healthy. Pressing the button, a broken wire, a loose terminal or a blown fuse on the input circuit all make the input FALSE, and the machine stops. A failure in the stop circuit shows up straight away as a machine that won't run, not as a stop button that quietly stopped working.",
      },
      {
        kind: "p",
        text: "Because the input is TRUE when healthy, the program uses a normally open contact for it, and in ST you AND it in without NOT. That's the classic confusion: a physical NC button read with a ladder NO contact. Naming the tag `Stop_NC` (or `StopOK`) helps the next reader.",
      },
      {
        kind: "sim",
        title: "For comparison: a stop button wired normally open (don't do this)",
        intro: "Here Stop is a normally open button, so the program uses NOT. It works while the wiring is intact. Now start the motor, cut the wire, and try to stop it.",
        source: `(* Stop_NO is TRUE only while pressed. *)
Motor := (Start OR Motor) AND NOT Stop_NO;
`,
        io: [START, { name: "Stop_NO", type: "BOOL", dir: "in", label: "Stop (NO pushbutton)", widget: "button", breakable: true }, MOTOR],
        ladder: [
          {
            nodes: [{ k: "par", branches: [[{ k: "no", v: "Start" }], [{ k: "no", v: "Motor" }]] }, { k: "nc", v: "Stop_NO" }],
            coils: [{ k: "coil", v: "Motor" }],
          },
        ],
      },
      { kind: "h", text: "Set and reset coils" },
      {
        kind: "pair",
        title: "The same circuit with set/reset",
        ladder: [
          { comment: "Set on Start", nodes: [{ k: "no", v: "Start" }], coils: [{ k: "set", v: "Motor" }] },
          { comment: "Reset when the stop circuit opens; below the set, so Stop wins", nodes: [{ k: "nc", v: "Stop_NC" }], coils: [{ k: "reset", v: "Motor" }] },
        ],
        st: `IF Start THEN
  Motor := TRUE;    (* set *)
END_IF;
IF NOT Stop_NC THEN
  Motor := FALSE;   (* reset: after the set, so Stop wins *)
END_IF;
`,
        note: "With set and reset, whichever runs last in the scan wins, so the reset goes below the set. The standard SR and RS blocks package the same idea: in an RS block reset wins, in an SR block set wins.",
      },
      {
        kind: "p",
        text: "Seal-ins are usually preferred for motors. A seal-in bit is recalculated every scan and drops out on its own. A set bit stays set until something resets it, and in many PLCs it also keeps its value through a power cut, so a latched run command can restart a machine when power returns. Whichever you use, a machine should not restart by itself after power comes back.",
      },
      {
        kind: "callout",
        tone: "warn",
        text: "This start/stop circuit is ordinary control, not an emergency stop. E-stops and other safety functions are built with safety-rated relays or safety controllers, not a standard PLC program. The good practice lesson covers why.",
      },
      {
        kind: "quiz",
        q: "Your stop button is wired normally closed to input Stop_NC. In ladder, which contact do you use for it in the motor rung?",
        options: ["Normally open contact (-| |-)", "Normally closed contact (-|/|-)", "Either works", "A set coil"],
        answer: 0,
        why: "The input is TRUE while the button is not pressed, so the rung should conduct when the bit is TRUE: a normally open contact. Using a normally closed contact would only let the motor run while Stop is held.",
      },
      { kind: "practice", ids: ["plc-ex-seal-in"] },
      { kind: "links", items: [["ladder-logic-basics", "Ladder Logic: reading rungs"], ["plc-safety-redundancy", "Safety & redundancy: fail-safe design"]] },
    ],
  },
  {
    id: "plc-timers",
    blocks: [
      {
        kind: "table",
        head: ["Block", "Q is TRUE", "ET (elapsed time)", "Typical use"],
        rows: [
          ["TON (on-delay)", "once IN has been TRUE for PT without a break; FALSE as soon as IN is FALSE", "counts up while IN is TRUE, stops at PT, resets to 0 when IN is FALSE", "delay a start, ignore brief signals, time-outs"],
          ["TOF (off-delay)", "as soon as IN is TRUE, and for PT after IN goes FALSE", "counts from the moment IN goes FALSE, stops at PT; 0 while IN is TRUE", "run a cooling fan on after a motor stops"],
          ["TP (pulse)", "for exactly PT, starting at a rising edge of IN; IN changing during the pulse is ignored", "counts during the pulse, holds PT while IN stays TRUE, then resets", "a fixed-length pulse to a solenoid or horn"],
        ],
      },
      {
        kind: "sim",
        title: "TON, TOF and TP side by side",
        intro: "All three timers watch the same switch, each with PT = 2 s. Turn IN on for a few seconds, then off. Then try flicking it on for under 2 s. Compare the three lines in the chart and the ET values in the watch table.",
        source: `VAR
  OnDelay : TON;
  OffDelay : TOF;
  Pulse : TP;
END_VAR

OnDelay(IN := InSwitch, PT := T#2s);
OffDelay(IN := InSwitch, PT := T#2s);
Pulse(IN := InSwitch, PT := T#2s);

TonQ := OnDelay.Q;
TofQ := OffDelay.Q;
TpQ := Pulse.Q;
`,
        io: [
          { name: "InSwitch", type: "BOOL", dir: "in", label: "IN", widget: "switch" },
          { name: "TonQ", type: "BOOL", dir: "out", label: "TON Q", widget: "lamp", color: "green" },
          { name: "TofQ", type: "BOOL", dir: "out", label: "TOF Q", widget: "lamp", color: "amber" },
          { name: "TpQ", type: "BOOL", dir: "out", label: "TP Q", widget: "lamp", color: "blue" },
        ],
        ladder: [
          { nodes: [{ k: "no", v: "InSwitch" }, { k: "fb", inst: "OnDelay", type: "TON", pins: [["PT", "T#2s"]] }], coils: [{ k: "coil", v: "TonQ" }] },
          { nodes: [{ k: "no", v: "InSwitch" }, { k: "fb", inst: "OffDelay", type: "TOF", pins: [["PT", "T#2s"]] }], coils: [{ k: "coil", v: "TofQ" }] },
          { nodes: [{ k: "no", v: "InSwitch" }, { k: "fb", inst: "Pulse", type: "TP", pins: [["PT", "T#2s"]] }], coils: [{ k: "coil", v: "TpQ" }] },
        ],
        trend: ["InSwitch", "TonQ", "TofQ", "TpQ"],
      },
      {
        kind: "p",
        text: "In ladder a timer is a box on the rung: the rung's power drives IN, and Q carries power on to the coil. In ST you call the instance with its inputs and read `.Q` and `.ET` afterwards. Allen-Bradley's Logix controllers use their own timer instructions with members such as `.PRE`, `.ACC` and `.DN`, but they map onto the same ideas.",
      },
      {
        kind: "sim",
        title: "Off-delay: a cooling fan",
        intro: "The fan runs with the motor and keeps running for 5 s after the motor stops. Turn the motor on and off a few times, including off and back on within 5 s.",
        source: `VAR
  FanRunOn : TOF;
END_VAR

Motor := RunSwitch;
FanRunOn(IN := Motor, PT := T#5s);   (* fan keeps going 5 s after the motor stops *)
Fan := FanRunOn.Q;
`,
        io: [
          { name: "RunSwitch", type: "BOOL", dir: "in", label: "Run", widget: "switch" },
          { name: "Motor", type: "BOOL", dir: "out", label: "Motor", widget: "motor" },
          { name: "Fan", type: "BOOL", dir: "out", label: "Cooling fan", widget: "motor" },
        ],
        trend: ["RunSwitch", "Motor", "Fan"],
      },
      { kind: "h", text: "Two rules for timers" },
      {
        kind: "list",
        ordered: true,
        items: [
          "Call each timer instance once per scan, unconditionally. A timer only updates when it is called. If the call sits inside an IF that becomes FALSE, the timer never sees its IN go FALSE, so it never resets and its Q can stay TRUE forever.",
          "A timer can only change Q when the program is scanned, so the real delay is PT rounded up to the next scan. With a 10 ms scan a 500 ms timer finishes somewhere from 500 to 510 ms. For anything that needs finer timing than the scan, PLCs have hardware features such as high-speed counters and timed interrupts.",
        ],
      },
      {
        kind: "code",
        title: "Don't: a timer called only some of the time",
        code: `IF Enable THEN
  T1(IN := TRUE, PT := T#5s);   (* when Enable goes FALSE, T1 is no longer
                                   called, so it never resets *)
END_IF;
Alarm := T1.Q;

(* Do: call it every scan and put the condition on IN *)
T1(IN := Enable, PT := T#5s);
Alarm := T1.Q;`,
      },
      {
        kind: "quiz",
        q: "Sound a horn for exactly 2 s whenever a conveyor starts, however long the start signal lasts. Which timer?",
        options: ["TON", "TOF", "TP"],
        answer: 2,
        why: "TP gives a fixed-length pulse from the rising edge of IN and ignores IN after that.",
      },
      {
        kind: "quiz",
        q: "A TON has PT = T#3s. IN is TRUE for 2 s, FALSE for one scan, then TRUE for 2 s. When does Q come on?",
        options: ["After 3 s in total", "Never during those 4 s", "At the end of the second 2 s", "Straight away"],
        answer: 1,
        why: "A TON needs IN TRUE without a break for the whole PT. The one-scan FALSE resets ET to zero, so neither 2 s stretch is long enough.",
      },
      { kind: "practice", ids: ["plc-ex-flasher", "plc-ex-debounce"] },
    ],
  },
  {
    id: "plc-edge-detection",
    blocks: [
      {
        kind: "sim",
        title: "Level vs edge",
        intro: "Press and hold the button for a second, a few times. ScansHeld counts every scan the button is down (the level). Presses and Releases count the rising and falling edges, once each per press. Pause and step scan by scan to catch Rise.Q and Fall.Q being TRUE for exactly one scan.",
        source: `VAR
  Rise : R_TRIG;
  Fall : F_TRIG;
END_VAR

Rise(CLK := Button);
Fall(CLK := Button);

IF Button THEN
  ScansHeld := ScansHeld + 1;   (* level: every scan *)
END_IF;
IF Rise.Q THEN
  Presses := Presses + 1;       (* rising edge: once per press *)
END_IF;
IF Fall.Q THEN
  Releases := Releases + 1;     (* falling edge: once per release *)
END_IF;
`,
        io: [
          { name: "Button", type: "BOOL", dir: "in", label: "Pushbutton", widget: "button" },
          { name: "ScansHeld", type: "INT", dir: "out", label: "Scans held", widget: "value" },
          { name: "Presses", type: "INT", dir: "out", label: "Presses", widget: "value" },
          { name: "Releases", type: "INT", dir: "out", label: "Releases", widget: "value" },
        ],
        trend: ["Button", "Rise.Q", "Fall.Q"],
      },
      {
        kind: "pair",
        title: "A one-scan pulse on each press",
        ladder: [{ comment: "Positive transition contact: passes power for one scan when Button goes TRUE", nodes: [{ k: "p", v: "Button", q: "PressEdge.Q" }], coils: [{ k: "coil", v: "PressPulse" }] }],
        st: `VAR
  PressEdge : R_TRIG;
END_VAR

PressEdge(CLK := Button);
PressPulse := PressEdge.Q;
`,
        note: "IEC ladder has transition contacts: -|P|- passes power for one scan on a rising edge and -|N|- on a falling edge. Allen-Bradley ladder uses one-shot instructions (ONS, OSR, OSF) for the same job.",
      },
      {
        kind: "code",
        title: "The same thing by hand",
        code: `VAR
  ButtonPrev : BOOL;
END_VAR

PressPulse := Button AND NOT ButtonPrev;   (* compare with last scan ... *)
ButtonPrev := Button;                      (* ... then remember this scan *)`,
      },
      { kind: "h", text: "Pitfalls" },
      {
        kind: "list",
        items: [
          "One edge detector per signal. An R_TRIG instance remembers the last value of whatever it was called with, so calling one instance with two different signals breaks both.",
          "Call it every scan. Like a timer, an edge detector only updates its memory when called. Inside an IF it can miss edges or report stale ones.",
          "Order. A pulse is TRUE for one scan, starting where it's computed. Logic above that point in the program only sees it on the next scan, and by then it may be gone. Compute edges near the top.",
          "First scan. R_TRIG's memory starts FALSE, so a signal that is already TRUE when the PLC starts counts as a rising edge on the first scan. Decide whether that's what you want.",
          "Pulses shorter than one scan are not seen at all; edge detection can't find an edge the input image never contained.",
        ],
      },
      {
        kind: "quiz",
        q: "A button is held for 0.5 s and the scan time is 10 ms. How much does `IF Button THEN Count := Count + 1; END_IF;` add?",
        options: ["1", "About 50", "About 500", "It depends on the button"],
        answer: 1,
        why: "0.5 s is about 50 scans, and the IF is TRUE on every one of them. An edge detector would add exactly 1.",
      },
      { kind: "practice", ids: ["plc-ex-toggle"] },
    ],
  },
  {
    id: "plc-counters",
    blocks: [
      {
        kind: "table",
        head: ["Block", "Inputs", "Outputs", "Behavior"],
        rows: [
          ["CTU (up)", "CU, R, PV", "Q, CV", "Each rising edge of CU adds 1 to CV. R sets CV to 0 and takes priority. Q = CV >= PV."],
          ["CTD (down)", "CD, LD, PV", "Q, CV", "LD loads CV with PV and takes priority. Each rising edge of CD subtracts 1. Q = CV <= 0."],
          ["CTUD (up/down)", "CU, CD, R, LD, PV", "QU, QD, CV", "R first, then LD, then counting. Edges on CU and CD in the same scan cancel. QU = CV >= PV, QD = CV <= 0."],
        ],
      },
      {
        kind: "p",
        text: "Counters count rising edges, not scans: the edge detection is built in. CV is an INT, and it stops at the INT limits rather than wrapping round. PV is the preset that sets Q; the counter keeps counting past it.",
      },
      {
        kind: "sim",
        title: "CTUD: parts in a buffer zone",
        intro: "A part entering the zone breaks the entry eye; a part leaving breaks the exit eye. The zone holds 5. Send parts in and out and watch QU and QD.",
        source: `VAR
  Zone : CTUD;
END_VAR

(* Up when a part enters, down when one leaves *)
Zone(CU := EntryEye, CD := ExitEye, R := ResetBtn, PV := 5);

InZone := Zone.CV;
ZoneFull := Zone.QU;    (* CV >= 5 *)
ZoneEmpty := Zone.QD;   (* CV <= 0 *)
`,
        io: [
          { name: "EntryEye", type: "BOOL", dir: "in", label: "Entry eye", widget: "button" },
          { name: "ExitEye", type: "BOOL", dir: "in", label: "Exit eye", widget: "button" },
          { name: "ResetBtn", type: "BOOL", dir: "in", label: "Reset", widget: "button" },
          { name: "InZone", type: "INT", dir: "out", label: "Parts in zone", widget: "value" },
          { name: "ZoneFull", type: "BOOL", dir: "out", label: "Zone full", widget: "lamp", color: "red" },
          { name: "ZoneEmpty", type: "BOOL", dir: "out", label: "Zone empty", widget: "lamp", color: "green" },
        ],
        ladder: [
          {
            nodes: [{ k: "no", v: "EntryEye" }, { k: "fb", inst: "Zone", type: "CTUD", pins: [["CD", "ExitEye"], ["R", "ResetBtn"], ["PV", "5"]], out: "QU" }],
            coils: [{ k: "coil", v: "ZoneFull" }],
          },
        ],
        trend: ["EntryEye", "ExitEye", "ZoneFull", "ZoneEmpty"],
      },
      {
        kind: "pair",
        title: "Maintenance due every 500 cycles",
        ladder: [
          {
            nodes: [{ k: "no", v: "CycleDone" }, { k: "fb", inst: "CycleCounter", type: "CTU", pins: [["R", "MaintReset"], ["PV", "500"]] }],
            coils: [{ k: "coil", v: "MaintDue" }],
          },
        ],
        st: `VAR
  CycleCounter : CTU;
END_VAR

CycleCounter(CU := CycleDone, R := MaintReset, PV := 500);
MaintDue := CycleCounter.Q;
`,
      },
      {
        kind: "callout",
        tone: "info",
        text: "Does the count survive a power cut? That depends on whether the counter's memory is retentive. IEC lets you declare variables in a VAR RETAIN block, and vendors have their own settings for it. Production and maintenance counts usually need to be retentive; the simulator's power cycle resets everything.",
      },
      {
        kind: "quiz",
        q: "A CTU has R held TRUE while five parts pass the sensor. Then R goes FALSE. What is CV?",
        options: ["0", "5", "1", "PV"],
        answer: 0,
        why: "Reset wins over counting. The edges that arrived during the reset are consumed, so CV stays at 0 until the next edge after R is released.",
      },
      { kind: "practice", ids: ["plc-ex-part-counter"] },
    ],
  },
  {
    id: "plc-state-machines",
    blocks: [
      { kind: "h", text: "The pattern" },
      {
        kind: "code",
        title: "Skeleton of a state machine in ST",
        code: `VAR
  State : INT := 0;   (* 0 idle, 10 filling, 20 mixing, 30 draining *)
  MixTimer : TON;
END_VAR

(* 1. Things that apply in every state: stop, faults *)
IF NOT Stop_NC THEN
  State := 0;
END_IF;

(* 2. Timers, called every scan, timing only in their own state *)
MixTimer(IN := State = 20, PT := T#5s);

(* 3. Transitions: what moves each state on *)
CASE State OF
  0:  IF Start THEN State := 10; END_IF;
  10: IF Level >= 80.0 THEN State := 20; END_IF;
  20: IF MixTimer.Q THEN State := 30; END_IF;
  30: IF Level <= 2.0 THEN State := 0; END_IF;
END_CASE;

(* 4. Outputs, each written once, from the state *)
InletValve := State = 10;
Mixer := State = 20;
DrainValve := State = 30;`,
      },
      {
        kind: "list",
        items: [
          "One INT holds the current state, so exactly one state is active and you can see where the machine is from one number.",
          "Number states in steps of 10. When a step needs adding later, 15 fits between 10 and 20 without renumbering.",
          "Give each timed state its own timer with `IN := State = n`: it starts from zero on entering the state and resets on leaving.",
          "Write outputs after the CASE, each in one place. Setting outputs inside the branches invites a state that forgets to switch something off.",
          "Handle stop and faults at the top, so they apply whatever state the machine is in.",
        ],
      },
      { kind: "p", text: "SFC draws the same thing: each state is a step, each transition condition sits on the line between steps. The tank sequence below, as an SFC:" },
      { kind: "diagram", which: "sfc-tank" },
      {
        kind: "sim",
        title: "Tank: fill, mix, drain",
        intro: "Press Start. The tank fills to 80 %, mixes for 5 s, drains to empty and waits for the next Start. Press Stop mid-sequence: everything goes off and the sequence returns to idle. The level is simulated.",
        source: `VAR
  State : INT := 0;   (* 0 idle, 10 filling, 20 mixing, 30 draining *)
  MixTimer : TON;
END_VAR

(* Stop from any state: back to idle *)
IF NOT Stop_NC THEN
  State := 0;
END_IF;

MixTimer(IN := State = 20, PT := T#5s);

CASE State OF
  0:  (* Idle: wait for Start *)
      IF Start AND Stop_NC THEN State := 10; END_IF;
  10: (* Fill to the high level *)
      IF Level >= 80.0 THEN State := 20; END_IF;
  20: (* Mix for 5 s *)
      IF MixTimer.Q THEN State := 30; END_IF;
  30: (* Drain until empty *)
      IF Level <= 2.0 THEN State := 0; END_IF;
END_CASE;

(* Outputs from the state, in one place *)
InletValve := State = 10;
Mixer := State = 20;
DrainValve := State = 30;
StepNo := State;
`,
        io: [
          START,
          { name: "Stop_NC", type: "BOOL", dir: "in", label: "Stop (NC pushbutton)", widget: "nc-button" },
          { name: "Level", type: "REAL", dir: "in", label: "Tank level", widget: "slider", min: 0, max: 100, step: 0.1, unit: "%" },
          { name: "InletValve", type: "BOOL", dir: "out", label: "Inlet valve", widget: "lamp", color: "blue" },
          { name: "Mixer", type: "BOOL", dir: "out", label: "Mixer", widget: "motor" },
          { name: "DrainValve", type: "BOOL", dir: "out", label: "Drain valve", widget: "lamp", color: "blue" },
          { name: "StepNo", type: "INT", dir: "out", label: "State", widget: "value" },
        ],
        plant: tankPlant({ level: "Level", pump: "InletValve", drain: "DrainValve", fillPerS: 10, drainPerS: 15, start: 0 }),
        trend: ["Level", "InletValve", "Mixer", "DrainValve"],
      },
      { kind: "h", text: "A conveyor with a sorter" },
      {
        kind: "sim",
        title: "Sorting metal parts off a conveyor",
        intro: "A photo-eye sees each part arrive and an inductive sensor beside it says whether the part is metal. Metal parts travel 1.5 s to a pusher, which fires for 0.5 s; other parts ride on. Turn Run on, set or clear IsMetal, then tap PartAtEye.",
        source: `VAR
  State : INT := 0;   (* 0 wait, 10 metal part travelling, 20 push, 30 other part passing *)
  NewPart : R_TRIG;
  TravelTimer : TON;
  PushTimer : TON;
  PassTimer : TON;
END_VAR

IF NOT Run THEN
  State := 0;
END_IF;

NewPart(CLK := PartAtEye);
TravelTimer(IN := State = 10, PT := T#1500ms);
PushTimer(IN := State = 20, PT := T#500ms);
PassTimer(IN := State = 30, PT := T#1500ms);

CASE State OF
  0:  IF Run AND NewPart.Q THEN
        IF IsMetal THEN State := 10; ELSE State := 30; END_IF;
      END_IF;
  10: IF TravelTimer.Q THEN State := 20; END_IF;   (* part reaches the pusher *)
  20: IF PushTimer.Q THEN
        MetalCount := MetalCount + 1;
        State := 0;
      END_IF;
  30: IF PassTimer.Q THEN
        OtherCount := OtherCount + 1;
        State := 0;
      END_IF;
END_CASE;

Conveyor := Run;
Pusher := State = 20;
`,
        io: [
          { name: "Run", type: "BOOL", dir: "in", label: "Run", widget: "switch" },
          { name: "PartAtEye", type: "BOOL", dir: "in", label: "Part at eye", widget: "button" },
          { name: "IsMetal", type: "BOOL", dir: "in", label: "Metal sensor", widget: "switch" },
          { name: "Conveyor", type: "BOOL", dir: "out", label: "Conveyor", widget: "motor" },
          { name: "Pusher", type: "BOOL", dir: "out", label: "Pusher solenoid", widget: "lamp", color: "amber" },
          { name: "MetalCount", type: "INT", dir: "out", label: "Metal parts", widget: "value" },
          { name: "OtherCount", type: "INT", dir: "out", label: "Other parts", widget: "value" },
        ],
        trend: ["PartAtEye", "IsMetal", "Pusher"],
      },
      {
        kind: "p",
        text: "This sorter handles one part at a time: a second part arriving while the first is still travelling is ignored. A real sorter tracks every part between the sensor and the pusher, usually with a queue or a shift register, or with an encoder on the belt measuring distance instead of time. The state machine idea stays the same.",
      },
      { kind: "practice", ids: ["plc-ex-traffic-light", "plc-ex-conveyor-jam"] },
    ],
  },
  {
    id: "plc-analog-alarms",
    blocks: [
      { kind: "h", text: "Scaling" },
      {
        kind: "code",
        title: "Linear scaling from raw counts to engineering units",
        code: `(* eng = (raw - rawMin) * (engMax - engMin) / (rawMax - rawMin) + engMin *)

RawReal := INT_TO_REAL(TempRaw);                      (* convert first! *)
TempC := (RawReal - 2000.0) * (130.0 - (-20.0)) / (10000.0 - 2000.0) + (-20.0);`,
      },
      {
        kind: "p",
        text: "An analog input card turns the signal into an integer, and the counts it uses depend on the card and how it is configured. The four numbers you need come from two places: rawMin and rawMax from the card's manual and configuration, engMin and engMax from the transmitter's calibrated range. Many cards can also be set to scale for you; then this code isn't needed, but you should still know which one is doing it.",
      },
      {
        kind: "sim",
        title: "A temperature transmitter, -20 to 130 °C",
        intro: "This made-up card reads 2000 counts at 4 mA and 10000 counts at 20 mA. Drag the raw value and watch the scaled temperature. Below 1800 counts (3.6 mA) the program flags a fault instead of reporting a temperature.",
        source: `VAR
  RawReal : REAL;
END_VAR

RawReal := INT_TO_REAL(TempRaw);
SensorFault := TempRaw < 1800;     (* below 3.6 mA: broken wire or failed transmitter *)

IF SensorFault THEN
  TempC := 0.0;                    (* and let the fault, not this number, drive decisions *)
ELSE
  TempC := (RawReal - 2000.0) * 150.0 / 8000.0 - 20.0;
  TempC := LIMIT(-20.0, TempC, 130.0);
END_IF;
`,
        io: [
          { name: "TempRaw", type: "INT", dir: "in", label: "Raw counts", widget: "slider", min: 0, max: 10500, step: 10, init: 6000 },
          { name: "TempC", type: "REAL", dir: "out", label: "Temperature", widget: "value", unit: "°C" },
          { name: "SensorFault", type: "BOOL", dir: "out", label: "Sensor fault", widget: "lamp", color: "red" },
        ],
      },
      {
        kind: "quiz",
        q: "Raw is an INT holding 13824, on a card where 27648 counts is 100 %. What does this give?",
        code: "Percent := INT_TO_REAL(Raw / 27648 * 100);",
        options: ["50.0", "0.0", "49.99", "A compile error"],
        answer: 1,
        why: "Raw / 27648 is integer division, which truncates 0.5 to 0 before anything else happens. Convert to REAL first: INT_TO_REAL(Raw) / 27648.0 * 100.0.",
      },
      { kind: "h", text: "Alarms that don't chatter" },
      {
        kind: "p",
        text: "A plain comparison like `HighAlarm := Level >= 90.0;` flickers on and off whenever the signal hovers near 90, and every flicker can be a new alarm for the operator. Two standard cures: a deadband (turn on at 90, turn off only below 85) and an on-delay (only alarm if the level stays high for a few seconds). Set the base level to about 89.5 below and compare the three alarms.",
      },
      {
        kind: "sim",
        title: "Plain vs deadband vs delayed alarm",
        source: `VAR
  HighDelay : TON;
END_VAR

(* Plain comparison: chatters near 90 % *)
AlarmPlain := Level >= 90.0;

(* Deadband: on at 90 %, off only below 85 % *)
IF Level >= 90.0 THEN
  AlarmDeadband := TRUE;
ELSIF Level < 85.0 THEN
  AlarmDeadband := FALSE;
END_IF;

(* On-delay: only if the level stays at or above 90 % for 3 s *)
HighDelay(IN := Level >= 90.0, PT := T#3s);
AlarmDelayed := HighDelay.Q;
`,
        io: [
          { name: "BaseLevel", type: "REAL", dir: "in", label: "Base level", widget: "slider", min: 70, max: 100, step: 0.1, unit: "%", init: 88 },
          { name: "Level", type: "REAL", dir: "in", label: "Measured level", widget: "slider", min: 0, max: 100, step: 0.1, unit: "%" },
          { name: "AlarmPlain", type: "BOOL", dir: "out", label: "Plain", widget: "lamp", color: "red" },
          { name: "AlarmDeadband", type: "BOOL", dir: "out", label: "Deadband", widget: "lamp", color: "red" },
          { name: "AlarmDelayed", type: "BOOL", dir: "out", label: "Delayed", widget: "lamp", color: "red" },
        ],
        plant: noisyLevel(),
        trend: ["Level", "AlarmPlain", "AlarmDeadband", "AlarmDelayed"],
      },
      {
        kind: "pair",
        title: "Deadband alarm in ladder",
        ladder: [
          { comment: "Set at or above 90 %", nodes: [{ k: "cmp", expr: "Level >= 90.0" }], coils: [{ k: "set", v: "HighAlarm" }] },
          { comment: "Reset below 85 %", nodes: [{ k: "cmp", expr: "Level < 85.0" }], coils: [{ k: "reset", v: "HighAlarm" }] },
        ],
        st: `IF Level >= 90.0 THEN
  HighAlarm := TRUE;
ELSIF Level < 85.0 THEN
  HighAlarm := FALSE;
END_IF;
`,
      },
      {
        kind: "p",
        text: "The same idea controls equipment. A pump that starts at 20 % and stops at 80 % is on/off control with hysteresis: the gap between the two switching points stops it cycling. For holding a value steady at a setpoint, PLCs use PID control instead, which is a topic of its own. How alarms are prioritized, shown and acknowledged is covered by alarm management standards such as ISA-18.2.",
      },
      { kind: "practice", ids: ["plc-ex-analog-scaling", "plc-ex-tank-level"] },
      { kind: "links", items: [["digital-vs-analog-io", "Digital vs. analog I/O and the 4 to 20 mA live zero"], ["floating-point-representation", "Floating point: why 0.1 isn't exact"]] },
    ],
  },
  {
    id: "plc-good-practice",
    blocks: [
      { kind: "h", text: "Naming and structure" },
      {
        kind: "table",
        head: ["Instead of", "Write", "Why"],
        rows: [
          ["`I_0_3`, `Bit17`", "`Tank1_HighLevel`, `Conv2_Running`", "Say what the signal means, not where it's wired"],
          ["`Stop`", "`Stop_NC` or `StopOK`", "Make the wiring sense visible: TRUE means healthy"],
          ["`Level`", "`Tank1_Level_pct`, or a comment with the unit", "Units belong with the number"],
          ["`T1`, `T2`", "`JamTimer`, `MixTimer`", "Six months later, T2 means nothing"],
          ["`State := 3;`", "`State := 30;   (* draining *)`", "Comments say why, and what the number means"],
        ],
      },
      {
        kind: "list",
        items: [
          "Map I/O to named variables in one place. If a sensor moves to another terminal, one line changes.",
          "Write each output in exactly one place (the scan cycle lesson showed why).",
          "Split the program by machine area, one routine or program per conveyor, tank or station, with sequences as state machines.",
          "Keep the program in version control or at least dated backups, and record what changed and why.",
        ],
      },
      { kind: "h", text: "Interlocks" },
      {
        kind: "p",
        text: "An interlock is a condition that must hold before something is allowed to happen. A reversing motor has two contactors, forward and reverse; energizing both at once shorts two phases together. The program interlocks them, and a real reversing starter also has a mechanical interlock and auxiliary contacts wired in hardware, so a program bug or a welded contact can't do it either.",
      },
      {
        kind: "sim",
        title: "Forward/reverse interlock",
        intro: "Start forward, then press Reverse: nothing happens until you press Stop. Reversing a running motor straight away is hard on the motor and the load, so this design requires a stop first. Each direction's rung includes the other direction's NC contact.",
        source: `(* Forward and reverse must never both be on.
   Pressing the other direction while running does nothing: stop first. *)
MotorFwd := (FwdBtn OR MotorFwd) AND Stop_NC AND NOT MotorRev;
MotorRev := (RevBtn OR MotorRev) AND Stop_NC AND NOT MotorFwd;
`,
        io: [
          { name: "FwdBtn", type: "BOOL", dir: "in", label: "Forward", widget: "button" },
          { name: "RevBtn", type: "BOOL", dir: "in", label: "Reverse", widget: "button" },
          { name: "Stop_NC", type: "BOOL", dir: "in", label: "Stop (NC)", widget: "nc-button" },
          { name: "MotorFwd", type: "BOOL", dir: "out", label: "Forward contactor", widget: "motor" },
          { name: "MotorRev", type: "BOOL", dir: "out", label: "Reverse contactor", widget: "motor" },
        ],
        ladder: [
          {
            nodes: [{ k: "par", branches: [[{ k: "no", v: "FwdBtn" }], [{ k: "no", v: "MotorFwd" }]] }, { k: "no", v: "Stop_NC" }, { k: "nc", v: "MotorRev" }],
            coils: [{ k: "coil", v: "MotorFwd" }],
          },
          {
            nodes: [{ k: "par", branches: [[{ k: "no", v: "RevBtn" }], [{ k: "no", v: "MotorRev" }]] }, { k: "no", v: "Stop_NC" }, { k: "nc", v: "MotorFwd" }],
            coils: [{ k: "coil", v: "MotorRev" }],
          },
        ],
        trend: ["FwdBtn", "RevBtn", "MotorFwd", "MotorRev"],
      },
      { kind: "h", text: "Fail-safe habits" },
      {
        kind: "list",
        items: [
          "Stops and limit switches wired normally closed, so a broken wire stops the machine.",
          "Outputs that are safe when de-energized: a motor stops when its output turns off, a spring-return valve goes to its safe position.",
          "Analog signals checked for wire break (below about 3.6 mA on a 4 to 20 mA loop), and a fault, not a reading of zero, drives the decision.",
          "No automatic restart after a power cut, a stop or a fault reset: an operator presses Start.",
          "Timeouts on anything that should finish: a valve that should reach its limit switch in 5 s, a part that should clear an eye in 2 s.",
        ],
      },
      { kind: "h", text: "What a standard PLC must not do" },
      {
        kind: "callout",
        tone: "warn",
        text: "A standard PLC is not a safety device. Functions that protect people, such as emergency stops, guard door interlocks, light curtains and two-hand controls, must be built from safety-rated parts: a safety relay or a safety PLC, designed and validated to standards such as ISO 13849-1 or IEC 62061 for machinery (ISO 13850 covers emergency stops). The standard PLC may read the safety system's status to show it and to sequence the machine, but the safety function has to work even if the standard PLC, its program or its outputs fail.",
      },
      {
        kind: "p",
        text: "The reason is that ordinary PLC hardware and programs can fail in ways nobody sees coming: an output transistor that fails shorted, a stuck input, a program change made online, a bit overwritten elsewhere in the program. Safety controllers use redundant channels, self-testing and locked-down programs to detect such failures and go to a safe state. That is a specialist area; on a real machine it is designed and signed off by someone qualified to do it.",
      },
      { kind: "h", text: "Testing" },
      {
        kind: "list",
        items: [
          "Simulate first, as in these exercises: script the input sequences, including the awkward ones (both buttons, a broken wire, a power cut mid-sequence).",
          "Then test on the machine with the hazards controlled, ideally with outputs disconnected or the machine unable to move until the logic checks out.",
          "Be careful with online edits on a running machine: a change takes effect on the next scan, in whatever state the machine is in.",
        ],
      },
      { kind: "practice", ids: ["plc-ex-two-hand"] },
      { kind: "links", items: [["plc-safety-redundancy", "Safety & redundancy: designing for what happens when it fails"], ["plc-contacts-seal-in", "Contacts, coils and the start/stop seal-in"]] },
    ],
  },
];

export const PLC_LESSON_BY_ID: Record<string, PlcLessonData> = Object.fromEntries(PLC_LESSONS.map((l) => [l.id, l]));

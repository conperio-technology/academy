// Hands-on lab guides for the Allen-Bradley Micro850 controllers, programmed with
// Rockwell's Connected Components Workbench (CCW). Each lab maps back to lessons and
// exercises in the vendor-neutral simulator track (lessons.ts, exercises.ts). The intro
// prose for each lab is in its ITool file (content/Tools/M850*Tool.cs);
// this is what renders under "Try it".
//
// Accuracy rule for this file: menu names, terminal names, variable names and protocol
// details are only stated specifically where they were checked against Rockwell
// documentation. Anything not confirmed is written generically ("in the controller's
// properties, find the Ethernet settings") and should be checked on real hardware.

import type { Rung } from "./ladder.ts";
import type { LessonBlock } from "./lessons.ts";

export interface LabStep {
  text: string; // `backticks` render as code
  expect?: string; // what the learner should see if it worked
  code?: string;
  codeLang?: "st" | "python" | "text";
  codeLabel?: string;
  ladder?: Rung[];
}

export interface LabSection {
  title: string;
  steps: LabStep[];
}

export interface Micro850LabData {
  id: string;
  short: string; // short name for links
  optional?: boolean;
  objectives: string[];
  prereqs: [string, string][]; // [lesson id, label]
  simFirst: { text: string; ids: [string, string][] };
  parts: string[];
  wiring?: { rows: [string, string, string][]; note?: string }; // [terminal, CCW variable, device]
  safety?: string;
  sections: LabSection[];
  reference?: LessonBlock[]; // tables and notes shown after the steps
  checklist: string[];
  mistakes: string[];
  stretch: string;
  instructor: string[];
}

// ---- The suggested bench ----
// One training board per controller, all 24 V DC. Labs use subsets of this table so a
// board wired once serves every lab.

const W = {
  start: ["I-00", "_IO_EM_DI_00", "Start pushbutton, green, normally open (NO)"],
  stop: ["I-01", "_IO_EM_DI_01", "Stop pushbutton, red, normally closed (NC)"],
  run: ["I-02", "_IO_EM_DI_02", "Run selector switch, two positions, maintained"],
  count: ["I-03", "_IO_EM_DI_03", "Count pushbutton (NO), or a 24 V DC proximity sensor"],
  reset: ["I-04", "_IO_EM_DI_04", "Reset pushbutton (NO)"],
  motor: ["O-00", "_IO_EM_DO_00", "\"Motor running\" pilot lamp, or the coil of a 24 V DC interposing relay"],
  red: ["O-01", "_IO_EM_DO_01", "Red pilot lamp"],
  yellow: ["O-02", "_IO_EM_DO_02", "Yellow (amber) pilot lamp"],
  green: ["O-03", "_IO_EM_DO_03", "Green pilot lamp"],
} satisfies Record<string, [string, string, string]>;

const WIRING_NOTE =
  "Terminal names are as printed on the Micro850 24-point terminal blocks (inputs I-00 to I-13, outputs O-00 to O-09). The input commons (COM0, COM1) and the output supply terminals must also be wired; follow the wiring diagram for your exact catalog number in the Micro830, Micro850 and Micro870 user manual (publication 2080-UM002). On the Conperio benches this is done once by the instructor.";

const SEAL_IN_MAPPED: Rung[] = [
  { comment: "Input mapping: terminal to meaningful name", nodes: [{ k: "no", v: "_IO_EM_DI_00" }], coils: [{ k: "coil", v: "Start" }] },
  { nodes: [{ k: "no", v: "_IO_EM_DI_01" }], coils: [{ k: "coil", v: "Stop_NC" }] },
  {
    comment: "Seal-in: Start, or the motor's own contact, in series with Stop_NC",
    nodes: [{ k: "par", branches: [[{ k: "no", v: "Start" }], [{ k: "no", v: "Motor" }]] }, { k: "no", v: "Stop_NC" }],
    coils: [{ k: "coil", v: "Motor" }],
  },
  { comment: "Output mapping", nodes: [{ k: "no", v: "Motor" }], coils: [{ k: "coil", v: "_IO_EM_DO_00" }] },
];

const SEAL_IN_ST = `(* Lab 4: start/stop seal-in. Variables are declared in CCW's
   variable tables, not in a VAR block. *)

(* Input mapping *)
Start := _IO_EM_DI_00;      (* green NO pushbutton *)
Stop_NC := _IO_EM_DI_01;    (* red NC pushbutton: TRUE when NOT pressed *)

(* Logic: exactly the line from the simulator exercise *)
Motor := (Start OR Motor) AND Stop_NC;

(* Output mapping *)
_IO_EM_DO_00 := Motor;
`;

const TIMERS_ST = `(* Lab 5: flasher and part counter *)

(* Input mapping *)
Run := _IO_EM_DI_02;
CountPb := _IO_EM_DI_03;
ResetPb := _IO_EM_DI_04;

(* Flasher: two TON instances chase each other (plc-ex-flasher) *)
OnTimer(IN := Run AND NOT OffTimer.Q, PT := T#500ms);
OffTimer(IN := OnTimer.Q, PT := T#500ms);
Beacon := Run AND NOT OnTimer.Q;

(* Part counter: Micro800's CTU uses RESET, not R, and PV is a DINT *)
PartCounter(CU := CountPb, RESET := ResetPb, PV := 5);
Count := PartCounter.CV;
BatchDone := PartCounter.Q;

(* Output mapping *)
_IO_EM_DO_02 := Beacon;      (* yellow *)
_IO_EM_DO_03 := BatchDone;   (* green *)
`;

const TRAFFIC_ST = `(* Lab 6: traffic light state machine (plc-ex-traffic-light) *)

Run := _IO_EM_DI_02;

IF NOT Run THEN
  State := 0;
END_IF;

(* Each timer runs only while its state is active *)
RedTimer(IN := Run AND State = 0, PT := T#4s);
GreenTimer(IN := State = 1, PT := T#3s);
YellowTimer(IN := State = 2, PT := T#1s);

CASE State OF
  0: IF RedTimer.Q THEN State := 1; END_IF;
  1: IF GreenTimer.Q THEN State := 2; END_IF;
  2: IF YellowTimer.Q THEN State := 0; END_IF;
END_CASE;

(* Outputs come from the state, in one place *)
_IO_EM_DO_01 := State = 0;   (* red *)
_IO_EM_DO_03 := State = 1;   (* green *)
_IO_EM_DO_02 := State = 2;   (* yellow *)
`;

const DEBOUNCE_FB_ST = `(* Body of the user-defined function block FB_Debounce.
   Its variable table holds:
     Raw          input   BOOL   the bouncy signal
     FilterTime   input   TIME   how long Raw must be steady
     Clean        output  BOOL   the debounced signal
     OnFilter     local   TON
     OffFilter    local   TON                                  *)

OnFilter(IN := Raw, PT := FilterTime);
OffFilter(IN := NOT Raw, PT := FilterTime);

IF OnFilter.Q THEN
  Clean := TRUE;
ELSIF OffFilter.Q THEN
  Clean := FALSE;
END_IF;
(* Otherwise Clean keeps its last value *)
`;

const DEBOUNCE_USE_ST = `(* Main program: two instances of the same block, each with its
   own timers and its own memory. StartDb and CountDb are local
   variables whose data type is FB_Debounce. *)

StartDb(Raw := _IO_EM_DI_00, FilterTime := T#50ms);
CountDb(Raw := _IO_EM_DI_03, FilterTime := T#50ms);

_IO_EM_DO_00 := StartDb.Clean;
_IO_EM_DO_03 := CountDb.Clean;
`;

const ANALOG_ST = `(* Lab 8: scale a 0 to 10 V signal on plug-in slot 1, channel 0.
   RawMin and RawMax are the counts you measured in step 6. *)

Raw := ANY_TO_REAL(_IO_P1_AI_00);
Level := (Raw - RawMin) * 100.0 / (RawMax - RawMin);

(* Clamp, as in plc-ex-analog-scaling *)
IF Level < 0.0 THEN
  Level := 0.0;
ELSIF Level > 100.0 THEN
  Level := 100.0;
END_IF;

(* Pump lamp with hysteresis, high alarm with deadband (plc-ex-tank-level) *)
IF Level >= 80.0 THEN
  Pump := FALSE;
ELSIF Level <= 20.0 THEN
  Pump := TRUE;
END_IF;

IF Level >= 90.0 THEN
  HighAlarm := TRUE;
ELSIF Level < 85.0 THEN
  HighAlarm := FALSE;
END_IF;

_IO_EM_DO_03 := Pump;        (* green *)
_IO_EM_DO_01 := HighAlarm;   (* red *)
`;

const MODBUS_ST = `(* Lab 9: copy the values the PC will read into global variables
   that are mapped in the Modbus Mapping table. *)

MB_MotorRunning := Motor;               (* coil 000001 *)
MB_PartCount := ANY_TO_INT(PartCounter.CV);   (* holding register 400001 *)
MB_Uptime := ANY_TO_REAL(UptimeTimer.ET) / 1000.0;  (* seconds, 400002 and 400003 *)
`;

const MODBUS_PY = `# Read the Micro850 over Modbus TCP. Written for pymodbus 3.x:
#   pip install "pymodbus<4"
# Set HOST to your bench controller's IP address.
import struct
from pymodbus.client import ModbusTcpClient

HOST = "192.168.1.11"

client = ModbusTcpClient(HOST, port=502)
if not client.connect():
    raise SystemExit(f"Could not connect to {HOST}:502")

# pymodbus addresses are zero-based: coil 000001 is address 0,
# holding register 400001 is address 0.
coils = client.read_coils(0, count=1)
regs = client.read_holding_registers(0, count=3)
client.close()

if coils.isError() or regs.isError():
    raise SystemExit(f"Modbus error: {coils} {regs}")

print("Motor running:", coils.bits[0])
print("Part count:   ", regs.registers[0])

# A REAL takes two registers. Most significant word first; if the
# value looks like nonsense, swap the two words and compare.
hi, lo = regs.registers[1], regs.registers[2]
print("Uptime (s):   ", struct.unpack(">f", struct.pack(">HH", hi, lo))[0])
`;

// ---- Labs ----

export const MICRO850_LABS: Micro850LabData[] = [
  // ------------------------------------------------------------------ Lab 0
  {
    id: "m850-kit-safety",
    short: "Lab 0: the kit and bench safety",
    objectives: [
      "Identify every part of the bench: controller, power supply, pushbuttons, selector switch, lamps and cables.",
      "Read the controller's catalog number and know what its letters tell you.",
      "Know the bench rules: 24 V DC only, no loads energised without supervision, and the lockout basics for changing wiring.",
      "Confirm your PC is ready: CCW Standard Edition installed and the right cables to hand.",
    ],
    prereqs: [
      ["plc-overview", "PLCs: How They're Different From a Normal Computer"],
      ["digital-vs-analog-io", "Digital vs. Analog I/O"],
      ["plc-safety-redundancy", "Safety & Redundancy"],
    ],
    simFirst: {
      text: "No unit free? Everything after this lab has a simulator twin. Work through the simulator track first, then come back to the bench to see the same programs on real hardware.",
      ids: [
        ["plc-iec-languages", "IEC 61131-3: The Standard PLC Languages"],
        ["plc-ex-seal-in", "Exercise: Start/Stop Motor Seal-In"],
      ],
    },
    parts: [
      "One Micro850 24-point controller on a training board. These labs assume a 24 V DC input model, for example a 2080-LC50-24QBB, 2080-LC50-24QVB or 2080-LC50-24QWB, or a newer 2080-L50E-24QBB or 2080-L50E-24QWB. The last three letters describe the I/O: QBB has source (current-out) transistor outputs, QVB sink (current-in) transistor outputs, QWB relay outputs.",
      "A 24 V DC supply for the board: either a DIN-rail supply or the Micro800 plug-in power supply (2080-PS120-240VAC). Its mains side is enclosed and was wired by a qualified person.",
      "On the board: a green normally open (NO) pushbutton, a red normally closed (NC) pushbutton, a two-position selector switch, two more NO pushbuttons, and red, yellow, green and white 24 V DC pilot lamps (or a 24 V DC interposing relay, a small relay whose coil the PLC drives so the relay's contacts can switch a separate load).",
      "A USB cable, USB A to USB Type B (the controller has a Type B programming port). It must be a data cable, not a charge-only one.",
      "An Ethernet patch cable (RJ-45), and optionally a small unmanaged switch if several PCs share one network.",
      "A Windows PC with Connected Components Workbench (CCW) Standard Edition, Rockwell's free programming software for Micro800 controllers, and rights to install drivers and change the network adapter settings.",
    ],
    wiring: { rows: [W.start, W.stop, W.run, W.count, W.reset, W.motor, W.red, W.yellow, W.green], note: WIRING_NOTE },
    safety:
      "These labs use low-voltage (24 V DC) training boards only. Mains wiring (anything at 100 V AC or more, including the supply's input terminals) is out of scope: it must be designed, wired and inspected by a qualified person, and learners never open, touch or rewire it. Never connect a real load (a motor, a contactor switching mains, a heater, a valve) to a bench output without a supervisor present. If your controller's catalog number ends in AWB, its inputs are 120 V AC: do not use it for these labs.",
    sections: [
      {
        title: "Know the bench",
        steps: [
          {
            text: "With the bench supply off, read the label on the side of the controller and write down its catalog number (it starts with `2080-`) and the firmware revision if it is printed.",
            expect: "A Micro850 catalog number such as `2080-LC50-24QBB` or `2080-L50E-24QWB`. You will choose exactly this catalog number in CCW in Lab 1.",
          },
          {
            text: "Find the parts of the controller: the status indicators (LEDs) at the top, the removable I/O terminal blocks, the mode switch, the USB Type B port, the RJ-45 Ethernet socket, the serial port, and the plug-in slots on the front.",
            expect: "You can point at each one. The mode switch has three positions; you will meet them in Lab 1.",
          },
          {
            text: "Name the status indicators. Besides one small LED per input and per output, the controller has indicators for power, run, fault, force, serial communications, module status and network status.",
            expect: "The input and output LEDs sit next to the terminal numbers, so `I-03` lighting up means input 3 sees voltage.",
          },
          {
            text: "Trace the board's wiring against the wiring table above, with the supply still off. Follow each pushbutton's wire from the button to its input terminal, and each lamp's wire from its output terminal.",
            expect: "Every device in the table goes to the terminal listed. If it doesn't, stop and tell the instructor: don't rewire it yourself.",
          },
        ],
      },
      {
        title: "Lockout basics for a bench",
        steps: [
          {
            text: "Lockout/tagout (LOTO) is the procedure of isolating a machine's energy, locking the isolator off and tagging it with your name, so nobody can switch it on while you work. On the bench the same idea is smaller: before you touch any wiring, switch off the bench supply, hang your name tag on it, and check the controller's power LED is off.",
            expect: "Power LED off, tag on the switch. Only the person whose tag it is switches it back on.",
          },
          {
            text: "\"Test before touch\": even at 24 V DC, confirm the circuit is dead before working on it. On a real machine this is done with a voltage tester by someone trained to; on the bench, the power LED being off and the supply switched off is enough because there is nothing above 24 V DC on the learner side.",
          },
        ],
      },
      {
        title: "First power-up (with the instructor)",
        steps: [
          {
            text: "Remove your tag and switch the bench supply on.",
            expect: "The power LED lights green. The fault LED is off. The run LED may be on if a program is already loaded; that's fine.",
          },
          {
            text: "Press each pushbutton in turn and flip the selector switch. Watch the input LEDs.",
            expect: "`I-00`, `I-03` and `I-04` light while their buttons are held, `I-02` follows the selector. `I-01` is lit when the red button is NOT pressed and goes out while you press it, because it is wired normally closed. The input LEDs show the terminal voltage directly, so this works with no program at all.",
          },
          {
            text: "On the PC, check CCW Standard Edition is installed and starts. It is a free download from Rockwell's Product Compatibility and Download Center (rok.auto/pcdc, a Rockwell account is required) and runs on Windows only.",
            expect: "CCW opens to its start page.",
          },
        ],
      },
    ],
    checklist: [
      "I wrote down my controller's catalog number and know what QBB, QVB or QWB means.",
      "I can find the mode switch, the USB port, the Ethernet socket and the status LEDs.",
      "My board's wiring matches the wiring table (or I told the instructor where it doesn't).",
      "I know the bench is 24 V DC only and that mains wiring is for qualified people.",
      "I switched the supply off and tagged it before touching wiring.",
      "Every input LED responds to its button, and I1 goes OUT when the red Stop is pressed.",
      "CCW Standard Edition starts on my PC.",
    ],
    mistakes: [
      "Treating the 24 V DC side as \"safe so anything goes\": short circuits still blow fuses, burn wires and damage outputs.",
      "Using a charge-only USB cable. It powers nothing and transfers nothing; the PC never sees the controller.",
      "Expecting the input LED for the red Stop button to be off at rest. It's wired normally closed, so it's on at rest.",
      "Choosing a different Micro850 catalog number in CCW than the one on the label. The project must match the hardware.",
    ],
    stretch:
      "Find the wiring diagram for your exact catalog number in the user manual (2080-UM002) and draw how the Start button is wired: which supply terminal, which common, which input. Then work out from the diagram whether your inputs are wired sinking or sourcing (see the Sinking and sourcing glossary entry).",
    instructor: [
      "Label each controller and board (for example M850-1 to M850-4) and write its IP address on the label once you set it in Lab 1.",
      "Wire all four boards to the same table so every lab works on every unit, and keep the mains side enclosed and inspected.",
      "Keep a known-good \"bench reset\" project per unit (a single program that maps I/O and does nothing else). Downloading it is how you reset a unit between learners.",
      "Do not set a controller password on shared training units; if you must, record it with the unit.",
      "Have one supervisor per bench whenever anything other than the pilot lamps is connected to an output.",
    ],
  },

  // ------------------------------------------------------------------ Lab 1
  {
    id: "m850-first-connection",
    short: "Lab 1: first connection in CCW",
    objectives: [
      "Create a CCW project for your exact controller and add a ladder program.",
      "Build, connect over USB, download and watch the program run.",
      "Use the mode switch and know the difference between RUN, REM (remote) and PROG.",
      "Set the PC's IP address and reach the controller over Ethernet.",
    ],
    prereqs: [
      ["m850-kit-safety", "Lab 0: the kit and bench safety"],
      ["plc-st-scan-cycle", "The Scan Cycle in Practice"],
      ["ip-subnetting", "IP subnetting"],
    ],
    simFirst: {
      text: "The simulator has no download step: what you type runs. Lab 1 is mostly about the parts the simulator hides. To practise the logic you'll download here, use:",
      ids: [["ladder-logic-basics", "Ladder Logic: Reading Rungs"]],
    },
    parts: ["Your bench from Lab 0", "USB A to Type B data cable", "Ethernet patch cable", "PC with CCW Standard Edition"],
    wiring: { rows: [W.start, W.motor], note: WIRING_NOTE },
    sections: [
      {
        title: "Create the project",
        steps: [
          { text: "Start CCW and create a new project. Name it after yourself and the lab, for example `Ana_Lab1`.", expect: "An empty project; the Project Organizer pane lists nothing yet." },
          {
            text: "Add the controller: open the Device Toolbox, go to its Catalog tab, expand Controllers, find the Micro850 with exactly the catalog number from your label, and double-click it (or drag it into the Project Organizer).",
            expect: "The controller appears in the Project Organizer, and its properties page opens in the middle. If CCW asks for a firmware revision, choose the one on the controller's label.",
          },
          {
            text: "Add a ladder program: in the Project Organizer, under the controller, right-click Programs and choose Add, then New LD: Ladder Diagram.",
            expect: "A program called `UntitledLD` (or similar). Right-click it and Rename it `Main`.",
          },
          {
            text: "Open `Main` and build one rung: a normally open contact assigned to `_IO_EM_DI_00` driving a coil assigned to `_IO_EM_DO_00`. Assign a variable by double-clicking the element and choosing it in the Variable Selector, under the controller's scope (the I/O variables are predefined there).",
            ladder: [{ comment: "Start button straight to the motor lamp", nodes: [{ k: "no", v: "_IO_EM_DI_00" }], coils: [{ k: "coil", v: "_IO_EM_DO_00" }] }],
          },
          { text: "Build: right-click the controller in the Project Organizer and choose Build. Read the Output pane.", expect: "The build finishes with no errors. Clicking an error, if there is one, jumps to it." },
        ],
      },
      {
        title: "Download over USB",
        steps: [
          { text: "Put the controller's mode switch in the middle position, REM (remote), so CCW is allowed to change the mode.", },
          {
            text: "Connect the USB cable. The first time, wait for Windows to detect the controller and configure its USB driver before going on.",
          },
          {
            text: "Right-click the controller and choose Download. In the Connection Browser that opens, expand USB, select your Micro850 and click OK.",
            expect: "CCW asks to put the controller into Remote Program mode if it was running: answer Yes. A download confirmation dialog follows: choose Download. Leave the other option, Download with Project Values, for later; CCW's help explains when you need it.",
          },
          {
            text: "When CCW asks whether to return the controller to Run mode, answer Yes.",
            expect: "The run LED is green. Press Start: the `O-00` lamp lights while the button is held and goes out when you release it. That's the whole program, running on real hardware.",
          },
        ],
      },
      {
        title: "Go online and watch it run",
        steps: [
          {
            text: "With the controller connected, start debugging (the Debug button on the toolbar, or F5 in the CCW versions we checked).",
            expect: "The ladder editor turns into a live view: the rung is drawn in a different colour and contacts that are passing power are highlighted.",
          },
          { text: "Press and release Start while watching the rung.", expect: "The contact and the coil highlight together with the lamp. This is the same live highlighting as in the simulator's ladder view." },
          { text: "Stop debugging (Shift+F5, or the Stop button) and disconnect.", expect: "The editor is editable again. The controller keeps running: it does not need the PC." },
        ],
      },
      {
        title: "Modes and the mode switch",
        steps: [
          {
            text: "Turn the mode switch to PROG.",
            expect: "The run LED goes out and the program stops: pressing Start no longer lights the lamp. In program mode the outputs are off.",
          },
          { text: "Turn it to RUN.", expect: "The program runs again. In RUN, CCW cannot take the controller out of run mode, so a download is refused until you go back to REM." },
          {
            text: "Turn it back to REM. From now on, leave it in REM: CCW then switches between Remote Program (for downloads) and Remote Run itself, and asks you each time.",
          },
        ],
      },
      {
        title: "Connect over Ethernet",
        steps: [
          {
            text: "Find the controller's IP address: connected over USB, open the controller's properties (double-click it in the Project Organizer) and look at the Ethernet settings, under Internet Protocol.",
            expect: "Out of the box a Micro850 uses DHCP (it asks the network for an address). On our benches the instructor has set a fixed (static) address, written on the unit's label, for example `192.168.1.11` with subnet mask `255.255.255.0`.",
          },
          {
            text: "Give the PC a fixed address on the same subnet. In Windows: Control Panel, Network and Sharing Center, Change adapter settings, right-click the wired Ethernet adapter, Properties, Internet Protocol Version 4 (TCP/IPv4), Properties, Use the following IP address. Enter `192.168.1.100` (or the address your instructor gives you; each PC needs a different one) and subnet mask `255.255.255.0`. Leave the gateway empty.",
            expect: "Two devices on the same subnet: 192.168.1.11 and 192.168.1.100 share the first three numbers under a 255.255.255.0 mask.",
          },
          {
            text: "Connect the Ethernet cable from the PC (or the switch) to the controller and run `ping 192.168.1.11` (your unit's address) in a Command Prompt.",
            expect: "Replies. If you get \"Destination host unreachable\" or timeouts, check the cable's link lights and both IP settings before going further.",
          },
          {
            text: "Unplug the USB cable, change the rung (for example, use `_IO_EM_DI_03` instead of `_IO_EM_DI_00`), build and download again. This time, in the Connection Browser, expand the Ethernet entry and select the controller with your unit's IP address.",
            expect: "The download works over Ethernet, and now the Count button lights the lamp.",
          },
        ],
      },
    ],
    reference: [
      { kind: "h", text: "The three mode switch positions" },
      {
        kind: "table",
        head: ["Position", "What the controller does", "Can CCW change the mode?"],
        rows: [
          ["RUN", "Runs the program", "No: downloads are refused"],
          ["REM (remote)", "Stays in whichever mode CCW last set: Remote Run or Remote Program", "Yes: use this for the labs"],
          ["PROG", "Program mode: the program does not execute and outputs are off", "No"],
        ],
      },
    ],
    checklist: [
      "My project uses exactly the catalog number on my controller's label.",
      "The build finished with no errors.",
      "I downloaded over USB and the Start button lit the O-00 lamp.",
      "I went online in debug mode and saw the rung highlight live.",
      "I saw the program stop in PROG and run in RUN, and left the switch in REM.",
      "I set my PC's IPv4 address and pinged the controller.",
      "I downloaded a changed program over Ethernet.",
    ],
    mistakes: [
      "Mode switch in RUN: the download fails because CCW can't put the controller into program mode. Use REM.",
      "Wrong catalog number or firmware revision in the project: CCW refuses the download or reports a mismatch. Fix the project, not the controller.",
      "PC on the wrong subnet: a laptop still on DHCP gets an address like 10.x.x.x and can't reach 192.168.1.11. Ping first.",
      "Two PCs set to the same IP address on a shared switch: both lose connections at random.",
      "Leaving Wi-Fi on a network that also uses 192.168.1.x: Windows may send the traffic out of the wrong adapter. Turn Wi-Fi off for the lab.",
      "Forgetting that the controller keeps the old program until a download succeeds. If the lamp does what the old program said, the download didn't happen.",
    ],
    stretch:
      "Use the IP subnetting lesson to work out the network address and the broadcast address for 192.168.1.11/24, and explain why 192.168.2.100 would not work as the PC's address without a router.",
    instructor: [
      "Before the first session, give each controller a static IP address (for example 192.168.1.11 to .14) in the Ethernet settings of a project and download it over USB, then write the address on the unit's label. Check the setting in Rockwell's documentation for your CCW version (see the verify list).",
      "Pre-install CCW and its USB driver on the lab PCs; the first USB connection takes a while to configure.",
      "Reset between learners: switch to REM, download the bench reset project, return the switch to REM, and check the fault LED is off.",
      "If a learner's PC can't see the controller over USB, try another cable before anything else.",
    ],
  },

  // ------------------------------------------------------------------ Lab 2
  {
    id: "m850-io-variables",
    short: "Lab 2: embedded I/O, variables and forcing",
    objectives: [
      "Read and use the Micro850's predefined I/O variables (`_IO_EM_DI_00`, `_IO_EM_DO_00` and so on).",
      "Create global and local user variables and map I/O to meaningful names.",
      "Monitor live values, and see for yourself why the NC Stop button reads TRUE at rest.",
      "Force an input and an output safely, see the force LED, and remove every force.",
    ],
    prereqs: [
      ["m850-first-connection", "Lab 1: first connection in CCW"],
      ["plc-memory-addressing", "PLC Memory Addressing"],
      ["plc-good-practice", "Good Practice: Naming, Interlocks, Fail-Safe Design"],
    ],
    simFirst: {
      text: "In the simulator the I/O already has names like `Start` and `Stop_NC`. On the Micro850 the I/O comes with fixed names and you map them yourself. Practise the naming ideas first in:",
      ids: [
        ["plc-good-practice", "Good Practice: Naming, Interlocks, Fail-Safe Design"],
        ["plc-memory-addressing", "PLC Memory Addressing"],
      ],
    },
    parts: ["Your bench", "PC with CCW, connected over USB or Ethernet"],
    wiring: { rows: [W.start, W.stop, W.motor], note: WIRING_NOTE },
    safety:
      "Forcing overrides the program. A forced output turns on whatever is wired to it, whatever the logic says, and the Micro800 user manual warns that this can cause sudden machine movement. On the bench only pilot lamps are wired to outputs. Say out loud what you are about to force before you do it, and never leave a force in place when you walk away.",
    sections: [
      {
        title: "The predefined I/O variables",
        steps: [
          {
            text: "Open your Lab 1 project (or a copy of it) and open the controller's Global Variables. Find the I/O variables.",
            expect: "Names like `_IO_EM_DI_00` to `_IO_EM_DI_13` and `_IO_EM_DO_00` to `_IO_EM_DO_09`. Read them as: I/O, EMbedded, Digital Input, number 00. The number is the terminal number, so `_IO_EM_DI_03` is terminal `I-03`.",
          },
          {
            text: "Notice you can't rename them. They exist because the hardware exists. A plug-in module's channels get their own names with the slot number in them, for example `_IO_P1_AI_00` for analog input 0 on plug-in slot 1 (Lab 8).",
          },
        ],
      },
      {
        title: "Your own variables",
        steps: [
          {
            text: "In Global Variables, add three user variables of type BOOL: `Start`, `Stop_NC` and `Motor`.",
            expect: "Global variables are visible to every program in the project. Each program also has its own Local Variables table for names only that program needs. These are the same names the simulator exercise used.",
          },
          {
            text: "Replace the Lab 1 rung with an input mapping, a test rung and an output mapping, as below. Mapping I/O to named variables in one place, at the start and the end of the scan, keeps the logic readable and makes rewiring a one-line change.",
            ladder: [
              { comment: "Input mapping", nodes: [{ k: "no", v: "_IO_EM_DI_00" }], coils: [{ k: "coil", v: "Start" }] },
              { nodes: [{ k: "no", v: "_IO_EM_DI_01" }], coils: [{ k: "coil", v: "Stop_NC" }] },
              { comment: "Test logic for this lab only", nodes: [{ k: "no", v: "Start" }], coils: [{ k: "coil", v: "Motor" }] },
              { comment: "Output mapping", nodes: [{ k: "no", v: "Motor" }], coils: [{ k: "coil", v: "_IO_EM_DO_00" }] },
            ],
          },
          { text: "Build and download, then start debugging." },
        ],
      },
      {
        title: "Monitor",
        steps: [
          {
            text: "Open Global Variables while debugging and watch the column that shows each variable's live value (labelled Logical Value in the versions we checked).",
            expect: "`Stop_NC` is TRUE while nobody touches the red button, and `_IO_EM_DI_01` with it. Press Stop and both go FALSE.",
          },
          { text: "Press Start.", expect: "`_IO_EM_DI_00`, `Start`, `Motor` and `_IO_EM_DO_00` all go TRUE together, and the lamp lights." },
        ],
      },
      {
        title: "Force, then remove the force",
        steps: [
          {
            text: "Force an input: in the variable monitor, lock `_IO_EM_DI_00` and set its logical value to TRUE. Forcing on a Micro800 is done by locking an I/O variable and then setting its value: the logical value for an input, the physical value for an output.",
            expect: "The force LED on the controller lights. `Start` and `Motor` go TRUE and the lamp lights, but the `I-00` input LED stays OFF: an input force changes what the program sees, not the terminal, and the input LEDs always show the terminal.",
          },
          { text: "Unlock `_IO_EM_DI_00`.", expect: "The lamp goes out and `Start` follows the real button again." },
          {
            text: "Force an output: lock `_IO_EM_DO_00` and set its physical value to TRUE, without pressing anything.",
            expect: "The lamp lights and the `O-00` LED lights, even though the program writes FALSE to it every scan. An output force drives the terminal; the program's value is ignored.",
          },
          {
            text: "Unlock every locked variable. Check the force LED.",
            expect: "The force LED is off. If it is still on, something is still locked: find it before you go on.",
          },
          {
            text: "Try to lock `Motor`, a user variable.",
            expect: "You can write a new value to it while debugging, but forcing applies only to I/O variables. And because the program writes `Motor` every scan, a value you type is overwritten straight away.",
          },
        ],
      },
    ],
    reference: [
      { kind: "h", text: "Names on the Micro850" },
      {
        kind: "table",
        head: ["Kind", "Example", "Where it lives"],
        rows: [
          ["Embedded digital input", "`_IO_EM_DI_00`", "Predefined global, one per input terminal"],
          ["Embedded digital output", "`_IO_EM_DO_00`", "Predefined global, one per output terminal"],
          ["Plug-in analog input", "`_IO_P1_AI_00`", "Appears when you add a plug-in module to slot 1"],
          ["System variable", "`__SYSVA_FIRST_SCAN`", "Predefined, read-only status from the controller"],
          ["User global", "`Motor`", "Global Variables: visible to every program"],
          ["User local", "`OnTimer`", "A program's Local Variables: visible only there"],
        ],
      },
      {
        kind: "callout",
        tone: "info",
        text: "CCW also lets you give an I/O variable an alias, a second name shown with it in the variable table. Mapping in code, as here, is more portable: it reads the same in every IEC 61131-3 tool, and it's what the simulator track taught.",
      },
    ],
    checklist: [
      "I can say which terminal `_IO_EM_DI_03` and `_IO_EM_DO_02` are.",
      "I created global variables Start, Stop_NC and Motor and mapped them to I/O.",
      "I saw Stop_NC read TRUE at rest and FALSE while pressed.",
      "I forced an input and saw the input LED stay off while the program saw TRUE.",
      "I forced an output and saw the lamp light against the program.",
      "I removed every force and the force LED is off.",
    ],
    mistakes: [
      "Writing the same output from two places (a mapping rung and a test rung). The last write in the scan wins, so one of them seems to do nothing.",
      "Forgetting a force. The machine then ignores the program on that point, and the next person doesn't know why. Always check the force LED before you leave.",
      "Expecting an input LED to show a force. It shows the terminal, not the program's view.",
      "Assuming a force survives a power cycle, or that it doesn't. The manual edition we checked says forces are cleared after a power cycle; don't rely on either: remove them yourself.",
    ],
    stretch:
      "Add a second program that reads `__SYSVA_FIRST_SCAN` and counts how many times the controller has started up (a DINT that you increment when the first-scan bit is TRUE). Power-cycle the board twice. Does your count survive the power cycle? Look up retained variables in CCW's help to explain what you see.",
    instructor: [
      "Check the force LED on every unit at the end of each session, and unlock anything left locked.",
      "If time is short, give learners a project with the mapping rungs already in place and let them do the monitoring and forcing parts.",
      "Reset: download the bench reset project.",
    ],
  },

  // ------------------------------------------------------------------ Lab 3
  {
    id: "m850-seal-in-ladder",
    short: "Lab 3: start/stop seal-in in ladder",
    objectives: [
      "Build the start/stop seal-in rung in CCW's ladder editor, including a parallel branch.",
      "Test it on the bench against the same sequence the simulator grader used, including a broken stop wire.",
      "See with your own eyes why the stop button is wired normally closed and used as a normally open contact.",
    ],
    prereqs: [
      ["m850-io-variables", "Lab 2: embedded I/O, variables and forcing"],
      ["plc-contacts-seal-in", "Contacts, Coils and the Start/Stop Seal-In"],
      ["plc-ex-seal-in", "Exercise: Start/Stop Motor Seal-In"],
    ],
    simFirst: {
      text: "Pass the simulator exercise first: the bench test below is the same sequence the grader runs.",
      ids: [
        ["plc-contacts-seal-in", "Contacts, Coils and the Start/Stop Seal-In"],
        ["plc-ex-seal-in", "Exercise: Start/Stop Motor Seal-In"],
      ],
    },
    parts: ["Your bench", "PC with CCW"],
    wiring: { rows: [W.start, W.stop, W.motor], note: WIRING_NOTE },
    sections: [
      {
        title: "Build the rung",
        steps: [
          { text: "Save your Lab 2 project under a new name (for example `Ana_Lab3`) so each lab has its own project." },
          {
            text: "In program `Main`, keep the two input mapping rungs and the output mapping rung, and replace the test rung with the seal-in: a normally open `Start` contact with a parallel branch around it holding a normally open `Motor` contact, then a normally open `Stop_NC` contact in series, driving the `Motor` coil. Use the ladder toolbox's branch element to add the parallel branch around the Start contact.",
            ladder: SEAL_IN_MAPPED,
            expect: "Four rungs, exactly as drawn. The Stop_NC contact is normally open: the button is wired NC, so the program uses an NO contact for it.",
          },
          { text: "Build. Fix anything the Output pane reports, then download and start debugging." },
        ],
      },
      {
        title: "Test it like the grader",
        steps: [
          { text: "Press and release Start.", expect: "The lamp lights and stays lit. Online, you can see power flow through the Motor branch now instead of the Start contact." },
          { text: "Press Stop.", expect: "The lamp goes out." },
          { text: "Release Stop.", expect: "The lamp stays out: releasing Stop must not restart anything." },
          { text: "Hold Start and Stop together.", expect: "The lamp stays out: Stop wins." },
          { text: "Release Stop while still holding Start, then release Start.", expect: "The lamp comes on when Stop is released and stays on." },
          {
            text: "Simulate a broken stop wire: switch the bench supply off and tag it, unplug the wire from terminal `I-01` (or open the board's wire break test switch if it has one), remove your tag and switch back on.",
            expect: "After power-up the lamp is off. Press Start: the lamp still won't light. A broken wire looks exactly like a pressed Stop, which is the fail-safe point of wiring stop buttons NC.",
          },
          { text: "Switch off, tag, reconnect `I-01`, untag, switch on.", expect: "Start works again." },
        ],
      },
      {
        title: "See the wrong version fail",
        steps: [
          {
            text: "Change the Stop_NC contact to a normally closed contact, build and download.",
            expect: "Now Start does nothing at rest, and the motor only runs while you hold Stop. Worse, with the wire broken, Stop could never stop it. Change it back.",
          },
        ],
      },
    ],
    checklist: [
      "My rung has Start and Motor in parallel, in series with an NO Stop_NC contact.",
      "Start starts the lamp and it stays on after release.",
      "Stop stops it, and releasing Stop doesn't restart it.",
      "With both held, Stop wins.",
      "With the I-01 wire unplugged, Start can't start it.",
      "I tried the NC-contact version and saw why it's wrong.",
    ],
    mistakes: [
      "Using a normally closed contact for Stop_NC because the button is NC. The contact type describes what the program checks, not how the button is wired.",
      "Putting the Motor branch around the Stop contact as well. Then the seal holds through Stop and Stop never works.",
      "Leaving the Lab 2 test rung in place: two rungs write Motor and the last one wins.",
      "Unplugging a wire with the supply on. It's only 24 V DC, but the habit is what matters on a real machine.",
    ],
    stretch:
      "Add a Jog button on `I-04` that runs the motor lamp only while held and never seals in. Hint: the jog must not feed the seal branch, so it needs its own path to the coil that bypasses the Motor contact. Then add a normally closed overload contact on `I-03` (pretend it's an overload relay) that stops the motor like Stop does.",
    instructor: [
      "If boards have no wire break test switch, consider adding one in series with the Stop button: it makes step 6 quicker and avoids loosening terminals.",
      "Watch for learners unplugging wires live; correct it every time.",
      "Reset: download the bench reset project.",
    ],
  },

  // ------------------------------------------------------------------ Lab 4
  {
    id: "m850-seal-in-st",
    short: "Lab 4: the seal-in in Structured Text",
    objectives: [
      "Add a Structured Text program in CCW and declare its variables in the variable tables.",
      "Run the simulator's one-line seal-in on the controller unchanged.",
      "Know how CCW's Structured Text differs from the simulator's subset: declarations, conversion functions, data types and counter pin names.",
    ],
    prereqs: [
      ["m850-seal-in-ladder", "Lab 3: start/stop seal-in in ladder"],
      ["plc-iec-languages", "IEC 61131-3: The Standard PLC Languages"],
      ["plc-st-scan-cycle", "The Scan Cycle in Practice"],
    ],
    simFirst: {
      text: "The logic line is the answer to the simulator exercise. Solve it there first:",
      ids: [["plc-ex-seal-in", "Exercise: Start/Stop Motor Seal-In"]],
    },
    parts: ["Your bench", "PC with CCW"],
    wiring: { rows: [W.start, W.stop, W.motor], note: WIRING_NOTE },
    sections: [
      {
        title: "Replace the ladder with ST",
        steps: [
          {
            text: "Save Lab 3 as a new project. Delete the ladder program `Main` from it, so only one program writes `_IO_EM_DO_00`.",
            expect: "Programs in one project all run every scan; if two write the same output, the last write wins, as in the scan cycle lesson.",
          },
          {
            text: "Add a Structured Text program: right-click Programs, choose Add, and pick the Structured Text option. Rename it `Main`.",
          },
          {
            text: "Keep `Start`, `Stop_NC` and `Motor` as global variables (from Lab 2). Type the program below. There is no `VAR ... END_VAR` block: in CCW every variable is declared in a variable table, not in the program text.",
            code: SEAL_IN_ST,
          },
          { text: "Build, download and start debugging. Watch `Start`, `Stop_NC` and `Motor` in the variable monitor." },
          { text: "Repeat the Lab 3 test sequence, including the broken wire.", expect: "Identical behaviour to the ladder version. The two languages compile to the same logic." },
        ],
      },
      {
        title: "Try the differences",
        steps: [
          {
            text: "Add a local REAL variable `Ratio` and an INT `Presses`. Write `Ratio := Presses / 2;` and build.",
            expect: "A type error, as the simulator would give: an INT expression can't be stored in a REAL without a conversion.",
          },
          {
            text: "Fix it the Micro800 way: `Ratio := ANY_TO_REAL(Presses) / 2.0;`. The simulator wrote `INT_TO_REAL(...)`; Micro800 controllers use the `ANY_TO_` family instead (`ANY_TO_REAL`, `ANY_TO_INT`, `ANY_TO_DINT`, `ANY_TO_BOOL`, `ANY_TO_TIME` and so on), each taking almost any input type.",
            expect: "It builds.",
          },
        ],
      },
    ],
    reference: [
      { kind: "h", text: "Simulator ST vs CCW ST" },
      {
        kind: "table",
        head: ["Topic", "Simulator", "CCW on a Micro850"],
        rows: [
          ["Declarations", "`VAR ... END_VAR` in the code (optional `PROGRAM` wrapper)", "Variable tables: Global Variables for the controller, Local Variables per program; no `VAR` block and no `PROGRAM ... END_PROGRAM` in the editor"],
          ["I/O", "The exercise's named variables", "Predefined `_IO_EM_DI_nn`, `_IO_EM_DO_nn`, which you map to your own names"],
          ["Type conversion", "`INT_TO_REAL`, `REAL_TO_INT` and similar", "`ANY_TO_REAL`, `ANY_TO_INT`, `ANY_TO_DINT` and the rest of the `ANY_TO_` family"],
          ["Data types", "BOOL, INT, DINT, REAL, TIME", "Those plus SINT, USINT, UINT, UDINT, LINT, ULINT, LREAL, BYTE, WORD, DWORD, LWORD, STRING, DATE and more"],
          ["CTU counter pins", "`CU`, `R`, `PV`; `PV` and `CV` are INT", "`CU`, `RESET`, `PV`; `PV` and `CV` are DINT"],
          ["CTD counter pins", "`CD`, `LD`, `PV`", "`CD`, `LOAD`, `PV`"],
          ["Timers", "TON, TOF, TP: `IN`, `PT`, `Q`, `ET`", "The same pins and behaviour; CCW's instruction set also has extra, non-IEC timers"],
          ["Comments", "`(* ... *)`", "`(* ... *)` works; stick to it"],
          ["Function block calls", "Named parameters: `T1(IN := x, PT := T#1s);`", "Named parameters work; Rockwell's help examples also show positional calls"],
          ["Instructions in ladder", "Not applicable", "Functions and blocks used in ladder get `EN` and `ENO` pins"],
          ["Scan time", "Fixed 10 ms", "As fast as the program allows, and it varies"],
        ],
      },
    ],
    checklist: [
      "I deleted the ladder program so only one program writes the outputs.",
      "My ST program has input mapping, the one-line seal-in and output mapping.",
      "It passed the same bench test as the ladder version, including the broken wire.",
      "I saw the type error for INT into REAL and fixed it with ANY_TO_REAL.",
      "I can name two differences between the simulator's ST and CCW's ST.",
    ],
    mistakes: [
      "Typing a `VAR ... END_VAR` block into CCW's ST editor out of simulator habit. Declare variables in the tables.",
      "Writing `INT_TO_REAL` from the simulator: use `ANY_TO_REAL` on a Micro800.",
      "Leaving the ladder program in the project as well: both write `_IO_EM_DO_00` and the last one in the scan wins.",
      "Declaring `Motor` as a local in one program and a global elsewhere, then wondering why they don't match. Two variables with the same name in different scopes are two different variables.",
    ],
    stretch:
      "Keep the ST program and add the ladder program back, but only for the mapping rungs, and move the logic line into ST. Then find where CCW sets the order programs run in, and work out which order the mapping and logic programs must run in for the outputs to update in the same scan as the inputs.",
    instructor: [
      "Learners often get a build error from an undeclared variable; show them where Local and Global Variables are before they start typing.",
      "Reset: download the bench reset project.",
    ],
  },

  // ------------------------------------------------------------------ Lab 5
  {
    id: "m850-timers-counters",
    short: "Lab 5: timers and counters",
    objectives: [
      "Declare TON and CTU instances as variables in CCW and call them from ST.",
      "Watch a timer's elapsed time and a counter's current value live.",
      "Build the simulator's flasher and part counter on the bench.",
    ],
    prereqs: [
      ["m850-seal-in-st", "Lab 4: the seal-in in Structured Text"],
      ["plc-timers", "Timers: TON, TOF and TP"],
      ["plc-counters", "Counters: CTU, CTD and CTUD"],
    ],
    simFirst: {
      text: "The two halves of this lab are two simulator exercises:",
      ids: [
        ["plc-ex-flasher", "Exercise: Flashing Beacon with TON"],
        ["plc-ex-part-counter", "Exercise: Part Counter with Reset"],
      ],
    },
    parts: ["Your bench", "PC with CCW"],
    wiring: { rows: [W.run, W.count, W.reset, W.yellow, W.green], note: WIRING_NOTE },
    sections: [
      {
        title: "Declare the instances",
        steps: [
          {
            text: "New project (or Save As), one ST program `Main`. In its Local Variables add: `OnTimer` and `OffTimer` of data type TON, `PartCounter` of data type CTU, BOOLs `Run`, `CountPb`, `ResetPb`, `Beacon`, `BatchDone`, and `Count` of type DINT.",
            expect: "A function block instance is a variable whose data type is the block. Each instance has its own memory: its own elapsed time, its own count.",
          },
          { text: "Type the program below, build and download.", code: TIMERS_ST },
        ],
      },
      {
        title: "Test the flasher",
        steps: [
          { text: "Turn the Run selector on.", expect: "The yellow lamp flashes: 0.5 s on, 0.5 s off." },
          {
            text: "Go online and watch `OnTimer.ET` and `OffTimer.ET` (expand the instance in the variable monitor to see its members).",
            expect: "One counts up to 500 ms while the other is at zero, and they take turns.",
          },
          { text: "Change both `PT` values to `T#250ms`, build and download.", expect: "Twice the flash rate." },
          { text: "Turn Run off.", expect: "The lamp stays off: `Beacon` is ANDed with Run." },
        ],
      },
      {
        title: "Test the counter",
        steps: [
          { text: "Press Count five times, watching `PartCounter.CV` online.", expect: "CV goes 1, 2, 3, 4, 5 and the green lamp lights at 5. CTU counts rising edges, so holding the button counts once." },
          { text: "Press Count twice more.", expect: "CV goes on counting (6, 7) and the lamp stays on: Q means CV is at least PV." },
          { text: "Press Reset.", expect: "CV goes to 0 and the lamp goes out. RESET wins over CU." },
          {
            text: "Press the Count button quickly and lightly a few times, and compare CV with the number of presses.",
            expect: "If CV jumps by more than one for a single press, the contact is bouncing. That's what the debounce exercise and Lab 7 deal with. (CCW also has input filter settings for the embedded inputs; leave them at their defaults for this lab.)",
          },
        ],
      },
    ],
    checklist: [
      "I declared TON and CTU instances as local variables.",
      "The yellow lamp flashes at 0.5 s on, 0.5 s off and stops when Run is off.",
      "I watched OnTimer.ET and OffTimer.ET take turns online.",
      "I changed the preset time and saw the flash rate change.",
      "The green lamp lit at a count of 5, and Reset cleared it.",
      "I used RESET (not R) on the Micro800 CTU.",
    ],
    mistakes: [
      "Calling an instance twice in one scan (for example in two IF branches) with different inputs. The second call wins: a timer can reset itself, and a counter can miss or double-count edges. Call each instance exactly once per scan.",
      "Calling a timer only inside an IF. When the IF is false the timer isn't called, so it neither runs nor resets.",
      "Writing `R :=` from the simulator: the Micro800 CTU's reset input is `RESET`.",
      "Writing `PT := 500`: PT is a TIME, so write `T#500ms`.",
      "Using one instance for two jobs. Each job needs its own instance.",
    ],
    stretch:
      "Add an off-delay: a TOF instance that keeps the red lamp on `O-01` lit for 3 s after Run is switched off, like a run-on fan. Then make Count debounce-proof using an R_TRIG on a debounced signal, after you have done Lab 7.",
    instructor: [
      "Pushbuttons on some boards bounce enough to double-count; that is a useful surprise, so don't fix it in advance.",
      "Reset: download the bench reset project.",
    ],
  },

  // ------------------------------------------------------------------ Lab 6
  {
    id: "m850-state-machine",
    short: "Lab 6: a traffic light state machine in ST",
    objectives: [
      "Run the simulator's traffic light state machine on three real lamps.",
      "Watch the state variable and timers change online.",
      "Change the sequence safely and re-test it.",
    ],
    prereqs: [
      ["m850-timers-counters", "Lab 5: timers and counters"],
      ["plc-state-machines", "Sequences as State Machines with CASE"],
    ],
    simFirst: {
      text: "Solve the traffic light in the simulator first; the bench program is the same solution with I/O mapping.",
      ids: [
        ["plc-ex-traffic-light", "Exercise: Traffic Light State Machine"],
        ["plc-ex-conveyor-jam", "Exercise: Conveyor Jam Detection"],
      ],
    },
    parts: ["Your bench", "PC with CCW"],
    wiring: { rows: [W.run, W.red, W.yellow, W.green], note: WIRING_NOTE },
    sections: [
      {
        title: "Build and run",
        steps: [
          {
            text: "New project, one ST program. Local variables: `State` (INT, initial value 0), `RedTimer`, `GreenTimer`, `YellowTimer` (TON), `Run` (BOOL). The variable table has a column for each variable's initial value.",
          },
          { text: "Type the program below, build and download.", code: TRAFFIC_ST },
          { text: "With Run off, look at the lamps.", expect: "Only red is lit." },
          { text: "Turn Run on and time a full cycle with a phone stopwatch.", expect: "Red 4 s, green 3 s, yellow 1 s, then red again, forever. Exactly one lamp at a time." },
          { text: "Go online and watch `State`, and the three timers' `ET`.", expect: "State steps 0, 1, 2, 0. Only the timer belonging to the current state is counting." },
          { text: "Turn Run off in the middle of green.", expect: "Straight to red. Turn Run on again: a fresh 4 s of red, because RedTimer restarted from zero." },
        ],
      },
      {
        title: "Change the sequence",
        steps: [
          {
            text: "Many countries show red and yellow together before green. Add a state 3 (red and yellow, 1 s) between red and green: red goes to 3, 3 goes to green. Change the output lines so red is lit in states 0 and 3 and yellow in states 2 and 3.",
            expect: "Red, red+yellow, green, yellow, red. Exactly one state at a time, but now two lamps in one of them.",
          },
        ],
      },
    ],
    checklist: [
      "Only red is on while Run is off.",
      "The cycle is red 4 s, green 3 s, yellow 1 s, measured on the bench.",
      "I watched State and the timers online.",
      "Switching Run off mid-cycle goes straight to red, and restarting gives a full red.",
      "I added a red+yellow state and the lamps follow the new sequence.",
    ],
    mistakes: [
      "Writing a lamp output inside more than one CASE branch. Drive outputs from the state in one place at the end, as here.",
      "Forgetting the initial value of State, or giving it one outside 0 to 2: no CASE branch matches and nothing ever happens.",
      "Running one shared timer for all states without resetting it between them: the second state inherits the first state's elapsed time.",
    ],
    stretch:
      "Add a pedestrian button on `I-00`: a press during green shortens the remaining green to 1 s, and the request is remembered (latched) until the next red. Draw the state diagram on paper before you change the code.",
    instructor: [
      "If a learner's sequence hangs, have them watch State online first; nine times out of ten it is stuck in a state whose timer isn't being called.",
      "Reset: download the bench reset project.",
    ],
  },

  // ------------------------------------------------------------------ Lab 7
  {
    id: "m850-function-blocks",
    short: "Lab 7: your own function block",
    objectives: [
      "Create a user-defined function block (UDFB) in CCW with inputs, outputs and internal timers.",
      "Use two instances of it and see that each keeps its own memory.",
      "Turn the simulator's debounce solution into a reusable block.",
    ],
    prereqs: [
      ["m850-timers-counters", "Lab 5: timers and counters"],
      ["plc-iec-languages", "IEC 61131-3: programs, function blocks and functions"],
    ],
    simFirst: {
      text: "The simulator can't define your own blocks, but the logic inside this one is the debounce exercise:",
      ids: [
        ["plc-ex-debounce", "Exercise: Debounce a Bouncy Contact"],
        ["plc-edge-detection", "Edge Detection: R_TRIG, F_TRIG and One-Scan Pulses"],
      ],
    },
    parts: ["Your bench", "PC with CCW"],
    wiring: { rows: [W.start, W.count, W.motor, W.green], note: WIRING_NOTE },
    sections: [
      {
        title: "Create the block",
        steps: [
          {
            text: "In the Project Organizer, right-click User-Defined Function Blocks and choose Add, then New ST: Structured Text. Name it `FB_Debounce`.",
            expect: "A new block with its own variable table and an empty ST body.",
          },
          {
            text: "In the block's variable table, add `Raw` (BOOL) and `FilterTime` (TIME) as inputs, `Clean` (BOOL) as an output, and `OnFilter` and `OffFilter` (TON) as internal variables. The table has a column for each variable's direction (input, output, or internal).",
          },
          { text: "Type the body below and build.", code: DEBOUNCE_FB_ST, expect: "The build succeeds and `FB_Debounce` now appears as a data type you can choose, next to TON and CTU." },
        ],
      },
      {
        title: "Use two instances",
        steps: [
          {
            text: "In the main ST program, add two local variables `StartDb` and `CountDb` whose data type is `FB_Debounce`, and type:",
            code: DEBOUNCE_USE_ST,
          },
          { text: "Build, download, debug. Press Start and Count separately, then together.", expect: "Each lamp follows its own button about 50 ms late. Online, `StartDb.OnFilter.ET` and `CountDb.OnFilter.ET` are independent: two instances, two sets of timers." },
          { text: "Tap a button very briefly (shorter than 50 ms if you can).", expect: "The lamp doesn't light: the pulse was filtered out." },
          { text: "Change `CountDb`'s FilterTime to `T#500ms` only.", expect: "Count is now slow to respond and Start is not: same block, different parameters per instance." },
        ],
      },
    ],
    reference: [
      {
        kind: "table",
        head: ["", "Program", "Function block", "Function"],
        rows: [
          ["Keeps memory between scans", "Yes", "Yes, one set per instance", "No"],
          ["Needs an instance variable", "No", "Yes", "No"],
          ["Example", "`Main`", "TON, CTU, `FB_Debounce`", "ANY_TO_REAL, ABS"],
        ],
      },
    ],
    checklist: [
      "I created FB_Debounce with Raw and FilterTime inputs and a Clean output.",
      "The block's timers are internal variables of the block, not globals.",
      "I used two instances, and their timers run independently.",
      "A very short tap is filtered out.",
      "Changing one instance's FilterTime didn't affect the other.",
    ],
    mistakes: [
      "Declaring the block's timers as globals. Then every instance shares one pair of timers and they fight.",
      "Forgetting to set an input's direction, so it shows up as an internal variable and the call won't accept it.",
      "Calling one instance for two buttons. One instance, one signal.",
      "Not calling an instance every scan: its timers stop updating.",
    ],
    stretch:
      "Write a second block, `FB_MotorStarter`, with inputs Start, Stop_NC and Overload_NC and an output Run, containing the seal-in from Lab 4. Use it with debounced inputs from `FB_Debounce`. This is how real projects reuse one tested motor block for every motor.",
    instructor: [
      "If a learner's block won't appear as a data type, they usually haven't built since creating it.",
      "Reset: download the bench reset project.",
    ],
  },

  // ------------------------------------------------------------------ Lab 8
  {
    id: "m850-analog-scaling",
    short: "Lab 8 (optional): analog input scaling",
    optional: true,
    objectives: [
      "Add an analog plug-in module to the project and configure a channel for 0 to 10 V.",
      "Read raw counts, measure the two end points and scale to engineering units (percent level).",
      "Reuse the simulator's clamp, hysteresis and deadband logic on a real signal.",
    ],
    prereqs: [
      ["m850-timers-counters", "Lab 5: timers and counters"],
      ["digital-vs-analog-io", "Digital vs. Analog I/O"],
      ["plc-analog-alarms", "Analog Scaling and Alarms with Deadband"],
    ],
    simFirst: {
      text: "Optional lab: only for units with an analog plug-in. Everyone can do the same logic in the simulator:",
      ids: [
        ["plc-ex-analog-scaling", "Exercise: Scale a 4 to 20 mA Pressure Signal"],
        ["plc-ex-tank-level", "Exercise: Tank Level with Hysteresis and Alarm"],
      ],
    },
    parts: [
      "Assumption: the Micro850's embedded I/O is digital only, so this lab needs an analog input plug-in module fitted in plug-in slot 1, either a 2080-IF2 (2 channels) or a 2080-IF4 (4 channels). If your unit has no analog plug-in, use the simulator exercises instead.",
      "A 0 to 10 V DC signal source: a bench signal generator or loop calibrator set to voltage, or a potentiometer board made for the purpose by the instructor. Nothing above 10 V may reach the input.",
      "A multimeter, to confirm the voltage you apply.",
    ],
    wiring: {
      rows: [
        ["Plug-in slot 1, VI-0", "_IO_P1_AI_00", "0 to 10 V signal, positive"],
        ["Plug-in slot 1, COM", "(none)", "0 to 10 V signal, common"],
        W.red,
        W.green,
      ],
      note: "Analog terminal names are as printed on the 2080-IF2 (Rockwell's starter pack quick start wires a 0 to 10 V signal to VI-0 and COM). Check the module's own wiring diagram before connecting anything.",
    },
    safety: "Apply the signal only after the module is configured for voltage, and only with the instructor's signal source. Never connect the 24 V DC supply to an analog input.",
    sections: [
      {
        title: "Configure the module",
        steps: [
          {
            text: "Disconnect from the controller first: Rockwell's quick start says to disconnect before adding plug-in modules. Open the controller's properties, right-click plug-in slot 1 in the controller's configuration, and choose your module (for example Analog, then 2080-IF2).",
            expect: "The module appears in slot 1 with its channel settings.",
          },
          { text: "Set channel 0 to a voltage input and make sure it is enabled. Disable channels you don't use.", },
          { text: "Build and download.", expect: "No fault. If the fault LED lights, the module in the project doesn't match the one fitted: check both." },
        ],
      },
      {
        title: "Read and calibrate",
        steps: [
          {
            text: "Go online and watch `_IO_P1_AI_00` in Global Variables while you turn the signal from 0 V to 10 V. Check its data type in the table.",
            expect: "A raw count that rises with the voltage. Rockwell's quick start shows a 2080-IF2 reading 0 to 65535 for 0 to 10 V; your module may differ, which is exactly why the next step measures it.",
          },
          {
            text: "Set the source to 0.0 V and write down the raw count (`RawMin`). Set it to 10.0 V (check with the multimeter) and write down the count (`RawMax`). Add `RawMin` and `RawMax` as REAL local variables with those values as initial values.",
            expect: "Two-point calibration: scaling from measured end points corrects for the whole signal chain, not just the module's datasheet.",
          },
        ],
      },
      {
        title: "Scale and use it",
        steps: [
          { text: "Add REAL locals `Raw` and `Level`, BOOLs `Pump` and `HighAlarm`, then type the program below, build and download.", code: ANALOG_ST },
          { text: "Set 5.0 V.", expect: "`Level` reads about 50.0 (%)." },
          { text: "Sweep slowly from 0 V up to 10 V and back.", expect: "The green Pump lamp switches off at 80 % going up and on again at 20 % going down; the red alarm lights at 90 % and clears below 85 %. No chatter at the switching points." },
        ],
      },
    ],
    checklist: [
      "The plug-in module in my project matches the one fitted, and channel 0 is set to voltage.",
      "I saw the raw count rise with the voltage.",
      "I measured RawMin and RawMax and used them in the scaling.",
      "Level reads about 50 % at 5 V.",
      "The pump lamp shows hysteresis and the alarm shows deadband.",
    ],
    mistakes: [
      "Treating the raw value as a signed INT. Check its data type in the table, and convert with `ANY_TO_REAL` before doing maths.",
      "Integer division: `(Raw - RawMin) / (RawMax - RawMin) * 100` in integers is 0 for every reading below the top. Do the maths in REAL.",
      "Changing the module configuration while online. Disconnect first.",
      "Wiring the signal to the current input terminal (CI) instead of the voltage terminal (VI).",
    ],
    stretch:
      "If your instructor has a loop calibrator, reconfigure the channel for 4 to 20 mA current, wire it to the current input terminal, measure the raw counts at 4 mA and 20 mA, and add the wire break check from the simulator exercise (below 3.6 mA means broken wire).",
    instructor: [
      "Mark this lab optional unless every unit has an analog plug-in. Plug-in modules should be fitted with the bench powered off.",
      "Provide a signal source limited to 0 to 10 V so a slip can't damage the input.",
      "If only some units have an analog plug-in, keep a reset project per unit that matches its hardware: a project whose plug-in configuration doesn't match the fitted modules can fault.",
    ],
  },

  // ------------------------------------------------------------------ Lab 9
  {
    id: "m850-modbus-tcp",
    short: "Lab 9: reading the Micro850 over Modbus TCP",
    objectives: [
      "Use the Micro850 as a Modbus TCP server: map variables to Modbus addresses in CCW.",
      "Read a coil, a 16-bit register and a 32-bit REAL from a PC with a short Python script.",
      "Handle the two classic traps: one-based vs zero-based addresses, and word order.",
    ],
    prereqs: [
      ["m850-timers-counters", "Lab 5: timers and counters"],
      ["industrial-networking", "Industrial Networking: Modbus & Deterministic Polling"],
      ["endianness", "Endianness"],
    ],
    simFirst: {
      text: "The simulator has no network. Read the Modbus lesson first; it covers the address model and why Modbus has no security.",
      ids: [["industrial-networking", "Industrial Networking: Modbus & Deterministic Polling"]],
    },
    parts: ["Your bench, with a static IP address (Lab 1)", "PC on the same subnet, with Python 3 and pymodbus 3.x installed (`pip install \"pymodbus<4\"`)", "Optionally, a free command-line Modbus client such as modpoll, to cross-check"],
    wiring: { rows: [W.start, W.stop, W.count, W.reset, W.motor], note: WIRING_NOTE },
    safety:
      "Modbus TCP has no authentication: anything that can reach port 502 can read and write mapped variables. This lab only reads. Keep the bench network separate from the office network, and never map a variable that starts equipment for writing without an interlock in the program.",
    sections: [
      {
        title: "Prepare the program",
        steps: [
          {
            text: "Start from your Lab 4 (seal-in) project and add the Lab 5 counter. Add a TON instance `UptimeTimer`, called as `UptimeTimer(IN := TRUE, PT := T#24h);` so its ET counts up from power-up.",
          },
          {
            text: "Add three global variables for Modbus: `MB_MotorRunning` (BOOL), `MB_PartCount` (INT) and `MB_Uptime` (REAL), and copy values into them at the end of the program:",
            code: MODBUS_ST,
            expect: "A separate set of variables for the network keeps a clear boundary: you decide exactly what the outside world can see.",
          },
        ],
      },
      {
        title: "Map the variables",
        steps: [
          {
            text: "Open the controller's properties and find the Modbus Mapping page. Check the Ethernet settings page as well: if your CCW version has a setting to enable Modbus TCP, turn it on.",
          },
          {
            text: "Map `MB_MotorRunning` to address `000001`, `MB_PartCount` to `400001` and `MB_Uptime` to `400002`.",
            expect: "CCW uses six-digit Modbus addresses whose first digit is the table: 0 for coils, 1 for discrete inputs, 3 for input registers, 4 for holding registers. The REAL needs 32 bits, so it takes two registers: 400002 and 400003.",
          },
          { text: "Build and download (the mapping is part of the project), then go to Run.", },
        ],
      },
      {
        title: "Read it from the PC",
        steps: [
          { text: "Save the script below as `read_m850.py`, set HOST to your controller's address, and run `python read_m850.py`.", code: MODBUS_PY, codeLang: "python", codeLabel: "Python" },
          {
            text: "Run it with the motor stopped, then press Start and run it again.",
            expect: "`Motor running: False`, then `True`. The part count matches what you see online in CCW.",
          },
          { text: "Press Count three times and run it again.", expect: "The part count has gone up by three." },
          { text: "Look at the uptime.", expect: "A plausible number of seconds since the program started. If it is a huge or tiny number like 1.4e-40, the two words are in the other order: swap `hi` and `lo` and compare." },
          {
            text: "Change `read_holding_registers(0, ...)` to start at 1 instead of 0 and run it again.",
            expect: "Wrong values (or an error). Modbus documentation numbers registers from 1 (400001), but on the wire, and in pymodbus, the first register is address 0. This off-by-one causes most \"Modbus doesn't work\" calls.",
          },
        ],
      },
    ],
    reference: [
      { kind: "h", text: "The four Modbus tables, as CCW numbers them" },
      {
        kind: "table",
        head: ["Table", "CCW address range", "Size", "pymodbus call (address 0 = the first)"],
        rows: [
          ["Coils (read/write bits)", "000001 to 065536", "1 bit", "`read_coils`, `write_coil`"],
          ["Discrete inputs (read-only bits)", "100001 to 165536", "1 bit", "`read_discrete_inputs`"],
          ["Input registers (read-only)", "300001 to 365536", "16 bits", "`read_input_registers`"],
          ["Holding registers (read/write)", "400001 to 465536", "16 bits", "`read_holding_registers`, `write_register`"],
        ],
      },
      {
        kind: "p",
        text: "The Micro850 supports up to 16 simultaneous Modbus TCP server connections. Modbus sends the most significant byte first, and the Micro800 user manual says the controller does too, so bytes don't need swapping; 32-bit values take two registers.",
      },
    ],
    checklist: [
      "My controller has a static IP and my PC can ping it.",
      "I mapped a BOOL to a coil, an INT to a holding register and a REAL to two holding registers.",
      "The script shows Motor running change when I press Start and Stop.",
      "The part count from Python matches CCW.",
      "I decoded the REAL correctly (and know how to tell if the words are swapped).",
      "I saw what happens with an off-by-one address.",
    ],
    mistakes: [
      "Off by one: 400001 in CCW is address 0 in pymodbus and on the wire.",
      "Mapping a REAL and reading one register: you get half a float. Read two.",
      "Overlapping mappings: a REAL at 400002 occupies 400003 too, so the next variable starts at 400004.",
      "Forgetting to download after changing the mapping.",
      "Firewall or wrong subnet on the PC: test with ping first.",
      "Reading an address that isn't mapped: the controller answers with an exception (illegal data address), and some clients then mark every value in the same request as bad.",
    ],
    stretch:
      "Map a BOOL `MB_ResetRequest` to coil 000002 and have the program reset the part counter on a rising edge of it, but only while the motor is stopped (an interlock). Write it from Python with `client.write_coil(1, True)`. Then explain why the interlock is in the PLC and not in the Python script.",
    instructor: [
      "Use a separate switch or VLAN for the benches; never put Modbus-enabled controllers on the office network.",
      "If pymodbus can't be installed on locked-down PCs, a portable Modbus client tool does the same job; check its addressing convention (zero-based or one-based) before blaming the controller.",
      "Reset: download the bench reset project, which has no Modbus mapping.",
    ],
  },

  // ------------------------------------------------------------------ Lab 10
  {
    id: "m850-troubleshooting",
    short: "Lab 10: troubleshooting, faults and uploading",
    objectives: [
      "Read the status LEDs and tell a power problem, a fault and a force apart.",
      "Find a fault code in CCW, look it up, clear it and recover.",
      "Upload the program from a controller and work out whether it matches your project.",
      "Work through a no-guessing troubleshooting order for I/O problems.",
    ],
    prereqs: [
      ["m850-io-variables", "Lab 2: embedded I/O, variables and forcing"],
      ["m850-seal-in-st", "Lab 4: the seal-in in Structured Text"],
      ["plc-st-scan-cycle", "The Scan Cycle in Practice"],
    ],
    simFirst: {
      text: "The simulator's error messages and timing charts are the gentle version of this lab. The scan cycle lesson explains the watchdog:",
      ids: [
        ["plc-st-scan-cycle", "The Scan Cycle in Practice"],
        ["plc-good-practice", "Good Practice: Naming, Interlocks, Fail-Safe Design"],
      ],
    },
    parts: ["Your bench", "PC with CCW", "Your Lab 4 project"],
    wiring: { rows: [W.start, W.stop, W.motor], note: WIRING_NOTE },
    sections: [
      {
        title: "Cause a fault on purpose (with the instructor)",
        steps: [
          {
            text: "Save Lab 4 as a new project and add this line at the end of the ST program: `WHILE TRUE DO END_WHILE;`. Build and download.",
            expect: "The program never finishes its scan. The controller's watchdog, a timer that checks every scan finishes in time, trips: the program stops, the fault LED comes on (flashing for an application fault) and the outputs turn off.",
          },
          {
            text: "Connect and open the controller's properties. Find where CCW shows the controller's status and fault information, and write down the fault code and its description.",
            expect: "A hexadecimal fault code. Look it up in CCW's help (search for the code) to read the cause and the recommended action.",
          },
          { text: "Remove the WHILE line, build, download, then clear the fault from CCW and return to Run.", expect: "The fault LED goes out and the seal-in works again." },
        ],
      },
      {
        title: "Upload and compare",
        steps: [
          {
            text: "Have a neighbour change one thing in your controller's program (for example the PT of a timer) and download it, without telling you what.",
          },
          {
            text: "Create a new, empty project, connect to the controller and upload. The upload brings the controller's program and configuration into the project.",
            expect: "A project that matches what's running, which is not necessarily what is on your disk.",
          },
          {
            text: "Find the difference. If your CCW version has a project compare feature, use it; otherwise compare the programs by eye, side by side.",
            expect: "You find the change. On a real site, always upload before you change anything: the controller is the truth, the file on the laptop may be old.",
          },
        ],
      },
      {
        title: "Fix the bench",
        steps: [
          {
            text: "Your instructor introduces one fault into your bench (a loose wire, a forced variable, a second program writing an output, a wrong catalog number in your project). Use the table below to find it, writing down each check you did before you fix anything.",
            expect: "You found it by checking, not by guessing.",
          },
        ],
      },
    ],
    reference: [
      { kind: "h", text: "Reading the LEDs" },
      {
        kind: "table",
        head: ["What you see", "What it means", "What to do"],
        rows: [
          ["All indicators off", "No input power, or a power supply problem", "Check the bench supply and its fuse; ask the instructor"],
          ["Power on, fault LED solid", "Hardware fault", "Cycle power; if it stays, the unit needs attention"],
          ["Power on, fault LED flashing", "Application (program) fault, or an operating system fault", "Connect, read the fault code, fix the cause, clear the fault"],
          ["Force LED on", "At least one I/O variable is forced", "Find and unlock it"],
          ["Run LED off, no fault", "Program mode", "Check the mode switch and the mode CCW shows"],
        ],
      },
      { kind: "h", text: "Some Micro800 fault codes" },
      {
        kind: "table",
        head: ["Code", "Meaning (from the Micro800 user manual)"],
        rows: [
          ["0xF000", "The controller reset unexpectedly (noise or internal failure); the program may have been cleared. Download it again."],
          ["0xF001", "The program was cleared, for example power was lost during a download. Download it again."],
          ["0xF002", "The hardware watchdog tripped. Download again; contact Rockwell support if it repeats."],
          ["0xD00F", "The hardware in the project (for example the embedded I/O type) doesn't match the actual controller. Fix the project."],
        ],
      },
      { kind: "h", text: "I/O troubleshooting order" },
      {
        kind: "table",
        head: ["Symptom", "Check, in this order"],
        rows: [
          ["Button pressed, input LED off", "Bench power on? Wire on the right terminal? Input common (COM) wired? The button itself (NO or NC)?"],
          ["Input LED on, variable FALSE", "Are you online and in debug? Is the program reading the right `_IO_EM_DI_nn`? Is that input forced FALSE?"],
          ["Variable TRUE, output lamp off", "Is the output forced? Does another program or rung write the same output later in the scan? Output supply wired? Lamp blown?"],
          ["Lamp on when the program says off", "Force LED? A second write to the same output? The right project downloaded (upload and compare)?"],
          ["Download refused", "Mode switch in REM? Catalog number and firmware match? Right connection path in the Connection Browser?"],
          ["Can't reach it over Ethernet", "Link lights on? PC and controller on the same subnet? Ping? Wi-Fi off?"],
        ],
      },
    ],
    checklist: [
      "I caused a watchdog fault, read its code in CCW and looked it up.",
      "I cleared the fault and the controller runs again.",
      "I uploaded a controller's program into a new project.",
      "I found the change my neighbour made.",
      "I found the instructor's bench fault by checking in order, and wrote down my checks.",
      "The force LED is off and the bench reset project is back on the unit.",
    ],
    mistakes: [
      "Clearing a fault without reading the code. It comes straight back and you've lost the clue.",
      "Downloading your laptop's project over an unknown program on a real machine without uploading first. You may undo someone's fix.",
      "Changing two things at once while troubleshooting, so you never learn which one fixed it.",
      "Power-cycling as the first move: on many faults the code is the only evidence.",
    ],
    stretch:
      "Read the force status from the program so an operator would see it without CCW: the user manual describes reading it with the SYS_INFO function block. Light the red lamp whenever any force is active.",
    instructor: [
      "Plant faults that are safe and quick to undo: lift one wire with the supply off, lock one variable, add a second program that writes `_IO_EM_DO_00`, or give the learner a project with the wrong catalog number.",
      "Supervise the watchdog step; outputs go off when the controller faults, which is the point, but it should be on a bench with only lamps connected.",
      "Reset at the end: clear any fault, unlock all forces, download the bench reset project, mode switch to REM, and check the power LED is on and the fault and force LEDs are off.",
    ],
  },
];

export const MICRO850_LAB_BY_ID: Record<string, Micro850LabData> = Object.fromEntries(MICRO850_LABS.map((l) => [l.id, l]));

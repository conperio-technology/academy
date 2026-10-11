import { useEffect, useMemo, useRef, useState } from "react";
import type { Rung } from "../../plc/ladder";
import { buildSim, PHASES, type IoDef, type Plant, type ScanSim } from "../../plc/sim";
import { compileExpr, formatValue, type StError, type Value } from "../../plc/st";
import { PlcLadder } from "./PlcLadder";
import { StCode, StEditor, TrendChart } from "./PlcShared";

// The reusable PLC scan-cycle simulator: field inputs (pushbuttons, switches, sliders),
// field outputs (lamps, motors, values), the four scan phases visible and steppable, a
// simulated clock (so timers are deterministic), an optional live ladder diagram, a
// timing chart and a watch table. The program is Structured Text and can be edited.

interface Props {
  title?: string;
  intro?: string;
  source: string;
  io: IoDef[];
  scanMs?: number;
  plant?: Plant;
  plantOptional?: boolean; // show a checkbox to switch the plant model off
  ladder?: Rung[];
  trend?: string[];
  editable?: boolean;
}

const SPEEDS: [number, string][] = [
  [1, "1x"],
  [0.25, "0.25x"],
  [0.05, "0.05x"],
];
const TREND_WINDOW_MS = 10000;

export function PlcSimulator({ title, intro, source: initialSource, io, scanMs: initialScan = 10, plant, plantOptional, ladder, trend, editable = true }: Props) {
  const [source, setSource] = useState(initialSource);
  const [draft, setDraft] = useState(initialSource);
  const [editing, setEditing] = useState(false);
  const [scanMs, setScanMs] = useState(initialScan);
  const [usePlant, setUsePlant] = useState(!!plant);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [, setTick] = useState(0);
  const [held, setHeld] = useState<Record<string, Value>>({}); // learner-set field values
  const [cut, setCut] = useState<Record<string, boolean>>({});
  const [showWatch, setShowWatch] = useState(true);
  const rerender = () => setTick((t) => t + 1);

  const activePlant = usePlant ? plant : undefined;
  const ioNames = useMemo(() => new Set(io.map((d) => d.name)), [io]);
  const extra = useMemo(() => (trend ?? []).filter((s) => !ioNames.has(s)), [trend, ioNames]);

  const built = useMemo(() => buildSim(source, io, scanMs, { plant: activePlant, extra, traceLimit: Math.ceil(TREND_WINDOW_MS / scanMs) + 50 }), [source, io, scanMs, activePlant, extra]);
  const sim = built.sim;
  const simRef = useRef<ScanSim | undefined>(sim);
  simRef.current = sim;

  // Field values the learner controls, pushed into a freshly built simulator.
  const fieldValue = (d: IoDef, base: Record<string, Value>, cuts: Record<string, boolean>): Value => {
    if (cuts[d.name]) return d.type === "BOOL" ? false : 0;
    if (d.widget === "nc-button") return !(base[d.name] ?? false); // held = pressed = circuit open
    if (base[d.name] !== undefined) return base[d.name];
    return d.init ?? (d.type === "BOOL" ? false : 0);
  };
  const driven = new Set(activePlant?.drives ?? []);

  useEffect(() => {
    if (!sim) return;
    for (const d of io) if (d.dir === "in" && !driven.has(d.name)) sim.setInput(d.name, fieldValue(d, held, cut));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim, held, cut]);

  // Continuous running: catch the simulated clock up with real time (times the speed).
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let owed = 0;
    const id = window.setInterval(() => {
      const s = simRef.current;
      if (!s) return;
      const now = performance.now();
      owed += (now - last) * speed;
      last = now;
      let n = 0;
      while (owed >= s.scanMs && n < 400 && !s.fault) {
        s.stepScan();
        owed -= s.scanMs;
        n++;
      }
      if (n === 400) owed = 0;
      if (s.fault) setRunning(false);
      rerender();
    }, 50);
    return () => window.clearInterval(id);
  }, [running, speed]);

  function setField(name: string, v: Value) {
    setHeld((h) => ({ ...h, [name]: v }));
  }

  function powerCycle() {
    sim?.powerCycle();
    if (sim) for (const d of io) if (d.dir === "in" && !driven.has(d.name)) sim.setInput(d.name, fieldValue(d, held, cut));
    rerender();
  }

  function apply() {
    setRunning(false);
    setSource(draft);
  }

  const evalCmp = (expr: string) => {
    if (!sim) return undefined;
    const e = compileExpr(expr, sim.prog);
    return e ? (sim.rt.eval(e) as boolean) : undefined;
  };

  const errors: StError[] = built.errors;
  const ins = io.filter((d) => d.dir === "in");
  const outs = io.filter((d) => d.dir === "out");
  const watch = sim ? sim.rt.snapshot().filter((v) => v.kind !== "input" && v.kind !== "output") : [];

  return (
    <div className="tool-widget plc-sim">
      {title && <h3 className="plc-sim-title">{title}</h3>}
      {intro && <p className="plc-sim-intro">{intro}</p>}

      {sim && (
        <>
          <div className="plc-sim-bar">
            <button onClick={() => setRunning((r) => !r)} disabled={!!sim.fault}>
              {running ? "⏸ Pause" : "▶ Run"}
            </button>
            <button
              onClick={() => {
                sim.stepPhase();
                rerender();
              }}
              disabled={running || !!sim.fault}
            >
              Step phase
            </button>
            <button
              onClick={() => {
                sim.stepScan();
                rerender();
              }}
              disabled={running || !!sim.fault}
            >
              Step scan
            </button>
            <button onClick={powerCycle}>Power cycle</button>
            <label className="plc-sim-select">
              Speed{" "}
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                {SPEEDS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="plc-sim-select">
              Scan{" "}
              <select
                value={scanMs}
                onChange={(e) => {
                  setRunning(false);
                  setScanMs(Number(e.target.value));
                }}
              >
                {[10, 20, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v} ms
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="plc-phases" aria-label="Scan phases">
            {PHASES.map((p, i) => (
              <div key={p} className={`plc-phase-chip${!running && sim.phase === i ? " next" : ""}`}>
                <span className="plc-phase-num">{i + 1}</span> {p}
              </div>
            ))}
          </div>
          <p className="plc-sim-status">
            {sim.fault ? (
              <span className="constraint-fail">
                PLC fault: {sim.fault.message} The simulator stopped the scan and switched every output off. Power cycle to restart.
              </span>
            ) : (
              <>
                Clock <strong>{(sim.clock / 1000).toFixed(2)} s</strong> · scans <strong>{sim.scans}</strong>
                {!running && <> · next phase: <strong>{PHASES[sim.phase]}</strong></>}
                {running ? " · buttons are momentary while running" : " · paused: click a button to hold it, click again to release"}
              </>
            )}
          </p>

          {activePlant?.note && <p className="gate-note">{activePlant.note}</p>}
          {plant && plantOptional && (
            <label className="plc-plant-toggle">
              <input type="checkbox" checked={usePlant} onChange={(e) => setUsePlant(e.target.checked)} /> Simulate the machine (inputs it drives follow the outputs)
            </label>
          )}

          <div className="plc-io">
            <div className="plc-io-col">
              <div className="plc-io-head">Inputs</div>
              {ins.map((d) => (
                <InputControl
                  key={d.name}
                  d={d}
                  sim={sim}
                  running={running}
                  driven={driven.has(d.name)}
                  heldValue={held[d.name]}
                  cut={!!cut[d.name]}
                  onSet={(v) => setField(d.name, v)}
                  onCut={(c) => setCut((x) => ({ ...x, [d.name]: c }))}
                />
              ))}
            </div>
            <div className="plc-io-col">
              <div className="plc-io-head">Outputs</div>
              {outs.map((d) => (
                <OutputView key={d.name} d={d} sim={sim} />
              ))}
            </div>
          </div>

          {ladder && (
            <details className="plc-sim-section" open>
              <summary>Ladder view (lit from the program's variables)</summary>
              <PlcLadder rungs={ladder} get={(n) => sim.rt.read(n)} evalCmp={evalCmp} />
            </details>
          )}

          {trend && trend.length > 0 && (
            <details className="plc-sim-section" open>
              <summary>Timing chart (last {TREND_WINDOW_MS / 1000} s of simulated time)</summary>
              <TrendChart rows={sim.trace} signals={trend} scanMs={sim.scanMs} windowMs={TREND_WINDOW_MS} ranges={rangesFor(io)} />
            </details>
          )}

          {watch.length > 0 && (
            <details className="plc-sim-section" open={showWatch} onToggle={(e) => setShowWatch((e.target as HTMLDetailsElement).open)}>
              <summary>Watch: internal variables and function blocks</summary>
              <div className="plc-watch">
                {watch.map((v) => (
                  <div key={v.name} className="plc-watch-row">
                    <span className="plc-watch-name">{v.name}</span>
                    <span className="plc-watch-type">{v.type}</span>
                    <span className={`plc-watch-val${v.value === true ? " on" : ""}`}>{formatValue(v.value, v.type)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      <details className="plc-sim-section" open={!sim || editing}>
        <summary>Program (Structured Text){editable ? ", editable" : ""}</summary>
        {editing ? (
          <>
            <StEditor value={draft} onChange={setDraft} errorLines={errors.map((e) => e.line)} label="Simulator program" />
            <div className="darr-actions">
              <button onClick={apply}>Load into the PLC</button>
              <button
                onClick={() => {
                  setDraft(initialSource);
                  setSource(initialSource);
                }}
              >
                Restore the original
              </button>
              <button onClick={() => setEditing(false)}>Done editing</button>
            </div>
          </>
        ) : (
          <>
            <StCode code={source} label="" />
            {editable && (
              <div className="darr-actions">
                <button
                  onClick={() => {
                    setDraft(source);
                    setEditing(true);
                  }}
                >
                  Edit the program
                </button>
              </div>
            )}
          </>
        )}
        {errors.length > 0 && (
          <ul className="plc-errors">
            {errors.map((e, i) => (
              <li key={i}>
                Line {e.line}: {e.message}
              </li>
            ))}
          </ul>
        )}
      </details>
    </div>
  );
}

function rangesFor(io: IoDef[]): Record<string, [number, number]> {
  const r: Record<string, [number, number]> = {};
  for (const d of io) if (d.min !== undefined && d.max !== undefined) r[d.name] = [d.min, d.max];
  return r;
}

interface InputProps {
  d: IoDef;
  sim: ScanSim;
  running: boolean;
  driven: boolean;
  heldValue: Value | undefined;
  cut: boolean;
  onSet: (v: Value) => void;
  onCut: (c: boolean) => void;
}

function InputControl({ d, sim, running, driven, heldValue, cut, onSet, onCut }: InputProps) {
  const field = sim.inputs[d.name];
  const image = sim.rt.get(d.name);
  const fmt = (v: Value | undefined) => formatValue(v, d.type);
  let control;
  if (d.widget === "button" || d.widget === "nc-button") {
    const pressed = !!heldValue;
    const down = () => running && onSet(true);
    const up = () => running && onSet(false);
    control = (
      <button
        className={`plc-pb${pressed ? " pressed" : ""}${d.widget === "nc-button" ? " plc-pb-stop" : ""}`}
        aria-pressed={pressed}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={() => pressed && up()}
        onPointerCancel={up}
        onKeyDown={(e) => {
          if (running && (e.key === " " || e.key === "Enter") && !e.repeat) onSet(true);
        }}
        onKeyUp={(e) => {
          if (running && (e.key === " " || e.key === "Enter")) onSet(false);
        }}
        onClick={() => !running && onSet(!pressed)}
      >
        {d.label}
        <span className="plc-pb-state">{pressed ? (running ? "pressed" : "held") : d.widget === "nc-button" ? "NC" : "NO"}</span>
      </button>
    );
  } else if (d.widget === "switch") {
    const on = !!heldValue;
    control = (
      <button className={`plc-switch${on ? " on" : ""}`} aria-pressed={on} onClick={() => onSet(!on)}>
        <span className="plc-switch-knob" aria-hidden="true" />
        {d.label}
      </button>
    );
  } else {
    const v = driven ? (field as number) : ((heldValue as number | undefined) ?? (d.init as number | undefined) ?? 0);
    control = (
      <label className="plc-slider">
        <span>
          {d.label}
          {driven && <em> (simulated)</em>}
        </span>
        <input
          type="range"
          min={d.min ?? 0}
          max={d.max ?? 100}
          step={d.step ?? 1}
          value={v}
          disabled={driven}
          onChange={(e) => onSet(d.type === "INT" ? Math.round(Number(e.target.value)) : Number(e.target.value))}
        />
      </label>
    );
  }
  return (
    <div className="plc-io-row">
      {control}
      <div className="plc-io-vals">
        <span title="The physical signal at the input terminal">
          field <code>{fmt(field)}</code>
        </span>
        <span title="The copy the program reads, taken at the last Read inputs phase">
          image <code>{fmt(image)}</code>
        </span>
        <span className="plc-io-name">
          {d.name}
          {d.unit ? ` (${d.unit})` : ""}
        </span>
        {d.breakable && (
          <label className="plc-cut">
            <input type="checkbox" checked={cut} onChange={(e) => onCut(e.target.checked)} /> cut the wire
          </label>
        )}
      </div>
    </div>
  );
}

function OutputView({ d, sim }: { d: IoDef; sim: ScanSim }) {
  const field = sim.outputs[d.name];
  const prog = sim.rt.get(d.name);
  const fmt = (v: Value | undefined) => formatValue(v, d.type);
  let indicator;
  if (d.widget === "lamp") indicator = <span className={`plc-lamp plc-lamp-${d.color ?? "green"}${field ? " on" : ""}`} aria-label={field ? "on" : "off"} />;
  else if (d.widget === "motor")
    indicator = (
      <svg className={`plc-motor${field ? " on" : ""}`} viewBox="0 0 32 32" aria-label={field ? "running" : "stopped"}>
        <circle cx="16" cy="16" r="14" className="plc-motor-ring" />
        <g className="plc-motor-rotor">
          <path d="M16 16 L16 4 A12 12 0 0 1 26 10 Z" />
          <path d="M16 16 L26 22 A12 12 0 0 1 16 28 Z" opacity="0.6" />
          <path d="M16 16 L6 22 A12 12 0 0 1 6 10 Z" opacity="0.8" />
        </g>
      </svg>
    );
  else indicator = <span className="plc-value">{fmt(field)}</span>;
  return (
    <div className="plc-io-row">
      <div className="plc-out">
        {indicator}
        <span>
          {d.label}
          {d.unit ? ` (${d.unit})` : ""}
        </span>
      </div>
      <div className="plc-io-vals">
        <span title="The program's output variable, updated during Execute program">
          program <code>{fmt(prog)}</code>
        </span>
        <span title="The physical output, updated at Write outputs">
          field <code>{fmt(field)}</code>
        </span>
        <span className="plc-io-name">{d.name}</span>
      </div>
    </div>
  );
}

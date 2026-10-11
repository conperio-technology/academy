import { useEffect, useState } from "react";

const PHASES = [
  {
    name: "Read Inputs",
    detail:
      "Snapshot every physical input (sensors, switches, digital/analog signals) into an input image table, all at once.",
  },
  {
    name: "Execute Program",
    detail:
      "Run the entire ladder logic program top to bottom, once, using only that snapshot -- inputs that change mid-scan wait for next scan.",
  },
  {
    name: "Write Outputs",
    detail:
      "Write the computed output image table to the physical outputs all at once -- relays, motor starters, actuators change together.",
  },
  {
    name: "Housekeeping",
    detail:
      "Run diagnostics, service communication (HMI, SCADA, other PLCs), check the watchdog timer, then loop back to Read Inputs.",
  },
];

export function PlcScanCycle() {
  const [phase, setPhase] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [running, setRunning] = useState(false);

  function advance() {
    setPhase((p) => {
      const next = (p + 1) % PHASES.length;
      if (next === 0) setScanCount((c) => c + 1);
      return next;
    });
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(advance, 700);
    return () => clearInterval(id);
  }, [running]);

  function reset() {
    setRunning(false);
    setPhase(0);
    setScanCount(0);
  }

  return (
    <div className="tool-widget">
      <div className="plc-cycle">
        {PHASES.map((p, i) => (
          <div key={p.name} className={`plc-phase ${i === phase ? "active" : ""}`}>
            {p.name}
          </div>
        ))}
      </div>

      <p className="gate-note">{PHASES[phase].detail}</p>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">completed scans</span>
          <span className="readout-value">{scanCount}</span>
        </div>
      </div>

      <div className="darr-actions">
        <button onClick={() => setRunning((r) => !r)}>{running ? "⏸ pause" : "▶ run continuously"}</button>
        <button onClick={advance} disabled={running}>
          next phase
        </button>
        <button onClick={reset}>reset</button>
      </div>
    </div>
  );
}

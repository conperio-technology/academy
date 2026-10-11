import { useState } from "react";

interface Register {
  addr: number;
  label: string;
  raw: number;
  unit: string;
  scale: number;
}

const REGISTERS: Register[] = [
  { addr: 0, label: "Tank Temperature", raw: 725, unit: "°F", scale: 10 },
  { addr: 1, label: "Line Pressure", raw: 140, unit: "PSI", scale: 10 },
  { addr: 2, label: "Motor Speed", raw: 1750, unit: "RPM", scale: 1 },
  { addr: 3, label: "Total Parts Count", raw: 48213, unit: "parts", scale: 1 },
];

export function IndustrialNetworking() {
  const [log, setLog] = useState<string[]>([]);

  function poll(reg: Register) {
    const scaled = (reg.raw / reg.scale).toFixed(reg.scale > 1 ? 1 : 0);
    setLog((l) => [
      ...l,
      `→ Master: Read Holding Register ${reg.addr} (${reg.label})`,
      `← Slave: raw value ${reg.raw} -> ${scaled} ${reg.unit}`,
    ]);
  }

  function reset() {
    setLog([]);
  }

  return (
    <div className="tool-widget">
      <div className="darr-actions">
        {REGISTERS.map((r) => (
          <button key={r.addr} onClick={() => poll(r)}>
            poll register {r.addr} ({r.label})
          </button>
        ))}
      </div>

      <div className="tcp-udp-log">
        {log.length === 0 && <p className="status-text">Click a register above to poll it -- the master always initiates.</p>}
        {log.map((line, i) => (
          <p key={i} className="tcp-udp-line">
            {line}
          </p>
        ))}
      </div>

      <div className="darr-actions">
        <button onClick={reset}>reset</button>
      </div>
    </div>
  );
}

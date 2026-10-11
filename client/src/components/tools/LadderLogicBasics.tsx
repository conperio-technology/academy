import { useState } from "react";

const WIDTH = 560;
const HEIGHT = 240;
const RAIL_TOP = 20;
const RAIL_BOTTOM = 220;
const LEFT_RAIL = 40;
const RIGHT_RAIL = 520;

interface ContactProps {
  x: number;
  y: number;
  label: string;
  kind: "NO" | "NC";
  active: boolean;
}

function Contact({ x, y, label, kind, active }: ContactProps) {
  const conducting = kind === "NO" ? active : !active;
  return (
    <g>
      <rect
        x={x - 24}
        y={y - 15}
        width={48}
        height={30}
        rx={4}
        className={`ladder-contact ${conducting ? "conducting" : ""}`}
      />
      <text x={x} y={y - 22} textAnchor="middle" className="ladder-label">
        {label} ({kind})
      </text>
      <text x={x} y={y + 5} textAnchor="middle" className="ladder-contact-text">
        {kind === "NO" ? "] [" : "]/["}
      </text>
    </g>
  );
}

function Coil({ x, y, label, energized }: { x: number; y: number; label: string; energized: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={20} className={`ladder-coil ${energized ? "energized" : ""}`} />
      <text x={x} y={y + 4} textAnchor="middle" className="ladder-coil-text">
        {label}
      </text>
    </g>
  );
}

export function LadderLogicBasics() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [c, setC] = useState(false);
  const [d, setD] = useState(false);
  const [e, setE] = useState(false);

  const coil1 = a && b;
  const coil2 = c || d;
  const coil3 = !e;

  return (
    <div className="tool-widget">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="ladder-svg" role="img" aria-label="Ladder logic diagram">
        <line x1={LEFT_RAIL} y1={RAIL_TOP} x2={LEFT_RAIL} y2={RAIL_BOTTOM} className="ladder-rail" />
        <line x1={RIGHT_RAIL} y1={RAIL_TOP} x2={RIGHT_RAIL} y2={RAIL_BOTTOM} className="ladder-rail" />

        {/* Rung 1: series (AND) */}
        <line x1={LEFT_RAIL} y1={50} x2={96} y2={50} className={`ladder-wire ${a ? "live" : ""}`} />
        <Contact x={120} y={50} label="A" kind="NO" active={a} />
        <line x1={144} y1={50} x2={196} y2={50} className={`ladder-wire ${a ? "live" : ""}`} />
        <Contact x={220} y={50} label="B" kind="NO" active={b} />
        <line x1={244} y1={50} x2={410} y2={50} className={`ladder-wire ${coil1 ? "live" : ""}`} />
        <Coil x={430} y={50} label="Y1" energized={coil1} />
        <line x1={450} y1={50} x2={RIGHT_RAIL} y2={50} className={`ladder-wire ${coil1 ? "live" : ""}`} />

        {/* Rung 2: parallel (OR) */}
        <line x1={LEFT_RAIL} y1={100} x2={96} y2={100} className={`ladder-wire ${c ? "live" : ""}`} />
        <Contact x={120} y={100} label="C" kind="NO" active={c} />
        <line x1={144} y1={100} x2={300} y2={100} className={`ladder-wire ${c ? "live" : ""}`} />

        <line x1={LEFT_RAIL} y1={140} x2={96} y2={140} className={`ladder-wire ${d ? "live" : ""}`} />
        <Contact x={120} y={140} label="D" kind="NO" active={d} />
        <line x1={144} y1={140} x2={300} y2={140} className={`ladder-wire ${d ? "live" : ""}`} />

        <line x1={300} y1={100} x2={300} y2={140} className={`ladder-wire ${coil2 ? "live" : ""}`} />
        <line x1={300} y1={120} x2={410} y2={120} className={`ladder-wire ${coil2 ? "live" : ""}`} />
        <Coil x={430} y={120} label="Y2" energized={coil2} />
        <line x1={450} y1={120} x2={RIGHT_RAIL} y2={120} className={`ladder-wire ${coil2 ? "live" : ""}`} />

        {/* Rung 3: normally-closed (NOT) */}
        <line x1={LEFT_RAIL} y1={190} x2={96} y2={190} className="ladder-wire live" />
        <Contact x={120} y={190} label="E" kind="NC" active={e} />
        <line x1={144} y1={190} x2={410} y2={190} className={`ladder-wire ${coil3 ? "live" : ""}`} />
        <Coil x={430} y={190} label="Y3" energized={coil3} />
        <line x1={450} y1={190} x2={RIGHT_RAIL} y2={190} className={`ladder-wire ${coil3 ? "live" : ""}`} />
      </svg>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Y1 = A AND B</span>
          <span className="readout-value">{coil1 ? "ENERGIZED" : "off"}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Y2 = C OR D</span>
          <span className="readout-value">{coil2 ? "ENERGIZED" : "off"}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Y3 = NOT E</span>
          <span className="readout-value">{coil3 ? "ENERGIZED" : "off"}</span>
        </div>
      </div>

      <div className="darr-actions">
        <button onClick={() => setA((v) => !v)}>toggle A ({a ? "ON" : "off"})</button>
        <button onClick={() => setB((v) => !v)}>toggle B ({b ? "ON" : "off"})</button>
        <button onClick={() => setC((v) => !v)}>toggle C ({c ? "ON" : "off"})</button>
        <button onClick={() => setD((v) => !v)}>toggle D ({d ? "ON" : "off"})</button>
        <button onClick={() => setE((v) => !v)}>toggle E ({e ? "ON" : "off"})</button>
      </div>
    </div>
  );
}

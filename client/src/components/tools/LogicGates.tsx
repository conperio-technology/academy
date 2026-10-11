import { useState } from "react";

type GateKey = "AND" | "OR" | "XOR" | "NAND" | "NOR" | "NOT";

interface Gate {
  compute: (a: boolean, b: boolean) => boolean;
  unary?: boolean;
  symbol: string;
  note: string;
}

const GATES: Record<GateKey, Gate> = {
  AND: { compute: (a, b) => a && b, symbol: "∧", note: "True only if both inputs are true." },
  OR: { compute: (a, b) => a || b, symbol: "∨", note: "True if either input is true." },
  XOR: { compute: (a, b) => a !== b, symbol: "⊕", note: "True only if the inputs disagree -- this is the gate behind binary addition." },
  NAND: { compute: (a, b) => !(a && b), symbol: "⊼", note: "AND, flipped. Universal -- every other gate can be built from just NAND." },
  NOR: { compute: (a, b) => !(a || b), symbol: "⊽", note: "OR, flipped." },
  NOT: { compute: (a) => !a, unary: true, symbol: "¬", note: "Flips a single input. The only unary gate here." },
};

const GATE_KEYS = Object.keys(GATES) as GateKey[];

function bit(v: boolean): string {
  return v ? "1" : "0";
}

export function LogicGates() {
  const [gateKey, setGateKey] = useState<GateKey>("XOR");
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);

  const gate = GATES[gateKey];
  const output = gate.unary ? gate.compute(a, a) : gate.compute(a, b);
  const rows: [boolean, boolean][] = gate.unary ? [[false, false], [true, true]] : [[false, false], [false, true], [true, false], [true, true]];

  return (
    <div className="tool-widget">
      <div className="gate-picker">
        {GATE_KEYS.map((key) => (
          <button key={key} className={`gate-tab ${gateKey === key ? "active" : ""}`} onClick={() => setGateKey(key)}>
            {key}
          </button>
        ))}
      </div>
      <p className="gate-note">{gate.note}</p>

      <div className="gate-circuit">
        <div className="gate-inputs">
          <button className={`bit-toggle ${a ? "bit-on" : ""}`} onClick={() => setA((v) => !v)}>
            {bit(a)}
          </button>
          <span className="gate-input-label">A</span>
          {!gate.unary && (
            <>
              <button className={`bit-toggle ${b ? "bit-on" : ""}`} onClick={() => setB((v) => !v)}>
                {bit(b)}
              </button>
              <span className="gate-input-label">B</span>
            </>
          )}
        </div>

        <div className="gate-symbol">{gate.symbol}</div>

        <div className="gate-output">
          <button className={`bit-toggle gate-output-bit ${output ? "bit-on" : ""}`} disabled>
            {bit(output)}
          </button>
          <span className="gate-input-label">OUT</span>
        </div>
      </div>

      <table className="bigo-table gate-truth-table">
        <thead>
          <tr>
            <th>A</th>
            {!gate.unary && <th>B</th>}
            <th>{gateKey}(A{!gate.unary ? ", B" : ""})</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([ra, rb]) => {
            const rOut = gate.unary ? gate.compute(ra, ra) : gate.compute(ra, rb);
            const isCurrent = ra === a && (gate.unary || rb === b);
            return (
              <tr key={`${ra}-${rb}`} className={isCurrent ? "gate-row-active" : ""}>
                <td className="mono">{bit(ra)}</td>
                {!gate.unary && <td className="mono">{bit(rb)}</td>}
                <td className="mono">{bit(rOut)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

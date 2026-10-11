import { useState } from "react";

interface RegionType {
  code: string;
  label: string;
  desc: string;
}

const TYPES: RegionType[] = [
  { code: "I", label: "Input", desc: "A physical input -- reads a real-world signal (sensor, switch) into the input image table. Overwritten every scan by Read Inputs." },
  { code: "Q", label: "Output", desc: "A physical output -- writes to a real-world actuator (relay, motor starter, indicator light). Pushed to hardware every scan by Write Outputs." },
  { code: "M", label: "Internal Memory", desc: "An internal marker/coil -- not wired to any physical I/O at all, just a bit the program uses to remember state between rungs or scans." },
  { code: "T", label: "Timer", desc: "A timer's internal bits (done bit, timing bit, accumulated value) -- used to delay or time an action." },
  { code: "C", label: "Counter", desc: "A counter's internal bits (done bit, accumulated count) -- used to count events, like parts passing a sensor." },
];

export function PlcMemoryAddressing() {
  const [typeCode, setTypeCode] = useState("I");
  const [slot, setSlot] = useState(1);
  const [bit, setBit] = useState(0);

  const type = TYPES.find((t) => t.code === typeCode)!;
  // Siemens / IEC style: I, Q and M are byte.bit; timers and counters are numbered (T1, C1).
  const isBitRegion = typeCode === "I" || typeCode === "Q" || typeCode === "M";
  const address = isBitRegion ? `${typeCode}${slot}.${bit}` : `${typeCode}${slot}`;
  const iecAddress = isBitRegion ? `%${typeCode}X${slot}.${bit}` : null;

  return (
    <div className="tool-widget">
      <div className="language-tabs">
        {TYPES.map((t) => (
          <button key={t.code} className={`language-tab ${typeCode === t.code ? "active" : ""}`} onClick={() => setTypeCode(t.code)}>
            {t.code} -- {t.label}
          </button>
        ))}
      </div>

      <div className="tool-inputs">
        <label>
          {isBitRegion ? "Byte" : "Number"}
          <input type="number" min={0} max={9} value={slot} onChange={(e) => setSlot(Number(e.target.value) || 0)} />
        </label>
        {isBitRegion && (
          <label>
            Bit
            <input type="number" min={0} max={7} value={bit} onChange={(e) => setBit(Math.min(7, Number(e.target.value) || 0))} />
          </label>
        )}
      </div>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">address</span>
          <span className="readout-value">{address}</span>
        </div>
        {iecAddress && (
          <div className="readout-cell">
            <span className="readout-label">IEC 61131-3</span>
            <span className="readout-value">{iecAddress}</span>
          </div>
        )}
      </div>

      <p className="gate-note">{type.desc}</p>
    </div>
  );
}

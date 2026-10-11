import { useState } from "react";

const RANGE_LOW = 0;
const RANGE_HIGH = 100;
// Same threshold as the analog alarms lesson and the plc-ex-analog-scaling exercise (NAMUR NE 43):
// below 3.6 mA is a wire break or failed transmitter; 3.6 to 4 mA is under range, clamped to the bottom.
const FAULT_BELOW_MA = 3.6;

export function DigitalAnalogIo() {
  const [mode, setMode] = useState<"digital" | "analog">("digital");
  const [digitalOn, setDigitalOn] = useState(false);
  const [rawMa, setRawMa] = useState(12);

  const clamped = Math.max(0, Math.min(20, rawMa));
  const isFault = clamped < FAULT_BELOW_MA;
  const isUnderRange = !isFault && clamped < 4;
  const engineeringValue = isFault ? null : ((Math.max(clamped, 4) - 4) / 16) * (RANGE_HIGH - RANGE_LOW) + RANGE_LOW;

  return (
    <div className="tool-widget">
      <div className="language-tabs">
        <button className={`language-tab ${mode === "digital" ? "active" : ""}`} onClick={() => setMode("digital")}>
          Digital
        </button>
        <button className={`language-tab ${mode === "analog" ? "active" : ""}`} onClick={() => setMode("analog")}>
          Analog
        </button>
      </div>

      {mode === "digital" ? (
        <>
          <p className="gate-note">A limit switch, push button, or proximity sensor -- either passing voltage or not.</p>
          <div className="darr-actions">
            <button onClick={() => setDigitalOn((v) => !v)}>{digitalOn ? "🟢 switch closed" : "⚪ switch open"}</button>
          </div>
          <div className="tool-readout">
            <div className="readout-cell">
              <span className="readout-label">PLC input bit</span>
              <span className="readout-value">{digitalOn ? "1" : "0"}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="gate-note">A 4-20mA pressure transducer, scaled to a 0-100 PSI range.</p>
          <label className="tool-single-input">
            Raw signal: {clamped.toFixed(1)} mA
            <input
              type="range"
              min={0}
              max={20}
              step={0.1}
              value={rawMa}
              onChange={(e) => setRawMa(Number(e.target.value))}
            />
          </label>
          <div className="tool-readout">
            <div className="readout-cell">
              <span className="readout-label">engineering value</span>
              <span className="readout-value">{isFault ? "-- FAULT --" : `${engineeringValue!.toFixed(1)} PSI`}</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">status</span>
              <span className="readout-value">{isFault
                  ? "below 3.6mA -- FAULT: broken wire / disconnected sensor"
                  : isUnderRange
                    ? "3.6-4mA -- slightly under range, clamped to 0 (not a fault)"
                    : "OK"}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

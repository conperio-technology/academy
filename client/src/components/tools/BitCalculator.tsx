import { useState } from "react";

const BIT_COUNT = 8;

function bitsToUnsigned(bits: number[]): number {
  return bits.reduce((acc, bit, i) => acc + bit * 2 ** (BIT_COUNT - 1 - i), 0);
}

function unsignedToBits(value: number): number[] {
  const clamped = Math.max(0, Math.min(2 ** BIT_COUNT - 1, Math.floor(value)));
  return Array.from({ length: BIT_COUNT }, (_, i) => (clamped >> (BIT_COUNT - 1 - i)) & 1);
}

function toSigned(unsigned: number): number {
  return unsigned >= 128 ? unsigned - 256 : unsigned;
}

// A one-byte (8-bit) toggle: click any bit, or type a decimal/hex value, and watch all
// three notations (binary/hex/decimal) update together. The "signed" toggle reinterprets
// the same bit pattern as two's complement instead of re-deriving new bits, since that's
// the actual point -- the bits don't change, only how you choose to read them.
export function BitCalculator() {
  const [bits, setBits] = useState<number[]>(() => unsignedToBits(77));
  const [signed, setSigned] = useState(false);
  const [decimalInput, setDecimalInput] = useState("");
  const [hexInput, setHexInput] = useState("");

  const unsigned = bitsToUnsigned(bits);
  const displayed = signed ? toSigned(unsigned) : unsigned;
  const hex = unsigned.toString(16).toUpperCase().padStart(2, "0");
  const binary = bits.join("");

  function toggleBit(i: number) {
    const next = [...bits];
    next[i] = next[i] ? 0 : 1;
    setBits(next);
  }

  function applyDecimal(raw: string) {
    setDecimalInput(raw);
    const n = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(n)) {
      setBits(unsignedToBits(signed && n < 0 ? n + 256 : n));
    }
  }

  function applyHex(raw: string) {
    setHexInput(raw);
    const n = parseInt(raw, 16);
    if (raw.trim() !== "" && !Number.isNaN(n)) {
      setBits(unsignedToBits(n));
    }
  }

  return (
    <div className="tool-widget">
      <div className="bit-toggle-row">
        {bits.map((bit, i) => (
          <button
            key={i}
            className={`bit-toggle ${bit ? "bit-on" : ""} ${signed && i === 0 ? "bit-sign" : ""}`}
            onClick={() => toggleBit(i)}
            title={signed && i === 0 ? "sign bit" : `value ${2 ** (BIT_COUNT - 1 - i)}`}
          >
            {bit}
          </button>
        ))}
      </div>
      <div className="bit-place-values">
        {Array.from({ length: BIT_COUNT }, (_, i) => (
          <span key={i} className="bit-place-value">
            {signed && i === 0 ? "sign" : 2 ** (BIT_COUNT - 1 - i)}
          </span>
        ))}
      </div>

      <label className="tool-checkbox">
        <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} />
        Signed (two's complement)
      </label>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Binary</span>
          <span className="readout-value">{binary}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Hex</span>
          <span className="readout-value">0x{hex}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Decimal ({signed ? "signed" : "unsigned"})</span>
          <span className="readout-value">{displayed}</span>
        </div>
      </div>

      <div className="tool-inputs">
        <label>
          Set decimal
          <input
            type="text"
            inputMode="numeric"
            value={decimalInput}
            placeholder={String(displayed)}
            onChange={(e) => applyDecimal(e.target.value)}
          />
        </label>
        <label>
          Set hex
          <input type="text" value={hexInput} placeholder={hex} onChange={(e) => applyHex(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

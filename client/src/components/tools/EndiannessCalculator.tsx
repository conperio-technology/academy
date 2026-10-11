import { useState } from "react";

function toHexByte(n: number): string {
  return n.toString(16).toUpperCase().padStart(2, "0");
}

export function EndiannessCalculator() {
  const [input, setInput] = useState("12345678");

  const cleaned = input.replace(/^0x/i, "").replace(/[^0-9a-fA-F]/g, "");
  const value = (parseInt(cleaned || "0", 16) || 0) >>> 0;
  const bytes = [24, 16, 8, 0].map((shift) => (value >>> shift) & 0xff); // index0 = most significant byte
  const littleEndianOrder = [...bytes].reverse();

  return (
    <div className="tool-widget">
      <label className="tool-single-input">
        Enter a 32-bit hex value
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="12345678" />
      </label>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Value</span>
          <span className="readout-value">0x{bytes.map(toHexByte).join("")}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Bytes, most to least significant</span>
          <span className="readout-value">{bytes.map(toHexByte).join(" ")}</span>
        </div>
      </div>

      <div className="endian-layout">
        <span className="stack-label">Big-endian memory (address 0 → 3)</span>
        <div className="endian-bytes">
          {bytes.map((b, i) => (
            <div key={i} className="endian-byte">
              <span className="endian-address">addr {i}</span>
              <span className="endian-value">0x{toHexByte(b)}</span>
              {i === 0 && <span className="endian-tag">most significant first</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="endian-layout">
        <span className="stack-label">Little-endian memory (address 0 → 3)</span>
        <div className="endian-bytes">
          {littleEndianOrder.map((b, i) => (
            <div key={i} className="endian-byte endian-byte-little">
              <span className="endian-address">addr {i}</span>
              <span className="endian-value">0x{toHexByte(b)}</span>
              {i === 0 && <span className="endian-tag">least significant first</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

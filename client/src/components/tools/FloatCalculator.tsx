import { useMemo, useState } from "react";

interface FloatBreakdown {
  sign: number;
  exponentBits: number;
  mantissaBits: number;
  exponent: number;
  reconstructed: number;
  kind: "zero" | "subnormal" | "normal" | "infinity" | "nan";
}

// Coerces to an actual IEEE-754 single-precision (32-bit) float the same way C#'s
// `float` or a numpy float32 would, then reads the real bit pattern back out via a
// DataView -- no manual bit-fiddling math to get subtly wrong, the browser's float32
// hardware path does it.
function toFloatBreakdown(value: number): FloatBreakdown {
  const buf = new ArrayBuffer(4);
  new Float32Array(buf)[0] = value;
  // Float32Array writes in the platform's native byte order, which is little-endian on
  // every real-world JS engine -- read it back the same way, or the bytes come out
  // reversed (a positive number reads as garbage, often "negative").
  const bits = new DataView(buf).getUint32(0, true);

  const sign = (bits >>> 31) & 1;
  const exponentBits = (bits >>> 23) & 0xff;
  const mantissaBits = bits & 0x7fffff;

  let kind: FloatBreakdown["kind"];
  let reconstructed: number;
  let exponent: number;

  if (exponentBits === 0 && mantissaBits === 0) {
    kind = "zero";
    exponent = 0;
    reconstructed = sign ? -0 : 0;
  } else if (exponentBits === 0) {
    kind = "subnormal";
    exponent = -126;
    reconstructed = (sign ? -1 : 1) * (mantissaBits / 2 ** 23) * 2 ** -126;
  } else if (exponentBits === 255) {
    kind = mantissaBits === 0 ? "infinity" : "nan";
    exponent = 0;
    reconstructed = mantissaBits === 0 ? (sign ? -Infinity : Infinity) : NaN;
  } else {
    kind = "normal";
    exponent = exponentBits - 127;
    reconstructed = (sign ? -1 : 1) * (1 + mantissaBits / 2 ** 23) * 2 ** exponent;
  }

  return { sign, exponentBits, mantissaBits, exponent, reconstructed, kind };
}

const KIND_NOTE: Record<Exclude<FloatBreakdown["kind"], "normal">, string> = {
  zero: "All exponent and mantissa bits are 0: that's zero (and with the sign bit set, negative zero).",
  subnormal:
    "Stored exponent 0 with a nonzero mantissa: a subnormal number, too small for the normal format. There is no implicit leading 1 and the exponent is fixed at -126.",
  infinity: "Stored exponent all 1s with a zero mantissa: infinity, what you get when a result is too big to store.",
  nan: "Stored exponent all 1s with a nonzero mantissa: NaN, \"not a number\".",
};

function exponentText(b: FloatBreakdown): string {
  if (b.kind === "normal") return `${b.exponentBits} - 127 = ${b.exponent}`;
  if (b.kind === "subnormal") return "fixed at -126";
  if (b.kind === "zero") return "0 (zero)";
  return "255 (special)";
}

function significand(b: FloatBreakdown): string {
  const lead = b.kind === "normal" ? 1 : 0;
  return (lead + b.mantissaBits / 2 ** 23).toPrecision(10).replace(/0+$/, "").replace(/\.$/, ".0");
}

function bitString(value: number, width: number): string {
  return value.toString(2).padStart(width, "0");
}

export function FloatCalculator() {
  const [input, setInput] = useState("0.1");
  const parsed = Number(input);
  const valid = input.trim() !== "" && Number.isFinite(parsed);
  const breakdown = useMemo(() => (valid ? toFloatBreakdown(parsed) : null), [valid, parsed]);

  return (
    <div className="tool-widget">
      <label className="tool-single-input">
        Enter a decimal number
        <input type="text" inputMode="decimal" value={input} onChange={(e) => setInput(e.target.value)} />
      </label>

      {!valid && <p className="status-text error">Not a number.</p>}

      {valid && breakdown && (
        <>
          <div className="float-bit-groups">
            <div className="float-group float-sign">
              <span className="float-group-label">sign (1 bit)</span>
              <span className="float-group-bits">{breakdown.sign}</span>
            </div>
            <div className="float-group float-exponent">
              <span className="float-group-label">exponent (8 bits, bias 127)</span>
              <span className="float-group-bits">{bitString(breakdown.exponentBits, 8)}</span>
            </div>
            <div className="float-group float-mantissa">
              <span className="float-group-label">mantissa (23 bits)</span>
              <span className="float-group-bits">{bitString(breakdown.mantissaBits, 23)}</span>
            </div>
          </div>

          <ul className="float-legend">
            <li>
              <span className="float-swatch swatch-sign" aria-hidden="true" />
              <b>Sign:</b> 0 means positive, 1 means negative.
            </li>
            <li>
              <span className="float-swatch swatch-exponent" aria-hidden="true" />
              <b>Exponent:</b> the power of 2 to multiply by, stored with 127 added (the bias) so it's never
              negative. Stored 127 means 2^0.
            </li>
            <li>
              <span className="float-swatch swatch-mantissa" aria-hidden="true" />
              <b>Mantissa:</b> the binary digits after the point. A leading "1." is implied and not stored, so
              the significand is 1.mantissa.
            </li>
          </ul>

          <div className="tool-readout">
            <div className="readout-cell">
              <span className="readout-label">Sign</span>
              <span className="readout-value">{breakdown.sign ? "negative" : "positive"}</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">Exponent (stored - 127)</span>
              <span className="readout-value">{exponentText(breakdown)}</span>
            </div>
            {(breakdown.kind === "normal" || breakdown.kind === "subnormal") && (
              <div className="readout-cell">
                <span className="readout-label">Significand ({breakdown.kind === "normal" ? "1" : "0"}.mantissa)</span>
                <span className="readout-value">{significand(breakdown)}</span>
              </div>
            )}
            <div className="readout-cell">
              <span className="readout-label">Kind</span>
              <span className="readout-value">{breakdown.kind}</span>
            </div>
          </div>
          {(breakdown.kind === "normal" || breakdown.kind === "subnormal") && (
            <p className="gate-note float-formula">
              (-1)^{breakdown.sign} x {significand(breakdown)} x 2^{breakdown.exponent}
            </p>
          )}
          {breakdown.kind !== "normal" && <p className="gate-note">{KIND_NOTE[breakdown.kind]}</p>}

          <div className="float-reconstructed">
            <span className="readout-label">Actual stored value (float32, full precision)</span>
            <span className="readout-value mono">
              {breakdown.kind === "nan" ? "NaN" : breakdown.reconstructed.toPrecision(20)}
            </span>
            {breakdown.kind === "normal" && breakdown.reconstructed !== parsed && (
              <p className="float-precision-note">
                You entered <code>{input}</code>, but that's not exactly representable in 23 mantissa
                bits, so this is the closest float32 value to it. That gap is exactly why floating-point
                equality checks are risky.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

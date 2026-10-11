import { useMemo, useState } from "react";
import { openLesson } from "../../api";

// Type text, see its code points and the exact UTF-8 and UTF-16 bytes, with the UTF-8
// bit layout for whichever character you pick. Then three answers to "how long is it"
// and three ways to reverse it. Encoding is done by hand (not TextEncoder) so the bit
// layout shown is the code actually computing the bytes.

const PRESETS: { label: string; text: string }[] = [
  { label: "Hi!", text: "Hi!" },
  { label: "café (é as one code point)", text: "café" },
  { label: "café (e + combining accent)", text: "café" },
  { label: "日本", text: "日本" },
  { label: "👍", text: "👍" },
  { label: "👍🏽", text: "👍🏽" },
  { label: "family emoji", text: "👨‍👩‍👧" },
  { label: "flag", text: "🇨🇦" },
];

const hex = (n: number, w: number) => n.toString(16).toUpperCase().padStart(w, "0");
const isSurrogate = (cp: number) => cp >= 0xd800 && cp <= 0xdfff;

function utf8(cp: number): number[] {
  if (isSurrogate(cp)) return [0xef, 0xbf, 0xbd]; // a lone surrogate can't be encoded: U+FFFD
  if (cp < 0x80) return [cp];
  if (cp < 0x800) return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)];
  if (cp < 0x10000) return [0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)];
  return [0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f)];
}

function utf16(cp: number): number[] {
  if (cp < 0x10000) return [cp];
  const v = cp - 0x10000;
  return [0xd800 + (v >> 10), 0xdc00 + (v & 0x3ff)];
}

function graphemes(s: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s), (x) => x.segment);
  }
  return Array.from(s);
}

function display(cp: number): string {
  if (cp === 0x20) return "space";
  if (cp === 0x0a) return "\\n";
  if (cp === 0x09) return "\\t";
  if (cp < 0x20 || cp === 0x7f) return "ctrl";
  if (cp === 0x200d) return "ZWJ";
  if (cp === 0xfe0f) return "VS16";
  if (isSurrogate(cp)) return "lone surrogate";
  if (cp >= 0x0300 && cp <= 0x036f) return "◌" + String.fromCodePoint(cp);
  return String.fromCodePoint(cp);
}

// The UTF-8 bit layout of one code point: per byte, the fixed prefix bits and the
// payload bits taken from the code point.
function bitLayout(cp: number): { prefix: string; payload: string }[] {
  const n = utf8(cp).length;
  if (isSurrogate(cp)) return [];
  const payloadBits = [7, 11, 16, 21][n - 1];
  const bits = cp.toString(2).padStart(payloadBits, "0");
  if (n === 1) return [{ prefix: "0", payload: bits }];
  const leadPrefix = "1".repeat(n) + "0";
  const leadBits = 8 - leadPrefix.length;
  const out = [{ prefix: leadPrefix, payload: bits.slice(0, leadBits) }];
  for (let i = leadBits; i < bits.length; i += 6) out.push({ prefix: "10", payload: bits.slice(i, i + 6) });
  return out;
}

const MAX_ROWS = 40;

export function TextEncoding() {
  const [text, setText] = useState("café 👍");
  const [sel, setSel] = useState(3);

  const info = useMemo(() => {
    const clusters = graphemes(text);
    const rows: { cp: number; cluster: number }[] = [];
    clusters.forEach((g, ci) => {
      for (const ch of g) rows.push({ cp: ch.codePointAt(0)!, cluster: ci });
    });
    const u8 = rows.flatMap((r) => utf8(r.cp));
    const u16 = rows.flatMap((r) => utf16(r.cp));
    return { clusters, rows, u8, u16 };
  }, [text]);

  const selIdx = Math.min(sel, info.rows.length - 1);
  const selCp = selIdx >= 0 ? info.rows[selIdx].cp : null;

  const units = text.split("");
  const reversedUnits = [...units].reverse().join("");
  const reversedCps = Array.from(text).reverse().join("");
  const reversedGraphemes = [...info.clusters].reverse().join("");
  const brokenPair = Array.from(reversedUnits).some((ch) => isSurrogate(ch.codePointAt(0)!));

  const nfc = text.normalize("NFC");
  const nfd = text.normalize("NFD");

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Type text, see the bytes</h3>
        <div className="sql-presets">
          {PRESETS.map((p) => (
            <button key={p.label} className={text === p.text ? "active" : ""} onClick={() => { setText(p.text); setSel(0); }}>
              {p.label}
            </button>
          ))}
        </div>
        <label className="tool-single-input">
          Your text
          <input className="te-input" value={text} maxLength={80} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </label>

        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">C# s.Length</span>
            <span className="readout-value">{units.length}</span>
            <span className="cm-sub">UTF-16 code units</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Python len(s)</span>
            <span className="readout-value">{info.rows.length}</span>
            <span className="cm-sub">code points</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">What a user sees</span>
            <span className="readout-value">{info.clusters.length}</span>
            <span className="cm-sub">grapheme clusters</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">UTF-8 bytes</span>
            <span className="readout-value">{info.u8.length}</span>
            <span className="cm-sub">UTF-16: {info.u16.length * 2} bytes</span>
          </div>
        </div>

        {info.rows.length > 0 && (
          <div className="cm-scroll">
            <table className="bigo-table te-table">
              <thead>
                <tr>
                  <th>Char</th>
                  <th>Code point</th>
                  <th>UTF-8 bytes</th>
                  <th>UTF-16 units</th>
                </tr>
              </thead>
              <tbody>
                {info.rows.slice(0, MAX_ROWS).map((r, i) => {
                  const u16 = utf16(r.cp);
                  return (
                    <tr
                      key={i}
                      className={`${i === selIdx ? "cm-row-on" : ""} ${r.cluster % 2 ? "te-odd" : ""}`}
                      onClick={() => setSel(i)}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSel(i); }}
                    >
                      <td className="te-char">{display(r.cp)}</td>
                      <td className="mono">U+{hex(r.cp, 4)}</td>
                      <td className="mono">{utf8(r.cp).map((b) => hex(b, 2)).join(" ")}</td>
                      <td className="mono">
                        {u16.map((u) => hex(u, 4)).join(" ")}
                        {u16.length === 2 && <span className="cm-sub">surrogate pair</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {info.rows.length > MAX_ROWS && <p className="bigo-table-footnote">Showing the first {MAX_ROWS} code points.</p>}
        <p className="bigo-table-footnote">Rows with the same shading belong to one grapheme cluster. Click a row to see how its bytes are built.</p>

        {selCp !== null && (
          <div className="te-bits">
            <strong>
              {display(selCp)} = U+{hex(selCp, 4)} = {selCp.toString(2)} in binary
            </strong>
            {isSurrogate(selCp) ? (
              <p className="gate-note">A lone surrogate isn't a character, so it has no valid UTF-8 form; encoders write U+FFFD (EF BF BD) instead.</p>
            ) : (
              <>
                <div className="te-bytes">
                  {bitLayout(selCp).map((b, i) => (
                    <span key={i} className="te-byte">
                      <code>
                        <span className="te-prefix">{b.prefix}</span>
                        <span className="te-payload">{b.payload}</span>
                      </code>
                      <span className="cm-sub">{hex(utf8(selCp)[i], 2)}</span>
                    </span>
                  ))}
                </div>
                <p className="gate-note">
                  {utf8(selCp).length === 1
                    ? "Up to U+007F: one byte starting 0, exactly the ASCII code."
                    : `${utf8(selCp).length} bytes: the first starts with ${utf8(selCp).length} ones and a zero to say how long the sequence is, and each continuation byte starts 10. The highlighted bits are the code point's own bits, split across the bytes.`}
                  {selCp >= 0x10000 &&
                    ` In UTF-16: ${hex(selCp, 4)} minus 10000 = ${hex(selCp - 0x10000, 5)}; its top 10 bits plus D800 give ${hex(utf16(selCp)[0], 4)}, its low 10 bits plus DC00 give ${hex(utf16(selCp)[1], 4)}.`}
                </p>
              </>
            )}
          </div>
        )}

        <div className="te-dump">
          <span className="readout-label">UTF-8 on disk</span>
          <code>{info.u8.map((b) => hex(b, 2)).join(" ") || "(empty)"}</code>
          <span className="readout-label">UTF-16LE (how .NET holds it in memory)</span>
          <code>{info.u16.map((u) => hex(u & 0xff, 2) + " " + hex(u >> 8, 2)).join(" ") || "(empty)"}</code>
        </div>
      </div>

      <div className="crypto-section">
        <h3>Reverse it three ways</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Result</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Reverse the chars
                  <span className="cm-sub">Array.Reverse(s.ToCharArray())</span>
                </td>
                <td className="te-char">{reversedUnits}</td>
                <td className={brokenPair ? "cm-yes" : ""}>{brokenPair ? "broken: split a surrogate pair" : "fine for this text"}</td>
              </tr>
              <tr>
                <td>
                  Reverse code points
                  <span className="cm-sub">Python s[::-1], C# Runes</span>
                </td>
                <td className="te-char">{reversedCps}</td>
                <td className={reversedCps !== reversedGraphemes ? "cm-yes" : ""}>
                  {reversedCps !== reversedGraphemes ? "wrong: a cluster was pulled apart" : "fine for this text"}
                </td>
              </tr>
              <tr>
                <td>
                  Reverse grapheme clusters
                  <span className="cm-sub">StringInfo text elements</span>
                </td>
                <td className="te-char">{reversedGraphemes}</td>
                <td className="cm-no">correct</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Try 👍 (a surrogate pair in UTF-16), café with the combining accent (the accent lands on the wrong letter, or on nothing), and the family
          emoji or the flag (the parts come apart). Python's slice reverse is safe from surrogates but not from combining marks.
        </p>
        <pre className="algo-code">{`// C#: reverse what the user sees
var e = StringInfo.GetTextElementEnumerator(s);
var parts = new List<string>();
while (e.MoveNext()) parts.Add(e.GetTextElement());
parts.Reverse();
string reversed = string.Concat(parts);`}</pre>
      </div>

      <div className="crypto-section">
        <h3>Same look, different code points</h3>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">NFC (composed)</span>
            <span className="readout-value">{Array.from(nfc).length} code points</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">NFD (decomposed)</span>
            <span className="readout-value">{Array.from(nfd).length} code points</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Your text is</span>
            <span className="readout-value">{text === nfc ? (text === nfd ? "both" : "NFC") : text === nfd ? "NFD" : "neither"}</span>
          </div>
        </div>
        <p className="gate-note">
          "café" typed into a form and "café" read from an older macOS file name (stored decomposed) can differ in bytes, so a plain string comparison says they're unequal
          and a database unique index lets both in. Normalize text (usually to NFC with s.Normalize()) at the boundary where it enters your
          system. Byte order for multi-byte numbers, which is also why UTF-16 has LE and BE forms, is in{" "}
          <button className="link-button" onClick={() => openLesson("endianness")}>
            Byte Order: Little vs Big Endian
          </button>
          .
        </p>
      </div>
    </div>
  );
}

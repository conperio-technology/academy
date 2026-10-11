import { useState } from "react";
import { Quiz, type QuizItem } from "./netSecShared";

// Part 1: plan 2.4 GHz channels for three access points and see where they overlap.
// Part 2: what a signal strength in dBm means. Then bands and security modes.

// 2.4 GHz channel n is centred on 2407 + 5n MHz; modern (OFDM) channels are 20 MHz wide, so two
// channels overlap when their centres are less than 20 MHz (4 channel numbers) apart.
const center = (ch: number) => 2407 + 5 * ch;
const overlap = (a: number, b: number) => a !== b && Math.abs(center(a) - center(b)) < 20;

const AP_NAMES = ["Office AP", "Warehouse AP", "Canteen AP"];
// Which APs are close enough to hear each other: office and warehouse, warehouse and canteen.
const NEIGHBOURS: [number, number][] = [
  [0, 1],
  [1, 2],
];
const COLORS = ["#7dd3a8", "#93c5fd", "#fbbf24"];

function quality(dbm: number): { label: string; note: string } {
  if (dbm >= -50) return { label: "Excellent", note: "Close to the access point. Full speed." };
  if (dbm >= -60) return { label: "Very good", note: "Fast and reliable for anything." };
  if (dbm >= -67) return { label: "Good", note: "-67 dBm is the usual design target for voice and video calls." };
  if (dbm >= -70) return { label: "Fair", note: "Browsing and email fine; calls may stutter." };
  if (dbm >= -80) return { label: "Poor", note: "Slow, drops out. Lower data rates, more retries." };
  return { label: "Unusable", note: "Near the noise floor. Connection fails or barely works." };
}

const QUIZ: QuizItem[] = [
  {
    q: "Three access points sit close together on 2.4 GHz. Which channel plan avoids overlap?",
    options: ["1, 2, 3", "1, 6, 11", "6, 6, 6", "3, 7, 11"],
    answer: 1,
    why: "Channels 1, 6 and 11 are 25 MHz apart, enough for 20 MHz channels not to overlap. 1, 2, 3 overlap heavily. 6, 6, 6 share one channel (they take turns, which is better than overlapping, but wastes capacity). 3 and 7 are only 20 MHz apart, so 3, 7, 11 just touch: workable, but 1, 6, 11 is the standard plan.",
  },
  {
    q: "A laptop shows -75 dBm and another shows -55 dBm. How much stronger is the second signal?",
    options: ["20% stronger", "About 2 times", "100 times"],
    answer: 2,
    why: "dBm is logarithmic: every 10 dB is a factor of 10 in power. 20 dB is 10 × 10 = 100 times.",
  },
  {
    q: "Which security mode should a new office Wi-Fi network use?",
    options: ["WEP", "WPA2-Personal with the password on a sticky note", "WPA3 (or WPA2/WPA3) Enterprise with 802.1X, or at least WPA3-Personal"],
    answer: 2,
    why: "WEP was broken in the early 2000s. Personal mode shares one password between everyone, so a leaver still knows it. Enterprise mode gives each user or device its own credentials through a RADIUS server, and WPA3-Personal at least resists offline password guessing.",
  },
  {
    q: "Why does 5 GHz usually give better throughput than 2.4 GHz in an office?",
    options: ["It travels further", "Many more non-overlapping channels and less interference, at the cost of range through walls", "It uses less power"],
    answer: 1,
    why: "2.4 GHz has 3 usable channels shared with Bluetooth, microwave ovens and neighbours. 5 GHz has around two dozen 20 MHz channels. Higher frequencies are absorbed more by walls, so range is shorter.",
  },
];

export function WifiBasics() {
  const [channels, setChannels] = useState([1, 3, 6]);
  const [dbm, setDbm] = useState(-67);

  const pairs = NEIGHBOURS.map(([a, b]) => {
    const ca = channels[a];
    const cb = channels[b];
    const kind = ca === cb ? "same" : overlap(ca, cb) ? "overlap" : "clear";
    return { a, b, kind };
  });
  const q = quality(dbm);
  const weaker = 10 ** ((-30 - dbm) / 10);

  // Spectrum drawing: 2400 to 2490 MHz across the SVG width.
  const W = 560;
  const x = (mhz: number) => ((mhz - 2398) / (2486 - 2398)) * W;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Plan the 2.4 GHz channels</h3>
        <div className="tool-inputs">
          {AP_NAMES.map((name, i) => (
            <label key={name}>
              {name}
              <select
                value={channels[i]}
                onChange={(e) => setChannels(channels.map((c, j) => (j === i ? Number(e.target.value) : c)))}
                style={{ borderColor: COLORS[i] }}
              >
                {Array.from({ length: 13 }, (_, k) => k + 1).map((c) => (
                  <option key={c} value={c}>
                    channel {c} ({center(c)} MHz)
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} 120`} className="ns-spectrum" role="img" aria-label="2.4 GHz spectrum with each access point's 20 MHz channel">
          {channels.map((c, i) => (
            <path
              key={i}
              d={`M ${x(center(c) - 10)} 95 C ${x(center(c) - 6)} ${30 + i * 8}, ${x(center(c) + 6)} ${30 + i * 8}, ${x(center(c) + 10)} 95`}
              fill={COLORS[i]}
              fillOpacity={0.25}
              stroke={COLORS[i]}
              strokeWidth={2}
            />
          ))}
          <line x1={0} x2={W} y1={95} y2={95} stroke="currentColor" opacity={0.4} />
          {Array.from({ length: 13 }, (_, k) => k + 1).map((c) => (
            <text key={c} x={x(center(c))} y={112} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
              {c}
            </text>
          ))}
        </svg>
        <ul className="ns-plain-list">
          {pairs.map((p) => (
            <li key={`${p.a}-${p.b}`} className={p.kind === "overlap" ? "constraint-fail" : p.kind === "same" ? "ns-warn" : "constraint-ok"}>
              {AP_NAMES[p.a]} (ch {channels[p.a]}) and {AP_NAMES[p.b]} (ch {channels[p.b]}):{" "}
              {p.kind === "overlap"
                ? "overlapping channels. Each hears the other as noise it can't decode, so both slow down: adjacent-channel interference, the worst case."
                : p.kind === "same"
                  ? "same channel. They hear each other and take turns (co-channel contention): they share the airtime, but at least nothing is garbled."
                  : "no overlap. Each has its channel to itself."}
            </li>
          ))}
        </ul>
        <p className="gate-note">
          The office and canteen are far apart and can reuse a channel. Europe allows channels 1 to 13, the US 1 to 11; the classic plan is 1, 6, 11 everywhere.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Signal strength</h3>
        <label className="tool-checkbox">
          <input type="range" min={-95} max={-30} value={dbm} onChange={(e) => setDbm(Number(e.target.value))} aria-label="Signal strength in dBm" />
          <span className="mono">{dbm} dBm</span>
        </label>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Quality</span>
            <span className="readout-value">{q.label}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Power vs -30 dBm</span>
            <span className="readout-value">{weaker < 10 ? weaker.toFixed(1) : Math.round(weaker).toLocaleString()} times weaker</span>
          </div>
        </div>
        <p className="gate-note">
          {q.note} dBm is decibels relative to one milliwatt, and it's logarithmic: -3 dB halves the power, -10 dB is a tenth. Walls, metal shelving, machinery and
          bodies all absorb signal, which is why a warehouse or plant floor needs a site survey, not a guess.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Bands</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Band</th>
                <th>Non-overlapping 20 MHz channels</th>
                <th>Strengths</th>
                <th>Weaknesses</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2.4 GHz</td>
                <td>3 (1, 6, 11)</td>
                <td>Best range and wall penetration; every device supports it</td>
                <td>Crowded: neighbours, Bluetooth, microwave ovens; slowest</td>
              </tr>
              <tr>
                <td>5 GHz</td>
                <td>about 25, depending on country</td>
                <td>Much more capacity, less interference</td>
                <td>Shorter range; some channels must give way to radar (DFS)</td>
              </tr>
              <tr>
                <td>6 GHz (Wi-Fi 6E and 7)</td>
                <td>up to 59</td>
                <td>Clean spectrum, wide fast channels</td>
                <td>Shortest range; newer devices only; WPA3 required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="crypto-section">
        <h3>Security modes</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>How you join</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Open</td>
                <td>Anyone, no encryption (unless Enhanced Open/OWE)</td>
                <td>Guest hotspots only, with client isolation</td>
              </tr>
              <tr>
                <td>WEP</td>
                <td>Shared key</td>
                <td className="constraint-fail">Broken. Cracked in minutes; never use</td>
              </tr>
              <tr>
                <td>WPA2-Personal (PSK)</td>
                <td>One shared password</td>
                <td>OK at home with a long passphrase. A captured handshake can be guessed offline, and everyone shares the key</td>
              </tr>
              <tr>
                <td>WPA3-Personal (SAE)</td>
                <td>One shared password</td>
                <td>Better: resists offline guessing</td>
              </tr>
              <tr>
                <td>WPA2/WPA3-Enterprise (802.1X)</td>
                <td>Each user or device signs in, checked by a RADIUS server, often with certificates</td>
                <td className="constraint-ok">The right choice for company networks: revoke one person without changing everyone's password</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          In a plant, keep safety functions and fast control loops on cable. Wi-Fi is shared, half-duplex airtime, and interference from motors, welders and metal
          makes its timing unpredictable.
        </p>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
    </div>
  );
}

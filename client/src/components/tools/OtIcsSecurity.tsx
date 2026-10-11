import { useState } from "react";
import { LessonLink } from "./netSecShared";

// Part 1: put plant and office systems on the Purdue model's levels. Part 2: decide which
// traffic flows a segmented plant network should allow between zones.

const LEVELS = [
  { id: "5", name: "Level 5: Enterprise and internet", note: "Corporate cloud services, the internet, vendors' portals." },
  { id: "4", name: "Level 4: Business network", note: "ERP, email, office PCs, the company's IT." },
  { id: "3.5", name: "Level 3.5: Industrial DMZ", note: "The buffer between IT and OT. Nothing passes straight through: each side talks only to systems here." },
  { id: "3", name: "Level 3: Site operations", note: "Historian, MES (manufacturing execution system), OT patch and domain servers for the whole site." },
  { id: "2", name: "Level 2: Supervisory control", note: "HMIs, SCADA servers and engineering workstations for one area or line." },
  { id: "1", name: "Level 1: Basic control", note: "PLCs, safety controllers and other controllers: the devices that run the process." },
  { id: "0", name: "Level 0: The physical process", note: "Sensors, valves, motors, actuators." },
];

const DEVICES: { name: string; level: string; why: string }[] = [
  { name: "Pressure transmitter on a tank", level: "0", why: "A field device measuring the process itself." },
  { name: "PLC running the filling line", level: "1", why: "Controls the process directly through its I/O." },
  { name: "Line 3 HMI panel", level: "2", why: "Operators supervise and adjust the line from it." },
  { name: "Engineering workstation with the PLC software", level: "2", why: "Programs and diagnoses controllers. It is the most powerful machine on the plant network, so it is a prime target." },
  { name: "Plant historian collecting every tag", level: "3", why: "Site-wide operations data, above any single line." },
  { name: "Remote access jump host for vendors", level: "3.5", why: "Outsiders land here (with MFA), never directly on control networks." },
  { name: "Read-only historian mirror for office reports", level: "3.5", why: "Office users read this copy, so they never connect into Level 3." },
  { name: "ERP system", level: "4", why: "Business planning: orders, stock, finance." },
  { name: "Equipment vendor's cloud dashboard", level: "5", why: "Outside the company entirely." },
];

interface Flow {
  text: string;
  allow: boolean;
  why: string;
}

const FLOWS: Flow[] = [
  { text: "HMI (L2) reads and writes tags on its line's PLC (L1) over EtherNet/IP", allow: true, why: "Normal control traffic inside one cell zone." },
  { text: "ERP (L4) writes production orders straight to a PLC (L1) over Modbus TCP", allow: false, why: "Never skip levels. Orders go to MES at Level 3 through the DMZ; only OT systems talk to controllers." },
  { text: "Historian (L3) pushes data to the historian mirror in the DMZ (L3.5)", allow: true, why: "OT starts the connection outward into the DMZ, so nothing on the IT side needs a way in." },
  { text: "Office PC (L4) opens the historian mirror's web page (L3.5)", allow: true, why: "IT talks to the DMZ, not to OT. This is the whole point of the mirror." },
  { text: "Office PC (L4) connects directly to the plant historian (L3)", allow: false, why: "Traffic must not pass straight through the DMZ. Use the mirror." },
  { text: "Vendor connects over VPN with MFA to the jump host (L3.5), then to the engineering workstation for an approved, time-limited, recorded session", allow: true, why: "Controlled remote access: brokered, authenticated, limited in time and logged." },
  { text: "Vendor reaches a PLC from the internet through a forwarded port", allow: false, why: "Internet-exposed controllers are found by scanners within hours. Industrial protocols like Modbus have no authentication at all." },
  { text: "Engineering workstation (L2) browses the internet to download a firmware update", allow: false, why: "Updates come in through a patch staging server in the DMZ, where they're checked first. Control-network machines don't browse." },
];

export function OtIcsSecurity() {
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [flowPicks, setFlowPicks] = useState<Record<number, boolean>>({});
  const correct = DEVICES.filter((d, i) => placed[i] === d.level).length;
  const flowScore = FLOWS.filter((f, i) => flowPicks[i] === f.allow).length;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>The Purdue model</h3>
        <ol className="ns-purdue">
          {LEVELS.map((l) => (
            <li key={l.id} className={`ns-purdue-level ns-purdue-${l.id.replace(".", "")}`}>
              <strong>{l.name}</strong>
              <span className="ns-small">{l.note}</span>
              {checked && (
                <span className="ns-small ns-purdue-devs">
                  {DEVICES.filter((d) => d.level === l.id)
                    .map((d) => d.name)
                    .join(" · ")}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="crypto-section">
        <h3>Where does each system belong?</h3>
        <ul className="sdi-points prep-tasks">
          {DEVICES.map((d, i) => (
            <li key={d.name}>
              <label className="ns-place">
                <span>{d.name}</span>
                <select value={placed[i] ?? ""} disabled={checked} onChange={(e) => setPlaced({ ...placed, [i]: e.target.value })} aria-label={`Level for ${d.name}`}>
                  <option value="">choose a level</option>
                  {LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      Level {l.id}
                    </option>
                  ))}
                </select>
              </label>
              {checked && (
                <p className={`ns-small ${placed[i] === d.level ? "constraint-ok" : "constraint-fail"}`}>
                  {placed[i] === d.level ? "Right. " : `Level ${d.level}. `}
                  {d.why}
                </p>
              )}
            </li>
          ))}
        </ul>
        <div className="darr-actions">
          {!checked ? (
            <button onClick={() => setChecked(true)}>Check</button>
          ) : (
            <>
              <span className="status-text">
                {correct} of {DEVICES.length} placed right.
              </span>
              <button
                onClick={() => {
                  setChecked(false);
                  setPlaced({});
                }}
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>

      <div className="crypto-section">
        <h3>Allow or block?</h3>
        <p className="gate-note">The plant is segmented into zones with firewalls between them. Decide what each firewall should do.</p>
        <ol className="cm-quiz">
          {FLOWS.map((f, i) => (
            <li key={f.text}>
              <p>{f.text}</p>
              <div className="sql-presets">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    className={flowPicks[i] === v ? (v === f.allow ? "active" : "cm-wrong") : ""}
                    onClick={() => setFlowPicks({ ...flowPicks, [i]: v })}
                  >
                    {v ? "Allow" : "Block"}
                  </button>
                ))}
              </div>
              {flowPicks[i] !== undefined && (
                <p className={flowPicks[i] === f.allow ? "constraint-ok" : "constraint-fail"}>
                  {flowPicks[i] === f.allow ? "Right. " : `Should ${f.allow ? "allow" : "block"}. `}
                  {f.why}
                </p>
              )}
            </li>
          ))}
        </ol>
        {Object.keys(flowPicks).length > 0 && (
          <p className="gate-note">
            {flowScore} of {Object.keys(flowPicks).length} right so far.
          </p>
        )}
      </div>

      <div className="crypto-section">
        <h3>Why OT security is different</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th></th>
                <th>Office IT</th>
                <th>Plant OT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Top priority</td>
                <td>Confidentiality of data</td>
                <td>Safety, then availability: the line must keep running safely</td>
              </tr>
              <tr>
                <td>Lifetime</td>
                <td>3 to 5 years</td>
                <td>15 to 25 years; Windows versions long out of support are common</td>
              </tr>
              <tr>
                <td>Patching</td>
                <td>Monthly, automatic</td>
                <td>In planned shutdowns, after vendor approval; sometimes never</td>
              </tr>
              <tr>
                <td>Protocols</td>
                <td>Encrypted and authenticated by default (HTTPS, Kerberos)</td>
                <td>Often neither: Modbus and many older protocols accept any command from anyone who can reach them</td>
              </tr>
              <tr>
                <td>Scanning and testing</td>
                <td>Routine</td>
                <td>Careful: an aggressive scan can crash an old controller</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Because devices can&apos;t always be patched or given authentication, the network has to protect them: segmentation, allowlisted flows, monitoring for
          unusual traffic and controlled remote access. Segments are built with <LessonLink id="net-vlans">VLANs</LessonLink> and{" "}
          <LessonLink id="net-firewalls-ports">firewalls</LessonLink>; the protocols are covered in{" "}
          <LessonLink id="industrial-networking">Industrial Networking</LessonLink>.
        </p>
      </div>
    </div>
  );
}

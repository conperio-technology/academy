import { useState } from "react";

type TcpIpGroup = "application" | "transport" | "internet" | "link";

interface OsiLayer {
  key: string;
  label: string;
  group: TcpIpGroup;
  pdu: string;
  examples: string;
  description: string;
}

const LAYERS: OsiLayer[] = [
  {
    key: "application",
    label: "7. Application",
    group: "application",
    pdu: "data / messages",
    examples: "HTTP, DNS, SMTP, FTP",
    description:
      "What the user-facing program actually speaks -- your browser sending an HTTP request, a mail " +
      "client speaking SMTP, a DNS resolver asking \"what's the IP for this name.\" Everything below " +
      "this layer exists just to get this data there. See DNS & HTTP for a full worked example.",
  },
  {
    key: "presentation",
    label: "6. Presentation",
    group: "application",
    pdu: "data",
    examples: "TLS/SSL encryption, character encoding, compression",
    description:
      "Formats, encrypts, and compresses the data before it's sent -- TLS (the \"S\" in HTTPS) lives " +
      "conceptually here. Real TCP/IP stacks don't implement this as a separate layer; it's folded " +
      "into \"Application.\"",
  },
  {
    key: "session",
    label: "5. Session",
    group: "application",
    pdu: "data",
    examples: "Login sessions, cookies keeping a conversation alive across requests",
    description:
      "Establishes, maintains, and tears down a conversation between two applications. Like " +
      "Presentation, real stacks fold this into \"Application\" rather than implementing it separately.",
  },
  {
    key: "transport",
    label: "4. Transport",
    group: "transport",
    pdu: "segments (TCP) / datagrams (UDP)",
    examples: "TCP, UDP, port numbers",
    description:
      "Gets data between the right PROGRAMS on two hosts, not just the right machines -- a port number " +
      "(like :443 for HTTPS) picks the program on top of the IP address that picked the machine. TCP " +
      "adds reliability; UDP doesn't bother. See TCP vs UDP.",
  },
  {
    key: "internet",
    label: "3. Internet (Network)",
    group: "internet",
    pdu: "packets",
    examples: "IP, routers",
    description:
      "Gets data between the right MACHINES, possibly across many different networks -- an IP address " +
      "identifies the machine, and routers forward packets one hop closer to it. See IP Addressing & " +
      "Subnetting for how an address itself is structured.",
  },
  {
    key: "link",
    label: "2. Link (Data Link)",
    group: "link",
    pdu: "frames",
    examples: "Ethernet, Wi-Fi (802.11), MAC addresses, switches",
    description:
      "Gets data between two devices on the SAME local network segment -- a MAC address identifies the " +
      "physical network interface, not the machine's location on the wider internet the way an IP " +
      "address does.",
  },
  {
    key: "physical",
    label: "1. Physical",
    group: "link",
    pdu: "bits",
    examples: "Cables, radio waves, voltage levels, light pulses",
    description:
      "The actual electrical, optical, or radio signal that represents each individual bit on the wire " +
      "or over the air -- the layer where \"1s and 0s\" stop being a metaphor.",
  },
];

const GROUPS: { key: TcpIpGroup; label: string }[] = [
  { key: "application", label: "application (TCP/IP)" },
  { key: "transport", label: "transport (TCP/IP)" },
  { key: "internet", label: "internet (TCP/IP)" },
  { key: "link", label: "link (TCP/IP)" },
];

export function NetworkLayers() {
  const [selected, setSelected] = useState<string>("application");
  const layer = LAYERS.find((l) => l.key === selected)!;

  return (
    <div className="tool-widget">
      <div className="arch-layers">
        {GROUPS.map((g) => (
          <div key={g.key} className={`arch-layer arch-layer-${g.key}`}>
            <span className="arch-layer-label">{g.label}</span>
            <div className="arch-cards">
              {LAYERS.filter((l) => l.group === g.key).map((l) => (
                <button
                  key={l.key}
                  className={`arch-card ${selected === l.key ? "selected" : ""}`}
                  onClick={() => setSelected(l.key)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="arch-detail">
        <strong>{layer.label}</strong>
        <p>{layer.description}</p>
      </div>

      <table className="bigo-table">
        <tbody>
          <tr>
            <td>Data unit (PDU)</td>
            <td className="mono">{layer.pdu}</td>
          </tr>
          <tr>
            <td>Examples</td>
            <td className="mono">{layer.examples}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

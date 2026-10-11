import { useState } from "react";
import { inCidr, parseIp } from "../../netMath";
import { LessonLink, Quiz, type QuizItem } from "./netSecShared";

// A laptop on café Wi-Fi reaching company and public servers, with and without a VPN, and
// full versus split tunnel routing.

interface Dest {
  id: string;
  label: string;
  ip: string;
  port: number;
  name: string;
  tls: boolean;
}

const DESTS: Dest[] = [
  { id: "intranet", label: "Company intranet", ip: "10.10.5.20", port: 443, name: "intranet.conperio.example", tls: true },
  { id: "historian", label: "Plant historian (plain HTTP)", ip: "10.10.8.30", port: 80, name: "historian.conperio.example", tls: false },
  { id: "web", label: "A public website", ip: "203.0.113.80", port: 443, name: "news.example.com", tls: true },
  { id: "printer", label: "Printer at home", ip: "192.168.1.40", port: 9100, name: "(home LAN)", tls: false },
];

const VPN_SERVER = "198.51.100.20";
const LAPTOP_WIFI = "10.20.0.15";
const TUNNEL_IP = "10.99.0.7";
const COMPANY = "10.0.0.0/8";

const QUIZ: QuizItem[] = [
  {
    q: "On café Wi-Fi with no VPN, you open an HTTPS site. What can someone sniffing the Wi-Fi see?",
    options: ["Everything, including your password", "The server's IP address and usually its hostname, but not the pages or what you type", "Nothing at all"],
    answer: 1,
    why: "TLS encrypts the content. The IP header, the DNS lookup (unless DNS is encrypted) and the hostname in the TLS handshake (SNI) are still visible. A VPN hides those from the local network too, and moves the visibility to the VPN provider.",
  },
  {
    q: "What does split tunneling do?",
    options: ["Splits each packet across two connections", "Sends only company-bound traffic through the VPN; everything else goes directly to the internet", "Uses two VPN servers"],
    answer: 1,
    why: "It saves bandwidth on the company link, but internet traffic then skips the company's web filtering and monitoring. Full tunnel sends everything through the company.",
  },
  {
    q: "Two plants need their networks permanently joined over the internet. What fits?",
    options: ["A remote-access VPN client on every PC", "A site-to-site VPN between the two firewalls", "Port forwarding"],
    answer: 1,
    why: "A site-to-site tunnel (often IPsec) runs between the sites' gateways, so devices on each side need no VPN software. Remote-access VPNs are for individual users and laptops.",
  },
  {
    q: "Does a VPN make a malware-infected laptop safe to connect to the company network?",
    options: ["Yes, the tunnel is encrypted", "No: the VPN carries the malware's traffic straight into the network, encrypted"],
    answer: 1,
    why: "A VPN protects data in transit; it says nothing about the endpoint. That's why companies pair VPNs with MFA, device health checks, and firewall rules that limit what VPN users can reach (or move to zero trust network access).",
  },
];

export function Vpns() {
  const [vpn, setVpn] = useState(true);
  const [full, setFull] = useState(false);
  const [destId, setDestId] = useState("intranet");
  const d = DESTS.find((x) => x.id === destId)!;
  const ip = parseIp(d.ip)!;
  const companyBound = inCidr(ip, COMPANY);
  const homeLan = inCidr(ip, "192.168.1.0/24");
  const viaTunnel = vpn && (full ? !homeLan : companyBound);
  const reachable = viaTunnel || !companyBound;

  const sniffer = !reachable
    ? `Nothing useful. ${d.ip} is a private company address; without the VPN the café network has no route to it, so the request fails.`
    : viaTunnel
      ? `Only UDP packets between ${LAPTOP_WIFI} and the VPN server ${VPN_SERVER}:51820. Destination, hostname, port and content are all inside the encrypted tunnel.`
      : homeLan
        ? `Nothing: the home printer isn't reachable from the café at all. (At home, split tunnel or a local-network exception lets you print while the VPN is up.)`
        : d.tls
          ? `The destination IP ${d.ip}, port ${d.port} and the hostname ${d.name} (from the DNS lookup and the TLS handshake). Not the pages or anything you type.`
          : `Everything: the hostname, the full URL and every byte of the page, because plain HTTP isn't encrypted.`;

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        {DESTS.map((x) => (
          <button key={x.id} className={x.id === destId ? "active" : ""} onClick={() => setDestId(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      <label className="tool-checkbox">
        <input type="checkbox" checked={vpn} onChange={(e) => setVpn(e.target.checked)} /> VPN connected
      </label>
      <label className="tool-checkbox">
        <input type="checkbox" checked={full} disabled={!vpn} onChange={(e) => setFull(e.target.checked)} /> Full tunnel (send all traffic through the VPN)
      </label>

      <div className="ns-encap" aria-label="The packet as it leaves the laptop">
        {viaTunnel ? (
          <div className="ns-encap-outer">
            <span className="ns-encap-label">
              Outer IP: {LAPTOP_WIFI} → {VPN_SERVER}, UDP 51820 (visible on the café Wi-Fi)
            </span>
            <div className="ns-encap-inner">
              <span className="ns-encap-label">Encrypted with the tunnel's keys:</span>
              <div className="ns-encap-plain">
                Inner IP: {TUNNEL_IP} → {d.ip}, port {d.port}
                <br />
                {d.tls ? "TLS-encrypted HTTP request" : "HTTP request (plain inside the tunnel)"} for {d.name}
              </div>
            </div>
          </div>
        ) : (
          <div className={`ns-encap-outer ${reachable ? "" : "ns-encap-fail"}`}>
            <span className="ns-encap-label">
              IP: {LAPTOP_WIFI} → {d.ip}, port {d.port} (visible on the café Wi-Fi)
            </span>
            <div className="ns-encap-plain">{d.tls ? `TLS-encrypted request for ${d.name}` : `Plain text request for ${d.name}`}</div>
          </div>
        )}
      </div>
      <div className="drill-feedback">
        <p>
          <strong>What someone sniffing the café Wi-Fi sees:</strong> {sniffer}
        </p>
        {viaTunnel && (
          <p>
            The VPN server decrypts it and forwards the inner packet{companyBound ? " into the company network" : " to the internet, so the website sees the company's address, not the café's"}.
          </p>
        )}
      </div>

      <div className="crypto-section">
        <h3>The laptop's routes{vpn ? (full ? ", full tunnel" : ", split tunnel") : ", no VPN"}</h3>
        <pre className="algo-code">
          {!vpn
            ? "default via 10.20.0.1 dev wlan0\n10.20.0.0/24 dev wlan0"
            : full
              ? `default dev wg0                     # everything into the tunnel\n${VPN_SERVER} via 10.20.0.1 dev wlan0   # except the tunnel's own packets\n10.20.0.0/24 dev wlan0`
              : `10.0.0.0/8 dev wg0                  # company addresses into the tunnel\ndefault via 10.20.0.1 dev wlan0     # the rest straight out\n10.20.0.0/24 dev wlan0`}
        </pre>
        <p className="gate-note">
          Illustrative routes. The VPN client installs them when it connects; the extra route to the VPN server stops the tunnel's own packets from being sent into
          the tunnel. In a WireGuard config, the AllowedIPs line decides this: <code>AllowedIPs = 10.0.0.0/8</code> for split tunnel, <code>0.0.0.0/0</code> for full.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Kinds of VPN</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Transport</th>
                <th>Typical use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IPsec (IKEv2)</td>
                <td className="mono ns-small">UDP 500 and 4500, ESP</td>
                <td>Site-to-site links between firewalls; built into Windows, macOS, iOS</td>
              </tr>
              <tr>
                <td>WireGuard</td>
                <td className="mono ns-small">UDP 51820 (default)</td>
                <td>Modern, small and fast; remote access and site-to-site</td>
              </tr>
              <tr>
                <td>OpenVPN</td>
                <td className="mono ns-small">UDP or TCP 1194 (default)</td>
                <td>Long-standing open-source remote access</td>
              </tr>
              <tr>
                <td>SSL/TLS VPN</td>
                <td className="mono ns-small">TCP 443</td>
                <td>Vendor remote-access clients; works through hotel firewalls that only allow web traffic</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          A remote-access VPN puts one device into the company network. A site-to-site VPN joins two networks through their gateways. Zero trust network access (ZTNA)
          is the newer idea: instead of putting you on the network, a broker checks your identity and device for each application you open. Vendor remote access to
          plant machines should go through one of these with MFA, never through a forwarded port; see{" "}
          <LessonLink id="net-nat-port-forwarding">NAT and Port Forwarding</LessonLink>.
        </p>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
    </div>
  );
}

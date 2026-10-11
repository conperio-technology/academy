import { useState } from "react";
import { LessonLink, Quiz, Terminal, type QuizItem } from "./netSecShared";

// DHCP step by step: the four-message exchange (DORA) with the real packet fields, plus the
// ways it goes wrong that IT people actually meet.

interface Packet {
  srcMac: string;
  dstMac: string;
  srcIp: string;
  dstIp: string;
  ports: string;
  fields: string;
}

interface Step {
  title: string;
  text: string;
  packet?: Packet;
  bad?: boolean;
}

const CLIENT_MAC = "02:00:00:00:00:0c";
const SERVER_MAC = "02:00:00:00:00:0a";
const ROGUE_MAC = "02:00:00:00:00:ee";

const discover: Step = {
  title: "Discover",
  text: "The new laptop has no address yet, so it sends from 0.0.0.0 to the broadcast address 255.255.255.255: \"is there a DHCP server out there?\"",
  packet: { srcMac: CLIENT_MAC, dstMac: "ff:ff:ff:ff:ff:ff", srcIp: "0.0.0.0", dstIp: "255.255.255.255", ports: "UDP 68 → 67", fields: "message type DISCOVER, client MAC, requested options: mask, router, DNS" },
};

const offer = (ip: string, router: string, dns: string, srvIp: string, srvMac: string): Step => ({
  title: "Offer",
  text: `A DHCP server at ${srvIp} offers ${ip} and the settings that go with it.`,
  packet: {
    srcMac: srvMac,
    dstMac: CLIENT_MAC,
    srcIp: srvIp,
    dstIp: ip,
    ports: "UDP 67 → 68",
    fields: `your address ${ip}, mask 255.255.255.0, router ${router}, DNS ${dns}, lease 1h, server ID ${srvIp}`,
  },
});

const request = (ip: string, srvIp: string): Step => ({
  title: "Request",
  text: `Still broadcast, so every DHCP server hears which offer was accepted (any others take theirs back): "I'd like ${ip} from ${srvIp}, please."`,
  packet: { srcMac: CLIENT_MAC, dstMac: "ff:ff:ff:ff:ff:ff", srcIp: "0.0.0.0", dstIp: "255.255.255.255", ports: "UDP 68 → 67", fields: `message type REQUEST, requested address ${ip}, server ID ${srvIp}` },
});

const ack = (ip: string, srvIp: string, srvMac: string): Step => ({
  title: "Acknowledge",
  text: `The server confirms and records the lease. The laptop configures ${ip}/24 and can now talk.`,
  packet: { srcMac: srvMac, dstMac: CLIENT_MAC, srcIp: srvIp, dstIp: ip, ports: "UDP 67 → 68", fields: "message type ACK, lease 1h, T1 (renew) 30m, T2 (rebind) 52m30s" },
});

const SCENARIOS: { id: string; label: string; steps: Step[] }[] = [
  {
    id: "normal",
    label: "Normal: DORA",
    steps: [discover, offer("10.1.1.105", "10.1.1.1", "10.1.1.53", "10.1.1.10", SERVER_MAC), request("10.1.1.105", "10.1.1.10"), ack("10.1.1.105", "10.1.1.10", SERVER_MAC)],
  },
  {
    id: "renew",
    label: "Renewing a lease",
    steps: [
      { title: "Half the lease gone (T1)", text: "After 30 minutes of a 1 hour lease the laptop asks its own server directly (unicast, not broadcast) to extend it." },
      {
        title: "Request (renew)",
        text: "Now it has an address, so it sends from it.",
        packet: { srcMac: CLIENT_MAC, dstMac: SERVER_MAC, srcIp: "10.1.1.105", dstIp: "10.1.1.10", ports: "UDP 68 → 67", fields: "message type REQUEST, client address 10.1.1.105" },
      },
      ack("10.1.1.105", "10.1.1.10", SERVER_MAC),
      {
        title: "If the server never answers",
        text: "At T2 (87.5% of the lease, 52m30s here) the laptop broadcasts to any DHCP server. If the lease runs out with no answer it must stop using the address. That's why a DHCP server outage shows up gradually, as leases expire, not all at once.",
      },
    ],
  },
  {
    id: "exhausted",
    label: "Pool exhausted",
    steps: [
      { ...discover, text: "A visitor's laptop joins a busy guest network whose pool of 50 addresses is fully leased." },
      { title: "No offer", text: "The server has nothing to offer, so it stays silent. The client retries a few times.", bad: true },
      {
        title: "Self-assigned address",
        text: "Windows and macOS give up and pick a link-local address in 169.254.0.0/16 (APIPA). It can only talk to other link-local devices on the same segment: no gateway, no internet. A 169.254.x.x address almost always means \"DHCP didn't answer\". Fixes: a bigger pool, shorter leases on guest networks, or check that the DHCP server or relay is up.",
        bad: true,
        packet: { srcMac: CLIENT_MAC, dstMac: "(none)", srcIp: "169.254.37.112", dstIp: "", ports: "", fields: "self-assigned, mask 255.255.0.0, no gateway" },
      },
    ],
  },
  {
    id: "rogue",
    label: "Rogue DHCP server",
    steps: [
      { ...discover, text: "Someone plugged a home router into an office wall socket. Its DHCP server is on, and it's on the same LAN." },
      { ...offer("192.168.0.100", "192.168.0.1", "192.168.0.1", "192.168.0.1", ROGUE_MAC), title: "Offer from the home router", bad: true, text: "The home router answers first, offering an address in its own 192.168.0.0/24." },
      { ...offer("10.1.1.106", "10.1.1.1", "10.1.1.53", "10.1.1.10", SERVER_MAC), title: "Offer from the real server", text: "The real server's offer arrives a moment later." },
      {
        ...request("192.168.0.100", "192.168.0.1"),
        bad: true,
        text: "Clients usually take the first offer. This laptop now has the wrong subnet, gateway and DNS: users report \"some PCs can't reach anything\". An attacker can do the same on purpose to become everyone's gateway and DNS. Managed switches block it with DHCP snooping: only the port facing the real server may send offers.",
      },
    ],
  },
  {
    id: "reservation",
    label: "Reservation",
    steps: [
      { ...discover, text: "A label printer with MAC 02:00:00:00:00:0c boots up." },
      {
        ...offer("10.1.1.50", "10.1.1.1", "10.1.1.53", "10.1.1.10", SERVER_MAC),
        text: "The server has a reservation for that MAC address, so it always offers 10.1.1.50. Printers, PLCs and servers keep a predictable address while settings stay managed in one place.",
      },
      request("10.1.1.50", "10.1.1.10"),
      ack("10.1.1.50", "10.1.1.10", SERVER_MAC),
    ],
  },
];

const QUIZ: QuizItem[] = [
  {
    q: "A user's PC shows the address 169.254.12.7. What's the first thing to suspect?",
    options: ["A virus", "The PC didn't get an answer from a DHCP server", "The DNS server is down"],
    answer: 1,
    why: "169.254.0.0/16 is the self-assigned (APIPA) range used when DHCP fails. Check the cable or Wi-Fi association, the VLAN the port is in, the DHCP relay and whether the pool is full.",
  },
  {
    q: "Why does a DHCP Discover come from 0.0.0.0?",
    options: ["It's a bug", "The client has no address yet, so 0.0.0.0 means \"no address\"", "To hide the client"],
    answer: 1,
    why: "And it goes to 255.255.255.255 because the client doesn't know where the server is. Routers don't forward broadcasts, which is why a server on another subnet needs a DHCP relay (\"ip helper\") on the router.",
  },
  {
    q: "Which UDP ports does DHCP use?",
    options: ["53 and 54", "67 (server) and 68 (client)", "80 and 443"],
    answer: 1,
    why: "A firewall between clients and a DHCP server on another subnet needs UDP 67 open between the relay (the router's ip helper) and the server; 68 is only used on the client's own subnet. 53 is DNS.",
  },
  {
    q: "A PLC needs a fixed address. Which is better on a managed network?",
    options: ["Pick any free address and hope", "A DHCP reservation or a static address outside the DHCP pool, documented", "A static address inside the DHCP pool"],
    answer: 1,
    why: "A static address inside the pool will eventually be handed to someone else too: an address conflict. Reserve it, or exclude a static range from the pool.",
  },
];

export function Dhcp() {
  const [scenario, setScenario] = useState("normal");
  const [step, setStep] = useState(0);
  const sc = SCENARIOS.find((s) => s.id === scenario)!;
  const shown = sc.steps.slice(0, step + 1);

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={s.id === scenario ? "active" : ""}
            onClick={() => {
              setScenario(s.id);
              setStep(0);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="darr-actions">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </button>
        <button disabled={step === sc.steps.length - 1} onClick={() => setStep(step + 1)}>
          Next message
        </button>
        <span className="status-text">
          {step + 1} of {sc.steps.length}
        </span>
      </div>
      <ol className="auth-stages">
        {shown.map((s, i) => (
          <li key={i} className={`auth-stage ${s.bad ? "auth-fail" : i === step ? "auth-pass" : ""}`}>
            <span className="auth-icon">{i + 1}</span>
            <div className="ns-min0">
              <strong>{s.title}</strong>
              <p>{s.text}</p>
              {s.packet && (
                <div className="cm-scroll">
                  <table className="bigo-table ns-packet">
                    <tbody>
                      <tr>
                        <td>Ethernet</td>
                        <td className="mono ns-small">
                          {s.packet.srcMac} → {s.packet.dstMac}
                        </td>
                      </tr>
                      {s.packet.srcIp && (
                        <tr>
                          <td>IP</td>
                          <td className="mono ns-small">
                            {s.packet.srcIp}
                            {s.packet.dstIp ? ` → ${s.packet.dstIp}` : ""}
                          </td>
                        </tr>
                      )}
                      {s.packet.ports && (
                        <tr>
                          <td>Ports</td>
                          <td className="mono ns-small">{s.packet.ports}</td>
                        </tr>
                      )}
                      <tr>
                        <td>DHCP</td>
                        <td className="ns-small">{s.packet.fields}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="crypto-section">
        <h3>A real lease on Linux</h3>
        <p className="gate-note">
          dnsmasq as the DHCP server (pool 10.1.1.100 to 10.1.1.150, 1 hour leases) and BusyBox's udhcpc as the client, in two network namespaces on one bridge.
        </p>
        <Terminal
          command="udhcpc -i e3 -f -q -n     # the client"
          output={`udhcpc: started, v1.36.1
udhcpc: broadcasting discover
udhcpc: broadcasting discover
udhcpc: broadcasting select for 10.1.1.105, server 10.1.1.10
udhcpc: lease of 10.1.1.105 obtained from 10.1.1.10, lease time 3600`}
        />
        <Terminal
          command="dnsmasq --log-dhcp ...     # the server's log, one exchange"
          output={`DHCPDISCOVER(e1) 02:00:00:00:00:0c
DHCPOFFER(e1) 10.1.1.105 02:00:00:00:00:0c
DHCPREQUEST(e1) 10.1.1.105 02:00:00:00:00:0c
DHCPACK(e1) 10.1.1.105 02:00:00:00:00:0c
sent size:  4 option: 51 lease-time  1h
sent size:  4 option: 58 T1  30m
sent size:  4 option: 59 T2  52m30s
sent size:  4 option:  1 netmask  255.255.255.0
sent size:  4 option:  6 dns-server  10.1.1.53
sent size:  4 option:  3 router  10.1.1.1`}
        />
        <Terminal
          command="tcpdump -n -i e3 port 67 or port 68"
          output={`0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from 02:00:00:00:00:0c, length 300
10.1.1.10.67 > 10.1.1.105.68: BOOTP/DHCP, Reply, length 300
0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from 02:00:00:00:00:0c, length 300
10.1.1.10.67 > 10.1.1.105.68: BOOTP/DHCP, Reply, length 300`}
          source="Real output, trimmed: timestamps and the transaction ID removed, and the server log shows one of the two discover/offer rounds (the client sent a second discover before the first offer arrived). tcpdump labels every DHCP message BOOTP, the older protocol DHCP extends."
        />
        <p className="gate-note">
          On Windows, <code>ipconfig /all</code> shows the lease and the DHCP server, and <code>ipconfig /release</code> then <code>ipconfig /renew</code> runs the
          exchange again. The lease includes the DNS server too, which is where <LessonLink id="dns-and-http">DNS &amp; HTTP</LessonLink> picks up.
        </p>
      </div>

      <Quiz items={QUIZ} title="Check yourself" />
    </div>
  );
}

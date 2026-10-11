import { useMemo, useState } from "react";
import { classify, firstHost as netFirst, ipToString, lastHost as netLast, networkOf, parseIp as parseIpNum, totalAddresses as netTotal, usableHosts as netUsable } from "../../netMath";
import { LessonLink } from "./netSecShared";

function parseIp(ip: string): number[] | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

function octetsToInt(octets: number[]): number {
  return (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
}

function intToIp(n: number): string {
  return [24, 16, 8, 0].map((shift) => (n >>> shift) & 0xff).join(".");
}

function maskFromPrefix(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function intToBinaryGroups(n: number): string {
  return [24, 16, 8, 0].map((shift) => (((n >>> shift) & 0xff) >>> 0).toString(2).padStart(8, "0")).join(" ");
}

interface Result {
  mask: string;
  network: string;
  broadcast: string;
  firstHost: string | null;
  lastHost: string | null;
  totalAddresses: number;
  usableHosts: number;
  ipBinary: string;
}

function calculate(ip: string, prefix: number): Result | null {
  const octets = parseIp(ip);
  if (!octets) return null;

  const ipInt = octetsToInt(octets);
  const mask = maskFromPrefix(prefix);
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  // /31 (RFC 3021, point-to-point links) and /32 (one host) don't reserve network and broadcast.
  const usableHosts = netUsable(prefix);

  return {
    mask: intToIp(mask),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(netFirst(ipInt, prefix)),
    lastHost: intToIp(netLast(ipInt, prefix)),
    totalAddresses,
    usableHosts,
    ipBinary: intToBinaryGroups(ipInt),
  };
}

export function IpSubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.10");
  const [prefix, setPrefix] = useState(24);

  const result = useMemo(() => calculate(ip, prefix), [ip, prefix]);

  // Which of the 32 binary characters (spaces included, at every 9th position) fall in
  // the network portion vs the host portion, for the two-tone binary readout.
  const networkCharCount = prefix + Math.floor(prefix / 8);

  return (
    <div className="tool-widget">
      <div className="tool-inputs ip-inputs">
        <label>
          IP address
          <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.10" />
        </label>
        <label>
          Prefix (CIDR)
          <div className="ip-prefix-input">
            /
            <input
              type="number"
              min={0}
              max={32}
              value={prefix}
              onChange={(e) => setPrefix(Math.max(0, Math.min(32, Number(e.target.value) || 0)))}
            />
          </div>
        </label>
      </div>

      {!result && <p className="status-text error">Not a valid IPv4 address (need 4 octets, each 0-255).</p>}

      {result && (
        <>
          <div className="ip-binary-readout">
            <span className="readout-label">
              {ip}/{prefix} in binary (network bits highlighted)
            </span>
            <div className="ip-binary-string">
              <span className="ip-binary-network">{result.ipBinary.slice(0, networkCharCount)}</span>
              <span className="ip-binary-host">{result.ipBinary.slice(networkCharCount)}</span>
            </div>
          </div>

          <div className="tool-readout ip-result-grid">
            <div className="readout-cell">
              <span className="readout-label">Subnet mask</span>
              <span className="readout-value">{result.mask}</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">Network address</span>
              <span className="readout-value">{result.network}</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">Broadcast address</span>
              <span className="readout-value">{result.broadcast}</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">Usable host range</span>
              <span className="readout-value">
                {result.firstHost === result.lastHost ? result.firstHost : `${result.firstHost} to ${result.lastHost}`}
              </span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">Total addresses</span>
              <span className="readout-value">{result.totalAddresses.toLocaleString()}</span>
            </div>
            <div className="readout-cell">
              <span className="readout-label">Usable hosts</span>
              <span className="readout-value">{result.usableHosts.toLocaleString()}</span>
            </div>
          </div>
          {prefix >= 31 && (
            <p className="gate-note">
              {prefix === 31
                ? "A /31 has no room for separate network and broadcast addresses, so RFC 3021 lets both addresses be used on a point-to-point link between two routers."
                : "A /32 is exactly one address: used for a single host route or a loopback address on a router."}
            </p>
          )}
          <AddressKind ip={ip} />
          <SubnetSplitter ip={ip} prefix={prefix} />
        </>
      )}
    </div>
  );
}

function AddressKind({ ip }: { ip: string }) {
  const n = parseIpNum(ip);
  if (n === null) return null;
  const c = classify(n);
  return (
    <div className="drill-feedback">
      <p>
        <strong>What kind of address is {ip.trim()}?</strong> {c.label}
        {c.range ? ` (${c.range})` : ""}. {c.note}
      </p>
    </div>
  );
}

// Split the current network into equal smaller subnets, the everyday "carve a /24 into VLANs" job.
function SubnetSplitter({ ip, prefix }: { ip: string; prefix: number }) {
  const [extra, setExtra] = useState(2);
  const n = parseIpNum(ip);
  if (n === null || prefix > 29) return null;
  const bits = Math.min(extra, 30 - prefix);
  const newPrefix = prefix + bits;
  const count = 2 ** bits;
  const base = networkOf(n, prefix);
  const shown = Math.min(count, 16);
  return (
    <div className="crypto-section ns-splitter">
      <h3>Split {ipToString(base)}/{prefix} into smaller subnets</h3>
      <label className="tool-checkbox">
        Borrow{" "}
        <input
          type="range"
          min={1}
          max={Math.max(1, 30 - prefix)}
          value={bits}
          onChange={(e) => setExtra(Number(e.target.value))}
          aria-label="Bits to borrow"
        />{" "}
        {bits} bit{bits === 1 ? "" : "s"}: {count.toLocaleString()} subnets of /{newPrefix}, {netUsable(newPrefix).toLocaleString()} usable hosts each
      </label>
      <div className="cm-scroll">
        <table className="bigo-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Subnet</th>
              <th>Usable hosts</th>
              <th>Broadcast</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: shown }, (_, i) => {
              const start = base + i * netTotal(newPrefix);
              return (
                <tr key={i}>
                  <td className="mono">{i + 1}</td>
                  <td className="mono">
                    {ipToString(start)}/{newPrefix}
                  </td>
                  <td className="mono">
                    {ipToString(netFirst(start, newPrefix))} to {ipToString(netLast(start, newPrefix))}
                  </td>
                  <td className="mono">{newPrefix >= 31 ? "none" : ipToString(start + netTotal(newPrefix) - 1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {count > shown && <p className="gate-note">First {shown} of {count.toLocaleString()} shown. Each starts {netTotal(newPrefix).toLocaleString()} addresses after the one before.</p>}
      <p className="gate-note">
        Practise this by hand, with as many generated questions as you like, in <LessonLink id="net-subnetting-practice">Subnetting Practice</LessonLink>.
      </p>
    </div>
  );
}

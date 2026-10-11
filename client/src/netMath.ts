// IPv4 arithmetic shared by the Networking lessons (the subnet calculator, the subnetting
// drills, routing and NAT simulators). Addresses are unsigned 32-bit numbers held in plain JS
// numbers; every bitwise result is forced back to unsigned with `>>> 0`.

export function parseIp(text: string): number | null {
  const parts = text.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

export function ipToString(n: number): string {
  return [24, 16, 8, 0].map((s) => (n >>> s) & 0xff).join(".");
}

export function maskFromPrefix(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

// The prefix length of a dotted mask, or null when the ones aren't contiguous (255.0.255.0).
export function prefixFromMask(mask: number): number | null {
  for (let p = 0; p <= 32; p++) if (maskFromPrefix(p) === mask) return p;
  return null;
}

export function networkOf(ip: number, prefix: number): number {
  return (ip & maskFromPrefix(prefix)) >>> 0;
}

export function broadcastOf(ip: number, prefix: number): number {
  return (networkOf(ip, prefix) | (~maskFromPrefix(prefix) >>> 0)) >>> 0;
}

export function totalAddresses(prefix: number): number {
  return 2 ** (32 - prefix);
}

// Usable host addresses: everything except the network and broadcast addresses. /31 is the
// RFC 3021 exception (two addresses, both usable, on a point-to-point link) and /32 is a single
// host route.
export function usableHosts(prefix: number): number {
  if (prefix === 32) return 1;
  if (prefix === 31) return 2;
  return totalAddresses(prefix) - 2;
}

export function firstHost(ip: number, prefix: number): number {
  return prefix >= 31 ? networkOf(ip, prefix) : networkOf(ip, prefix) + 1;
}

export function lastHost(ip: number, prefix: number): number {
  return prefix >= 31 ? broadcastOf(ip, prefix) : broadcastOf(ip, prefix) - 1;
}

export function sameSubnet(a: number, b: number, prefix: number): boolean {
  return networkOf(a, prefix) === networkOf(b, prefix);
}

// The smallest subnet (largest prefix) with at least `hosts` usable addresses, using the
// ordinary "minus two" rule, so it never answers /31 or /32.
export function prefixForHosts(hosts: number): number {
  for (let p = 30; p >= 0; p--) if (totalAddresses(p) - 2 >= hosts) return p;
  return 0;
}

export function toBinary(n: number): string {
  return [24, 16, 8, 0].map((s) => ((n >>> s) & 0xff).toString(2).padStart(8, "0")).join(".");
}

export type AddressKind =
  | "private"
  | "public"
  | "loopback"
  | "link-local"
  | "cgnat"
  | "this-network"
  | "documentation"
  | "multicast"
  | "reserved"
  | "broadcast";

export interface AddressClass {
  kind: AddressKind;
  label: string;
  range: string;
  note: string;
}

// Special ranges an IT person meets in practice (RFC 1918, 1122, 3927, 5737, 6598, 5771, 1112).
export const SPECIAL_RANGES: { cidr: string; kind: AddressKind; label: string; note: string }[] = [
  { cidr: "0.0.0.0/8", kind: "this-network", label: "This network", note: "Means \"no address yet\". A DHCP client sends from 0.0.0.0 before it has a lease, and a server listening on 0.0.0.0 listens on every interface." },
  { cidr: "10.0.0.0/8", kind: "private", label: "Private (RFC 1918)", note: "The biggest private block, popular for company networks. Not routed on the public internet, so it needs NAT to get out." },
  { cidr: "100.64.0.0/10", kind: "cgnat", label: "Carrier-grade NAT (RFC 6598)", note: "Shared address space ISPs use between their own NAT and your router. Seeing it on your router's WAN side means you are behind your ISP's NAT and port forwarding from the internet will not work." },
  { cidr: "127.0.0.0/8", kind: "loopback", label: "Loopback", note: "Never leaves the machine. 127.0.0.1 is \"this computer\"." },
  { cidr: "169.254.0.0/16", kind: "link-local", label: "Link-local (APIPA)", note: "Self-assigned when DHCP fails. A PC with 169.254.x.x usually means \"no DHCP server answered\"." },
  { cidr: "172.16.0.0/12", kind: "private", label: "Private (RFC 1918)", note: "172.16.0.0 to 172.31.255.255. Docker's default bridge network uses 172.17.0.0/16 from this block." },
  { cidr: "192.0.2.0/24", kind: "documentation", label: "Documentation (TEST-NET-1)", note: "Reserved for examples in books and docs, like example.com for names." },
  { cidr: "192.168.0.0/16", kind: "private", label: "Private (RFC 1918)", note: "The usual home and small office range: 192.168.0.x and 192.168.1.x are router defaults." },
  { cidr: "198.51.100.0/24", kind: "documentation", label: "Documentation (TEST-NET-2)", note: "Reserved for examples." },
  { cidr: "203.0.113.0/24", kind: "documentation", label: "Documentation (TEST-NET-3)", note: "Reserved for examples." },
  { cidr: "224.0.0.0/4", kind: "multicast", label: "Multicast", note: "One sender, many receivers that joined a group. Used by some industrial protocols and by service discovery." },
  { cidr: "255.255.255.255/32", kind: "broadcast", label: "Limited broadcast", note: "Every device on the local network segment. Routers never forward it." },
  { cidr: "240.0.0.0/4", kind: "reserved", label: "Reserved (former class E)", note: "Set aside for future use and not usable on normal networks." },
];

export function parseCidr(cidr: string): { ip: number; prefix: number } | null {
  const [a, p] = cidr.split("/");
  const ip = parseIp(a);
  const prefix = Number(p);
  if (ip === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
  return { ip, prefix };
}

export function classify(ip: number): AddressClass {
  for (const r of SPECIAL_RANGES) {
    const c = parseCidr(r.cidr)!;
    if (sameSubnet(ip, c.ip, c.prefix)) return { kind: r.kind, label: r.label, range: r.cidr, note: r.note };
  }
  return { kind: "public", label: "Public", range: "", note: "Globally routable: reachable across the internet if nothing blocks it." };
}

export function inCidr(ip: number, cidr: string): boolean {
  const c = parseCidr(cidr);
  return c !== null && sameSubnet(ip, c.ip, c.prefix);
}

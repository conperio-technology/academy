// Randomized subnetting questions for the Subnetting Practice lesson. Each question carries
// its own worked explanation, built from the same numbers, so every answer can be explained.
// `rand` is injectable so the generator can be checked with a seeded source.

import {
  broadcastOf,
  classify,
  firstHost,
  ipToString,
  lastHost,
  maskFromPrefix,
  networkOf,
  parseIp,
  prefixForHosts,
  sameSubnet,
  totalAddresses,
  type AddressKind,
} from "./netMath";

export type DrillTopic = "network" | "broadcast" | "hosts" | "range" | "mask" | "fit" | "same" | "kind" | "split";
export type Difficulty = "easy" | "normal" | "hard";

export const DRILL_TOPICS: { id: DrillTopic; label: string }[] = [
  { id: "network", label: "Network address" },
  { id: "broadcast", label: "Broadcast address" },
  { id: "range", label: "First and last host" },
  { id: "hosts", label: "Hosts per subnet" },
  { id: "mask", label: "Mask and prefix" },
  { id: "fit", label: "Size a subnet" },
  { id: "same", label: "Same subnet?" },
  { id: "split", label: "Splitting a network" },
  { id: "kind", label: "Private or public?" },
];

export interface DrillQuestion {
  topic: DrillTopic;
  prompt: string;
  // "address" answers are compared as IPv4 numbers, "prefix" accepts 26 or /26, "number"
  // ignores thousands separators, "choice" is one of `choices`.
  answerType: "address" | "prefix" | "number" | "choice";
  choices?: string[];
  answer: string;
  steps: string[];
}

type Rand = () => number;

const int = (rand: Rand, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = <T,>(rand: Rand, xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)];

function prefixFor(rand: Rand, d: Difficulty): number {
  if (d === "easy") return pick(rand, [8, 16, 24]);
  if (d === "normal") return int(rand, 24, 30);
  let p = int(rand, 9, 30);
  while (p % 8 === 0) p = int(rand, 9, 30);
  return p;
}

// A host-looking address in one of the private ranges most networks use.
// Wide prefixes stay in 10.0.0.0/8 so the question looks like a real network plan.
function randomIp(rand: Rand, prefix = 24): number {
  const base = prefix <= 12 ? "10" : prefix <= 16 ? pick(rand, ["10", "172"]) : pick(rand, ["10", "172", "192"]);
  const o = () => int(rand, 0, 255);
  const text = base === "10" ? `10.${o()}.${o()}.${o()}` : base === "172" ? `172.${int(rand, 16, 31)}.${o()}.${o()}` : `192.168.${o()}.${o()}`;
  return parseIp(text)!;
}

const fmt = (n: number) => n.toLocaleString("en-US");
const maskText = (p: number) => ipToString(maskFromPrefix(p));

// The "block size" walk-through used by most explanations: which octet the mask splits,
// how big each subnet is in that octet, and where this address's block starts.
function blockSteps(ip: number, prefix: number): string[] {
  const mask = maskText(prefix);
  if (prefix % 8 === 0) {
    const whole = prefix / 8;
    return [
      whole === 1
        ? `/${prefix} is the mask ${mask}: the first octet is network, the other three are host.`
        : `/${prefix} is the mask ${mask}: the first ${whole} octets are network, the rest are host.`,
      `So keep the first ${whole === 1 ? "octet" : `${whole} octets`} of ${ipToString(ip)} and set the others to 0 for the network address, or 255 for the broadcast address.`,
    ];
  }
  const k = Math.floor(prefix / 8); // index of the octet the mask splits
  const maskOctet = (maskFromPrefix(prefix) >>> (24 - 8 * k)) & 0xff;
  const block = 256 - maskOctet;
  const v = (ip >>> (24 - 8 * k)) & 0xff;
  const start = Math.floor(v / block) * block;
  const ordinal = ["first", "second", "third", "fourth"][k];
  return [
    `/${prefix} is the mask ${mask}. The ${ordinal} octet (${maskOctet}) is the one the mask splits, so that's where to look.`,
    `Block size = 256 - ${maskOctet} = ${block}. Subnets start at multiples of ${block} in that octet: 0, ${block}, ${block * 2}, ${block * 3}, and so on.`,
    `The address has ${v} there. ${v} sits in the block that starts at ${start} (${start} to ${start + block - 1}), because ${Math.floor(v / block)} × ${block} = ${start}.`,
    `In binary: ${v.toString(2).padStart(8, "0")} AND ${maskOctet.toString(2).padStart(8, "0")} = ${start.toString(2).padStart(8, "0")}, which is ${start}.`,
    k < 3
      ? `Octets after the ${ordinal} are all host bits: 0 in the network address and 255 in the broadcast address.`
      : `It's the last octet, so there are no octets after it.`,
  ];
}

function networkQ(rand: Rand, d: Difficulty): DrillQuestion {
  const p = prefixFor(rand, d);
  const ip = randomIp(rand, p);
  const net = ipToString(networkOf(ip, p));
  return {
    topic: "network",
    prompt: `What is the network address of ${ipToString(ip)}/${p}?`,
    answerType: "address",
    answer: net,
    steps: [...blockSteps(ip, p), `Network address: ${net}.`],
  };
}

function broadcastQ(rand: Rand, d: Difficulty): DrillQuestion {
  const p = prefixFor(rand, d);
  const ip = randomIp(rand, p);
  const bc = ipToString(broadcastOf(ip, p));
  const net = ipToString(networkOf(ip, p));
  return {
    topic: "broadcast",
    prompt: `What is the broadcast address of ${ipToString(ip)}/${p}?`,
    answerType: "address",
    answer: bc,
    steps: [
      ...blockSteps(ip, p),
      `The network address is ${net}. The broadcast address is the last address in the same block, one before the next subnet starts: ${bc}.`,
    ],
  };
}

function rangeQ(rand: Rand, d: Difficulty): DrillQuestion {
  const p = Math.min(prefixFor(rand, d), 30);
  const ip = randomIp(rand, p);
  const first = rand() < 0.5;
  const net = ipToString(networkOf(ip, p));
  const bc = ipToString(broadcastOf(ip, p));
  const answer = ipToString(first ? firstHost(ip, p) : lastHost(ip, p));
  return {
    topic: "range",
    prompt: `${ipToString(ip)}/${p}: what is the ${first ? "first" : "last"} usable host address?`,
    answerType: "address",
    answer,
    steps: [
      ...blockSteps(ip, p),
      `Network ${net}, broadcast ${bc}. Neither can be given to a device.`,
      first ? `First usable host = network + 1 = ${answer}.` : `Last usable host = broadcast - 1 = ${answer}.`,
    ],
  };
}

function hostsQ(rand: Rand, d: Difficulty): DrillQuestion {
  const p = d === "easy" ? pick(rand, [24, 16, 30, 29]) : d === "normal" ? int(rand, 22, 30) : int(rand, 12, 30);
  const hostBits = 32 - p;
  const usable = totalAddresses(p) - 2;
  return {
    topic: "hosts",
    prompt: `How many usable host addresses does a /${p} subnet have?`,
    answerType: "number",
    answer: String(usable),
    steps: [
      `/${p} leaves 32 - ${p} = ${hostBits} host bits.`,
      `${hostBits} bits give 2^${hostBits} = ${fmt(totalAddresses(p))} addresses.`,
      `Take away the network address (all host bits 0) and the broadcast address (all host bits 1): ${fmt(totalAddresses(p))} - 2 = ${fmt(usable)}.`,
    ],
  };
}

function maskQ(rand: Rand, d: Difficulty): DrillQuestion {
  const p = d === "easy" ? pick(rand, [8, 16, 24]) : d === "normal" ? int(rand, 24, 30) : int(rand, 9, 30);
  const mask = maskText(p);
  const k = Math.floor(p / 8);
  const rem = p % 8;
  const bits = [
    `/${p} means ${p} one bits followed by ${32 - p} zero bits.`,
    `${k} full octet${k === 1 ? "" : "s"} of ones = 255${k > 1 ? " each" : ""}${rem ? `, then ${rem} one bit${rem === 1 ? "" : "s"} in the next octet: ${"1".repeat(rem)}${"0".repeat(8 - rem)} = ${256 - 2 ** (8 - rem)}` : ""}.`,
    `So /${p} = ${mask}.`,
  ];
  if (rand() < 0.5) {
    return { topic: "mask", prompt: `Write /${p} as a dotted subnet mask.`, answerType: "address", answer: mask, steps: bits };
  }
  return {
    topic: "mask",
    prompt: `What prefix length is the subnet mask ${mask}?`,
    answerType: "prefix",
    answer: `/${p}`,
    steps: [`Count the one bits. ${bits[1].replace(/\.$/, "")}.`, `That's ${p} ones, so the prefix is /${p}.`],
  };
}

function fitQ(rand: Rand, d: Difficulty): DrillQuestion {
  const hosts = d === "easy" ? pick(rand, [10, 25, 50, 100, 200]) : d === "normal" ? int(rand, 3, 250) : int(rand, 3, 4000);
  const p = prefixForHosts(hosts);
  const bits = 32 - p;
  return {
    topic: "fit",
    prompt: `A new office VLAN needs ${fmt(hosts)} device addresses. What is the smallest subnet (the longest prefix) that fits?`,
    answerType: "prefix",
    answer: `/${p}`,
    steps: [
      `You need 2^h - 2 ≥ ${fmt(hosts)}, where h is the number of host bits.`,
      bits > 2 ? `h = ${bits - 1} gives 2^${bits - 1} - 2 = ${fmt(2 ** (bits - 1) - 2)}, not enough.` : `h = 2 is the smallest that leaves any usable hosts.`,
      `h = ${bits} gives 2^${bits} - 2 = ${fmt(2 ** bits - 2)}, enough.`,
      `Prefix = 32 - ${bits} = /${p} (mask ${maskText(p)}). In real life leave room to grow: the next size up costs nothing on a private network.`,
    ],
  };
}

function sameQ(rand: Rand, d: Difficulty): DrillQuestion {
  const p = prefixFor(rand, d === "easy" ? "normal" : d);
  const a = randomIp(rand, p);
  const net = networkOf(a, p);
  const size = totalAddresses(p);
  // Half the time pick a neighbour in the same block, otherwise one just outside it.
  let b: number;
  if (rand() < 0.5) b = net + int(rand, 1, Math.max(1, size - 2));
  else b = rand() < 0.5 && net >= size ? net - int(rand, 1, Math.min(size, 200)) : net + size + int(rand, 0, Math.min(size - 1, 200));
  b = b >>> 0;
  const same = sameSubnet(a, b, p);
  const na = ipToString(networkOf(a, p));
  const nb = ipToString(networkOf(b, p));
  return {
    topic: "same",
    prompt: `With a /${p} mask, are ${ipToString(a)} and ${ipToString(b)} on the same subnet?`,
    answerType: "choice",
    choices: ["Yes", "No"],
    answer: same ? "Yes" : "No",
    steps: [
      `Work out the network address of each with /${p} (mask ${maskText(p)}).`,
      `${ipToString(a)} is in ${na}/${p}. ${ipToString(b)} is in ${nb}/${p}.`,
      same
        ? `Same network address, so they're on the same subnet and can talk directly (through a switch, with ARP).`
        : `Different network addresses, so traffic between them has to go through a router (the default gateway).`,
    ],
  };
}

function splitQ(rand: Rand, d: Difficulty): DrillQuestion {
  const p = d === "easy" ? pick(rand, [16, 24]) : d === "normal" ? pick(rand, [22, 23, 24]) : int(rand, 12, 24);
  const q = Math.min(30, p + (d === "easy" ? pick(rand, [1, 2, 8]) : int(rand, 1, 6)));
  const count = 2 ** (q - p);
  const base = networkOf(randomIp(rand, p), p);
  if (rand() < 0.5 || count < 3) {
    return {
      topic: "split",
      prompt: `How many /${q} subnets fit in ${ipToString(base)}/${p}?`,
      answerType: "number",
      answer: String(count),
      steps: [
        `Going from /${p} to /${q} borrows ${q - p} host bit${q - p === 1 ? "" : "s"} for the subnet number.`,
        `${q - p} bit${q - p === 1 ? " gives" : "s give"} 2^${q - p} = ${fmt(count)} subnets, each with ${fmt(totalAddresses(q))} addresses (${fmt(totalAddresses(q) - 2)} usable).`,
      ],
    };
  }
  const n = int(rand, 2, Math.min(count, 8));
  const nth = (base + (n - 1) * totalAddresses(q)) >>> 0;
  const ordinal = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"][n];
  return {
    topic: "split",
    prompt: `${ipToString(base)}/${p} is split into /${q} subnets, numbered from the start. What is the network address of the ${ordinal} one?`,
    answerType: "address",
    answer: ipToString(nth),
    steps: [
      `Each /${q} holds 2^${32 - q} = ${fmt(totalAddresses(q))} addresses, so the subnets start every ${fmt(totalAddresses(q))} addresses.`,
      `The 1st starts at ${ipToString(base)}. The ${ordinal} starts ${n - 1} × ${fmt(totalAddresses(q))} = ${fmt((n - 1) * totalAddresses(q))} addresses later.`,
      `Adding that (carrying into the next octet every 256): ${ipToString(nth)}/${q}.`,
    ],
  };
}

const KIND_CHOICES: { kind: AddressKind; label: string }[] = [
  { kind: "private", label: "Private (RFC 1918)" },
  { kind: "public", label: "Public" },
  { kind: "loopback", label: "Loopback" },
  { kind: "link-local", label: "Link-local (APIPA)" },
  { kind: "cgnat", label: "Carrier-grade NAT" },
];

function kindQ(rand: Rand): DrillQuestion {
  const o = () => int(rand, 0, 255);
  const kind = pick(rand, ["private", "private", "private", "public", "public", "loopback", "link-local", "cgnat"] as const);
  let text: string;
  if (kind === "private") text = pick(rand, [`10.${o()}.${o()}.${o()}`, `172.${int(rand, 16, 31)}.${o()}.${o()}`, `192.168.${o()}.${o()}`]);
  else if (kind === "loopback") text = `127.${o()}.${o()}.${int(rand, 1, 254)}`;
  else if (kind === "link-local") text = `169.254.${int(rand, 1, 254)}.${o()}`;
  else if (kind === "cgnat") text = `100.${int(rand, 64, 127)}.${o()}.${o()}`;
  else {
    // Public, but chosen to look like the traps: 172.x just outside 16 to 31, 192.169.x, 100.x outside 64 to 127.
    text = pick(rand, [
      `172.${pick(rand, [int(rand, 1, 15), int(rand, 32, 99)])}.${o()}.${o()}`,
      `192.${pick(rand, [167, 169, 170])}.${o()}.${o()}`,
      `100.${pick(rand, [int(rand, 1, 63), int(rand, 128, 200)])}.${o()}.${o()}`,
      `${pick(rand, [8, 20, 52, 81, 145, 151])}.${o()}.${o()}.${o()}`,
    ]);
  }
  const ip = parseIp(text)!;
  const c = classify(ip);
  const label = KIND_CHOICES.find((k) => k.kind === c.kind)?.label ?? c.label;
  return {
    topic: "kind",
    prompt: `What kind of address is ${text}?`,
    answerType: "choice",
    choices: KIND_CHOICES.map((k) => k.label),
    answer: label,
    steps: [
      `The private ranges are 10.0.0.0/8, 172.16.0.0/12 (172.16 to 172.31 only) and 192.168.0.0/16. Loopback is 127.0.0.0/8, link-local is 169.254.0.0/16 and carrier-grade NAT is 100.64.0.0/10 (100.64 to 100.127).`,
      c.range ? `${text} falls in ${c.range}: ${c.label}.` : `${text} isn't in any of those ranges, so it's a public address.`,
      c.note,
    ],
  };
}

export function generateQuestion(topics: DrillTopic[], difficulty: Difficulty, rand: Rand = Math.random): DrillQuestion {
  const topic = pick(rand, topics.length > 0 ? topics : DRILL_TOPICS.map((t) => t.id));
  switch (topic) {
    case "network":
      return networkQ(rand, difficulty);
    case "broadcast":
      return broadcastQ(rand, difficulty);
    case "range":
      return rangeQ(rand, difficulty);
    case "hosts":
      return hostsQ(rand, difficulty);
    case "mask":
      return maskQ(rand, difficulty);
    case "fit":
      return fitQ(rand, difficulty);
    case "same":
      return sameQ(rand, difficulty);
    case "split":
      return splitQ(rand, difficulty);
    case "kind":
      return kindQ(rand);
  }
}

// True when the learner's typed answer means the same thing as the expected one.
export function checkAnswer(q: DrillQuestion, input: string): boolean {
  const t = input.trim();
  if (q.answerType === "address") {
    const a = parseIp(t);
    return a !== null && a === parseIp(q.answer);
  }
  if (q.answerType === "prefix") return t.replace(/^\//, "") === q.answer.replace(/^\//, "");
  if (q.answerType === "number") return t.replace(/[,\s_]/g, "") === q.answer;
  return t === q.answer;
}

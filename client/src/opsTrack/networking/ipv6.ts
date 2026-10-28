import { src, type OpsLessonData } from "../types.ts";

export const ipv6: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "IPv4 has about 4.3 billion addresses, and they ran out years ago; NAT and private ranges are what kept it going. IPv6 has 128-bit addresses, enough to give every device a globally unique address with room to spare, and it now carries a large and growing share of internet traffic. Phones on mobile networks are often IPv6 first, and every cloud and operating system supports it.",
        "Most networks run both at once (dual stack), so you need to read IPv6 addresses, know the address types, and understand how devices configure themselves without DHCP. This lesson covers that and ends with an address drill.",
      ],
    },
    {
      kind: "text",
      title: "Reading an address",
      paragraphs: [
        "An IPv6 address is eight groups of four hex digits separated by colons: 2001:0db8:0000:0042:0000:0000:0000:0001. Two rules shorten it. Leading zeros in a group can be dropped (0db8 becomes db8, 0042 becomes 42, 0000 becomes 0). And one run of consecutive all-zero groups can be replaced by ::, once per address, because using it twice would be ambiguous. So that address is 2001:db8:0:42::1.",
        "The standard form (RFC 5952) is lowercase, drops every leading zero, and uses :: for the longest run of two or more zero groups, the first one if two runs tie. A single zero group stays 0. Prefixes use CIDR notation as in IPv4: 2001:db8:abcd:12::/64 is the network whose first 64 bits are those.",
      ],
    },
    {
      kind: "table",
      title: "Address types",
      head: ["Type", "Prefix", "Example", "IPv4 equivalent"],
      rows: [
        ["Global unicast", "2000::/3", "2606:4700::1111", "a public address"],
        ["Unique local (ULA)", "fc00::/7 (fd00::/8 in use)", "fd12:3456:789a:1::10", "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16"],
        ["Link-local", "fe80::/10", "fe80::a1b2:c3ff:fed4:e5f6", "169.254.0.0/16, but always present and used"],
        ["Multicast", "ff00::/8", "ff02::1 (all nodes on the link)", "224.0.0.0/4; IPv6 has no broadcast"],
        ["Loopback", "::1/128", "::1", "127.0.0.1"],
        ["Unspecified", "::/128", "::", "0.0.0.0"],
        ["Documentation", "2001:db8::/32", "2001:db8::1", "192.0.2.0/24 and similar"],
      ],
      notes: ["Every IPv6 interface has a link-local address and usually one or more global ones as well, so seeing several addresses on one network card is normal. Link-local addresses are only meaningful on one link, which is why you sometimes see a zone such as fe80::1%eth0."],
    },
    {
      kind: "text",
      title: "Subnetting is simpler",
      paragraphs: [
        "IPv6 subnets are almost always /64: the first 64 bits name the network, the last 64 (the interface identifier) name the host. A /64 holds 2^64 addresses, so you never size a subnet by host count. An organization typically gets a /48 from its provider or registry, and a home connection a /56 or /48. A /48 contains 65,536 /64 subnets, and you plan by numbering them: the fourth group is usually the subnet number, such as 2001:db8:abcd:12::/64 for VLAN 12.",
        "There is no NAT in normal IPv6 designs. Every device can have a globally routable address, so the stateful firewall, not NAT, is what blocks unsolicited inbound connections. Home routers and cloud networks block inbound by default; servers must be firewalled as deliberately as they would be with a public IPv4 address.",
      ],
    },
    {
      kind: "code",
      title: "Working with IPv6 in Python",
      blocks: [
        {
          lang: "python",
          label: "ipv6_demo.py",
          code: src`
import ipaddress

addr = ipaddress.ip_address("2001:0db8:0000:0042:0000:0000:0000:0001")
print(addr)            # the standard short form
print(addr.exploded)   # all eight groups

net = ipaddress.ip_network("2001:db8:abcd::/48")
subnets = list(net.subnets(new_prefix=64))
print(len(subnets), subnets[0], subnets[-1])

host = ipaddress.ip_interface("2001:db8:abcd:12:a1b2:c3ff:fed4:e5f6/64")
print(host.network)

for a in ["2606:4700::1111", "fe80::1", "fd12:3456:789a::1", "::1"]:
    ip = ipaddress.ip_address(a)
    print(f"{a:18} global={ip.is_global} link-local={ip.is_link_local}")`,
          output: src`
2001:db8:0:42::1
2001:0db8:0000:0042:0000:0000:0000:0001
65536 2001:db8:abcd::/64 2001:db8:abcd:ffff::/64
2001:db8:abcd:12::/64
2606:4700::1111    global=True link-local=False
fe80::1            global=False link-local=True
fd12:3456:789a::1  global=False link-local=False
::1                global=False link-local=False`,
        },
      ],
      notes: ["In C#, `IPAddress.Parse(\"2001:0db8::42:0:0:0:1\").ToString()` gives the short form too. Always parse and compare addresses as addresses, never as strings: the same address has many spellings."],
    },
    {
      kind: "terms",
      title: "How hosts get their addresses",
      terms: [
        { term: "NDP (Neighbor Discovery Protocol)", meaning: "ICMPv6 messages that replace ARP (finding a neighbour's MAC address) and do router discovery and duplicate address detection. Blocking all ICMPv6 breaks IPv6." },
        { term: "Router advertisement (RA)", meaning: "a router periodically announces the network's prefix and whether hosts should use SLAAC or DHCPv6. A rogue RA from a misconfigured device can hijack a LAN, which is what RA Guard on switches prevents." },
        { term: "SLAAC (stateless address autoconfiguration)", meaning: "the host takes the advertised /64 prefix and makes up its own 64-bit interface identifier, with no server keeping track. This is the normal way devices get IPv6 addresses." },
        { term: "Privacy (temporary) addresses", meaning: "random interface identifiers that change regularly, used for outgoing connections so websites can't track a device by its address. Older SLAAC built the identifier from the MAC address (EUI-64, the ff:fe in the middle)." },
        { term: "DHCPv6", meaning: "a server hands out addresses or just DNS settings, for networks that want central records. Android doesn't support stateful DHCPv6, which is one reason SLAAC dominates." },
        { term: "Dual stack", meaning: "running IPv4 and IPv6 side by side on the same network. Clients that get both an A and an AAAA record race the two (Happy Eyeballs) and use whichever connects first." },
      ],
    },
    {
      kind: "widget",
      widget: "ipv6Drill",
      title: "Drill: read and write IPv6 addresses",
      intro: "Each question gives an address. Compress it to the standard form, expand it to all eight groups, find its /64 network, or name its type. New addresses are generated each time.",
    },
  ],
  quiz: [
    {
      question: "What is the standard short form of 2001:0db8:0000:0000:0001:0000:0000:0000?",
      answer: "2001:db8:0:0:1::",
      distractors: ["2001:db8::1::", "2001:db8::1:0:0:0", "2001:db8:0:0:1:0:0:0"],
      why: "Two zero runs: groups 3 and 4 (length 2) and groups 6 to 8 (length 3). The longer one becomes ::, and :: can only appear once.",
    },
    {
      question: "A host's address starts with fe80::. What can you say about it?",
      answer: "It's link-local: valid only on that network segment, never routed",
      distractors: ["It's a public address", "It came from a DHCPv6 server", "It's a multicast group"],
      why: "Every IPv6 interface creates a fe80::/10 address automatically. NDP and routing protocols use them to talk to neighbours.",
    },
    {
      question: "Your company gets 2001:db8:abcd::/48. How many /64 subnets is that?",
      answer: "65,536",
      distractors: ["256", "64", "About 18 quintillion"],
      why: "From /48 to /64 is 16 more bits, so 2^16 = 65,536 subnets, each with 2^64 addresses.",
    },
    {
      question: "With no NAT, what stops the internet connecting to every device on an IPv6 network?",
      answer: "A stateful firewall that blocks unsolicited inbound traffic",
      distractors: ["The addresses are too long to guess", "Link-local addressing", "IPv6 can't accept inbound connections"],
      why: "NAT was never meant as security; the protection came from the state tracking that came with it. With IPv6 you configure that firewall policy explicitly.",
    },
  ],
  pitfalls: [
    "Blocking all ICMPv6 on firewalls, which breaks neighbour discovery, router advertisements and path MTU discovery.",
    "Firewalling IPv4 carefully and forgetting that the same hosts are reachable over IPv6.",
    "Using :: twice in one address, or comparing addresses as strings.",
    "Making subnets smaller than /64, which breaks SLAAC.",
    "Disabling IPv6 on Windows to fix a problem; Microsoft doesn't support that configuration and parts of Windows depend on it.",
  ],
  next: [
    { id: "ip-subnetting", label: "IP Addressing & Subnetting" },
    { id: "net-dhcp", label: "DHCP: How Devices Get an Address" },
    { id: "net-nat-port-forwarding", label: "NAT and Port Forwarding" },
  ],
};

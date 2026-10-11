// Real command output for the Network Troubleshooting lesson, captured from a lab built with
// Linux network namespaces: a PC (192.168.10.25/24), a router (192.168.10.1 inside, 203.0.113.1
// outside) and a server (203.0.113.10) running a web server on port 80 and a DNS server for
// portal.example.net. Each scenario broke one thing and every tool was run against it.
// Generated once from the capture; not edited by hand.

export type TroubleTool = "addr" | "route" | "neigh" | "pinggw" | "pingsrv" | "nslookup" | "trace" | "curl" | "ss";

export const TROUBLE_TOOLS: { id: TroubleTool; command: string }[] = [
  {
    "id": "addr",
    "command": "ip -br addr show pc0"
  },
  {
    "id": "route",
    "command": "ip route"
  },
  {
    "id": "neigh",
    "command": "ip neigh"
  },
  {
    "id": "pinggw",
    "command": "ping -c 2 -W 1 192.168.10.1"
  },
  {
    "id": "pingsrv",
    "command": "ping -c 2 -W 1 203.0.113.10"
  },
  {
    "id": "nslookup",
    "command": "nslookup -timeout=2 -retry=1 portal.example.net"
  },
  {
    "id": "trace",
    "command": "traceroute -n -q 1 -w 1 -m 5 203.0.113.10"
  },
  {
    "id": "curl",
    "command": "curl -sS -m 5 -I http://portal.example.net/"
  },
  {
    "id": "ss",
    "command": "ss -tlnp     # on the server"
  }
];

export type TroubleScenarioId = "ok" | "dns" | "firewall" | "service" | "gateway" | "link";

export const TROUBLE_OUTPUT: Record<TroubleScenarioId, Record<TroubleTool, string>> = {
  "ok": {
    "addr": "pc0@if8          UP             192.168.10.25/24",
    "route": "default via 192.168.10.1 dev pc0 \n192.168.10.0/24 dev pc0 proto kernel scope link src 192.168.10.25",
    "neigh": "192.168.10.1 dev pc0 lladdr c2:0b:8f:f4:b1:0e REACHABLE",
    "pinggw": "PING 192.168.10.1 (192.168.10.1) 56(84) bytes of data.\n64 bytes from 192.168.10.1: icmp_seq=1 ttl=64 time=0.241 ms\n64 bytes from 192.168.10.1: icmp_seq=2 ttl=64 time=0.036 ms\n\n--- 192.168.10.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1017ms\nrtt min/avg/max/mdev = 0.036/0.138/0.241/0.102 ms",
    "pingsrv": "PING 203.0.113.10 (203.0.113.10) 56(84) bytes of data.\n64 bytes from 203.0.113.10: icmp_seq=1 ttl=63 time=0.281 ms\n64 bytes from 203.0.113.10: icmp_seq=2 ttl=63 time=0.045 ms\n\n--- 203.0.113.10 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1018ms\nrtt min/avg/max/mdev = 0.045/0.163/0.281/0.118 ms",
    "nslookup": "Server:\t\t203.0.113.10\nAddress:\t203.0.113.10#53\n\nName:\tportal.example.net\nAddress: 203.0.113.10",
    "trace": "traceroute to 203.0.113.10 (203.0.113.10), 5 hops max, 60 byte packets\n 1  192.168.10.1  0.023 ms\n 2  203.0.113.10  0.264 ms",
    "curl": "HTTP/1.0 200 OK\nServer: SimpleHTTP/0.6 Python/3.13.16\nDate: Sat, 10 Oct 2026 20:26:39 GMT\nContent-type: text/html\nContent-Length: 22\nLast-Modified: Sat, 10 Oct 2026 20:19:02 GMT",
    "ss": "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                           \nLISTEN 0      5       203.0.113.10:80        0.0.0.0:*    users:((\"python3\",pid=8678,fd=3))\nLISTEN 0      32      203.0.113.10:53        0.0.0.0:*    users:((\"dnsmasq\",pid=8719,fd=5))"
  },
  "dns": {
    "addr": "pc0@if8          UP             192.168.10.25/24",
    "route": "default via 192.168.10.1 dev pc0 \n192.168.10.0/24 dev pc0 proto kernel scope link src 192.168.10.25",
    "neigh": "192.168.10.1 dev pc0 lladdr c2:0b:8f:f4:b1:0e REACHABLE",
    "pinggw": "PING 192.168.10.1 (192.168.10.1) 56(84) bytes of data.\n64 bytes from 192.168.10.1: icmp_seq=1 ttl=64 time=0.027 ms\n64 bytes from 192.168.10.1: icmp_seq=2 ttl=64 time=0.044 ms\n\n--- 192.168.10.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1030ms\nrtt min/avg/max/mdev = 0.027/0.035/0.044/0.008 ms",
    "pingsrv": "PING 203.0.113.10 (203.0.113.10) 56(84) bytes of data.\n64 bytes from 203.0.113.10: icmp_seq=1 ttl=63 time=0.222 ms\n64 bytes from 203.0.113.10: icmp_seq=2 ttl=63 time=0.067 ms\n\n--- 203.0.113.10 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1018ms\nrtt min/avg/max/mdev = 0.067/0.144/0.222/0.077 ms",
    "nslookup": ";; communications error to 203.0.113.10#53: timed out\n;; no servers could be reached",
    "trace": "traceroute to 203.0.113.10 (203.0.113.10), 5 hops max, 60 byte packets\n 1  192.168.10.1  0.034 ms\n 2  203.0.113.10  0.430 ms",
    "curl": "curl: (28) Resolving timed out after 5002 milliseconds",
    "ss": "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                           \nLISTEN 0      5       203.0.113.10:80        0.0.0.0:*    users:((\"python3\",pid=8678,fd=3))\nLISTEN 0      32      203.0.113.10:53        0.0.0.0:*    users:((\"dnsmasq\",pid=8719,fd=5))"
  },
  "firewall": {
    "addr": "pc0@if8          UP             192.168.10.25/24",
    "route": "default via 192.168.10.1 dev pc0 \n192.168.10.0/24 dev pc0 proto kernel scope link src 192.168.10.25",
    "neigh": "192.168.10.1 dev pc0 lladdr c2:0b:8f:f4:b1:0e REACHABLE",
    "pinggw": "PING 192.168.10.1 (192.168.10.1) 56(84) bytes of data.\n64 bytes from 192.168.10.1: icmp_seq=1 ttl=64 time=0.305 ms\n64 bytes from 192.168.10.1: icmp_seq=2 ttl=64 time=0.036 ms\n\n--- 192.168.10.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1016ms\nrtt min/avg/max/mdev = 0.036/0.170/0.305/0.134 ms",
    "pingsrv": "PING 203.0.113.10 (203.0.113.10) 56(84) bytes of data.\n64 bytes from 203.0.113.10: icmp_seq=1 ttl=63 time=0.233 ms\n64 bytes from 203.0.113.10: icmp_seq=2 ttl=63 time=0.065 ms\n\n--- 203.0.113.10 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1019ms\nrtt min/avg/max/mdev = 0.065/0.149/0.233/0.084 ms",
    "nslookup": "Server:\t\t203.0.113.10\nAddress:\t203.0.113.10#53\n\nName:\tportal.example.net\nAddress: 203.0.113.10",
    "trace": "traceroute to 203.0.113.10 (203.0.113.10), 5 hops max, 60 byte packets\n 1  192.168.10.1  0.029 ms\n 2  203.0.113.10  0.247 ms",
    "curl": "curl: (28) Connection timed out after 5002 milliseconds",
    "ss": "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                           \nLISTEN 0      5       203.0.113.10:80        0.0.0.0:*    users:((\"python3\",pid=8678,fd=3))\nLISTEN 0      32      203.0.113.10:53        0.0.0.0:*    users:((\"dnsmasq\",pid=8719,fd=5))"
  },
  "service": {
    "addr": "pc0@if8          UP             192.168.10.25/24",
    "route": "default via 192.168.10.1 dev pc0 \n192.168.10.0/24 dev pc0 proto kernel scope link src 192.168.10.25",
    "neigh": "192.168.10.1 dev pc0 lladdr c2:0b:8f:f4:b1:0e REACHABLE",
    "pinggw": "PING 192.168.10.1 (192.168.10.1) 56(84) bytes of data.\n64 bytes from 192.168.10.1: icmp_seq=1 ttl=64 time=0.228 ms\n64 bytes from 192.168.10.1: icmp_seq=2 ttl=64 time=0.051 ms\n\n--- 192.168.10.1 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1007ms\nrtt min/avg/max/mdev = 0.051/0.139/0.228/0.088 ms",
    "pingsrv": "PING 203.0.113.10 (203.0.113.10) 56(84) bytes of data.\n64 bytes from 203.0.113.10: icmp_seq=1 ttl=63 time=0.342 ms\n64 bytes from 203.0.113.10: icmp_seq=2 ttl=63 time=0.067 ms\n\n--- 203.0.113.10 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1018ms\nrtt min/avg/max/mdev = 0.067/0.204/0.342/0.137 ms",
    "nslookup": "Server:\t\t203.0.113.10\nAddress:\t203.0.113.10#53\n\nName:\tportal.example.net\nAddress: 203.0.113.10",
    "trace": "traceroute to 203.0.113.10 (203.0.113.10), 5 hops max, 60 byte packets\n 1  192.168.10.1  0.021 ms\n 2  203.0.113.10  0.243 ms",
    "curl": "curl: (7) Failed to connect to portal.example.net port 80 after 1 ms: Couldn't connect to server",
    "ss": "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess\nLISTEN 0      32      203.0.113.10:53        0.0.0.0:*    users:((\"dnsmasq\",pid=8719,fd=5))"
  },
  "gateway": {
    "addr": "pc0@if8          UP             192.168.10.25/24",
    "route": "default via 192.168.10.1 dev pc0 \n192.168.10.0/24 dev pc0 proto kernel scope link src 192.168.10.25",
    "neigh": "192.168.10.1 dev pc0 INCOMPLETE",
    "pinggw": "PING 192.168.10.1 (192.168.10.1) 56(84) bytes of data.\n\n--- 192.168.10.1 ping statistics ---\n2 packets transmitted, 0 received, 100% packet loss, time 1015ms",
    "pingsrv": "PING 203.0.113.10 (203.0.113.10) 56(84) bytes of data.\nFrom 192.168.10.25 icmp_seq=1 Destination Host Unreachable\nFrom 192.168.10.25 icmp_seq=2 Destination Host Unreachable\n\n--- 203.0.113.10 ping statistics ---\n2 packets transmitted, 0 received, +2 errors, 100% packet loss, time 1010ms\npipe 2",
    "nslookup": ";; communications error to 203.0.113.10#53: timed out\n;; no servers could be reached",
    "trace": "traceroute to 203.0.113.10 (203.0.113.10), 5 hops max, 60 byte packets\n 1  *\n 2  *\n 3  *\n 4  *\n 5  *",
    "curl": "curl: (6) Could not resolve host: portal.example.net",
    "ss": "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                            \nLISTEN 0      5       203.0.113.10:80        0.0.0.0:*    users:((\"python3\",pid=10104,fd=3))\nLISTEN 0      32      203.0.113.10:53        0.0.0.0:*    users:((\"dnsmasq\",pid=8719,fd=5))"
  },
  "link": {
    "addr": "pc0@if8          DOWN           192.168.10.25/24",
    "route": "default via 192.168.10.1 dev pc0 linkdown \n192.168.10.0/24 dev pc0 proto kernel scope link src 192.168.10.25 linkdown",
    "neigh": "192.168.10.1 dev pc0 INCOMPLETE",
    "pinggw": "PING 192.168.10.1 (192.168.10.1) 56(84) bytes of data.\n\n--- 192.168.10.1 ping statistics ---\n2 packets transmitted, 0 received, 100% packet loss, time 1016ms",
    "pingsrv": "PING 203.0.113.10 (203.0.113.10) 56(84) bytes of data.\nFrom 192.168.10.25 icmp_seq=1 Destination Host Unreachable\nFrom 192.168.10.25 icmp_seq=2 Destination Host Unreachable\n\n--- 203.0.113.10 ping statistics ---\n2 packets transmitted, 0 received, +2 errors, 100% packet loss, time 1011ms\npipe 2",
    "nslookup": ";; communications error to 203.0.113.10#53: timed out\n;; no servers could be reached",
    "trace": "traceroute to 203.0.113.10 (203.0.113.10), 5 hops max, 60 byte packets\n 1  *\n 2  *\n 3  *\n 4  *\n 5  *",
    "curl": "curl: (6) Could not resolve host: portal.example.net",
    "ss": "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                            \nLISTEN 0      5       203.0.113.10:80        0.0.0.0:*    users:((\"python3\",pid=10104,fd=3))\nLISTEN 0      32      203.0.113.10:53        0.0.0.0:*    users:((\"dnsmasq\",pid=8719,fd=5))"
  }
};

import { ScrubberControls } from "../ScrubberControls";
import { useStepScrubber } from "../../useStepScrubber";

interface Step {
  label: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    label: "1. Check the DNS cache",
    detail:
      "The browser checks whether it already resolved this hostname recently. If so, it skips straight to opening a connection -- no point re-asking for an address it already has.",
  },
  {
    label: "2. DNS lookup",
    detail:
      'Not cached, so the browser asks a DNS resolver "what\'s the IP address for example.com?" and gets an answer back -- see IP Addressing & Subnetting for what that address actually is.',
  },
  {
    label: "3. TCP handshake",
    detail:
      "The browser opens a TCP connection to that IP on port 443 (HTTPS) or 80 (HTTP) -- SYN, SYN-ACK, ACK (synchronize, synchronize-acknowledge, acknowledge). See TCP vs UDP for why this costs a full round-trip before any real data moves.",
  },
  {
    label: "4. TLS handshake (HTTPS only)",
    detail:
      "Browser and server agree on encryption keys before any HTTP data is exchanged -- this is why an HTTPS connection's first request has more round-trip overhead than plain HTTP.",
  },
  {
    label: "5. HTTP request",
    detail: 'The browser sends a request: "GET /path HTTP/1.1" plus headers like Host and User-Agent.',
  },
  {
    label: "6. HTTP response",
    detail:
      "The server sends back a status code (200 OK, 404 Not Found, 301 Redirect, ...), response headers, and the actual content.",
  },
  {
    label: "7. Parse & repeat",
    detail:
      "If the content is HTML, the browser parses it, finds every extra resource it references (images, CSS, JS), and repeats steps 2-6 for each one -- usually reusing the same already-open TCP connection instead of a fresh handshake every time.",
  },
];

export function DnsHttpTrace() {
  const scrubber = useStepScrubber(STEPS);

  return (
    <div className="tool-widget">
      <ol className="algo-steps">
        {STEPS.map((s, i) => (
          <li key={i} className={i === scrubber.index ? "algo-step-active" : i < scrubber.index ? "algo-step-done" : ""}>
            <strong>{s.label}:</strong> {s.detail}
          </li>
        ))}
      </ol>

      <ScrubberControls
        index={scrubber.index}
        total={STEPS.length}
        isFirst={scrubber.isFirst}
        isLast={scrubber.isLast}
        playing={scrubber.playing}
        onReset={scrubber.reset}
        onPrev={scrubber.prev}
        onNext={scrubber.next}
        onPlay={scrubber.play}
        onPause={scrubber.pause}
      />
    </div>
  );
}

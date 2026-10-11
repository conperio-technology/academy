import { useState } from "react";

type Protocol = "tcp" | "udp";

export function TcpVsUdp() {
  const [protocol, setProtocol] = useState<Protocol>("tcp");
  const [connected, setConnected] = useState(false);
  const [seq, setSeq] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  function append(lines: string[]) {
    setLog((l) => [...l, ...lines]);
  }

  function switchProtocol(p: Protocol) {
    setProtocol(p);
    setConnected(false);
    setSeq(0);
    setLog([]);
  }

  function handshakeIfNeeded() {
    if (protocol === "tcp" && !connected) {
      append([
        "→ SYN, short for synchronize (client requests a connection)",
        "← SYN-ACK, synchronize plus acknowledge (server agrees and asks back)",
        "→ ACK (connection established)",
      ]);
      setConnected(true);
    }
  }

  function sendMessage() {
    handshakeIfNeeded();
    const n = seq + 1;
    setSeq(n);
    if (protocol === "tcp") {
      append([`→ Segment ${n} sent`, `← ACK ${n} received (the peer's TCP has everything up to segment ${n}; the app may not have read it yet)`]);
    } else {
      append([`→ Datagram ${n} sent (fire-and-forget, no acknowledgment)`]);
    }
  }

  function dropMessage() {
    handshakeIfNeeded();
    const n = seq + 1;
    setSeq(n);
    if (protocol === "tcp") {
      append([
        `→ Segment ${n} sent... lost in transit`,
        `⏱ no ACK received before timeout -- retransmitting Segment ${n}`,
        `→ Segment ${n} sent again`,
        `← ACK ${n} received (the peer's TCP has it now, just late)`,
      ]);
    } else {
      append([`→ Datagram ${n} sent... lost in transit`, "✕ UDP has no way to know -- it's simply gone"]);
    }
  }

  function reset() {
    setConnected(false);
    setSeq(0);
    setLog([]);
  }

  return (
    <div className="tool-widget">
      <div className="language-tabs">
        <button className={`language-tab ${protocol === "tcp" ? "active" : ""}`} onClick={() => switchProtocol("tcp")}>
          TCP
        </button>
        <button className={`language-tab ${protocol === "udp" ? "active" : ""}`} onClick={() => switchProtocol("udp")}>
          UDP
        </button>
      </div>

      <div className="tcp-udp-log">
        {log.length === 0 && <p className="status-text">Click "send a message" below to start.</p>}
        {log.map((line, i) => (
          <p key={i} className="tcp-udp-line">
            {line}
          </p>
        ))}
      </div>

      <div className="darr-actions">
        <button onClick={sendMessage}>send a message</button>
        <button onClick={dropMessage}>simulate a dropped packet</button>
        <button onClick={reset}>reset</button>
      </div>
    </div>
  );
}

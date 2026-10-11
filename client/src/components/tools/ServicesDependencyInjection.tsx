import { useState } from "react";

const CODE =
  "class OrderProcessor\n" +
  "{\n" +
  "    private readonly INotificationService _notifier;\n" +
  "\n" +
  "    public OrderProcessor(INotificationService notifier)\n" +
  "    {\n" +
  "        _notifier = notifier;   // handed in, never constructed here\n" +
  "    }\n" +
  "\n" +
  '    public void CompleteOrder() => _notifier.Notify("user@example.com");\n' +
  "}";

export function ServicesDependencyInjection() {
  const [useFake, setUseFake] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  function send() {
    setLog((l) => [
      ...l,
      useFake
        ? "🧪 [FAKE] NotificationService recorded: would have emailed user@example.com"
        : "📧 [REAL] NotificationService sent an email to user@example.com via SMTP",
    ]);
  }

  function reset() {
    setLog([]);
  }

  return (
    <div className="tool-widget">
      <div className="language-tabs">
        <button className={`language-tab ${!useFake ? "active" : ""}`} onClick={() => setUseFake(false)}>
          Real Service
        </button>
        <button className={`language-tab ${useFake ? "active" : ""}`} onClick={() => setUseFake(true)}>
          Fake Service (for tests)
        </button>
      </div>

      <pre className="algo-code">{CODE}</pre>

      <div className="darr-actions">
        <button onClick={send}>OrderProcessor.CompleteOrder()</button>
        <button onClick={reset}>reset</button>
      </div>

      <div className="tcp-udp-log">
        {log.length === 0 && (
          <p className="status-text">Click the button above -- same OrderProcessor code, different injected service.</p>
        )}
        {log.map((line, i) => (
          <p key={i} className="tcp-udp-line">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

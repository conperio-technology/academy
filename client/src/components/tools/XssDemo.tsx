import { useState } from "react";

const PRESETS = [
  { label: "A normal comment", text: "Great lesson, the visualizer finally made heaps click for me!" },
  { label: "Some bold text", text: "This is <b>really</b> useful." },
  {
    label: "Steal the session",
    text: `Nice post <img src="x" onerror="document.getElementById('loot').textContent = 'Sent to attacker: ' + window.sessionToken">`,
  },
  {
    label: "Rewrite the page",
    text: `<img src="x" onerror="document.body.innerHTML = '<h2>Session expired. Re-enter your password:</h2><input type=password>'">`,
  },
];

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// The "victim's page" is a sandboxed iframe: allow-scripts lets the injected script run
// so you can see it happen, but without allow-same-origin it runs in an opaque origin,
// cut off from this app, its storage, and its cookies. The session token is a fake one
// that exists only inside the frame.
function victimPage(commentHtml: string) {
  return `<!doctype html><html><head><style>
    body { font: 14px system-ui, sans-serif; color: #c9cad1; background: #1b1c23; margin: 12px; }
    .comment { border: 1px solid #2e303a; border-radius: 6px; padding: 8px 10px; }
    #loot { color: #f87171; font-weight: 600; margin-top: 10px; }
  </style></head><body>
    <script>window.sessionToken = "session=4f9c2e7a-ava-logged-in";</script>
    <p><strong>Comments</strong></p>
    <div class="comment">${commentHtml}</div>
    <div id="loot"></div>
  </body></html>`;
}

export function XssDemo() {
  const [text, setText] = useState(PRESETS[0].text);
  const [escape, setEscape] = useState(false);
  const [posted, setPosted] = useState<{ html: string; escaped: boolean } | null>(null);

  const html = escape ? escapeHtml(text) : text;

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setText(p.text);
              setPosted(null);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <textarea className="sql-textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} />

      <label className="sql-index-toggle">
        <input type="checkbox" checked={escape} onChange={(e) => setEscape(e.target.checked)} /> Escape the comment before
        putting it in the page (<code>&lt;</code> becomes <code>&amp;lt;</code>, and so on)
      </label>

      <div className="darr-actions">
        <button onClick={() => setPosted({ html, escaped: escape })}>Post comment</button>
      </div>

      {posted && (
        <>
          <p className="gate-note">HTML the server put in the page:</p>
          <code className="sql-snippet">{posted.html}</code>
          <p className="gate-note">What another user sees when they open the page:</p>
          <iframe
            key={posted.html}
            className="xss-frame"
            title="Victim's page"
            sandbox="allow-scripts"
            srcDoc={victimPage(posted.html)}
          />
          {!posted.escaped && posted.html.includes("onerror") && (
            <p className="constraint-fail">
              The comment's markup ran as code in the reader's browser, with access to everything their session can
              see.
            </p>
          )}
          {posted.escaped && (
            <p className="constraint-ok">Escaped: the browser shows the characters instead of running them.</p>
          )}
        </>
      )}
    </div>
  );
}

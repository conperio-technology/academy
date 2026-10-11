interface Props {
  recognitionSignals: string[];
  gotchas: string[];
  confusableWith: string[];
}

// Patterns-track-only content: the recognition cues, common mistakes, and
// confusable siblings that turn "here's an algorithm" into "here's how you'd have
// recognized this on your own." Renders nothing for ordinary Fundamentals concepts,
// where all three lists are empty.
export function PatternNotes({ recognitionSignals, gotchas, confusableWith }: Props) {
  if (recognitionSignals.length === 0 && gotchas.length === 0 && confusableWith.length === 0) return null;

  return (
    <div className="pattern-notes">
      {recognitionSignals.length > 0 && (
        <div className="pattern-note pattern-note-signals">
          <h3>👀 If you see this, think this pattern</h3>
          <ul>
            {recognitionSignals.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {gotchas.length > 0 && (
        <div className="pattern-note pattern-note-gotchas">
          <h3>⚠️ Watch out for</h3>
          <ul>
            {gotchas.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}
      {confusableWith.length > 0 && (
        <div className="pattern-note pattern-note-confusable">
          <h3>🔀 Easily confused with</h3>
          <ul>
            {confusableWith.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

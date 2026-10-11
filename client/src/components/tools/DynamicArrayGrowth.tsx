import { useState } from "react";

export function DynamicArrayGrowth() {
  const [capacity, setCapacity] = useState(1);
  const [count, setCount] = useState(0);
  const [totalCopies, setTotalCopies] = useState(0);
  const [lastEvent, setLastEvent] = useState("Empty array. Capacity starts at 1.");

  function push() {
    if (count < capacity) {
      setLastEvent(`Pushed into slot ${count} -- capacity (${capacity}) not full yet. O(1).`);
      setCount((c) => c + 1);
    } else {
      const newCapacity = capacity * 2;
      setLastEvent(
        `Capacity full (${count}/${capacity}) -- RESIZE. Allocate a new array of capacity ${newCapacity}, copy all ${capacity} existing elements (O(n)), then push.`,
      );
      setTotalCopies((tc) => tc + capacity);
      setCapacity(newCapacity);
      setCount((c) => c + 1);
    }
  }

  function reset() {
    setCapacity(1);
    setCount(0);
    setTotalCopies(0);
    setLastEvent("Empty array. Capacity starts at 1.");
  }

  const cells = Array.from({ length: capacity }, (_, i) => i < count);

  return (
    <div className="tool-widget">
      <div className="darr-cells">
        {cells.map((filled, i) => (
          <div key={i} className={`darr-cell ${filled ? "filled" : ""}`}>
            {filled ? i : ""}
          </div>
        ))}
      </div>

      <p className="gate-note">{lastEvent}</p>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">count</span>
          <span className="readout-value">{count}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">capacity</span>
          <span className="readout-value">{capacity}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">elements ever copied</span>
          <span className="readout-value">{totalCopies}</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">avg copies / push</span>
          <span className="readout-value">{count > 0 ? (totalCopies / count).toFixed(2) : "0.00"}</span>
        </div>
      </div>

      <div className="darr-actions">
        <button onClick={push}>▶ push()</button>
        <button onClick={reset}>reset</button>
      </div>
    </div>
  );
}

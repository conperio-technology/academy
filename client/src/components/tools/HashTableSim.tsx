import { useState } from "react";

const INITIAL_CAPACITY = 8;

function hash(key: string, capacity: number): number {
  let sum = 0;
  for (const ch of key) sum += ch.charCodeAt(0);
  return sum % capacity;
}

function emptyBuckets(capacity: number): string[][] {
  return Array.from({ length: capacity }, () => []);
}

export function HashTableSim() {
  const [capacity, setCapacity] = useState(INITIAL_CAPACITY);
  const [buckets, setBuckets] = useState<string[][]>(emptyBuckets(INITIAL_CAPACITY));
  const [count, setCount] = useState(0);
  const [keyInput, setKeyInput] = useState("");
  const [lastEvent, setLastEvent] = useState(`Empty table. ${INITIAL_CAPACITY} buckets, load factor 0.00.`);

  function insert() {
    const key = keyInput.trim();
    if (!key) return;

    const idx = hash(key, capacity);
    const collided = buckets[idx].length > 0;
    const nextBuckets = buckets.map((b, i) => (i === idx ? [...b, key] : b));
    const nextCount = count + 1;
    const loadFactor = nextCount / capacity;

    if (loadFactor > 0.75) {
      const newCapacity = capacity * 2;
      const resized = emptyBuckets(newCapacity);
      for (const bucket of nextBuckets) {
        for (const k of bucket) resized[hash(k, newCapacity)].push(k);
      }
      setBuckets(resized);
      setCapacity(newCapacity);
      setLastEvent(
        `Load factor exceeded 0.75 after inserting "${key}" -- RESIZE. Capacity doubled to ${newCapacity}, every key rehashed into a new bucket.`,
      );
    } else {
      setBuckets(nextBuckets);
      setLastEvent(
        collided
          ? `"${key}" hashed to bucket ${idx} -- COLLISION, chained after the existing key(s) there.`
          : `"${key}" hashed to bucket ${idx}. O(1) insert.`,
      );
    }
    setCount(nextCount);
    setKeyInput("");
  }

  function reset() {
    setCapacity(INITIAL_CAPACITY);
    setBuckets(emptyBuckets(INITIAL_CAPACITY));
    setCount(0);
    setKeyInput("");
    setLastEvent(`Empty table. ${INITIAL_CAPACITY} buckets, load factor 0.00.`);
  }

  const loadFactor = count / capacity;

  return (
    <div className="tool-widget">
      <label className="tool-single-input">
        Key to insert
        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && insert()}
          placeholder="e.g. apple"
        />
      </label>

      <div className="hash-buckets">
        {buckets.map((bucket, i) => (
          <div key={i} className="hash-bucket">
            <span className="hash-bucket-index">{i}</span>
            <div className="hash-bucket-chain">
              {bucket.map((k, j) => (
                <span key={j} className="hash-chip">
                  {k}
                </span>
              ))}
            </div>
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
          <span className="readout-label">load factor</span>
          <span className="readout-value">{loadFactor.toFixed(2)}</span>
        </div>
      </div>

      <div className="darr-actions">
        <button onClick={insert}>insert</button>
        <button onClick={reset}>reset</button>
      </div>
    </div>
  );
}

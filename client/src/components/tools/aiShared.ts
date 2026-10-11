// Deterministic maths shared by the AI & Machine Learning lessons. No JSX here so the
// functions can be checked with plain Node. Nothing calls a real model.

// ---- seeded randomness ----------------------------------------------------------------------

// mulberry32: a tiny seeded PRNG, so every demo gives the same numbers on every load.
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard normal sample via Box-Muller.
export function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// Picks an index from a probability list using one uniform draw.
export function pickIndex(probs: number[], r: number): number {
  let acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (r < acc) return i;
  }
  return probs.length - 1;
}

// ---- curve fitting (ML basics) --------------------------------------------------------------

// The "true" relationship the noisy data is drawn from, on x in [0, 1].
export const trueCurve = (x: number) => 0.9 * Math.sin(2 * Math.PI * x * 0.85) + 0.25 * x;

export interface Point {
  x: number;
  y: number;
}

export function makeDataset(seed: number, xs: number[], noise: number): Point[] {
  const rand = seededRandom(seed);
  return xs.map((x) => ({ x, y: trueCurve(x) + noise * gaussian(rand) }));
}

// Chebyshev basis on t = 2x - 1 keeps the least-squares problem well conditioned even at
// degree 11, where a plain x^k basis gets numerically shaky.
function chebyshevRow(x: number, degree: number): number[] {
  const t = 2 * x - 1;
  const row = [1];
  if (degree >= 1) row.push(t);
  for (let k = 2; k <= degree; k++) row.push(2 * t * row[k - 1] - row[k - 2]);
  return row;
}

// Least squares via Householder QR, with optional ridge (L2) regularisation added as extra
// rows sqrt(lambda) * I. Returns the coefficients of the Chebyshev basis.
export function fitPolynomial(points: Point[], degree: number, lambda = 0): number[] {
  const n = degree + 1;
  const A = points.map((p) => chebyshevRow(p.x, degree));
  const b = points.map((p) => p.y);
  if (lambda > 0) {
    // Leave the constant term unpenalised, as is usual.
    for (let k = 1; k < n; k++) {
      const row = new Array(n).fill(0);
      row[k] = Math.sqrt(lambda);
      A.push(row);
      b.push(0);
    }
  }
  const m = A.length;
  const cols = Math.min(n, m);
  for (let k = 0; k < cols; k++) {
    let norm = 0;
    for (let i = k; i < m; i++) norm += A[i][k] * A[i][k];
    norm = Math.sqrt(norm);
    if (norm === 0) continue;
    const alpha = A[k][k] > 0 ? -norm : norm;
    const v = new Array(m).fill(0);
    for (let i = k; i < m; i++) v[i] = A[i][k];
    v[k] -= alpha;
    let vv = 0;
    for (let i = k; i < m; i++) vv += v[i] * v[i];
    if (vv === 0) continue;
    for (let j = k; j < n; j++) {
      let dot = 0;
      for (let i = k; i < m; i++) dot += v[i] * A[i][j];
      const f = (2 * dot) / vv;
      for (let i = k; i < m; i++) A[i][j] -= f * v[i];
    }
    let dotb = 0;
    for (let i = k; i < m; i++) dotb += v[i] * b[i];
    const fb = (2 * dotb) / vv;
    for (let i = k; i < m; i++) b[i] -= fb * v[i];
  }
  const coef = new Array(n).fill(0);
  for (let k = cols - 1; k >= 0; k--) {
    let s = b[k];
    for (let j = k + 1; j < n; j++) s -= A[k][j] * coef[j];
    coef[k] = Math.abs(A[k][k]) < 1e-12 ? 0 : s / A[k][k];
  }
  return coef;
}

export function evalPolynomial(coef: number[], x: number): number {
  const row = chebyshevRow(x, coef.length - 1);
  return row.reduce((s, r, i) => s + r * coef[i], 0);
}

export function meanSquaredError(coef: number[], points: Point[]): number {
  return points.reduce((s, p) => s + (evalPolynomial(coef, p.x) - p.y) ** 2, 0) / points.length;
}

// ---- gradient descent (neural networks) -----------------------------------------------------

// A one-weight loss curve with a shallow local minimum near w = -1.6 and a deeper global
// minimum near w = 2.2, so the starting point and the step size both matter.
export const loss = (w: number) => 0.08 * w ** 4 - 0.07 * w ** 3 - 0.55 * w ** 2 + 0.1 * w + 1.6;
export const lossGradient = (w: number) => 0.32 * w ** 3 - 0.21 * w ** 2 - 1.1 * w + 0.1;

export interface DescentStep {
  w: number;
  loss: number;
  grad: number;
}

export function descend(start: number, learningRate: number, steps: number): DescentStep[] {
  const path: DescentStep[] = [{ w: start, loss: loss(start), grad: lossGradient(start) }];
  let w = start;
  for (let i = 0; i < steps; i++) {
    w = w - learningRate * lossGradient(w);
    if (!Number.isFinite(w) || Math.abs(w) > 1e6) {
      path.push({ w: Number.NaN, loss: Number.NaN, grad: Number.NaN });
      break;
    }
    path.push({ w, loss: loss(w), grad: lossGradient(w) });
  }
  return path;
}

// ---- toy byte-pair encoding (tokens) --------------------------------------------------------

// Splits text the way GPT-style tokenizers pre-split it: a word keeps the space in front of
// it, so " motor" and "motor" are different tokens.
export function preSplit(text: string): string[] {
  return text.match(/ ?[A-Za-z]+| ?[0-9]+| ?[^\sA-Za-z0-9]+|\s+(?!\S)|\s+/g) ?? [];
}

export interface BpeModel {
  merges: [string, string][];
  base: string[];
}

export function trainBpe(corpus: string, mergeCount: number): BpeModel {
  const counts = new Map<string, number>();
  for (const chunk of preSplit(corpus)) counts.set(chunk, (counts.get(chunk) ?? 0) + 1);
  let words = [...counts.entries()].map(([w, c]) => ({ parts: [...w], count: c }));
  // Every printable ASCII character is a base token, as in a byte-level tokenizer, so only
  // non-ASCII characters (accents, other scripts, emoji) fall back to raw bytes.
  const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));
  const base = [...new Set([...ascii, ...corpus])].sort();
  const merges: [string, string][] = [];
  for (let m = 0; m < mergeCount; m++) {
    const pairs = new Map<string, number>();
    for (const w of words) {
      for (let i = 0; i < w.parts.length - 1; i++) {
        const key = w.parts[i] + "\u0000" + w.parts[i + 1];
        pairs.set(key, (pairs.get(key) ?? 0) + w.count);
      }
    }
    let best: string | null = null;
    let bestCount = 1; // a pair seen only once is not worth a vocabulary slot
    for (const [key, c] of pairs) {
      if (c > bestCount || (c === bestCount && best !== null && key < best)) {
        best = key;
        bestCount = c;
      }
    }
    if (best === null) break;
    const [a, b] = best.split("\u0000") as [string, string];
    merges.push([a, b]);
    words = words.map((w) => ({ parts: mergePair(w.parts, a, b), count: w.count }));
  }
  return { merges, base };
}

function mergePair(parts: string[], a: string, b: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i < parts.length - 1 && parts[i] === a && parts[i + 1] === b) {
      out.push(a + b);
      i++;
    } else out.push(parts[i]);
  }
  return out;
}

export interface Token {
  text: string;
  id: number;
  byteFallback: boolean;
}

// Applies the learned merges in the order they were learned (lowest rank first), like a
// real BPE tokenizer. A character the tokenizer never saw falls back to its UTF-8 bytes,
// one token each, which is how byte-level tokenizers can encode any text at all.
export function tokenize(text: string, model: BpeModel): Token[] {
  const rank = new Map(model.merges.map(([a, b], i) => [a + "\u0000" + b, i]));
  const vocab = new Map<string, number>();
  model.base.forEach((c) => vocab.set(c, vocab.size));
  model.merges.forEach(([a, b]) => {
    if (!vocab.has(a + b)) vocab.set(a + b, vocab.size);
  });
  const byteBase = 1000;
  const out: Token[] = [];
  for (const chunk of preSplit(text)) {
    let parts: string[] = [];
    for (const ch of chunk) {
      if (vocab.has(ch)) parts.push(ch);
      else {
        for (const byte of new TextEncoder().encode(ch)) parts.push("\u0001" + byte.toString(16).toUpperCase().padStart(2, "0"));
      }
    }
    for (;;) {
      let bestRank = Infinity;
      let bestAt = -1;
      for (let i = 0; i < parts.length - 1; i++) {
        const r = rank.get(parts[i] + "\u0000" + parts[i + 1]);
        if (r !== undefined && r < bestRank) {
          bestRank = r;
          bestAt = i;
        }
      }
      if (bestAt < 0) break;
      const [a, b] = model.merges[bestRank];
      parts = mergePair(parts, a, b);
    }
    for (const p of parts) {
      if (p.startsWith("\u0001")) out.push({ text: `<${p.slice(1)}>`, id: byteBase + parseInt(p.slice(1), 16), byteFallback: true });
      else out.push({ text: p, id: vocab.get(p) ?? -1, byteFallback: false });
    }
  }
  return out;
}

// ---- vectors --------------------------------------------------------------------------------

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb);
}

// ---- word-overlap retrieval (RAG demo) ------------------------------------------------------

const STOP = new Set(
  "a an and are as at be by can do does for from how i if in is it of on or should the this to what when where which why with you your".split(" "),
);

export function contentWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((w) => !STOP.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
}

// Cosine similarity of word-count vectors: a transparent stand-in for embedding similarity.
export function overlapScore(query: string, doc: string): { score: number; matched: string[] } {
  const q = contentWords(query);
  const d = contentWords(doc);
  const vocab = [...new Set([...q, ...d])];
  const qv = vocab.map((w) => q.filter((x) => x === w).length);
  const dv = vocab.map((w) => d.filter((x) => x === w).length);
  return { score: cosine(qv, dv), matched: [...new Set(q.filter((w) => d.includes(w)))] };
}

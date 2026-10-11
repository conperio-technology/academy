// Spread an ordered task list over a number of weeks, shared by both study paths: each phase
// gets weeks in proportion to its share (at least one each, summing to `weeks`), and within a
// phase tasks fill its weeks evenly by estimated minutes.

export function scheduleTasks<T extends { minutes: number }>(tasks: T[][], weeks: number, shares: number[]): { weeks: T[][]; phase: number[] } {
  const alloc = shares.map((s) => Math.max(1, Math.round(s * weeks)));
  while (alloc.reduce((a, b) => a + b, 0) > weeks) alloc[alloc.indexOf(Math.max(...alloc))]--;
  while (alloc.reduce((a, b) => a + b, 0) < weeks) alloc[alloc.indexOf(Math.min(...alloc))]++;

  const result: T[][] = [];
  const phase: number[] = [];
  tasks.forEach((phaseTasks, p) => {
    const n = alloc[p];
    const total = phaseTasks.reduce((m, t) => m + t.minutes, 0);
    const buckets: T[][] = Array.from({ length: n }, () => []);
    let elapsed = 0;
    for (const t of phaseTasks) {
      const week = Math.min(n - 1, Math.floor(((elapsed + t.minutes / 2) / Math.max(1, total)) * n));
      buckets[week].push(t);
      elapsed += t.minutes;
    }
    result.push(...buckets);
    phase.push(...buckets.map(() => p));
  });
  return { weeks: result, phase };
}

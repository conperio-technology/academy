// The Complexity Gym bank: snippets that each ask for BOTH the time and the space
// complexity, with a model explanation in the same three steps as the "How to Analyze"
// lesson (how many trips, cost per trip, put together) plus a short space explanation.
// Validate with: node scripts/check-complexity-gym.mjs (from client/).
//
// Conventions every answer follows:
// - Big O means the tightest bound for the worst case, the way interviewers use it,
//   unless the title says otherwise (for example "average case" or "already sorted input").
// - Hash set and dictionary operations count as O(1) average.
// - Space is memory used beyond the input: variables, new collections, the call stack,
//   and anything returned. When only the returned result is big, spaceWhy says so.
// - Arithmetic on fixed-size numbers is O(1).

export type GymLang = "C#" | "Python";
export type GymDifficulty = "easy" | "medium" | "hard";

export const GYM_CATEGORIES = [
  { id: "loops", label: "Single loops" },
  { id: "nested", label: "Nested and dependent loops" },
  { id: "logarithmic", label: "Halving and doubling" },
  { id: "recursion", label: "Recursion and recurrences" },
  { id: "divide", label: "Divide and conquer" },
  { id: "amortized", label: "Amortized" },
  { id: "multi", label: "Multiple variables" },
  { id: "library", label: "Hidden library costs" },
  { id: "ds", label: "Data structure operations" },
  { id: "graphs", label: "Graphs" },
  { id: "dp", label: "DP tables" },
  { id: "backtracking", label: "Backtracking and exponential" },
  { id: "sorting", label: "Sorting and heaps" },
  { id: "strings", label: "Strings" },
  { id: "space", label: "Space" },
] as const;

export type GymCategory = (typeof GYM_CATEGORIES)[number]["id"];

export const GYM_DIFFICULTIES: GymDifficulty[] = ["easy", "medium", "hard"];

export interface GymSnippet {
  id: string;
  category: GymCategory;
  difficulty: GymDifficulty;
  lang: GymLang;
  title: string;
  code: string;
  vars: string; // what n (and any other variable) stands for
  time: string;
  timeOptions: string[];
  space: string;
  spaceOptions: string[];
  structure: string; // how many trips or calls
  perStep: string; // cost of each trip
  verdict: string; // put together
  spaceWhy: string;
}

export const SPACE_CONVENTION =
  "Space here means memory beyond the input: variables, new collections, the call stack and anything the code returns. " +
  "Hash operations count as O(1) average. Pick the tightest worst case bound unless the title says otherwise.";

const BASIC = ["O(1)", "O(log n)", "O(n)", "O(n²)"];
const BASIC_NLOGN = ["O(n)", "O(n log n)", "O(n²)", "O(log n)"];

const PART_ONE: GymSnippet[] = [
  // ---------------- Single loops ----------------
  {
    id: "loops-max",
    category: "loops",
    difficulty: "easy",
    lang: "C#",
    title: "Largest element",
    code: `int Max(int[] a)
{
    int best = a[0];
    for (int i = 1; i < a.Length; i++)
        if (a[i] > best) best = a[i];
    return best;
}`,
    vars: "n = a.Length",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "One loop from index 1 to the end: n minus 1 trips.",
    perStep: "One comparison and maybe one assignment: O(1).",
    verdict: "About n trips × O(1) = O(n).",
    spaceWhy: "Only best and i, whatever the size of the array: O(1).",
  },
  {
    id: "loops-count-evens",
    category: "loops",
    difficulty: "easy",
    lang: "Python",
    title: "Count the even numbers",
    code: `def count_evens(nums):
    count = 0
    for x in nums:
        if x % 2 == 0:
            count += 1
    return count`,
    vars: "n = len(nums)",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "One pass over the list: n trips.",
    perStep: "A modulo, a comparison and an increment: O(1).",
    verdict: "n × O(1) = O(n).",
    spaceWhy: "A single counter. The loop variable is reused, so nothing grows with n: O(1).",
  },
  {
    id: "loops-step-two",
    category: "loops",
    difficulty: "easy",
    lang: "C#",
    title: "Every other element",
    code: `int SumEvenIndexes(int[] a)
{
    int total = 0;
    for (int i = 0; i < a.Length; i += 2)
        total += a[i];
    return total;
}`,
    vars: "n = a.Length",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "i goes up by 2, so the loop runs about n / 2 trips.",
    perStep: "One addition: O(1).",
    verdict: "n / 2 × O(1) is still O(n): dropping the factor of one half is exactly what Big O does. Skipping elements by a constant step never changes the class.",
    spaceWhy: "total and i only: O(1).",
  },
  {
    id: "loops-fixed",
    category: "loops",
    difficulty: "easy",
    lang: "Python",
    title: "Only the first ten",
    code: `def first_ten_total(nums):
    total = 0
    for i in range(min(10, len(nums))):
        total += nums[i]
    return total`,
    vars: "n = len(nums)",
    time: "O(1)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "The loop runs at most 10 times no matter how long the list is.",
    perStep: "An index and an addition: O(1). len() on a list is O(1) too.",
    verdict: "At most 10 × O(1) = O(1). A loop is only O(n) when its trip count grows with the input.",
    spaceWhy: "total and i: O(1). range() is lazy, it does not build a list.",
  },
  {
    id: "loops-sqrt",
    category: "loops",
    difficulty: "medium",
    lang: "C#",
    title: "Divisors up to the square root",
    code: `int CountDivisors(int n)
{
    int count = 0;
    for (int i = 1; i * i <= n; i++)
        if (n % i == 0)
            count += (i * i == n) ? 1 : 2;
    return count;
}`,
    vars: "n is the input value itself, not a collection size",
    time: "O(√n)",
    timeOptions: ["O(log n)", "O(√n)", "O(n)", "O(n²)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "The loop stops once i × i passes n, so i only reaches √n: about √n trips.",
    perStep: "A multiplication, a modulo and a comparison: O(1).",
    verdict: "√n × O(1) = O(√n). Divisors come in pairs (i and n / i), which is why checking up to √n is enough.",
    spaceWhy: "count and i only: O(1).",
  },
  {
    id: "loops-squares",
    category: "loops",
    difficulty: "easy",
    lang: "Python",
    title: "Square everything",
    code: `def squares(nums):
    return [x * x for x in nums]`,
    vars: "n = len(nums)",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "The comprehension is a loop: one trip per element, n trips.",
    perStep: "A multiplication and an append: O(1) (append is amortized O(1)).",
    verdict: "n × O(1) = O(n).",
    spaceWhy: "The returned list holds n numbers: O(n). All of it is output space; beyond the output it uses O(1).",
  },
  {
    id: "loops-alphabet",
    category: "loops",
    difficulty: "medium",
    lang: "Python",
    title: "A loop over the alphabet",
    code: `def letter_counts(s):
    counts = []
    for letter in "abcdefghijklmnopqrstuvwxyz":
        c = 0
        for ch in s:
            if ch == letter:
                c += 1
        counts.append(c)
    return counts`,
    vars: "n = len(s)",
    time: "O(n)",
    timeOptions: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "It looks nested, but the outer loop always runs exactly 26 times. The inner loop runs n times. Total 26n trips.",
    perStep: "One character comparison: O(1).",
    verdict: "26 × n × O(1) = O(n). Nesting only multiplies by n when BOTH loops grow with the input; 26 is a constant.",
    spaceWhy: "counts always has 26 entries, a constant: O(1).",
  },
  {
    id: "loops-early-exit",
    category: "loops",
    difficulty: "easy",
    lang: "C#",
    title: "Early exit (worst case)",
    code: `int FirstNegative(int[] a)
{
    for (int i = 0; i < a.Length; i++)
        if (a[i] < 0) return i;
    return -1;
}`,
    vars: "n = a.Length",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Best case 1 trip (a[0] is negative). Worst case, no negatives at all: n trips.",
    perStep: "One comparison: O(1).",
    verdict: "Worst case n × O(1) = O(n). An early return helps the best case, not the Big O. Say both out loud: \"O(n) worst case, O(1) best case.\"",
    spaceWhy: "Just i: O(1).",
  },
  {
    id: "loops-countdown-three",
    category: "loops",
    difficulty: "easy",
    lang: "Python",
    title: "Counting down by three",
    code: `def countdown(n):
    steps = 0
    while n > 0:
        n -= 3
        steps += 1
    return steps`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: ["O(1)", "O(log n)", "O(√n)", "O(n)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "n shrinks by a constant 3 each trip, so it takes about n / 3 trips to reach 0.",
    perStep: "A subtraction and an increment: O(1).",
    verdict: "n / 3 × O(1) = O(n). Subtracting a constant is linear; DIVIDING by a constant would be logarithmic.",
    spaceWhy: "Two integers: O(1).",
  },

  // ---------------- Nested and dependent loops ----------------
  {
    id: "nested-matrix-sum",
    category: "nested",
    difficulty: "easy",
    lang: "C#",
    title: "Sum an n by n grid",
    code: `int Sum(int[,] grid)   // n by n
{
    int n = grid.GetLength(0), total = 0;
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            total += grid[r, c];
    return total;
}`,
    vars: "n = number of rows (and columns)",
    time: "O(n²)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "n rows, and n columns inside each: n × n trips.",
    perStep: "One index and one addition: O(1).",
    verdict: "n² × O(1) = O(n²). Note that this is linear in the number of CELLS. If the interviewer calls the cell count N, the same code is O(N): always say which n you mean.",
    spaceWhy: "total, r and c: O(1).",
  },
  {
    id: "nested-pairs",
    category: "nested",
    difficulty: "easy",
    lang: "Python",
    title: "Every pair, once",
    code: `def count_close_pairs(nums, d):
    count = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if abs(nums[i] - nums[j]) <= d:
                count += 1
    return count`,
    vars: "n = len(nums)",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "The inner loop runs n minus 1, then n minus 2, and so on: n(n minus 1) / 2 trips in total.",
    perStep: "A subtraction, abs and a comparison: O(1).",
    verdict: "n(n minus 1) / 2 is about n² / 2. Drop the half: O(n²). Starting j at i + 1 halves the work but keeps the class.",
    spaceWhy: "count, i and j: O(1).",
  },
  {
    id: "nested-triples",
    category: "nested",
    difficulty: "medium",
    lang: "C#",
    title: "Every triple",
    code: `int CountZeroTriples(int[] a)
{
    int n = a.Length, count = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++)
                if (a[i] + a[j] + a[k] == 0) count++;
    return count;
}`,
    vars: "n = a.Length",
    time: "O(n³)",
    timeOptions: ["O(n²)", "O(n² log n)", "O(n³)", "O(2ⁿ)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Three nested loops that each depend on the one outside: one trip per triple i < j < k, which is n choose 3, about n³ / 6.",
    perStep: "Two additions and a comparison: O(1).",
    verdict: "n³ / 6 × O(1) = O(n³).",
    spaceWhy: "A few integers: O(1).",
  },
  {
    id: "nested-i-squared",
    category: "nested",
    difficulty: "hard",
    lang: "Python",
    title: "An inner loop of i squared",
    code: `def work(n):
    total = 0
    for i in range(n):
        for j in range(i * i):
            total += 1
    return total`,
    vars: "n is the input value",
    time: "O(n³)",
    timeOptions: ["O(n²)", "O(n² log n)", "O(n³)", "O(2ⁿ)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Trip i of the outer loop runs the inner loop i² times. Total 0 + 1 + 4 + 9 + ... + (n minus 1)², which is about n³ / 3.",
    perStep: "One increment: O(1).",
    verdict: "Sum of i² up to n is about n³ / 3, so O(n³). When the inner bound depends on i, add up the inner counts instead of guessing n × n.",
    spaceWhy: "range() is lazy, so only total, i and j exist: O(1).",
  },
  {
    id: "nested-constant-inner",
    category: "nested",
    difficulty: "medium",
    lang: "C#",
    title: "A five-wide window",
    code: `int[] Smooth(int[] a)
{
    var result = new int[a.Length];
    for (int i = 0; i < a.Length; i++)
        for (int k = -2; k <= 2; k++)
        {
            int j = Math.Clamp(i + k, 0, a.Length - 1);
            result[i] += a[j];
        }
    return result;
}`,
    vars: "n = a.Length",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Outer loop n trips; the inner loop always runs exactly 5 trips. 5n in total.",
    perStep: "A clamp and an addition: O(1).",
    verdict: "5n × O(1) = O(n). A nested loop with a constant bound is just a bigger constant.",
    spaceWhy: "The result array has n entries: O(n), all of it output.",
  },
  {
    id: "nested-doubling-bound",
    category: "nested",
    difficulty: "hard",
    lang: "C#",
    title: "Inner loop up to a doubling i",
    code: `int Work(int n)
{
    int ops = 0;
    for (int i = 1; i < n; i *= 2)
        for (int j = 0; j < i; j++)
            ops++;
    return ops;
}`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "The outer loop runs log n times with i = 1, 2, 4, 8 ... The inner loop runs i times, so the total is 1 + 2 + 4 + ... up to n.",
    perStep: "One increment: O(1).",
    verdict: "A doubling series sums to less than 2n, so the total is O(n), not O(n log n). The last term dominates a geometric series.",
    spaceWhy: "Three integers: O(1).",
  },
  {
    id: "nested-harmonic",
    category: "nested",
    difficulty: "hard",
    lang: "Python",
    title: "Multiples of every i",
    code: `def multiples(n):
    count = 0
    for i in range(1, n + 1):
        for j in range(i, n + 1, i):
            count += 1
    return count`,
    vars: "n is the input value",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "For each i the inner loop steps by i, so it runs about n / i times. Total n/1 + n/2 + n/3 + ... + n/n.",
    perStep: "One increment: O(1).",
    verdict: "n × (1 + 1/2 + ... + 1/n) is n times the harmonic number, about n ln n: O(n log n). The Sieve of Eratosthenes has this shape but runs the inner loop only for prime i, which brings it down to O(n log log n).",
    spaceWhy: "count, i and j: O(1).",
  },
  {
    id: "nested-shared-pointer",
    category: "nested",
    difficulty: "hard",
    lang: "C#",
    title: "An inner pointer that never resets",
    code: `long CountSmaller(int[] a, int[] b)   // both sorted, both length n
{
    int j = 0;
    long total = 0;
    for (int i = 0; i < a.Length; i++)
    {
        while (j < b.Length && b[j] < a[i]) j++;
        total += j;
    }
    return total;
}`,
    vars: "n = a.Length = b.Length",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "The outer loop runs n times. j is declared OUTSIDE the loop and only ever moves forward, so across the whole run the while loop advances at most n times in total.",
    perStep: "Each outer trip and each inner advance is O(1).",
    verdict: "n outer trips + at most n inner advances = O(n). Count the total movement of the inner pointer, not \"n per outer trip\".",
    spaceWhy: "i, j and total: O(1).",
  },
  {
    id: "nested-grid-build",
    category: "nested",
    difficulty: "easy",
    lang: "Python",
    title: "Build an n by n grid",
    code: `def make_grid(n):
    return [[0] * n for _ in range(n)]`,
    vars: "n is the input value (the side length)",
    time: "O(n²)",
    timeOptions: BASIC,
    space: "O(n²)",
    spaceOptions: BASIC,
    structure: "The comprehension runs n times, and each [0] * n writes n cells.",
    perStep: "Creating one row of n zeros costs O(n).",
    verdict: "n rows × O(n) per row = O(n²). Allocating memory is work too.",
    spaceWhy: "n² cells in the returned grid: O(n²).",
  },
  {
    id: "nested-log-inner",
    category: "nested",
    difficulty: "medium",
    lang: "C#",
    title: "Halving inside a linear loop",
    code: `int Work(int n)
{
    int ops = 0;
    for (int i = 1; i <= n; i++)
        for (int j = i; j > 0; j /= 2)
            ops++;
    return ops;
}`,
    vars: "n is the input value",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Outer loop n trips. The inner loop halves j from i down to 0: about log i + 1 trips.",
    perStep: "One increment: O(1).",
    verdict: "Sum of log i for i up to n is log(n!), which is Θ(n log n). So O(n log n).",
    spaceWhy: "Three integers: O(1).",
  },

  // ---------------- Halving and doubling ----------------
  {
    id: "log-binary-search",
    category: "logarithmic",
    difficulty: "easy",
    lang: "C#",
    title: "Binary search",
    code: `int Find(int[] sorted, int target)
{
    int lo = 0, hi = sorted.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;
        if (sorted[mid] == target) return mid;
        if (sorted[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}`,
    vars: "n = sorted.Length",
    time: "O(log n)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Every trip throws away half of the remaining range, so after k trips n / 2ᵏ items remain: about log₂ n trips.",
    perStep: "One index, two comparisons: O(1).",
    verdict: "log n × O(1) = O(log n). A million items take about 20 trips.",
    spaceWhy: "lo, hi and mid: O(1). (The recursive version would use O(log n) stack.)",
  },
  {
    id: "log-digits",
    category: "logarithmic",
    difficulty: "easy",
    lang: "Python",
    title: "Count the digits",
    code: `def digit_count(n):
    count = 1
    while n >= 10:
        n //= 10
        count += 1
    return count`,
    vars: "n is the input value (non-negative)",
    time: "O(log n)",
    timeOptions: ["O(1)", "O(log n)", "O(√n)", "O(n)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Each trip divides n by 10, so the trip count is the number of digits, log₁₀ n.",
    perStep: "An integer division: O(1) for machine-sized numbers.",
    verdict: "log₁₀ n × O(1) = O(log n). The base of a log is a constant factor (log₁₀ n = log₂ n / log₂ 10), so Big O never writes it.",
    spaceWhy: "Two integers: O(1).",
  },
  {
    id: "log-times-three",
    category: "logarithmic",
    difficulty: "easy",
    lang: "C#",
    title: "Tripling",
    code: `int Steps(int n)
{
    int steps = 0;
    for (long i = 1; i < n; i *= 3)
        steps++;
    return steps;
}`,
    vars: "n is the input value",
    time: "O(log n)",
    timeOptions: ["O(1)", "O(log n)", "O(n / 3)", "O(n)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "i takes the values 1, 3, 9, 27 ...: it passes n after log₃ n trips.",
    perStep: "A multiplication and an increment: O(1).",
    verdict: "log₃ n × O(1) = O(log n). Multiplying (or dividing) by any constant bigger than 1 gives a logarithmic loop.",
    spaceWhy: "Two integers: O(1).",
  },
  {
    id: "log-fast-pow",
    category: "logarithmic",
    difficulty: "medium",
    lang: "Python",
    title: "Fast modular power",
    code: `def power_mod(x, n, m):
    result = 1
    x %= m
    while n > 0:
        if n % 2 == 1:
            result = result * x % m
        x = x * x % m
        n //= 2
    return result`,
    vars: "n is the exponent; m fits in a machine word",
    time: "O(log n)",
    timeOptions: ["O(1)", "O(log n)", "O(√n)", "O(n)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "n is halved every trip, so the loop runs once per bit of n: about log₂ n trips.",
    perStep: "At most two multiplications and a modulo on numbers smaller than m: O(1).",
    verdict: "log n × O(1) = O(log n), against O(n) for multiplying x by itself n times.",
    spaceWhy: "Three integers, each kept below m by the modulo: O(1).",
  },
  {
    id: "log-sqrt-loop",
    category: "logarithmic",
    difficulty: "hard",
    lang: "C#",
    title: "Repeated square roots",
    code: `int Steps(double n)
{
    int steps = 0;
    while (n > 2)
    {
        n = Math.Sqrt(n);
        steps++;
    }
    return steps;
}`,
    vars: "n is the input value",
    time: "O(log log n)",
    timeOptions: ["O(1)", "O(log log n)", "O(log n)", "O(√n)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Write n as 2 to the power x. A square root halves the EXPONENT: x, x / 2, x / 4 ... so it takes log x trips, and x = log n.",
    perStep: "One square root: O(1).",
    verdict: "log(log n) × O(1) = O(log log n). Halving the value gives log n; halving the log gives log log n.",
    spaceWhy: "n and steps: O(1).",
  },
  {
    id: "log-halving-work",
    category: "logarithmic",
    difficulty: "hard",
    lang: "Python",
    title: "Halve, but do all the work each time",
    code: `def work(n):
    ops = 0
    size = n
    while size > 0:
        for _ in range(size):
            ops += 1
        size //= 2
    return ops`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "The outer loop runs log n times, but the inner loop runs size times and size halves: n + n/2 + n/4 + ...",
    perStep: "One increment: O(1).",
    verdict: "A halving series sums to less than 2n: O(n). It is NOT log n × n, because the inner loop shrinks.",
    spaceWhy: "Three integers: O(1).",
  },
  {
    id: "log-recursive-bs",
    category: "logarithmic",
    difficulty: "medium",
    lang: "Python",
    title: "Recursive binary search",
    code: `def find(a, target, lo, hi):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if a[mid] == target:
        return mid
    if a[mid] < target:
        return find(a, target, mid + 1, hi)
    return find(a, target, lo, mid - 1)`,
    vars: "n = hi minus lo + 1 on the first call",
    time: "O(log n)",
    timeOptions: BASIC,
    space: "O(log n)",
    spaceOptions: BASIC,
    structure: "Each call makes ONE recursive call on half the range: log n calls.",
    perStep: "Each call does O(1) work (it passes indexes, not slices).",
    verdict: "log n calls × O(1) = O(log n).",
    spaceWhy: "Every call waits for the one it made, so log n frames are on the stack at the deepest point: O(log n). Python does not eliminate tail calls, so the iterative loop is the O(1) space version.",
  },
  {
    id: "log-exponential-search",
    category: "logarithmic",
    difficulty: "medium",
    lang: "C#",
    title: "Gallop, then binary search",
    code: `int FirstAtLeast(int[] sorted, int target)   // target <= last element
{
    int bound = 1;
    while (bound < sorted.Length && sorted[bound] < target)
        bound *= 2;
    int lo = bound / 2, hi = Math.Min(bound, sorted.Length - 1);
    while (lo < hi)
    {
        int mid = (lo + hi) / 2;
        if (sorted[mid] < target) lo = mid + 1; else hi = mid;
    }
    return lo;
}`,
    vars: "n = sorted.Length",
    time: "O(log n)",
    timeOptions: ["O(1)", "O(log n)", "O(log² n)", "O(n)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Two loops one after the other. The first doubles bound until it passes the target: at most log n trips. The second binary searches a range of at most bound / 2 items: at most log n trips.",
    perStep: "Each trip is O(1).",
    verdict: "log n + log n = O(log n). Sequential loops add, and two logs are still one log. (Precisely it is O(log p), where p is the answer's position.)",
    spaceWhy: "A few integers: O(1).",
  },
  {
    id: "log-halving-outer-full-inner",
    category: "logarithmic",
    difficulty: "medium",
    lang: "C#",
    title: "Halving outside, full pass inside",
    code: `int Work(int[] a)
{
    int ops = 0;
    for (int size = a.Length; size > 1; size /= 2)
        foreach (var x in a)
            ops += x & 1;
    return ops;
}`,
    vars: "n = a.Length",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "The outer loop halves size: log n trips. The inner loop walks the WHOLE array every time (it does not use size): n trips.",
    perStep: "A bitwise AND and an addition: O(1).",
    verdict: "log n × n × O(1) = O(n log n). Compare with the snippet where the inner loop shrinks with size: that one was O(n).",
    spaceWhy: "ops and size: O(1).",
  },

  // ---------------- Recursion and recurrences ----------------
  {
    id: "rec-factorial",
    category: "recursion",
    difficulty: "easy",
    lang: "C#",
    title: "Recursive factorial",
    code: `long Factorial(int n)
{
    if (n <= 1) return 1;
    return n * Factorial(n - 1);
}`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "One recursive call per call, with n going down by 1: a chain of n calls. T(n) = T(n minus 1) + O(1).",
    perStep: "One multiplication per call: O(1).",
    verdict: "n calls × O(1) = O(n).",
    spaceWhy: "Each call waits for the next to return, so n frames sit on the call stack at once: O(n).",
  },
  {
    id: "rec-sum-index",
    category: "recursion",
    difficulty: "easy",
    lang: "Python",
    title: "Recursive sum with an index",
    code: `def total(a, i=0):
    if i == len(a):
        return 0
    return a[i] + total(a, i + 1)`,
    vars: "n = len(a)",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "One call per index: n + 1 calls in a chain.",
    perStep: "An index and an addition: O(1). The list is passed by reference, not copied.",
    verdict: "n calls × O(1) = O(n).",
    spaceWhy: "n frames deep at the bottom of the chain: O(n) stack (and Python's default recursion limit of about 1000 makes this fail for large lists).",
  },
  {
    id: "rec-sum-slice",
    category: "recursion",
    difficulty: "hard",
    lang: "Python",
    title: "Recursive sum with slicing",
    code: `def total(a):
    if not a:
        return 0
    return a[0] + total(a[1:])`,
    vars: "n = len(a)",
    time: "O(n²)",
    timeOptions: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    space: "O(n²)",
    spaceOptions: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
    structure: "Still one call per element: n calls.",
    perStep: "a[1:] COPIES the rest of the list: n minus 1 items, then n minus 2, and so on. Each call costs O(length of its list).",
    verdict: "(n minus 1) + (n minus 2) + ... + 1 = about n² / 2: O(n²). Passing an index instead of a slice makes it O(n).",
    spaceWhy: "Every frame keeps its own slice alive until it returns, and all n frames are live at the bottom: n + (n minus 1) + ... items = O(n²).",
  },
  {
    id: "rec-fib",
    category: "recursion",
    difficulty: "medium",
    lang: "C#",
    title: "Naive Fibonacci",
    code: `long Fib(int n)
{
    if (n <= 1) return n;
    return Fib(n - 1) + Fib(n - 2);
}`,
    vars: "n is the input value",
    time: "O(2ⁿ)",
    timeOptions: ["O(n)", "O(n²)", "O(2ⁿ)", "O(n!)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(n)", "O(n²)", "O(2ⁿ)"],
    structure: "Two calls per call and the tree is about n levels deep, so the call count roughly doubles per level: about 2ⁿ calls (more exactly φⁿ, about 1.618ⁿ).",
    perStep: "One addition per call: O(1).",
    verdict: "About 2ⁿ calls × O(1) = O(2ⁿ). The waste is recomputing the same Fib(k) over and over.",
    spaceWhy: "The stack only holds ONE path from the root to a leaf at a time, and the longest path is n deep: O(n). The tree is huge but it is never all in memory at once.",
  },
  {
    id: "rec-fib-memo",
    category: "recursion",
    difficulty: "medium",
    lang: "Python",
    title: "Memoized Fibonacci",
    code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n²)", "O(2ⁿ)"],
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Each distinct fib(k) for k from 0 to n is computed once; every repeat is a cache hit. About 2n calls in total.",
    perStep: "A cache lookup (O(1) average) and one addition (treating the addition as O(1)).",
    verdict: "O(n) distinct subproblems × O(1) each = O(n). Memoization turns exponential into linear here because there are only n + 1 different arguments.",
    spaceWhy: "The cache holds n + 1 entries and the first descent is n frames deep: O(n) + O(n) = O(n).",
  },
  {
    id: "rec-linear-plus-loop",
    category: "recursion",
    difficulty: "hard",
    lang: "C#",
    title: "Recursion that scans first",
    code: `int F(int[] a, int n)
{
    if (n == 0) return 0;
    int best = 0;
    for (int i = 0; i < n; i++)
        best = Math.Max(best, a[i]);
    return best + F(a, n - 1);
}`,
    vars: "n = the length on the first call",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "One recursive call per call, n going down by 1: n calls. T(n) = T(n minus 1) + O(n).",
    perStep: "Call k scans k elements: O(k).",
    verdict: "n + (n minus 1) + ... + 1 = n(n + 1) / 2 = O(n²). This recurrence is the shape of selection sort.",
    spaceWhy: "n frames on the stack at the deepest point, O(1) each: O(n).",
  },
  {
    id: "rec-three-branches",
    category: "recursion",
    difficulty: "medium",
    lang: "Python",
    title: "Three calls per call",
    code: `def f(n):
    if n <= 0:
        return 1
    return f(n - 1) + f(n - 1) + f(n - 1)`,
    vars: "n is the input value",
    time: "O(3ⁿ)",
    timeOptions: ["O(n)", "O(n³)", "O(2ⁿ)", "O(3ⁿ)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(n)", "O(n³)", "O(3ⁿ)"],
    structure: "Each call makes 3 calls and the depth is n: level k has 3ᵏ calls, about 3ⁿ in total.",
    perStep: "Two additions: O(1).",
    verdict: "Branching factor to the power of depth: 3ⁿ × O(1) = O(3ⁿ). This is not O(2ⁿ): 3ⁿ / 2ⁿ = 1.5ⁿ grows without bound, so the base matters.",
    spaceWhy: "Only one root to leaf path is on the stack at a time: depth n, O(n).",
  },
  {
    id: "rec-halves-both",
    category: "recursion",
    difficulty: "hard",
    lang: "C#",
    title: "Two calls on half each",
    code: `int Count(int n)
{
    if (n <= 1) return 1;
    return Count(n / 2) + Count(n / 2);
}`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n log n)", "O(2ⁿ)"],
    space: "O(log n)",
    spaceOptions: BASIC,
    structure: "Two calls per call, but the argument halves, so the depth is only log n. Level k has 2ᵏ calls; the last level has 2 to the log n = n calls.",
    perStep: "O(1) per call.",
    verdict: "1 + 2 + 4 + ... + n is about 2n calls: O(n). Master theorem: T(n) = 2T(n/2) + O(1), a = 2, b = 2, d = 0, log₂ 2 = 1 > 0, so O(n¹).",
    spaceWhy: "The deepest path is log n calls: O(log n).",
  },
  {
    id: "rec-halve-once",
    category: "recursion",
    difficulty: "easy",
    lang: "Python",
    title: "One call on half",
    code: `def halvings(n):
    if n <= 1:
        return 0
    return 1 + halvings(n // 2)`,
    vars: "n is the input value",
    time: "O(log n)",
    timeOptions: BASIC,
    space: "O(log n)",
    spaceOptions: BASIC,
    structure: "One call per call with n halving: a chain of log n calls. T(n) = T(n/2) + O(1).",
    perStep: "O(1) per call.",
    verdict: "log n × O(1) = O(log n), the recurrence of binary search.",
    spaceWhy: "The chain is log n frames deep: O(log n).",
  },
  {
    id: "rec-sum-of-smaller",
    category: "recursion",
    difficulty: "hard",
    lang: "Python",
    title: "A call for every smaller value",
    code: `def ways(n):
    if n == 0:
        return 1
    return sum(ways(i) for i in range(n))`,
    vars: "n is the input value",
    time: "O(2ⁿ)",
    timeOptions: ["O(n²)", "O(n³)", "O(2ⁿ)", "O(n!)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(n)", "O(n²)", "O(2ⁿ)"],
    structure: "ways(n) calls ways(0) through ways(n minus 1). Let C(n) be the call count: C(0) = 1 and C(n) = 1 + C(0) + ... + C(n minus 1), which solves to C(n) = 2ⁿ.",
    perStep: "Each call does O(1) work besides its own loop over its children.",
    verdict: "2ⁿ calls, each O(1) apart from the children it starts: O(2ⁿ). Memoizing it would make it O(n²): n distinct values, each summing up to n results.",
    spaceWhy: "The deepest chain is ways(n) to ways(n minus 1) and so on down to 0: n frames (plus a generator per frame), O(n).",
  },

  // ---------------- Divide and conquer ----------------
  {
    id: "dc-merge-sort",
    category: "divide",
    difficulty: "medium",
    lang: "C#",
    title: "Merge sort",
    code: `void MergeSort(int[] a, int lo, int hi)   // sorts a[lo..hi)
{
    if (hi - lo < 2) return;
    int mid = (lo + hi) / 2;
    MergeSort(a, lo, mid);
    MergeSort(a, mid, hi);
    var merged = new int[hi - lo];
    int i = lo, j = mid, k = 0;
    while (i < mid && j < hi) merged[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i < mid) merged[k++] = a[i++];
    while (j < hi) merged[k++] = a[j++];
    Array.Copy(merged, 0, a, lo, merged.Length);
}`,
    vars: "n = hi minus lo on the first call",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    structure: "Two calls on halves, so log n levels. Every level merges all n elements between its calls.",
    perStep: "Merging a range of size k costs O(k), so each level costs O(n) in total.",
    verdict: "log n levels × O(n) per level = O(n log n). Master theorem: T(n) = 2T(n/2) + O(n), log₂ 2 = 1 = d, so O(n log n).",
    spaceWhy: "Each merge buffer is created after both recursive calls return and is garbage once copied back, so at most one big buffer is live at a time (size n at the top), plus log n stack frames: O(n). The total ALLOCATED is n log n, but space counts the peak.",
  },
  {
    id: "dc-quicksort-lists",
    category: "divide",
    difficulty: "medium",
    lang: "Python",
    title: "Quicksort with new lists (average case)",
    code: `def quicksort(a):
    if len(a) <= 1:
        return a
    pivot = a[len(a) // 2]
    left = [x for x in a if x < pivot]
    mid = [x for x in a if x == pivot]
    right = [x for x in a if x > pivot]
    return quicksort(left) + mid + quicksort(right)`,
    vars: "n = len(a)",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    structure: "On average the pivot splits the list roughly in half, so there are about log n levels of recursion.",
    perStep: "Each call makes three passes and one concatenation over its own list: O(k) for a list of k, so O(n) per level.",
    verdict: "Average: log n levels × O(n) = O(n log n). Worst case (a pivot that is always the smallest or largest) is n levels: O(n²). Say both.",
    spaceWhy: "A frame at depth d holds lists totalling about n / 2ᵈ items, so the live lists along one path sum to n + n/2 + ... = O(n) on average, plus the O(n) result. Worst case it is O(n²).",
  },
  {
    id: "dc-max-halves",
    category: "divide",
    difficulty: "medium",
    lang: "C#",
    title: "Maximum by halves",
    code: `int Max(int[] a, int lo, int hi)   // a[lo..hi], non-empty
{
    if (lo == hi) return a[lo];
    int mid = (lo + hi) / 2;
    return Math.Max(Max(a, lo, mid), Max(a, mid + 1, hi));
}`,
    vars: "n = hi minus lo + 1",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(log n)",
    spaceOptions: BASIC,
    structure: "Two calls on halves: log n levels, with 1, 2, 4 ... n calls per level, about 2n calls in all.",
    perStep: "O(1) per call (one comparison).",
    verdict: "T(n) = 2T(n/2) + O(1) gives O(n): the same as a plain loop. Divide and conquer is not automatically n log n; it depends on the work per call.",
    spaceWhy: "Recursion depth log n: O(log n).",
  },
  {
    id: "dc-in-place-nlogn",
    category: "divide",
    difficulty: "hard",
    lang: "Python",
    title: "Split by indexes, scan each range",
    code: `def visit(a, lo, hi):
    if hi - lo <= 1:
        return 0
    mid = (lo + hi) // 2
    total = visit(a, lo, mid) + visit(a, mid, hi)
    for i in range(lo, hi):
        total += a[i]
    return total`,
    vars: "n = hi minus lo on the first call",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(log n)",
    spaceOptions: BASIC,
    structure: "Two calls on halves: log n levels.",
    perStep: "Each call loops over its own range, so each level does n work in total.",
    verdict: "T(n) = 2T(n/2) + O(n) = O(n log n), the merge sort recurrence.",
    spaceWhy: "Indexes instead of slices, so nothing is copied; the stack is log n deep: O(log n).",
  },
  {
    id: "dc-quadratic-combine",
    category: "divide",
    difficulty: "hard",
    lang: "C#",
    title: "Halves with a quadratic combine",
    code: `long Work(int[] a, int lo, int hi)
{
    if (hi - lo <= 1) return 0;
    int mid = (lo + hi) / 2;
    long total = Work(a, lo, mid) + Work(a, mid, hi);
    for (int i = lo; i < hi; i++)
        for (int j = lo; j < hi; j++)
            total += a[i] ^ a[j];
    return total;
}`,
    vars: "n = hi minus lo on the first call",
    time: "O(n²)",
    timeOptions: ["O(n log n)", "O(n²)", "O(n² log n)", "O(n³)"],
    space: "O(log n)",
    spaceOptions: BASIC,
    structure: "Two calls on halves: log n levels. A call on k items does k² work.",
    perStep: "The top call does n², its children 2 × (n/2)² = n² / 2, then n² / 4 ...",
    verdict: "n² + n²/2 + n²/4 + ... < 2n², so O(n²): the top level dominates. Master theorem: a = 2, b = 2, d = 2, log₂ 2 = 1 < 2, so O(n²).",
    spaceWhy: "Depth log n, O(1) per frame: O(log n).",
  },
  {
    id: "dc-bs-slices",
    category: "divide",
    difficulty: "hard",
    lang: "Python",
    title: "Binary search that slices",
    code: `def contains(a, target):
    if not a:
        return False
    mid = len(a) // 2
    if a[mid] == target:
        return True
    if a[mid] < target:
        return contains(a[mid + 1:], target)
    return contains(a[:mid], target)`,
    vars: "n = len(a), sorted",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n log n)", "O(log² n)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    structure: "log n calls, one per halving, as in any binary search.",
    perStep: "But each call copies half its list: n/2, then n/4, then n/8 ...",
    verdict: "n/2 + n/4 + ... < n, so the slicing makes it O(n). T(n) = T(n/2) + O(n) = O(n). It is still correct, just no faster than a linear scan.",
    spaceWhy: "Every frame's slice stays alive until it returns: n/2 + n/4 + ... = O(n).",
  },
  {
    id: "dc-three-halves",
    category: "divide",
    difficulty: "hard",
    lang: "C#",
    title: "Three calls on halves (the Karatsuba shape)",
    code: `long Work(int[] a, int lo, int hi)
{
    int n = hi - lo;
    if (n <= 1) return n;
    int half = n / 2, quarter = n / 4;
    long total = Work(a, lo, lo + half)
               + Work(a, lo + half, hi)
               + Work(a, lo + quarter, lo + quarter + half);
    for (int i = lo; i < hi; i++) total += a[i];
    return total;
}`,
    vars: "n = hi minus lo on the first call",
    time: "O(n^1.58)",
    timeOptions: ["O(n log n)", "O(n^1.58)", "O(n²)", "O(3ⁿ)"],
    space: "O(log n)",
    spaceOptions: BASIC,
    structure: "Three calls, each on about half the range: log₂ n levels, and level k has 3ᵏ calls.",
    perStep: "A call on k items does a k-step loop, so level k does 3ᵏ × n / 2ᵏ = n × 1.5ᵏ work: it GROWS per level.",
    verdict: "The leaves dominate: 3 to the log₂ n = n to the log₂ 3, about n^1.58. Master theorem: a = 3, b = 2, d = 1, log₂ 3 ≈ 1.58 > 1, so O(n^log₂3). This is why Karatsuba multiplication beats the O(n²) schoolbook method.",
    spaceWhy: "Depth log n, O(1) per frame: O(log n).",
  },
  {
    id: "dc-halve-sum",
    category: "divide",
    difficulty: "medium",
    lang: "Python",
    title: "Sum, then recurse on the first half",
    code: `def shrink(a):
    if len(a) <= 1:
        return 0
    s = sum(a)
    return s + shrink(a[:len(a) // 2])`,
    vars: "n = len(a)",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "One call per halving: log n calls. T(n) = T(n/2) + O(n).",
    perStep: "Call on k items: sum is O(k) and the slice is O(k).",
    verdict: "n + n/2 + n/4 + ... < 2n: O(n). Master theorem: a = 1, b = 2, d = 1, log₂ 1 = 0 < 1, so O(n¹).",
    spaceWhy: "The slices along the chain stay alive: n/2 + n/4 + ... = O(n).",
  },
];

const PART_TWO: GymSnippet[] = [
  // ---------------- Amortized ----------------
  {
    id: "am-list-add",
    category: "amortized",
    difficulty: "easy",
    lang: "C#",
    title: "Appending n items to a List",
    code: `List<int> Build(int n)
{
    var list = new List<int>();
    for (int i = 0; i < n; i++)
        list.Add(i);
    return list;
}`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n calls to Add.",
    perStep: "Most Adds write into spare capacity: O(1). When the backing array is full, List doubles it and copies everything: O(current size), but that happens only at sizes 4, 8, 16 ...",
    verdict: "Total copying is 4 + 8 + ... + n < 2n, so n Adds cost O(n) in total: amortized O(1) per Add. A single Add can still be O(n) in the worst case.",
    spaceWhy: "The list holds n items (capacity at most 2n): O(n).",
  },
  {
    id: "am-distinct-window",
    category: "amortized",
    difficulty: "medium",
    lang: "Python",
    title: "Longest run of distinct values",
    code: `def longest_distinct(nums):
    seen = set()
    best = left = 0
    for right, x in enumerate(nums):
        while x in seen:
            seen.remove(nums[left])
            left += 1
        seen.add(x)
        best = max(best, right - left + 1)
    return best`,
    vars: "n = len(nums)",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "right moves n times. The inner while moves left forward, and left never moves back, so it advances at most n times over the WHOLE run.",
    perStep: "Set add, remove and membership are O(1) average.",
    verdict: "Each element enters the window once and leaves at most once: at most 2n steps, O(n) average. The nested while is the classic sliding window disguise.",
    spaceWhy: "The set can hold every element if they are all distinct: O(n).",
  },
  {
    id: "am-next-greater",
    category: "amortized",
    difficulty: "medium",
    lang: "C#",
    title: "Next greater element with a stack",
    code: `int[] NextGreater(int[] a)
{
    var result = new int[a.Length];
    Array.Fill(result, -1);
    var stack = new Stack<int>();   // indexes still waiting
    for (int i = 0; i < a.Length; i++)
    {
        while (stack.Count > 0 && a[stack.Peek()] < a[i])
            result[stack.Pop()] = a[i];
        stack.Push(i);
    }
    return result;
}`,
    vars: "n = a.Length",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "The for loop runs n times. The while loop pops, and every index is pushed exactly once, so it can be popped at most once: at most n pops in the whole run.",
    perStep: "Push, pop and peek are O(1).",
    verdict: "n pushes + at most n pops = O(n). Count operations per ELEMENT across the run, not per outer trip.",
    spaceWhy: "The stack can hold all n indexes (a decreasing array never pops), plus the n-element result: O(n).",
  },
  {
    id: "am-two-pointer",
    category: "amortized",
    difficulty: "easy",
    lang: "Python",
    title: "Two pointers on a sorted list",
    code: `def has_pair(sorted_nums, target):
    i, j = 0, len(sorted_nums) - 1
    while i < j:
        s = sorted_nums[i] + sorted_nums[j]
        if s == target:
            return True
        if s < target:
            i += 1
        else:
            j -= 1
    return False`,
    vars: "n = len(sorted_nums)",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Every trip moves i right or j left, and they start n apart: at most n minus 1 trips before they meet.",
    perStep: "One addition and comparisons: O(1).",
    verdict: "O(n). Measure the distance the pointers close, not the loop shape. (Sorting first would add O(n log n).)",
    spaceWhy: "Two indexes: O(1).",
  },
  {
    id: "am-two-stack-queue",
    category: "amortized",
    difficulty: "medium",
    lang: "C#",
    title: "Queue from two stacks: n operations",
    code: `class TwoStackQueue
{
    private readonly Stack<int> inbox = new(), outbox = new();

    public void Enqueue(int x) => inbox.Push(x);

    public int Dequeue()
    {
        if (outbox.Count == 0)
            while (inbox.Count > 0) outbox.Push(inbox.Pop());
        return outbox.Pop();
    }
}
// n operations in total, any mix of Enqueue and Dequeue`,
    vars: "n = total number of operations",
    time: "O(n)",
    timeOptions: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "A single Dequeue can move everything from inbox to outbox: O(n) for that one call.",
    perStep: "But each element is pushed to inbox once, moved to outbox once and popped once: three O(1) operations over its whole life.",
    verdict: "n operations × at most 3 moves each = O(n) total, amortized O(1) per operation. The worst single call is O(n), and that is worth saying out loud.",
    spaceWhy: "Up to n elements stored across the two stacks: O(n).",
  },
  {
    id: "am-stringbuilder",
    category: "amortized",
    difficulty: "easy",
    lang: "C#",
    title: "StringBuilder appends",
    code: `string Repeat(char c, int n)
{
    var sb = new StringBuilder();
    for (int i = 0; i < n; i++)
        sb.Append(c);
    return sb.ToString();
}`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n appends, then one ToString.",
    perStep: "StringBuilder grows its buffer geometrically, so each Append is amortized O(1); ToString copies n chars once: O(n).",
    verdict: "n × amortized O(1) + O(n) = O(n). The same loop with string += would be O(n²).",
    spaceWhy: "The builder and the final string each hold n chars: O(n).",
  },
  {
    id: "am-stack-prune",
    category: "amortized",
    difficulty: "medium",
    lang: "Python",
    title: "Remove k digits with a stack",
    code: `def remove_k_digits(num, k):
    stack = []
    for d in num:
        while k > 0 and stack and stack[-1] > d:
            stack.pop()
            k -= 1
        stack.append(d)
    stack = stack[:len(stack) - k]
    return "".join(stack).lstrip("0") or "0"`,
    vars: "n = len(num)",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n trips of the for loop; across the whole run the while loop pops at most n times, because each digit is appended once.",
    perStep: "append and pop at the end of a list are O(1); the final slice, join and lstrip are one O(n) pass each.",
    verdict: "O(n) + O(n) + O(n) = O(n).",
    spaceWhy: "The stack, the slice and the joined string are each up to n characters: O(n).",
  },
  {
    id: "am-grow-by-ten",
    category: "amortized",
    difficulty: "hard",
    lang: "C#",
    title: "A list that grows by 10",
    code: `class SlowList
{
    private int[] items = new int[10];
    private int count;

    public void Add(int x)
    {
        if (count == items.Length)
        {
            var bigger = new int[items.Length + 10];
            Array.Copy(items, bigger, count);
            items = bigger;
        }
        items[count++] = x;
    }
}
// Call Add n times`,
    vars: "n = number of Add calls",
    time: "O(n²)",
    timeOptions: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "A resize happens every 10 Adds: n / 10 resizes.",
    perStep: "The k-th resize copies 10k items.",
    verdict: "10 + 20 + 30 + ... + n is about n² / 20: O(n²) total, O(n) amortized per Add. Growing by a constant amount is the mistake; growing by a constant FACTOR (doubling) is what makes appends amortized O(1).",
    spaceWhy: "The array holds n items plus up to 10 spare slots: O(n).",
  },
  {
    id: "am-min-window-sum",
    category: "amortized",
    difficulty: "medium",
    lang: "C#",
    title: "Shortest subarray reaching a sum",
    code: `int ShortestWithSum(int[] a, int target)   // all values positive
{
    int left = 0, sum = 0, best = int.MaxValue;
    for (int right = 0; right < a.Length; right++)
    {
        sum += a[right];
        while (sum >= target)
        {
            best = Math.Min(best, right - left + 1);
            sum -= a[left++];
        }
    }
    return best == int.MaxValue ? 0 : best;
}`,
    vars: "n = a.Length",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "right advances n times and left advances at most n times overall; neither moves backwards.",
    perStep: "Each advance is O(1).",
    verdict: "At most 2n pointer moves: O(n).",
    spaceWhy: "A few integers: O(1).",
  },
  {
    id: "am-dict-inserts",
    category: "amortized",
    difficulty: "medium",
    lang: "Python",
    title: "Filling a dict (resizes included)",
    code: `def index_of_each(nums):
    position = {}
    for i, x in enumerate(nums):
        position[x] = i
    return position`,
    vars: "n = len(nums)",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n inserts.",
    perStep: "An insert is O(1) average. When the table gets too full, the dict allocates a bigger table and reinserts every key: O(size), but the size grows by a constant factor each time.",
    verdict: "Like a dynamic array, the resize costs form a geometric series bounded by a constant times n: O(n) average in total, amortized O(1) per insert.",
    spaceWhy: "Up to n keys and values: O(n).",
  },

  // ---------------- Multiple variables ----------------
  {
    id: "multi-sequential",
    category: "multi",
    difficulty: "easy",
    lang: "C#",
    title: "Two arrays, one after the other",
    code: `long Total(int[] a, int[] b)
{
    long total = 0;
    foreach (var x in a) total += x;
    foreach (var y in b) total += y;
    return total;
}`,
    vars: "n = a.Length, m = b.Length",
    time: "O(n + m)",
    timeOptions: ["O(n)", "O(n + m)", "O(n · m)", "O(n²)"],
    space: "O(1)",
    spaceOptions: ["O(1)", "O(n)", "O(m)", "O(n + m)"],
    structure: "A loop of n trips, then a separate loop of m trips.",
    perStep: "One addition: O(1).",
    verdict: "Sequential work adds: O(n + m). Writing O(n) quietly assumes m is no bigger than n; with two independent inputs, keep both.",
    spaceWhy: "One accumulator: O(1).",
  },
  {
    id: "multi-nested",
    category: "multi",
    difficulty: "easy",
    lang: "Python",
    title: "Compare every pair across two lists",
    code: `def common_count(a, b):
    count = 0
    for x in a:
        for y in b:
            if x == y:
                count += 1
    return count`,
    vars: "n = len(a), m = len(b)",
    time: "O(n · m)",
    timeOptions: ["O(n + m)", "O(n · m)", "O(n²)", "O(n log m)"],
    space: "O(1)",
    spaceOptions: ["O(1)", "O(n)", "O(m)", "O(n · m)"],
    structure: "For each of the n items in a, the inner loop runs over all m items of b.",
    perStep: "One comparison: O(1).",
    verdict: "n × m × O(1) = O(n · m). Only call it O(n²) if the interviewer says both lists have the same length.",
    spaceWhy: "One counter: O(1).",
  },
  {
    id: "multi-set-lookup",
    category: "multi",
    difficulty: "medium",
    lang: "C#",
    title: "Intersect with a HashSet",
    code: `List<int> Common(int[] a, int[] b)
{
    var inB = new HashSet<int>(b);
    var result = new List<int>();
    foreach (var x in a)
        if (inB.Contains(x)) result.Add(x);
    return result;
}`,
    vars: "n = a.Length, m = b.Length",
    time: "O(n + m)",
    timeOptions: ["O(n)", "O(n + m)", "O(n · m)", "O(n log m)"],
    space: "O(n + m)",
    spaceOptions: ["O(1)", "O(m)", "O(n + m)", "O(n · m)"],
    structure: "Building the set is m inserts, then a loop of n trips.",
    perStep: "Insert and Contains are O(1) average; Add on the list is amortized O(1).",
    verdict: "O(m) + n × O(1) = O(n + m) average. With nested loops it would have been O(n · m).",
    spaceWhy: "The set holds up to m values and the result up to n: O(n + m). Building the set from the smaller array is a good follow-up to mention.",
  },
  {
    id: "multi-anagram-keys",
    category: "multi",
    difficulty: "medium",
    lang: "Python",
    title: "Group anagrams by sorted key",
    code: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = "".join(sorted(w))
        groups[key].append(w)
    return list(groups.values())`,
    vars: "n = number of words, L = length of the longest word",
    time: "O(n · L log L)",
    timeOptions: ["O(n log n)", "O(n · L)", "O(n · L log L)", "O(n² · L)"],
    space: "O(n · L)",
    spaceOptions: ["O(n)", "O(L)", "O(n · L)", "O(n² · L)"],
    structure: "One trip per word: n trips.",
    perStep: "sorted(w) is O(L log L); join is O(L); hashing the key is O(L) because hashing a string reads every character.",
    verdict: "n × O(L log L) = O(n · L log L). Using a 26-letter count tuple as the key instead of sorting makes it O(n · L).",
    spaceWhy: "n keys of up to L characters each, plus the groups: O(n · L).",
  },
  {
    id: "multi-top-k",
    category: "multi",
    difficulty: "medium",
    lang: "C#",
    title: "Top k with a size-k heap",
    code: `int[] TopK(int[] nums, int k)
{
    var heap = new PriorityQueue<int, int>();   // min-heap by value
    foreach (var x in nums)
    {
        heap.Enqueue(x, x);
        if (heap.Count > k) heap.Dequeue();
    }
    var result = new int[heap.Count];
    for (int i = 0; i < result.Length; i++) result[i] = heap.Dequeue();
    return result;
}`,
    vars: "n = nums.Length, k = how many to keep",
    time: "O(n log k)",
    timeOptions: ["O(n log n)", "O(n log k)", "O(n · k)", "O(k log n)"],
    space: "O(k)",
    spaceOptions: ["O(1)", "O(k)", "O(n)", "O(n log k)"],
    structure: "One trip per element: n trips, then k dequeues at the end.",
    perStep: "The heap never holds more than k + 1 items, so Enqueue and Dequeue are O(log k).",
    verdict: "n × O(log k) + k × O(log k) = O(n log k). When k is much smaller than n this beats sorting (O(n log n)).",
    spaceWhy: "The heap and the result each hold at most k + 1 items: O(k).",
  },
  {
    id: "multi-knapsack",
    category: "multi",
    difficulty: "hard",
    lang: "Python",
    title: "0/1 knapsack with a capacity array",
    code: `def max_value(weights, values, W):
    best = [0] * (W + 1)
    for i in range(len(weights)):
        for cap in range(W, weights[i] - 1, -1):
            best[cap] = max(best[cap], best[cap - weights[i]] + values[i])
    return best[W]`,
    vars: "n = number of items, W = the capacity (a number)",
    time: "O(n · W)",
    timeOptions: ["O(n)", "O(n log W)", "O(n · W)", "O(2ⁿ)"],
    space: "O(W)",
    spaceOptions: ["O(1)", "O(n)", "O(W)", "O(n · W)"],
    structure: "n items, and for each one a loop over capacities from W down: up to W + 1 trips.",
    perStep: "One max and two lookups: O(1).",
    verdict: "O(n · W). This is pseudo-polynomial: W is a VALUE, and writing W down takes only about log W digits, so doubling the number of digits in W squares the work. That is why knapsack is still NP-hard.",
    spaceWhy: "One array of W + 1 entries: O(W). The 2D table version would be O(n · W).",
  },
  {
    id: "multi-trial-division",
    category: "multi",
    difficulty: "hard",
    lang: "C#",
    title: "Primality by trial division",
    code: `bool IsPrime(long x)
{
    if (x < 2) return false;
    for (long d = 2; d * d <= x; d++)
        if (x % d == 0) return false;
    return true;
}`,
    vars: "x is the input value; it has about log₁₀ x digits",
    time: "O(√x)",
    timeOptions: ["O(1)", "O(log x)", "O(√x)", "O(x)"],
    space: "O(1)",
    spaceOptions: ["O(1)", "O(log x)", "O(√x)", "O(x)"],
    structure: "d runs from 2 while d² ≤ x: about √x trips in the worst case (x prime).",
    perStep: "One multiplication and one modulo: O(1) for a 64-bit number.",
    verdict: "O(√x) in the VALUE of x. Measured in input size (the number of digits D), √x = 10 to the D / 2, which is exponential. Interviewers sometimes probe exactly this difference.",
    spaceWhy: "One loop variable: O(1).",
  },
  {
    id: "multi-grid",
    category: "multi",
    difficulty: "easy",
    lang: "Python",
    title: "Walk a rectangular grid",
    code: `def count_ones(grid):
    count = 0
    for row in grid:
        for cell in row:
            count += cell
    return count`,
    vars: "n = number of rows, m = number of columns",
    time: "O(n · m)",
    timeOptions: ["O(n)", "O(n + m)", "O(n · m)", "O(n²)"],
    space: "O(1)",
    spaceOptions: ["O(1)", "O(n)", "O(m)", "O(n · m)"],
    structure: "n rows, m cells in each: n × m trips.",
    perStep: "One addition: O(1).",
    verdict: "O(n · m), which is linear in the number of cells.",
    spaceWhy: "One counter: O(1).",
  },
  {
    id: "multi-bs-answer",
    category: "multi",
    difficulty: "hard",
    lang: "C#",
    title: "Binary search on the answer",
    code: `int MinSpeed(int[] piles, int hours)   // Koko eating bananas
{
    int lo = 1, hi = piles.Max();
    while (lo < hi)
    {
        int mid = lo + (hi - lo) / 2;
        long needed = 0;
        foreach (var p in piles) needed += (p + mid - 1) / mid;
        if (needed <= hours) hi = mid; else lo = mid + 1;
    }
    return lo;
}`,
    vars: "n = piles.Length, M = the largest pile",
    time: "O(n log M)",
    timeOptions: ["O(n log n)", "O(n log M)", "O(n · M)", "O(log M)"],
    space: "O(1)",
    spaceOptions: ["O(1)", "O(log M)", "O(n)", "O(M)"],
    structure: "The binary search is over SPEEDS from 1 to M, not over the array: log M trips. piles.Max() is one O(n) pass first.",
    perStep: "Each trip checks a speed with a full pass over the piles: O(n).",
    verdict: "O(n) + log M × O(n) = O(n log M). Name M explicitly; it is a value, unrelated to n.",
    spaceWhy: "A few numbers: O(1).",
  },
  {
    id: "multi-word-pairs",
    category: "multi",
    difficulty: "medium",
    lang: "Python",
    title: "Duplicate words by comparing pairs",
    code: `def has_duplicate(words):
    for i in range(len(words)):
        for j in range(i + 1, len(words)):
            if words[i] == words[j]:
                return True
    return False`,
    vars: "n = number of words, L = length of the longest word",
    time: "O(n² · L)",
    timeOptions: ["O(n²)", "O(n · L)", "O(n² · L)", "O(n · L²)"],
    space: "O(1)",
    spaceOptions: ["O(1)", "O(n)", "O(L)", "O(n · L)"],
    structure: "Every pair i < j: about n² / 2 comparisons.",
    perStep: "Comparing two strings walks them until they differ: up to O(L).",
    verdict: "n² / 2 × O(L) = O(n² · L). String comparison is not O(1); forgetting the L is the most common slip here. A set of words gives O(n · L) average.",
    spaceWhy: "Two indexes: O(1).",
  },

  // ---------------- Hidden library costs ----------------
  {
    id: "lib-string-concat",
    category: "library",
    difficulty: "medium",
    lang: "C#",
    title: "String += in a loop",
    code: `string Digits(int n)
{
    string s = "";
    for (int i = 0; i < n; i++)
        s += (char)('0' + i % 10);
    return s;
}`,
    vars: "n is the input value",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "One loop: n trips.",
    perStep: "C# strings are immutable, so s += c builds a NEW string and copies all of s into it: O(i) on trip i.",
    verdict: "0 + 1 + 2 + ... + (n minus 1) = O(n²). StringBuilder makes it O(n).",
    spaceWhy: "Only the newest string is still referenced, so live memory is O(n). The garbage collector has to clean up O(n²) characters of dead strings along the way, which costs time, not peak space.",
  },
  {
    id: "lib-in-list",
    category: "library",
    difficulty: "easy",
    lang: "Python",
    title: "in on a list",
    code: `def common(a, b):     # both lists of length n
    result = []
    for x in a:
        if x in b:
            result.append(x)
    return result`,
    vars: "n = len(a) = len(b)",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "One visible loop: n trips.",
    perStep: "x in b on a LIST scans it from the front: O(n).",
    verdict: "n × O(n) = O(n²). Converting b to a set first (O(n)) makes each check O(1) average and the whole thing O(n).",
    spaceWhy: "result can hold up to n items: O(n).",
  },
  {
    id: "lib-insert-front",
    category: "library",
    difficulty: "medium",
    lang: "Python",
    title: "insert(0, x) to reverse",
    code: `def reversed_copy(nums):
    out = []
    for x in nums:
        out.insert(0, x)
    return out`,
    vars: "n = len(nums)",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n inserts.",
    perStep: "A Python list is an array: inserting at index 0 shifts every existing element one place right, O(current length).",
    verdict: "0 + 1 + ... + (n minus 1) = O(n²). Use nums[::-1], reversed(), or collections.deque.appendleft for O(1) per insert.",
    spaceWhy: "out ends with n items: O(n).",
  },
  {
    id: "lib-removeat-zero",
    category: "library",
    difficulty: "medium",
    lang: "C#",
    title: "RemoveAt(0) until empty",
    code: `long DrainSum(List<int> list)
{
    long total = 0;
    while (list.Count > 0)
    {
        total += list[0];
        list.RemoveAt(0);
    }
    return total;
}`,
    vars: "n = list.Count",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "n trips, one removal each.",
    perStep: "RemoveAt(0) shifts every remaining element left: O(remaining).",
    verdict: "(n minus 1) + (n minus 2) + ... = O(n²). A Queue<int> (Dequeue is O(1)) or simply iterating and clearing at the end is O(n).",
    spaceWhy: "Nothing new is allocated: O(1).",
  },
  {
    id: "lib-linq-count-in-loop",
    category: "library",
    difficulty: "hard",
    lang: "C#",
    title: "LINQ Count inside a loop",
    code: `List<int> Duplicates(List<int> nums)
{
    var result = new List<int>();
    foreach (var x in nums)
        if (nums.Count(y => y == x) > 1)
            result.Add(x);
    return result;
}`,
    vars: "n = nums.Count",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n trips of the foreach.",
    perStep: "Count with a predicate enumerates the whole list: O(n). (The Count PROPERTY is O(1); the Count(predicate) METHOD is a loop.)",
    verdict: "n × O(n) = O(n²). Counting once into a Dictionary first makes it O(n) average.",
    spaceWhy: "result can hold all n items: O(n).",
  },
  {
    id: "lib-join",
    category: "library",
    difficulty: "easy",
    lang: "Python",
    title: "Collect parts, join once",
    code: `def csv_line(values):          # values are ints
    parts = []
    for v in values:
        parts.append(str(v))
    return ",".join(parts)`,
    vars: "n = len(values)",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n trips, then one join.",
    perStep: "str(v) on a machine-sized int is O(1); append is amortized O(1); join measures the total length once and copies each part once: O(total length).",
    verdict: "O(n) + O(n) = O(n). This is the idiomatic replacement for += in a loop.",
    spaceWhy: "The parts list and the joined string are both O(n).",
  },
  {
    id: "lib-linq-pipeline",
    category: "library",
    difficulty: "medium",
    lang: "C#",
    title: "A LINQ chain",
    code: `List<int> PositiveSquares(int[] nums) =>
    nums.Where(x => x > 0)
        .Select(x => x * x)
        .ToList();`,
    vars: "n = nums.Length",
    time: "O(n)",
    timeOptions: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Where and Select are lazy: nothing runs until ToList pulls items through, and then each element flows through both steps in ONE pass.",
    perStep: "A comparison, a multiplication and an amortized O(1) append.",
    verdict: "n × O(1) = O(n). Chaining lazy operators does not multiply passes. The traps are different: calling Count(), ToList() or Contains() on a sequence inside a loop, or enumerating the same lazy query twice.",
    spaceWhy: "The resulting list can hold n items: O(n).",
  },
  {
    id: "lib-pop-front",
    category: "library",
    difficulty: "hard",
    lang: "Python",
    title: "A list used as a queue",
    code: `def process_all(items):
    queue = list(items)
    done = 0
    while queue:
        item = queue.pop(0)
        done += item
    return done`,
    vars: "n = len(items)",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n trips, one pop each.",
    perStep: "pop(0) removes the FIRST element of an array, shifting the rest: O(remaining). pop() from the end would be O(1).",
    verdict: "O(n²). collections.deque with popleft() is O(1) per pop and makes it O(n). This is the classic slow BFS in Python.",
    spaceWhy: "list(items) copies the input: O(n).",
  },
  {
    id: "lib-sorted-items",
    category: "library",
    difficulty: "medium",
    lang: "Python",
    title: "Values in key order",
    code: `def by_key(d):                 # d maps int to int
    return [v for k, v in sorted(d.items())]`,
    vars: "n = len(d)",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "sorted builds a list of n pairs and sorts it, then the comprehension makes one pass.",
    perStep: "Sorting is O(n log n) comparisons; the pass is O(1) per pair.",
    verdict: "O(n log n) + O(n) = O(n log n). Iterating a dict is O(n) but gives insertion order, not key order.",
    spaceWhy: "The sorted list of pairs and the result are each O(n).",
  },
  {
    id: "lib-slice-loop",
    category: "library",
    difficulty: "hard",
    lang: "Python",
    title: "Strip zeros by slicing (worst case)",
    code: `def strip_leading_zeros(s):
    while s and s[0] == "0":
        s = s[1:]
    return s`,
    vars: "n = len(s)",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Worst case (all zeros): n trips.",
    perStep: "s[1:] copies the rest of the string: O(remaining length).",
    verdict: "(n minus 1) + (n minus 2) + ... = O(n²). Find the first non-zero index and slice once, or use s.lstrip(\"0\"): O(n).",
    spaceWhy: "Only the newest slice is referenced: O(n) live at any time.",
  },
  {
    id: "lib-substring-loop",
    category: "library",
    difficulty: "medium",
    lang: "C#",
    title: "Substring inside a loop",
    code: `int CountAb(string s)
{
    int count = 0;
    for (int i = 0; i < s.Length; i++)
        if (s.Substring(i).StartsWith("ab", StringComparison.Ordinal))
            count++;
    return count;
}`,
    vars: "n = s.Length",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n trips.",
    perStep: "Substring(i) allocates and copies n minus i characters before StartsWith looks at just two of them.",
    verdict: "n + (n minus 1) + ... = O(n²). s.AsSpan(i).StartsWith(\"ab\") or comparing s[i] and s[i + 1] directly is O(1) per trip, O(n) overall.",
    spaceWhy: "One substring of up to n chars is live at a time: O(n).",
  },
  {
    id: "lib-max-in-loop",
    category: "library",
    difficulty: "medium",
    lang: "Python",
    title: "max() inside the loop condition",
    code: `def positions_of_max(a):
    result = []
    for i in range(len(a)):
        if a[i] == max(a):
            result.append(i)
    return result`,
    vars: "n = len(a)",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n trips.",
    perStep: "max(a) scans the whole list every trip: O(n).",
    verdict: "n × O(n) = O(n²). Hoist it: m = max(a) once before the loop gives O(n).",
    spaceWhy: "If every element is equal, result holds n indexes: O(n).",
  },

  // ---------------- Data structure operations ----------------
  {
    id: "ds-frequency",
    category: "ds",
    difficulty: "easy",
    lang: "C#",
    title: "Count with a Dictionary",
    code: `Dictionary<int, int> Counts(int[] nums)
{
    var counts = new Dictionary<int, int>();
    foreach (var x in nums)
        counts[x] = counts.GetValueOrDefault(x) + 1;
    return counts;
}`,
    vars: "n = nums.Length",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n trips.",
    perStep: "A lookup and a store: O(1) average each.",
    verdict: "n × O(1) = O(n) average. Worst case, if every key collides, a hash table degrades, so say \"average\".",
    spaceWhy: "Up to n distinct keys: O(n).",
  },
  {
    id: "ds-sorted-set",
    category: "ds",
    difficulty: "medium",
    lang: "C#",
    title: "Fill a SortedSet",
    code: `SortedSet<int> Collect(int[] nums)
{
    var set = new SortedSet<int>();
    foreach (var x in nums) set.Add(x);
    return set;
}`,
    vars: "n = nums.Length",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n Adds.",
    perStep: "SortedSet is a balanced binary search tree (red-black), so Add is O(log n).",
    verdict: "n × O(log n) = O(n log n). A HashSet would be O(n) average but unordered: you pay log n for keeping order.",
    spaceWhy: "One tree node per distinct value: O(n).",
  },
  {
    id: "ds-heapify-pop-k",
    category: "ds",
    difficulty: "hard",
    lang: "Python",
    title: "Heapify, then pop k",
    code: `import heapq

def drop_smallest(nums, k):
    heapq.heapify(nums)          # in place
    for _ in range(k):
        heapq.heappop(nums)
    return nums`,
    vars: "n = len(nums), k = number popped (k <= n)",
    time: "O(n + k log n)",
    timeOptions: ["O(k)", "O(k log n)", "O(n + k log n)", "O(n log n)"],
    space: "O(1)",
    spaceOptions: ["O(1)", "O(k)", "O(log n)", "O(n)"],
    structure: "One heapify, then k pops.",
    perStep: "heapify is O(n) (not n log n: most nodes are near the bottom and sift down only a little). Each heappop is O(log n).",
    verdict: "O(n) + k × O(log n) = O(n + k log n). If k is close to n that becomes O(n log n); if k is small it is O(n).",
    spaceWhy: "Both work in place on the input list: O(1) extra.",
  },
  {
    id: "ds-linkedlist-elementat",
    category: "ds",
    difficulty: "hard",
    lang: "C#",
    title: "Indexing a LinkedList",
    code: `long SumByIndex(LinkedList<int> list)
{
    long total = 0;
    for (int i = 0; i < list.Count; i++)
        total += list.ElementAt(i);
    return total;
}`,
    vars: "n = list.Count",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "n trips.",
    perStep: "LinkedList<T> has no index. ElementAt(i) walks from the head: O(i). (Count is a stored field, O(1).)",
    verdict: "0 + 1 + ... + (n minus 1) = O(n²). A foreach over the list is O(n).",
    spaceWhy: "One accumulator: O(1).",
  },
  {
    id: "ds-dict-queries",
    category: "ds",
    difficulty: "easy",
    lang: "Python",
    title: "Build a dict, then answer queries",
    code: `def answer_queries(pairs, queries):
    lookup = dict(pairs)                       # n (key, value) pairs
    return [lookup.get(q) for q in queries]    # m queries`,
    vars: "n = len(pairs), m = len(queries)",
    time: "O(n + m)",
    timeOptions: ["O(n)", "O(m)", "O(n + m)", "O(n · m)"],
    space: "O(n + m)",
    spaceOptions: ["O(1)", "O(n)", "O(m)", "O(n + m)"],
    structure: "n inserts to build, then m lookups.",
    perStep: "Each insert and get is O(1) average.",
    verdict: "O(n) + O(m) = O(n + m) average. Preprocessing once so each query is cheap is the whole point.",
    spaceWhy: "The dict holds n entries and the result m: O(n + m).",
  },
  {
    id: "ds-stack-reverse",
    category: "ds",
    difficulty: "easy",
    lang: "C#",
    title: "Reverse through a Stack",
    code: `int[] Reverse(int[] a)
{
    var stack = new Stack<int>();
    foreach (var x in a) stack.Push(x);
    var result = new int[a.Length];
    for (int i = 0; i < result.Length; i++) result[i] = stack.Pop();
    return result;
}`,
    vars: "n = a.Length",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n pushes, then n pops.",
    perStep: "Push (amortized) and Pop are O(1).",
    verdict: "n + n = O(n).",
    spaceWhy: "The stack and the result each hold n items: O(n).",
  },
  {
    id: "ds-bst-sorted-insert",
    category: "ds",
    difficulty: "hard",
    lang: "Python",
    title: "Unbalanced BST, sorted input",
    code: `class Node:
    def __init__(self, key):
        self.key, self.left, self.right = key, None, None

def build(keys):          # keys arrive already sorted
    root = None
    for k in keys:
        if root is None:
            root = Node(k)
            continue
        cur = root
        while True:
            if k < cur.key:
                if cur.left is None:
                    cur.left = Node(k)
                    break
                cur = cur.left
            else:
                if cur.right is None:
                    cur.right = Node(k)
                    break
                cur = cur.right
    return root`,
    vars: "n = len(keys)",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n inserts. Sorted keys always go right, so the tree becomes a chain.",
    perStep: "Insert k walks the whole chain built so far: O(k).",
    verdict: "0 + 1 + ... + (n minus 1) = O(n²). \"BST insert is O(log n)\" assumes a balanced tree; a plain BST is O(h) per insert, and h can be n.",
    spaceWhy: "n nodes; the insert is iterative so there is no recursion stack: O(n).",
  },
  {
    id: "ds-priority-queue-all",
    category: "ds",
    difficulty: "medium",
    lang: "C#",
    title: "Everything through a PriorityQueue",
    code: `List<string> InPriorityOrder(List<(string Task, int Priority)> jobs)
{
    var pq = new PriorityQueue<string, int>();
    foreach (var (task, priority) in jobs) pq.Enqueue(task, priority);
    var order = new List<string>();
    while (pq.Count > 0) order.Add(pq.Dequeue());
    return order;
}`,
    vars: "n = jobs.Count",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n enqueues, then n dequeues.",
    perStep: "Each is O(log n) on a binary heap.",
    verdict: "2n × O(log n) = O(n log n): this is heap sort.",
    spaceWhy: "The heap and the output each hold n entries (references to the existing strings): O(n).",
  },
  {
    id: "ds-trie",
    category: "ds",
    difficulty: "medium",
    lang: "Python",
    title: "Build a trie",
    code: `def build_trie(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = True
    return root`,
    vars: "n = number of words, L = length of the longest word",
    time: "O(n · L)",
    timeOptions: ["O(n)", "O(n log n)", "O(n · L)", "O(n² · L)"],
    space: "O(n · L)",
    spaceOptions: ["O(n)", "O(L)", "O(n · L)", "O(26ᴸ)"],
    structure: "n words, and up to L characters in each: n × L steps.",
    perStep: "setdefault on a dict keyed by one character: O(1) average.",
    verdict: "O(n · L) average, which is the total number of characters. A lookup later costs O(L), independent of n.",
    spaceWhy: "At worst every character creates a new node (no shared prefixes): O(n · L).",
  },

  // ---------------- Graphs ----------------
  {
    id: "gr-bfs",
    category: "graphs",
    difficulty: "medium",
    lang: "C#",
    title: "BFS distances on an adjacency list",
    code: `int[] Distances(List<int>[] adj, int start)
{
    var dist = new int[adj.Length];
    Array.Fill(dist, -1);
    dist[start] = 0;
    var queue = new Queue<int>();
    queue.Enqueue(start);
    while (queue.Count > 0)
    {
        int u = queue.Dequeue();
        foreach (int v in adj[u])
            if (dist[v] == -1)
            {
                dist[v] = dist[u] + 1;
                queue.Enqueue(v);
            }
    }
    return dist;
}`,
    vars: "V = number of vertices, E = number of edges",
    time: "O(V + E)",
    timeOptions: ["O(V)", "O(V + E)", "O(V · E)", "O(V²)"],
    space: "O(V)",
    spaceOptions: ["O(1)", "O(V)", "O(E)", "O(V²)"],
    structure: "Each vertex is enqueued at most once (dist marks it), so the while loop runs at most V times. The foreach over adj[u] runs deg(u) times.",
    perStep: "Every queue operation and check is O(1). Summed over all vertices, the degrees add up to E (2E undirected).",
    verdict: "O(V) for the vertices + O(E) for the edges = O(V + E). Do not multiply: the inner loop is bounded by E in TOTAL, not E per vertex.",
    spaceWhy: "dist has V entries and the queue holds at most V: O(V). (The adjacency list itself is input.)",
  },
  {
    id: "gr-dfs-rec",
    category: "graphs",
    difficulty: "medium",
    lang: "Python",
    title: "Recursive DFS",
    code: `def count_reachable(adj, start):
    seen = set()
    def dfs(u):
        seen.add(u)
        for v in adj[u]:
            if v not in seen:
                dfs(v)
    dfs(start)
    return len(seen)`,
    vars: "V = number of vertices, E = number of edges",
    time: "O(V + E)",
    timeOptions: ["O(V)", "O(V + E)", "O(V · E)", "O(2ⱽ)"],
    space: "O(V)",
    spaceOptions: ["O(1)", "O(log V)", "O(V)", "O(E)"],
    structure: "dfs runs once per reachable vertex, and each run loops over that vertex's neighbors.",
    perStep: "Set operations are O(1) average; the neighbor loops total E.",
    verdict: "O(V + E). The seen set is what stops it from being exponential.",
    spaceWhy: "seen holds up to V vertices, and on a long path the recursion is V deep: O(V) + O(V) = O(V).",
  },
  {
    id: "gr-islands",
    category: "graphs",
    difficulty: "medium",
    lang: "Python",
    title: "Number of islands (recursive flood fill)",
    code: `def count_islands(grid):          # n rows, m columns of "1" and "0"
    rows, cols = len(grid), len(grid[0])
    def sink(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"
        sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count`,
    vars: "n = rows, m = columns",
    time: "O(n · m)",
    timeOptions: ["O(n + m)", "O(n · m)", "O((n · m)²)", "O(4ⁿ)"],
    space: "O(n · m)",
    spaceOptions: ["O(1)", "O(n + m)", "O(min(n, m))", "O(n · m)"],
    structure: "The double loop visits n · m cells. Each land cell is sunk once (it is set to \"0\" right away), so sink does real work at most n · m times in total.",
    perStep: "Each sink call does O(1) work plus 4 calls, and each cell is the target of at most 4 calls from its neighbors.",
    verdict: "O(n · m) for the scan + O(n · m) for all the flood fills = O(n · m). Not (n · m)²: the fills share one budget.",
    spaceWhy: "Marking the grid in place means no visited set, but the recursion can go as deep as the island is long: a snake-shaped island covers about n · m cells, so O(n · m) stack worst case.",
  },
  {
    id: "gr-dijkstra",
    category: "graphs",
    difficulty: "hard",
    lang: "C#",
    title: "Dijkstra with a binary heap",
    code: `long[] Dijkstra(List<(int To, int W)>[] adj, int src)
{
    var dist = new long[adj.Length];
    Array.Fill(dist, long.MaxValue);
    dist[src] = 0;
    var pq = new PriorityQueue<int, long>();
    pq.Enqueue(src, 0);
    while (pq.TryDequeue(out int u, out long d))
    {
        if (d > dist[u]) continue;            // stale entry
        foreach (var (v, w) in adj[u])
            if (d + w < dist[v])
            {
                dist[v] = d + w;
                pq.Enqueue(v, dist[v]);
            }
    }
    return dist;
}`,
    vars: "V = vertices, E = edges",
    time: "O((V + E) log V)",
    timeOptions: ["O(V + E)", "O((V + E) log V)", "O(V · E)", "O(V²)"],
    space: "O(V + E)",
    spaceOptions: ["O(V)", "O(V + E)", "O(E log V)", "O(V²)"],
    structure: "Every successful relaxation pushes one entry, so there are at most E + 1 pushes and as many pops. Each vertex's edge list is scanned once (stale entries are skipped).",
    perStep: "A push or pop on a heap of up to E entries is O(log E), and log E ≤ log V² = 2 log V, so O(log V).",
    verdict: "O((V + E) log V), usually written O(E log V) for connected graphs. With a Fibonacci heap it is O(E + V log V), a fact worth knowing but rarely needed.",
    spaceWhy: "dist is O(V), but this lazy version can hold up to E stale entries in the heap: O(V + E).",
  },
  {
    id: "gr-kahn",
    category: "graphs",
    difficulty: "medium",
    lang: "Python",
    title: "Topological sort (Kahn's algorithm)",
    code: `from collections import deque

def topo_order(n, edges):          # edges: list of (u, v), u before v
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indegree[v] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    return order if len(order) == n else []`,
    vars: "V = n (vertices), E = len(edges)",
    time: "O(V + E)",
    timeOptions: ["O(V)", "O(V + E)", "O(V · E)", "O(V log V)"],
    space: "O(V + E)",
    spaceOptions: ["O(V)", "O(E)", "O(V + E)", "O(V²)"],
    structure: "One pass over E edges to build the lists, one over V vertices for the starting queue, then each vertex is dequeued once and each edge relaxed once.",
    perStep: "Every step is O(1): popleft on a deque, append, decrement.",
    verdict: "O(E) + O(V) + O(V + E) = O(V + E).",
    spaceWhy: "The code BUILDS the adjacency list from the edge list, so it owns O(V + E) memory, plus indegree, queue and order at O(V) each: O(V + E).",
  },
  {
    id: "gr-matrix-bfs",
    category: "graphs",
    difficulty: "hard",
    lang: "C#",
    title: "BFS on an adjacency matrix",
    code: `int Reachable(bool[,] adj, int start)   // V by V matrix
{
    int n = adj.GetLength(0), count = 0;
    var seen = new bool[n];
    var queue = new Queue<int>();
    seen[start] = true;
    queue.Enqueue(start);
    while (queue.Count > 0)
    {
        int u = queue.Dequeue();
        count++;
        for (int v = 0; v < n; v++)
            if (adj[u, v] && !seen[v]) { seen[v] = true; queue.Enqueue(v); }
    }
    return count;
}`,
    vars: "V = n = number of vertices, E = number of edges",
    time: "O(V²)",
    timeOptions: ["O(V)", "O(V + E)", "O(V²)", "O(V · E)"],
    space: "O(V)",
    spaceOptions: ["O(1)", "O(V)", "O(E)", "O(V²)"],
    structure: "Each vertex is dequeued at most once: up to V trips of the while loop.",
    perStep: "Finding u's neighbors means checking all V columns of its row, even if it has 2 edges: O(V).",
    verdict: "V × O(V) = O(V²), whatever E is. The same BFS on an adjacency list is O(V + E), which is much better for sparse graphs.",
    spaceWhy: "seen and the queue are O(V); the matrix is input.",
  },
  {
    id: "gr-floyd",
    category: "graphs",
    difficulty: "medium",
    lang: "Python",
    title: "Floyd-Warshall",
    code: `def all_pairs(dist):              # V by V matrix, math.inf for no edge
    n = len(dist)
    d = [row[:] for row in dist]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    return d`,
    vars: "V = n = number of vertices",
    time: "O(V³)",
    timeOptions: ["O(V²)", "O(V² log V)", "O(V³)", "O(V + E)"],
    space: "O(V²)",
    spaceOptions: ["O(1)", "O(V)", "O(V²)", "O(V³)"],
    structure: "Three nested loops of V each: V³ trips.",
    perStep: "Two additions and a comparison: O(1).",
    verdict: "V × V × V = O(V³), independent of the number of edges.",
    spaceWhy: "It copies the matrix first: O(V²). Updating the input in place would make the extra space O(1).",
  },
  {
    id: "gr-bellman-ford",
    category: "graphs",
    difficulty: "hard",
    lang: "C#",
    title: "Bellman-Ford",
    code: `long[] BellmanFord(int n, (int U, int V, int W)[] edges, int src)
{
    var dist = new long[n];
    Array.Fill(dist, long.MaxValue);
    dist[src] = 0;
    for (int round = 0; round < n - 1; round++)
        foreach (var (u, v, w) in edges)
            if (dist[u] != long.MaxValue && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
    return dist;
}`,
    vars: "V = n (vertices), E = edges.Length",
    time: "O(V · E)",
    timeOptions: ["O(V + E)", "O(E log V)", "O(V · E)", "O(V²)"],
    space: "O(V)",
    spaceOptions: ["O(1)", "O(V)", "O(E)", "O(V + E)"],
    structure: "V minus 1 rounds, and every round loops over all E edges.",
    perStep: "One relaxation: O(1).",
    verdict: "(V minus 1) × E = O(V · E). Slower than Dijkstra, but it handles negative edge weights.",
    spaceWhy: "The dist array: O(V).",
  },
  {
    id: "gr-edge-list-scan",
    category: "graphs",
    difficulty: "hard",
    lang: "Python",
    title: "Search that rescans the edge list",
    code: `def reachable(n, edges, start):          # edges: list of (u, v)
    seen = {start}
    frontier = [start]
    while frontier:
        u = frontier.pop()
        for a, b in edges:
            if a == u and b not in seen:
                seen.add(b)
                frontier.append(b)
    return len(seen)`,
    vars: "V = n (vertices), E = len(edges)",
    time: "O(V · E)",
    timeOptions: ["O(V)", "O(V + E)", "O(V · E)", "O(E log V)"],
    space: "O(V)",
    spaceOptions: ["O(1)", "O(V)", "O(E)", "O(V · E)"],
    structure: "Each vertex is added to seen once, so the while loop pops at most V vertices.",
    perStep: "But finding the neighbors of u scans ALL E edges, not just u's.",
    verdict: "V × O(E) = O(V · E). Building an adjacency list first (O(V + E)) brings the search down to O(V + E). The graph representation is part of the complexity.",
    spaceWhy: "seen and frontier hold at most V vertices: O(V).",
  },
];

const PART_THREE: GymSnippet[] = [
  // ---------------- DP tables ----------------
  {
    id: "dp-stairs-array",
    category: "dp",
    difficulty: "easy",
    lang: "Python",
    title: "Climbing stairs with a table",
    code: `def climb(n):
    if n <= 2:
        return n
    ways = [0] * (n + 1)
    ways[1], ways[2] = 1, 2
    for i in range(3, n + 1):
        ways[i] = ways[i - 1] + ways[i - 2]
    return ways[n]`,
    vars: "n is the input value (number of steps)",
    time: "O(n)",
    timeOptions: ["O(n)", "O(n²)", "O(2ⁿ)", "O(log n)"],
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "One state per step count, filled once each: about n trips.",
    perStep: "Two lookups and an addition (treating the addition as O(1)).",
    verdict: "States × work per state = n × O(1) = O(n). That product is the general DP formula.",
    spaceWhy: "The ways table has n + 1 entries: O(n).",
  },
  {
    id: "dp-stairs-vars",
    category: "dp",
    difficulty: "easy",
    lang: "C#",
    title: "Climbing stairs with two variables",
    code: `long Climb(int n)
{
    if (n <= 2) return n;
    long a = 1, b = 2;
    for (int i = 3; i <= n; i++) (a, b) = (b, a + b);
    return b;
}`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "n minus 2 trips.",
    perStep: "One addition and a swap: O(1).",
    verdict: "O(n), the same as the table version.",
    spaceWhy: "Each state only needs the previous two, so two variables replace the table: O(1). Spotting how far back a recurrence looks is how you shrink DP space.",
  },
  {
    id: "dp-lcs",
    category: "dp",
    difficulty: "medium",
    lang: "Python",
    title: "Longest common subsequence",
    code: `def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
    vars: "n = len(a), m = len(b)",
    time: "O(n · m)",
    timeOptions: ["O(n + m)", "O(n · m)", "O(2ⁿ)", "O((n + m)²)"],
    space: "O(n · m)",
    spaceOptions: ["O(1)", "O(m)", "O(n + m)", "O(n · m)"],
    structure: "One cell per (i, j) pair: (n + 1) × (m + 1) states, each filled once.",
    perStep: "Each cell looks at up to three neighbors: O(1).",
    verdict: "n · m states × O(1) = O(n · m).",
    spaceWhy: "The full table: O(n · m). Row i only reads row i minus 1, so two rows would be enough.",
  },
  {
    id: "dp-lcs-two-rows",
    category: "dp",
    difficulty: "hard",
    lang: "C#",
    title: "LCS with two rows",
    code: `int Lcs(string a, string b)
{
    var prev = new int[b.Length + 1];
    var cur = new int[b.Length + 1];
    for (int i = 1; i <= a.Length; i++)
    {
        for (int j = 1; j <= b.Length; j++)
            cur[j] = a[i - 1] == b[j - 1] ? prev[j - 1] + 1 : Math.Max(prev[j], cur[j - 1]);
        (prev, cur) = (cur, prev);
    }
    return prev[b.Length];
}`,
    vars: "n = a.Length, m = b.Length",
    time: "O(n · m)",
    timeOptions: ["O(n + m)", "O(n · m)", "O(m log n)", "O(n² · m)"],
    space: "O(m)",
    spaceOptions: ["O(1)", "O(m)", "O(n + m)", "O(n · m)"],
    structure: "The same n × m cells as the full table.",
    perStep: "O(1) per cell.",
    verdict: "O(n · m): the time does not change when you shrink the table.",
    spaceWhy: "Two arrays of m + 1 ints, swapped each row: O(m). Swapping a and b so the shorter string is b gives O(min(n, m)).",
  },
  {
    id: "dp-coin-change",
    category: "dp",
    difficulty: "medium",
    lang: "Python",
    title: "Fewest coins",
    code: `def min_coins(coins, amount):
    INF = float("inf")
    best = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and best[a - c] + 1 < best[a]:
                best[a] = best[a - c] + 1
    return best[amount] if best[amount] != INF else -1`,
    vars: "n = len(coins), A = amount (a value)",
    time: "O(n · A)",
    timeOptions: ["O(A)", "O(n · A)", "O(nᴬ)", "O(n log A)"],
    space: "O(A)",
    spaceOptions: ["O(1)", "O(n)", "O(A)", "O(n · A)"],
    structure: "A states (one per amount), and each state tries all n coins.",
    perStep: "A comparison and a lookup: O(1).",
    verdict: "A × n × O(1) = O(n · A). Pseudo-polynomial again: A is a value, not a length.",
    spaceWhy: "One array of A + 1 entries: O(A).",
  },
  {
    id: "dp-lis-quadratic",
    category: "dp",
    difficulty: "medium",
    lang: "Python",
    title: "Longest increasing subsequence, O(n) choices per state",
    code: `def lis(nums):
    if not nums:
        return 0
    length = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                length[i] = max(length[i], length[j] + 1)
    return max(length)`,
    vars: "n = len(nums)",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n states; state i looks at all i earlier states.",
    perStep: "O(1) per (i, j) pair.",
    verdict: "n states × O(n) choices = O(n²). States × choices per state is the DP time formula.",
    spaceWhy: "One length per index: O(n).",
  },
  {
    id: "dp-lis-patience",
    category: "dp",
    difficulty: "hard",
    lang: "C#",
    title: "LIS with binary search",
    code: `int Lis(int[] nums)
{
    var tails = new List<int>();
    foreach (var x in nums)
    {
        int i = tails.BinarySearch(x);
        if (i < 0) i = ~i;
        if (i == tails.Count) tails.Add(x); else tails[i] = x;
    }
    return tails.Count;
}`,
    vars: "n = nums.Length",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "One trip per element: n trips.",
    perStep: "tails stays sorted, so BinarySearch is O(log n); the replace or append is O(1) amortized.",
    verdict: "n × O(log n) = O(n log n).",
    spaceWhy: "tails can grow to n entries (an increasing input): O(n).",
  },
  {
    id: "dp-grid-paths-memo",
    category: "dp",
    difficulty: "medium",
    lang: "Python",
    title: "Grid paths, memoized",
    code: `from functools import lru_cache

def unique_paths(n, m):
    @lru_cache(maxsize=None)
    def go(r, c):
        if r == n - 1 or c == m - 1:
            return 1
        return go(r + 1, c) + go(r, c + 1)
    return go(0, 0)`,
    vars: "n = rows, m = columns",
    time: "O(n · m)",
    timeOptions: ["O(n + m)", "O(n · m)", "O(2ⁿ⁺ᵐ)", "O((n · m)²)"],
    space: "O(n · m)",
    spaceOptions: ["O(1)", "O(n + m)", "O(n · m)", "O(2ⁿ⁺ᵐ)"],
    structure: "Without the cache this is a binary call tree of depth n + m. With it, each (r, c) is computed once: at most n · m distinct states.",
    perStep: "Two cached calls and an addition (treating it as O(1)).",
    verdict: "n · m states × O(1) = O(n · m), instead of exponential.",
    spaceWhy: "The cache can hold n · m entries, and the stack is at most n + m deep: O(n · m).",
  },
  {
    id: "dp-edit-distance",
    category: "dp",
    difficulty: "medium",
    lang: "C#",
    title: "Edit distance",
    code: `int EditDistance(string a, string b)
{
    int n = a.Length, m = b.Length;
    var dp = new int[n + 1, m + 1];
    for (int i = 0; i <= n; i++) dp[i, 0] = i;
    for (int j = 0; j <= m; j++) dp[0, j] = j;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i, j] = a[i - 1] == b[j - 1]
                ? dp[i - 1, j - 1]
                : 1 + Math.Min(dp[i - 1, j - 1], Math.Min(dp[i - 1, j], dp[i, j - 1]));
    return dp[n, m];
}`,
    vars: "n = a.Length, m = b.Length",
    time: "O(n · m)",
    timeOptions: ["O(n + m)", "O(n · m)", "O(3ⁿ)", "O(n² · m)"],
    space: "O(n · m)",
    spaceOptions: ["O(1)", "O(m)", "O(n + m)", "O(n · m)"],
    structure: "Two border loops (n + m trips), then one fill per cell: n · m trips.",
    perStep: "Three lookups and two mins: O(1).",
    verdict: "O(n + m) + O(n · m) = O(n · m).",
    spaceWhy: "The (n + 1) by (m + 1) table: O(n · m). Two rows would do, as with LCS.",
  },
  {
    id: "dp-interval",
    category: "dp",
    difficulty: "hard",
    lang: "Python",
    title: "Interval DP: merging adjacent piles",
    code: `def min_merge_cost(stones):
    n = len(stones)
    prefix = [0]
    for s in stones:
        prefix.append(prefix[-1] + s)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = min(dp[i][k] + dp[k + 1][j] for k in range(i, j)) + prefix[j + 1] - prefix[i]
    return dp[0][n - 1] if n else 0`,
    vars: "n = len(stones)",
    time: "O(n³)",
    timeOptions: ["O(n²)", "O(n² log n)", "O(n³)", "O(2ⁿ)"],
    space: "O(n²)",
    spaceOptions: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
    structure: "About n² / 2 states (i, j) with i ≤ j.",
    perStep: "Each state tries every split point k between i and j: up to n choices. The prefix sums make the range total O(1).",
    verdict: "O(n²) states × O(n) choices = O(n³). Interval DPs (matrix chain, burst balloons) all have this shape.",
    spaceWhy: "The n by n table: O(n²).",
  },

  // ---------------- Backtracking and exponential ----------------
  {
    id: "bt-subsets",
    category: "backtracking",
    difficulty: "medium",
    lang: "Python",
    title: "All subsets",
    code: `def subsets(nums):
    result = []
    def go(i, path):
        if i == len(nums):
            result.append(path[:])
            return
        path.append(nums[i])
        go(i + 1, path)
        path.pop()
        go(i + 1, path)
    go(0, [])
    return result`,
    vars: "n = len(nums)",
    time: "O(n · 2ⁿ)",
    timeOptions: ["O(n²)", "O(2ⁿ)", "O(n · 2ⁿ)", "O(n!)"],
    space: "O(n · 2ⁿ)",
    spaceOptions: ["O(n)", "O(2ⁿ)", "O(n · 2ⁿ)", "O(n!)"],
    structure: "Every element is either in or out: a binary tree of depth n with 2ⁿ leaves (and about 2ⁿ internal calls).",
    perStep: "Internal calls are O(1). Each leaf copies path, up to n items: O(n).",
    verdict: "2ⁿ leaves × O(n) copy = O(n · 2ⁿ). The output itself has that size, so you cannot do better.",
    spaceWhy: "The output holds 2ⁿ subsets of average size n / 2: O(n · 2ⁿ). Beyond the output, path and the stack are O(n).",
  },
  {
    id: "bt-permutations",
    category: "backtracking",
    difficulty: "medium",
    lang: "C#",
    title: "All permutations",
    code: `List<List<int>> Permutations(int[] nums)
{
    var result = new List<List<int>>();
    var path = new List<int>();
    var used = new bool[nums.Length];
    void Go()
    {
        if (path.Count == nums.Length) { result.Add(new List<int>(path)); return; }
        for (int i = 0; i < nums.Length; i++)
        {
            if (used[i]) continue;
            used[i] = true; path.Add(nums[i]);
            Go();
            path.RemoveAt(path.Count - 1); used[i] = false;
        }
    }
    Go();
    return result;
}`,
    vars: "n = nums.Length",
    time: "O(n · n!)",
    timeOptions: ["O(2ⁿ)", "O(n · 2ⁿ)", "O(n!)", "O(n · n!)"],
    space: "O(n · n!)",
    spaceOptions: ["O(n)", "O(n!)", "O(n · n!)", "O(n²)"],
    structure: "n choices at the first level, n minus 1 at the next ...: n! leaves, and about e × n! calls in total.",
    perStep: "Each call loops over all n indexes (O(n)), and each leaf copies n items (O(n)).",
    verdict: "About n! calls × O(n) = O(n · n!).",
    spaceWhy: "The output holds n! lists of n items: O(n · n!). Beyond that, path, used and the n-deep stack are O(n).",
  },
  {
    id: "bt-count-subset-sums",
    category: "backtracking",
    difficulty: "hard",
    lang: "Python",
    title: "Count subsets that hit a target",
    code: `def count_ways(nums, target):
    def go(i, total):
        if i == len(nums):
            return 1 if total == target else 0
        return go(i + 1, total + nums[i]) + go(i + 1, total)
    return go(0, 0)`,
    vars: "n = len(nums)",
    time: "O(2ⁿ)",
    timeOptions: ["O(n²)", "O(n · target)", "O(2ⁿ)", "O(n · 2ⁿ)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(n)", "O(2ⁿ)", "O(n · 2ⁿ)"],
    structure: "Two calls per call, depth n: about 2ⁿ⁺¹ calls.",
    perStep: "O(1) per call: nothing is copied, only an integer total is passed down.",
    verdict: "O(2ⁿ). Compare all subsets, which pays an extra n per leaf to copy. Memoizing on (i, total) would make it O(n · S) where S is the range of reachable totals.",
    spaceWhy: "Only the current path is on the stack: n frames, O(n).",
  },
  {
    id: "bt-nqueens",
    category: "backtracking",
    difficulty: "hard",
    lang: "C#",
    title: "Count N-Queens solutions",
    code: `int CountQueens(int n)
{
    var cols = new HashSet<int>();
    var diag = new HashSet<int>();
    var anti = new HashSet<int>();
    int Place(int row)
    {
        if (row == n) return 1;
        int count = 0;
        for (int c = 0; c < n; c++)
        {
            if (cols.Contains(c) || diag.Contains(row - c) || anti.Contains(row + c)) continue;
            cols.Add(c); diag.Add(row - c); anti.Add(row + c);
            count += Place(row + 1);
            cols.Remove(c); diag.Remove(row - c); anti.Remove(row + c);
        }
        return count;
    }
    return Place(0);
}`,
    vars: "n = board size",
    time: "O(n!)",
    timeOptions: ["O(n²)", "O(n³)", "O(2ⁿ)", "O(n!)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(n)", "O(n²)", "O(n!)"],
    structure: "One queen per row. Row 0 has n columns to try, row 1 at most n minus 1 free columns, row 2 at most n minus 2 ...: at most n! complete placements.",
    perStep: "The safety check is three O(1) average set lookups, so a row costs O(n) to scan.",
    verdict: "The standard answer is O(n!), the size of the search tree. Counting the O(n) scan at each node gives O(n · n!) as a looser bound, and diagonal pruning makes the real count far smaller. Say the bound and say why.",
    spaceWhy: "Three sets of at most n entries and a recursion n deep: O(n). It counts solutions, so there is no big output.",
  },
  {
    id: "bt-strings-k",
    category: "backtracking",
    difficulty: "hard",
    lang: "Python",
    title: "Every lowercase word of length k",
    code: `def all_words(k):
    letters = "abcdefghijklmnopqrstuvwxyz"
    result = []
    def go(prefix):
        if len(prefix) == k:
            result.append(prefix)
            return
        for ch in letters:
            go(prefix + ch)
    go("")
    return result`,
    vars: "k is the input value (word length)",
    time: "O(k · 26ᵏ)",
    timeOptions: ["O(26 · k)", "O(k²)", "O(26ᵏ)", "O(k · 26ᵏ)"],
    space: "O(k · 26ᵏ)",
    spaceOptions: ["O(k)", "O(k²)", "O(26ᵏ)", "O(k · 26ᵏ)"],
    structure: "Branching factor 26, depth k: 26ᵏ leaves.",
    perStep: "prefix + ch builds a new string: O(length), up to k.",
    verdict: "26ᵏ words × O(k) to build each = O(k · 26ᵏ). The base is the alphabet size and the exponent is the length.",
    spaceWhy: "The output holds 26ᵏ strings of length k: O(k · 26ᵏ). Beyond the output, the stack is k deep with prefixes up to k: O(k²).",
  },
  {
    id: "bt-combinations",
    category: "backtracking",
    difficulty: "hard",
    lang: "C#",
    title: "Choose k of n (with pruning)",
    code: `List<List<int>> Choose(int n, int k)
{
    var result = new List<List<int>>();
    var path = new List<int>();
    void Go(int start)
    {
        if (path.Count == k) { result.Add(new List<int>(path)); return; }
        int last = n - (k - path.Count) + 1;   // leave room for the rest
        for (int i = start; i <= last; i++)
        {
            path.Add(i);
            Go(i + 1);
            path.RemoveAt(path.Count - 1);
        }
    }
    Go(1);
    return result;
}`,
    vars: "n = numbers 1..n, k = how many to pick",
    time: "O(k · C(n, k))",
    timeOptions: ["O(n · k)", "O(n²)", "O(k log n)", "O(k · C(n, k))"],
    space: "O(k · C(n, k))",
    spaceOptions: ["O(k)", "O(n · k)", "O(C(n, k))", "O(k · C(n, k))"],
    structure: "Thanks to the pruning bound, every call leads to at least one complete combination, so the tree has C(n, k) leaves and every leaf has k ancestors.",
    perStep: "Each leaf copies k numbers: O(k). Every call is on the path to some leaf, so internal calls add at most k per leaf as well.",
    verdict: "O(k · C(n, k)). Without the pruning line the loop also explores dead ends, and when k is close to n that wastes up to 2ⁿ calls.",
    spaceWhy: "The output holds C(n, k) lists of k numbers: O(k · C(n, k)). Beyond it, path and the stack are O(k).",
  },
  {
    id: "bt-word-search",
    category: "backtracking",
    difficulty: "hard",
    lang: "Python",
    title: "Word search on a grid",
    code: `def exists(board, word):          # n rows, m columns
    rows, cols = len(board), len(board[0])
    def go(r, c, i):
        if i == len(word):
            return True
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != word[i]:
            return False
        saved, board[r][c] = board[r][c], "#"
        found = (go(r + 1, c, i + 1) or go(r - 1, c, i + 1) or
                 go(r, c + 1, i + 1) or go(r, c - 1, i + 1))
        board[r][c] = saved
        return found
    return any(go(r, c, 0) for r in range(rows) for c in range(cols))`,
    vars: "n = rows, m = columns, L = len(word)",
    time: "O(n · m · 3ᴸ)",
    timeOptions: ["O(n · m)", "O(n · m · L)", "O(n · m · 3ᴸ)", "O((n · m)²)"],
    space: "O(L)",
    spaceOptions: ["O(1)", "O(L)", "O(n · m)", "O(n · m · L)"],
    structure: "A search starts from each of the n · m cells. From there it branches 4 ways on the first step and at most 3 ways after that (the cell it came from is marked \"#\"), for up to L steps.",
    perStep: "O(1) work per call besides the branching.",
    verdict: "n · m starts × O(3ᴸ) paths each = O(n · m · 3ᴸ). Writing 4ᴸ is also an accepted (looser) bound.",
    spaceWhy: "The board is marked in place, so the only extra memory is the recursion, at most L + 1 deep: O(L).",
  },
  {
    id: "bt-hanoi",
    category: "backtracking",
    difficulty: "medium",
    lang: "C#",
    title: "Towers of Hanoi, recording every move",
    code: `void Hanoi(int n, char from, char to, char via, List<string> moves)
{
    if (n == 0) return;
    Hanoi(n - 1, from, via, to, moves);
    moves.Add($"{from}->{to}");
    Hanoi(n - 1, via, to, from, moves);
}`,
    vars: "n = number of disks",
    time: "O(2ⁿ)",
    timeOptions: ["O(n)", "O(n²)", "O(2ⁿ)", "O(n!)"],
    space: "O(2ⁿ)",
    spaceOptions: ["O(1)", "O(n)", "O(n²)", "O(2ⁿ)"],
    structure: "T(n) = 2T(n minus 1) + O(1): two calls on n minus 1 each.",
    perStep: "One Add per call: amortized O(1).",
    verdict: "2ⁿ minus 1 moves: O(2ⁿ). Subtracting 1 and branching twice is exponential; halving and branching twice would be linear.",
    spaceWhy: "The moves list ends with 2ⁿ minus 1 entries: O(2ⁿ) output. The recursion itself is only n deep, O(n), so if the moves were printed instead of stored the space would be O(n).",
  },

  // ---------------- Sorting and heaps ----------------
  {
    id: "sort-array-sort",
    category: "sorting",
    difficulty: "easy",
    lang: "C#",
    title: "Array.Sort, then index",
    code: `int Median(int[] a)
{
    Array.Sort(a);   // sorts in place
    return a[a.Length / 2];
}`,
    vars: "n = a.Length",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(log n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    structure: "One sort, then one index.",
    perStep: "Array.Sort is introsort (quicksort with a heapsort fallback): O(n log n) worst case.",
    verdict: "O(n log n) + O(1) = O(n log n). Quickselect could find the median in O(n) average.",
    spaceWhy: "In place, but introsort recurses with its depth capped at about 2 log n: O(log n) stack. Many interviewers accept \"O(1) extra, in place\"; saying O(log n) for the recursion shows you know why.",
  },
  {
    id: "sort-sorted-py",
    category: "sorting",
    difficulty: "easy",
    lang: "Python",
    title: "sorted()",
    code: `def sorted_copy(nums):
    return sorted(nums)`,
    vars: "n = len(nums)",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    structure: "One sort of n items.",
    perStep: "Timsort does O(n log n) comparisons worst case (O(n) if the input is already sorted).",
    verdict: "O(n log n).",
    spaceWhy: "sorted() returns a new list (O(n)) and Timsort's merges use up to n / 2 extra slots: O(n).",
  },
  {
    id: "sort-bubble",
    category: "sorting",
    difficulty: "easy",
    lang: "C#",
    title: "Bubble sort",
    code: `void BubbleSort(int[] a)
{
    for (int i = 0; i < a.Length; i++)
        for (int j = 0; j + 1 < a.Length - i; j++)
            if (a[j] > a[j + 1])
                (a[j], a[j + 1]) = (a[j + 1], a[j]);
}`,
    vars: "n = a.Length",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Pass i compares n minus i minus 1 pairs: (n minus 1) + (n minus 2) + ... = n(n minus 1) / 2.",
    perStep: "A comparison and maybe a swap: O(1).",
    verdict: "O(n²), and with no early-exit flag it is O(n²) even on sorted input.",
    spaceWhy: "Swaps in place with a couple of indexes: O(1).",
  },
  {
    id: "sort-insertion-sorted",
    category: "sorting",
    difficulty: "medium",
    lang: "Python",
    title: "Insertion sort on already sorted input",
    code: `def insertion_sort(a):            # a is already sorted
    for i in range(1, len(a)):
        x = a[i]
        j = i - 1
        while j >= 0 and a[j] > x:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = x`,
    vars: "n = len(a)",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "n minus 1 outer trips. On sorted input the while condition a[j] > x fails immediately, so the inner loop does zero shifts.",
    perStep: "O(1) per outer trip.",
    verdict: "Best case O(n). The worst case (reverse sorted) is O(n²), and the general answer is O(n²): this snippet tests whether you read the input assumption.",
    spaceWhy: "In place: O(1).",
  },
  {
    id: "sort-counting",
    category: "sorting",
    difficulty: "medium",
    lang: "C#",
    title: "Counting sort",
    code: `void CountingSort(int[] a, int k)   // every value is in 0..k
{
    var count = new int[k + 1];
    foreach (var x in a) count[x]++;
    int i = 0;
    for (int v = 0; v <= k; v++)
        while (count[v]-- > 0) a[i++] = v;
}`,
    vars: "n = a.Length, k = the largest possible value",
    time: "O(n + k)",
    timeOptions: ["O(n)", "O(n + k)", "O(n · k)", "O(n log n)"],
    space: "O(k)",
    spaceOptions: ["O(1)", "O(k)", "O(n)", "O(n · k)"],
    structure: "One pass over n items, then one pass over k + 1 buckets whose inner while writes n items in total.",
    perStep: "Each step is an O(1) array operation.",
    verdict: "O(n) + O(k + n) = O(n + k). No comparisons, which is how it beats the n log n limit; it only pays off when k is not much bigger than n.",
    spaceWhy: "The count array has k + 1 entries; the output is written back into a: O(k).",
  },
  {
    id: "sort-merge-k",
    category: "sorting",
    difficulty: "hard",
    lang: "Python",
    title: "Merge k sorted lists with a heap",
    code: `import heapq

def merge_k(lists):               # k sorted lists, N items in total
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)
        out.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out`,
    vars: "k = number of lists, N = total number of items",
    time: "O(N log k)",
    timeOptions: ["O(N · k)", "O(N log k)", "O(k log N)", "O(N + k)"],
    space: "O(N)",
    spaceOptions: ["O(1)", "O(k)", "O(N)", "O(N · k)"],
    structure: "Every item is pushed and popped exactly once: N pops, fewer than N pushes, plus one heapify of at most k entries.",
    perStep: "The heap never holds more than k entries, so each push and pop is O(log k).",
    verdict: "O(k) + N × O(log k) = O(N log k). Merging the lists one by one would be O(N · k).",
    spaceWhy: "The heap is O(k), but the merged output holds N items: O(N) including output.",
  },
  {
    id: "sort-then-search",
    category: "sorting",
    difficulty: "medium",
    lang: "C#",
    title: "Sort once, binary search many times",
    code: `int CountFound(int[] items, int[] queries)
{
    Array.Sort(items);
    int found = 0;
    foreach (var q in queries)
        if (Array.BinarySearch(items, q) >= 0) found++;
    return found;
}`,
    vars: "n = items.Length, m = queries.Length",
    time: "O((n + m) log n)",
    timeOptions: ["O(n · m)", "O(n log n)", "O(m log n)", "O((n + m) log n)"],
    space: "O(log n)",
    spaceOptions: ["O(1)", "O(log n)", "O(m)", "O(n + m)"],
    structure: "One sort of n items, then a loop of m queries.",
    perStep: "The sort is O(n log n); each BinarySearch is O(log n).",
    verdict: "O(n log n) + m × O(log n) = O((n + m) log n). A HashSet would make it O(n + m) average.",
    spaceWhy: "The sort is in place but its recursion uses O(log n) stack; the counter is O(1): O(log n).",
  },
  {
    id: "sort-heapify",
    category: "sorting",
    difficulty: "hard",
    lang: "Python",
    title: "heapify alone",
    code: `import heapq

def smallest(nums):
    heapq.heapify(nums)
    return nums[0] if nums else None`,
    vars: "n = len(nums)",
    time: "O(n)",
    timeOptions: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "heapify sifts down every internal node, starting from the bottom.",
    perStep: "Half the nodes are leaves (0 work), a quarter sift down 1 level, an eighth 2 levels ...",
    verdict: "n/4 × 1 + n/8 × 2 + n/16 × 3 + ... < n, so building a heap is O(n), not O(n log n). Pushing items one by one WOULD be O(n log n). (min(nums) would also be O(n), with no mutation.)",
    spaceWhy: "In place: O(1).",
  },
  {
    id: "sort-strings",
    category: "sorting",
    difficulty: "hard",
    lang: "C#",
    title: "Sorting strings",
    code: `void SortWords(string[] words)   // n words, each up to L chars
{
    Array.Sort(words, StringComparer.Ordinal);
}`,
    vars: "n = words.Length, L = length of the longest word",
    time: "O(L · n log n)",
    timeOptions: ["O(n log n)", "O(n · L)", "O(L · n log n)", "O(n² · L)"],
    space: "O(log n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n · L)"],
    structure: "A comparison sort makes O(n log n) comparisons.",
    perStep: "Comparing two strings costs up to O(L) (shared prefixes).",
    verdict: "O(n log n) comparisons × O(L) each = O(L · n log n). \"Sorting is n log n\" counts comparisons; it is time only if a comparison is O(1).",
    spaceWhy: "Only references move; introsort's recursion is O(log n).",
  },
  {
    id: "sort-3sum",
    category: "sorting",
    difficulty: "medium",
    lang: "Python",
    title: "Three sum after sorting",
    code: `def three_sum_exists(nums):
    nums.sort()
    n = len(nums)
    for i in range(n):
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                return True
            if s < 0:
                lo += 1
            else:
                hi -= 1
    return False`,
    vars: "n = len(nums)",
    time: "O(n²)",
    timeOptions: ["O(n log n)", "O(n²)", "O(n² log n)", "O(n³)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    structure: "A sort, then n outer trips, each running a two pointer scan of up to n steps.",
    perStep: "O(n log n) for the sort; O(1) per pointer step.",
    verdict: "O(n log n) + n × O(n) = O(n²). The sort is dominated.",
    spaceWhy: "list.sort() sorts in place, but Timsort can use a temporary buffer of up to n / 2 items while merging: O(n). If you say O(1), say \"ignoring the sort's buffer\".",
  },

  // ---------------- Strings ----------------
  {
    id: "str-reverse-compare",
    category: "strings",
    difficulty: "easy",
    lang: "Python",
    title: "Palindrome by reversing",
    code: `def is_palindrome(s):
    return s == s[::-1]`,
    vars: "n = len(s)",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Two hidden loops one after the other: building the reversed copy, then comparing.",
    perStep: "Each is O(n).",
    verdict: "O(n) + O(n) = O(n).",
    spaceWhy: "s[::-1] is a full copy: O(n). Two pointers from both ends would be O(1).",
  },
  {
    id: "str-freq26",
    category: "strings",
    difficulty: "easy",
    lang: "C#",
    title: "Anagram check with 26 counters",
    code: `bool IsAnagram(string s, string t)   // lowercase a to z only
{
    if (s.Length != t.Length) return false;
    var count = new int[26];
    foreach (char c in s) count[c - 'a']++;
    foreach (char c in t) count[c - 'a']--;
    return count.All(x => x == 0);
}`,
    vars: "n = s.Length",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "Two passes of n characters and one check of 26 counters.",
    perStep: "Each step is an O(1) array update.",
    verdict: "n + n + 26 = O(n).",
    spaceWhy: "26 counters regardless of n: O(1). With an unbounded alphabet, say O(k) for k distinct characters.",
  },
  {
    id: "str-all-substrings",
    category: "strings",
    difficulty: "medium",
    lang: "Python",
    title: "Check every substring",
    code: `def count_palindromic_substrings(s):
    count = 0
    for i in range(len(s)):
        for j in range(i + 1, len(s) + 1):
            sub = s[i:j]
            if sub == sub[::-1]:
                count += 1
    return count`,
    vars: "n = len(s)",
    time: "O(n³)",
    timeOptions: ["O(n²)", "O(n² log n)", "O(n³)", "O(2ⁿ)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(n)", "O(n²)", "O(n³)"],
    structure: "Every (i, j) pair: about n² / 2 substrings.",
    perStep: "Slicing, reversing and comparing a substring of length j minus i is O(j minus i), which averages about n / 3.",
    verdict: "n² / 2 substrings × O(n) each = O(n³). Expanding around each center does the same job in O(n²).",
    spaceWhy: "One substring and its reverse are live at a time, each up to n: O(n).",
  },
  {
    id: "str-naive-search",
    category: "strings",
    difficulty: "medium",
    lang: "C#",
    title: "Naive substring search",
    code: `int IndexOf(string text, string pattern)
{
    for (int i = 0; i + pattern.Length <= text.Length; i++)
    {
        int j = 0;
        while (j < pattern.Length && text[i + j] == pattern[j]) j++;
        if (j == pattern.Length) return i;
    }
    return -1;
}`,
    vars: "n = text.Length, m = pattern.Length",
    time: "O(n · m)",
    timeOptions: ["O(n)", "O(n + m)", "O(n · m)", "O(n log m)"],
    space: "O(1)",
    spaceOptions: ["O(1)", "O(m)", "O(n)", "O(n + m)"],
    structure: "Up to n minus m + 1 starting positions.",
    perStep: "Each start can compare up to m characters before failing (text \"aaaa...a\", pattern \"aa...ab\").",
    verdict: "O((n minus m + 1) · m), written O(n · m). KMP or Z-function gets O(n + m).",
    spaceWhy: "Two indexes: O(1).",
  },
  {
    id: "str-kmp",
    category: "strings",
    difficulty: "hard",
    lang: "Python",
    title: "KMP search",
    code: `def kmp_find(text, pattern):
    m = len(pattern)
    if m == 0:
        return 0
    fail = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and pattern[i] != pattern[k]:
            k = fail[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        fail[i] = k
    k = 0
    for i, ch in enumerate(text):
        while k > 0 and ch != pattern[k]:
            k = fail[k - 1]
        if ch == pattern[k]:
            k += 1
        if k == m:
            return i - m + 1
    return -1`,
    vars: "n = len(text), m = len(pattern)",
    time: "O(n + m)",
    timeOptions: ["O(n)", "O(n + m)", "O(n · m)", "O(n log m)"],
    space: "O(m)",
    spaceOptions: ["O(1)", "O(m)", "O(n)", "O(n · m)"],
    structure: "Two sequential loops: m trips to build the failure table, n trips to scan the text. Each has an inner while that looks nested.",
    perStep: "k goes up by at most 1 per outer trip and every while trip lowers it, so the inner whiles run at most m and n times in total.",
    verdict: "Amortized: O(m) + O(n) = O(n + m).",
    spaceWhy: "The failure table has m entries: O(m).",
  },
  {
    id: "str-split-reverse",
    category: "strings",
    difficulty: "medium",
    lang: "C#",
    title: "Reverse the words",
    code: `string ReverseWords(string s)
{
    string[] words = s.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    Array.Reverse(words);
    return string.Join(" ", words);
}`,
    vars: "n = s.Length",
    time: "O(n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Three passes one after the other: Split scans n characters, Reverse swaps at most n / 2 references, Join copies about n characters.",
    perStep: "Each pass is O(n).",
    verdict: "O(n) + O(n) + O(n) = O(n). Library calls are loops; sequential ones add.",
    spaceWhy: "The words array and the joined string together hold about n characters: O(n).",
  },
  {
    id: "str-expand-center",
    category: "strings",
    difficulty: "hard",
    lang: "Python",
    title: "Longest palindrome length, expand around centers",
    code: `def longest_palindrome_length(s):
    best = 0
    for center in range(2 * len(s) - 1):
        lo, hi = center // 2, (center + 1) // 2
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo -= 1
            hi += 1
        best = max(best, hi - lo - 1)
    return best`,
    vars: "n = len(s)",
    time: "O(n²)",
    timeOptions: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "2n minus 1 centers (each character and each gap).",
    perStep: "Each expansion can run up to n / 2 steps (think \"aaaa...a\").",
    verdict: "O(n) centers × O(n) expansion = O(n²). Manacher's algorithm does it in O(n), but nobody expects it in an interview.",
    spaceWhy: "Indexes only, no substrings: O(1).",
  },
  {
    id: "str-sorted-anagram",
    category: "strings",
    difficulty: "easy",
    lang: "Python",
    title: "Anagram check by sorting",
    code: `def is_anagram(s, t):
    return sorted(s) == sorted(t)`,
    vars: "n = len(s) (assume len(t) is about the same)",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Two sorts, then a list comparison.",
    perStep: "Each sort is O(n log n); comparing two lists is O(n).",
    verdict: "O(n log n). Counting characters gets O(n).",
    spaceWhy: "sorted() returns a new list of n characters, twice: O(n).",
  },
  {
    id: "str-list-insert-front",
    category: "strings",
    difficulty: "medium",
    lang: "C#",
    title: "Reverse by inserting at the front",
    code: `string Reverse(string s)
{
    var chars = new List<char>();
    foreach (char c in s)
        chars.Insert(0, c);
    return new string(chars.ToArray());
}`,
    vars: "n = s.Length",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "n inserts, then one copy into an array and one into a string.",
    perStep: "Insert(0, c) shifts every character already in the list: O(current length).",
    verdict: "0 + 1 + ... + (n minus 1) = O(n²). Fill a char[] from the back, or Array.Reverse, for O(n).",
    spaceWhy: "The list, the array and the string each hold n chars: O(n).",
  },
  {
    id: "str-dict-words",
    category: "strings",
    difficulty: "medium",
    lang: "Python",
    title: "Count words in a dict",
    code: `def word_counts(words):            # n words, each up to L chars
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    return counts`,
    vars: "n = number of words, L = length of the longest word",
    time: "O(n · L)",
    timeOptions: ["O(n)", "O(n log n)", "O(n · L)", "O(n² · L)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(n)", "O(L)", "O(n · L)"],
    structure: "n trips.",
    perStep: "Hashing a string reads all its characters (O(L), cached on the string afterwards), and a hit compares the key with == (O(L) again).",
    verdict: "n × O(L) = O(n · L) average. \"Dict operations are O(1)\" assumes the key is O(1) to hash.",
    spaceWhy: "Up to n entries, but the keys are references to the SAME string objects that are already in words; nothing is copied. So the extra space is O(n), not O(n · L).",
  },

  // ---------------- Space ----------------
  {
    id: "sp-reverse-in-place",
    category: "space",
    difficulty: "easy",
    lang: "C#",
    title: "Reverse in place",
    code: `void Reverse(int[] a)
{
    for (int i = 0, j = a.Length - 1; i < j; i++, j--)
        (a[i], a[j]) = (a[j], a[i]);
}`,
    vars: "n = a.Length",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: BASIC,
    structure: "n / 2 swaps.",
    perStep: "O(1) per swap.",
    verdict: "O(n).",
    spaceWhy: "Two indexes; the array is modified in place, and the input does not count: O(1) auxiliary.",
  },
  {
    id: "sp-height-balanced",
    category: "space",
    difficulty: "medium",
    lang: "Python",
    title: "Tree height on a balanced tree",
    code: `def height(node):                 # a balanced binary tree of n nodes
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))`,
    vars: "n = number of nodes, h = height",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(log n)",
    spaceOptions: BASIC,
    structure: "One call per node plus one per empty child: about 2n calls.",
    perStep: "O(1) per call.",
    verdict: "O(n): every node is visited once.",
    spaceWhy: "The stack holds one root to leaf path at a time: O(h). A balanced tree has h = log n, so O(log n).",
  },
  {
    id: "sp-height-skewed",
    category: "space",
    difficulty: "medium",
    lang: "C#",
    title: "Tree height on a chain",
    code: `int Height(TreeNode? node)   // every node has only a right child: a chain of n
{
    if (node == null) return 0;
    return 1 + Math.Max(Height(node.left), Height(node.right));
}`,
    vars: "n = number of nodes, h = height",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Still one call per node (plus the null children): O(n) calls.",
    perStep: "O(1) per call.",
    verdict: "O(n).",
    spaceWhy: "Same code as the balanced case, but now h = n, so the stack gets n deep: O(n). That is why tree answers are written O(h) space, then specialised.",
  },
  {
    id: "sp-bfs-width",
    category: "space",
    difficulty: "medium",
    lang: "C#",
    title: "BFS on a perfect binary tree",
    code: `int CountNodes(TreeNode root)   // a perfect binary tree of n nodes
{
    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);
    int count = 0;
    while (queue.Count > 0)
    {
        var node = queue.Dequeue();
        count++;
        if (node.left != null) queue.Enqueue(node.left);
        if (node.right != null) queue.Enqueue(node.right);
    }
    return count;
}`,
    vars: "n = number of nodes",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    space: "O(n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    structure: "Each node is enqueued and dequeued once: n trips.",
    perStep: "O(1) per node.",
    verdict: "O(n).",
    spaceWhy: "BFS holds a whole level at once, and the last level of a perfect tree has about n / 2 nodes: O(n). DFS on the same tree would need only O(log n). BFS space is the tree's WIDTH, DFS space is its HEIGHT.",
  },
  {
    id: "sp-memo-dict",
    category: "space",
    difficulty: "easy",
    lang: "Python",
    title: "Memo dict Fibonacci",
    code: `def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: ["O(log n)", "O(n)", "O(n²)", "O(2ⁿ)"],
    space: "O(n)",
    spaceOptions: BASIC,
    structure: "Each value 2..n is computed once; repeats are dict hits.",
    perStep: "O(1) average per call (treating the addition as O(1)).",
    verdict: "O(n).",
    spaceWhy: "Two costs, both O(n): the memo holds n minus 1 entries, and the first descent fib(n), fib(n minus 1), ... is n frames deep. Name both.",
  },
  {
    id: "sp-generator",
    category: "space",
    difficulty: "hard",
    lang: "Python",
    title: "A generator instead of a list",
    code: `def evens(n):
    for i in range(n):
        if i % 2 == 0:
            yield i

def total_evens(n):
    return sum(evens(n))`,
    vars: "n is the input value",
    time: "O(n)",
    timeOptions: BASIC,
    space: "O(1)",
    spaceOptions: ["O(1)", "O(log n)", "O(√n)", "O(n)"],
    structure: "The generator runs its loop n times as sum pulls values from it.",
    perStep: "O(1) per value.",
    verdict: "O(n).",
    spaceWhy: "A generator produces one value at a time and sum keeps a running total, so nothing of size n ever exists: O(1). sum([i for i in range(n) if i % 2 == 0]) would build an O(n) list first.",
  },
  {
    id: "sp-clone-sort",
    category: "space",
    difficulty: "easy",
    lang: "C#",
    title: "Copy, then sort the copy",
    code: `int Median(int[] a)
{
    var copy = (int[])a.Clone();
    Array.Sort(copy);
    return copy[copy.Length / 2];
}`,
    vars: "n = a.Length",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    structure: "One O(n) copy, then one sort.",
    perStep: "The sort is O(n log n).",
    verdict: "O(n) + O(n log n) = O(n log n).",
    spaceWhy: "The copy is n ints: O(n). Not mutating the caller's array costs memory; mention the trade-off.",
  },
  {
    id: "sp-mergesort-slices",
    category: "space",
    difficulty: "hard",
    lang: "Python",
    title: "Merge sort with slices: peak memory",
    code: `def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    return out + left[i:] + right[j:]`,
    vars: "n = len(a)",
    time: "O(n log n)",
    timeOptions: BASIC_NLOGN,
    space: "O(n)",
    spaceOptions: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    structure: "log n levels of halving, as in any merge sort.",
    perStep: "Each level slices and merges n items in total: O(n).",
    verdict: "O(n log n).",
    spaceWhy: "The program ALLOCATES O(n log n) over its life, but the peak is what counts. A call on k items holds O(k) of slices and merged lists while its child (on k / 2) runs: S(k) = O(k) + S(k / 2), so the peak is O(n).",
  },
  {
    id: "sp-dp-grid",
    category: "space",
    difficulty: "easy",
    lang: "C#",
    title: "A full DP grid",
    code: `long Paths(int n)
{
    var dp = new long[n, n];
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            dp[r, c] = (r == 0 || c == 0) ? 1 : dp[r - 1, c] + dp[r, c - 1];
    return dp[n - 1, n - 1];
}`,
    vars: "n is the input value (grid side)",
    time: "O(n²)",
    timeOptions: BASIC,
    space: "O(n²)",
    spaceOptions: BASIC,
    structure: "n × n cells.",
    perStep: "O(1) per cell.",
    verdict: "O(n²).",
    spaceWhy: "The table is n by n: O(n²). Each cell only reads the row above and the cell to its left, so one row of n would do: O(n).",
  },
  {
    id: "sp-buffer-per-frame",
    category: "space",
    difficulty: "hard",
    lang: "Python",
    title: "A buffer in every frame",
    code: `def f(n):
    if n == 0:
        return 0
    buffer = [0] * n
    return len(buffer) + f(n - 1)`,
    vars: "n is the input value",
    time: "O(n²)",
    timeOptions: BASIC_NLOGN,
    space: "O(n²)",
    spaceOptions: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
    structure: "A chain of n calls.",
    perStep: "Call k allocates a list of k zeros: O(k).",
    verdict: "n + (n minus 1) + ... + 1 = O(n²).",
    spaceWhy: "Each frame's buffer is a local variable, so it stays alive until that frame returns, and all n frames are live at the bottom: n + (n minus 1) + ... = O(n²). Recursion space is depth × memory per frame, not just depth.",
  },
];

export const GYM_SNIPPETS: GymSnippet[] = [...PART_ONE, ...PART_TWO, ...PART_THREE];

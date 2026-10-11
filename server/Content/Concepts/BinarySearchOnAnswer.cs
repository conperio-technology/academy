namespace DsaAcademy.Content.Concepts;

public class BinarySearchOnAnswer : IConcept
{
    public string Id => "binary-search-on-answer";
    public string Track => "patterns";
    public string Title => "Binary Search on Answer: Minimum Eating Speed";
    public string OneLiner => "Not every binary search hunts through an array -- this one hunts through the space of POSSIBLE ANSWERS for the smallest one that actually works.";
    public string KeyTakeaway =>
        "Binary search on answer works whenever you can write a yes/no FEASIBILITY check for any " +
        "candidate answer, and that check flips from infeasible to feasible exactly once as the " +
        "candidate increases (monotonic) -- then the smallest feasible candidate is found by halving " +
        "the answer range, exactly like Binary Search: Find a Target halves an array.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Koko has piles of bananas and h hours; each hour she picks one pile and eats up to k bananas " +
        "from it (if the pile has fewer than k left, she finishes it and the hour is still used up). " +
        "Find the minimum integer eating speed k so she finishes every pile within h hours. There's no " +
        "array to search here -- the thing being searched is k itself, somewhere between 1 and the " +
        "largest pile.\n\n" +
        "The key move: write hoursNeeded(k) = sum of ceil(pile / k) (pile / k rounded up) over every pile -- how many hours " +
        "speed k actually takes. This function is MONOTONIC: a bigger k always needs the same or fewer " +
        "hours, never more. That monotonicity is exactly what makes binary search valid here -- just " +
        "like a sorted array lets you discard half the remaining candidates at every step of an " +
        "ordinary binary search, a monotonic feasibility check lets you discard half the remaining " +
        "SPEEDS at every step: if hoursNeeded(mid) fits within h, the answer is mid or something " +
        "smaller (search the lower half); if it doesn't fit, the answer is bigger than mid (search the " +
        "upper half).\n\n" +
        "Watch the candidate range collapse below -- at each step, the midpoint speed's hours-needed is " +
        "computed once, and half the remaining candidates get discarded based on a single yes/no " +
        "answer, the same shape as an ordinary array binary search wearing different clothes.";

    public List<string> RecognitionSignals =>
    [
        "The problem asks for a MINIMUM (or maximum) value that satisfies some condition -- \"minimum speed/capacity/time such that...\" -- rather than searching for a value already sitting in an array.",
        "You can write a yes/no FEASIBILITY check for any candidate answer, and that check flips from no to yes (or vice versa) exactly once as the candidate increases.",
    ];

    public List<string> Gotchas =>
    [
        "The thing being binary-searched is the ANSWER (a speed, a capacity, a day count), not an array index -- the search range is [smallest possible answer, largest possible answer], not [0, array.Length - 1].",
        "Getting the feasibility check's direction backwards (searching for the largest feasible instead of the smallest, or vice versa) silently returns the wrong boundary -- always double-check which direction \"better\" points.",
    ];

    public List<string> ConfusableWith =>
    [
        "Binary Search: Find a Target (this track) searches a SORTED ARRAY for a specific value; this pattern searches a RANGE OF POSSIBLE ANSWERS for the boundary where a feasibility check flips -- same halving idea, a different search space.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int MinEatingSpeed(int[] piles, int h)\n" +
            "    {\n" +
            "        // TODO: binary search k in [1, max(piles)]. hoursNeeded(k) = sum of\n" +
            "        // ceil(pile / k) over all piles. Find the smallest k where\n" +
            "        // hoursNeeded(k) <= h -- lo = 1, hi = max(piles); while lo < hi:\n" +
            "        // mid = (lo + hi) / 2; if hoursNeeded(mid) <= h, hi = mid, else\n" +
            "        // lo = mid + 1. Return lo.\n" +
            "        return 1;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def min_eating_speed(piles, h):\n" +
            "    # TODO: binary search k in [1, max(piles)]. hours_needed(k) = sum of\n" +
            "    # ceil(pile / k) over all piles. Find the smallest k where\n" +
            "    # hours_needed(k) <= h -- lo = 1, hi = max(piles); while lo < hi:\n" +
            "    # mid = (lo + hi) // 2; if hours_needed(mid) <= h, hi = mid, else\n" +
            "    # lo = mid + 1. Return lo.\n" +
            "    return 1\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MinEatingSpeed",
        ["python"] = "min_eating_speed",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([3, 6, 7, 11]), Lit.Int(8)), "4"),
        new TestCase(Lit.Args(Lit.IntArray([30, 11, 23, 4, 20]), Lit.Int(5)), "30"),
        new TestCase(Lit.Args(Lit.IntArray([30, 11, 23, 4, 20]), Lit.Int(6)), "23"),
        new TestCase(Lit.Args(Lit.IntArray([5]), Lit.Int(5)), "1"),
        new TestCase(Lit.Args(Lit.IntArray([1, 1, 1, 1]), Lit.Int(4)), "1"),
    ];

    public string CSharpCallTemplate => "Solution.MinEatingSpeed({input})";
    public string PythonCallTemplate => "min_eating_speed({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] piles = [3, 6, 7, 11];
        const int h = 8;
        var steps = new List<VisualizationStep>();
        var lo = 1;
        var hi = piles.Max();

        int HoursNeeded(int k) => piles.Sum(p => (p + k - 1) / k);

        object[] Snapshot() => Enumerable.Range(lo, hi - lo + 1).Select(v => (object)v).ToArray();

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Search speeds k from {lo} to {hi}. hoursNeeded(k) = sum of ceil(pile/k) -- find the smallest k where hoursNeeded(k) <= {h}."
        ));

        while (lo < hi)
        {
            var mid = (lo + hi) / 2;
            var hours = HoursNeeded(mid);
            var midIndex = mid - lo;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = hours, ["trackerLabel"] = $"hoursNeeded({mid})" },
                HighlightIndices: [midIndex],
                Message: hours <= h
                    ? $"k={mid} needs {hours}h <= {h}h -- feasible, try smaller (hi = {mid})."
                    : $"k={mid} needs {hours}h > {h}h -- too slow, try bigger (lo = {mid + 1})."
            ));
            if (hours <= h) hi = mid; else lo = mid + 1;
        }

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["array"] = Snapshot(), ["tracker"] = HoursNeeded(lo), ["trackerLabel"] = $"hoursNeeded({lo})" },
            HighlightIndices: [0],
            Message: $"lo == hi == {lo} -- done. Minimum eating speed: {lo}."
        ));

        return steps;
    }
}

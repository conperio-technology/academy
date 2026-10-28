namespace DsaAcademy.Content.Concepts;

public class BacktrackingCombinationSum : IConcept
{
    public string Id => "backtracking-combination-sum";
    public string Track => "patterns";
    public string Title => "Backtracking: Combination Sum";
    public string OneLiner => "All combinations of candidates that add up to a target, each candidate reusable. Backtrack with a start index so every combination is built in one order only.";
    public string KeyTakeaway =>
        "Choose, recurse, un-choose, with two twists. Recursing with the same index i (not i + 1) lets a " +
        "number be reused. Never going back to an earlier index means [2, 2, 3] is built once instead of as " +
        "every permutation. Sorting the candidates lets you stop the loop as soon as a candidate is larger " +
        "than what remains.";
    public VisualizerKind VisualizerKind => VisualizerKind.CallStack;

    public string Explanation =>
        "candidates are distinct positive integers. Return every combination of them that sums to target, " +
        "where each candidate may be used any number of times. Order within a combination doesn't matter and " +
        "each combination appears once. For [2, 3, 6, 7] and target 7 the answer is [[2, 2, 3], [7]]. The " +
        "grader sorts your combinations before comparing, so any order of output is fine.\n\n" +
        "This is the Subsets backtracking shape with a running remainder. backtrack(start, remaining): if " +
        "remaining is 0, record a copy of the current path. Otherwise for each index i from start onwards: " +
        "put candidates[i] on the path, recurse with backtrack(i, remaining - candidates[i]), then take it " +
        "off again.\n\n" +
        "Two details carry the whole problem. Recursing with i rather than i + 1 is what allows reuse: after " +
        "picking 2 you may pick 2 again. Starting the loop at start rather than 0 is what prevents " +
        "duplicates: once you have moved past 2 to 3, you never come back to 2, so [3, 2, 2] can't be built " +
        "after [2, 2, 3]. Each combination is generated in exactly one order, non-decreasing by index.\n\n" +
        "Pruning: sort the candidates first. Then when candidates[i] > remaining, every later candidate is " +
        "too big as well, so break out of the loop instead of recursing into dead ends.\n\n" +
        "The output can be exponential in size, so the running time is too. A rough bound is O(n^(T/m)), for " +
        "target T and smallest candidate m, which is the depth of the deepest path. The recursion stack and " +
        "the current path hold at most T/m values.\n\n" +
        "The visualization runs [2, 3, 6, 7] with target 7, showing the call stack as (path, remaining).";

    public List<string> RecognitionSignals => [
        "\"Find all combinations\" that reach a target sum, with unlimited reuse.",
        "Output is a list of lists and its size can be exponential: backtracking.",
    ];

    public List<string> Gotchas => [
        "Recursing with i + 1 forbids reuse (that is Combination Sum II); recursing from 0 creates permutations of the same combination.",
        "Recording current instead of a copy: every recorded list ends up empty after backtracking.",
        "Without sorting, break is wrong (a later, smaller candidate might still fit); use continue, or sort first.",
    ];

    public List<string> ConfusableWith => [
        "Subsets records every path; this records only paths whose sum hits the target, and lets values repeat.",
        "Coin Change Ways counts the same combinations with DP instead of listing them, which is far cheaper when you only need the number.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static List<List<int>> CombinationSum(int[] candidates, int target)\n" +
            "    {\n" +
            "        var sorted = candidates.OrderBy(x => x).ToArray();\n" +
            "        var result = new List<List<int>>();\n" +
            "        var path = new List<int>();\n" +
            "\n" +
            "        void Backtrack(int start, int remaining)\n" +
            "        {\n" +
            "            // TODO: if remaining == 0, add a COPY of path and return.\n" +
            "            // For i from start: if sorted[i] > remaining, break. Otherwise add\n" +
            "            // sorted[i], Backtrack(i, remaining - sorted[i]) (i again: reuse\n" +
            "            // allowed), then remove the last element.\n" +
            "        }\n" +
            "\n" +
            "        Backtrack(0, target);\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def combination_sum(candidates, target):\n" +
            "    candidates = sorted(candidates)\n" +
            "    result = []\n" +
            "    path = []\n" +
            "\n" +
            "    def backtrack(start, remaining):\n" +
            "        # TODO: if remaining == 0, append a COPY of path and return.\n" +
            "        # For i from start: if candidates[i] > remaining, break. Otherwise append\n" +
            "        # candidates[i], backtrack(i, remaining - candidates[i]) (i again: reuse\n" +
            "        # allowed), then pop.\n" +
            "        pass\n" +
            "\n" +
            "    backtrack(0, target)\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.CombinationSum",
        ["python"] = "combination_sum",
    };

    public string? CSharpHarnessPreamble => "public static class CombinationNormalizer\n" +
        "{\n" +
        "    public static List<List<int>> Normalize(List<List<int>> combos)\n" +
        "    {\n" +
        "        var sorted = combos.Select(c => { var copy = new List<int>(c); copy.Sort(); return copy; }).ToList();\n" +
        "        sorted.Sort((a, b) =>\n" +
        "        {\n" +
        "            for (var i = 0; i < Math.Min(a.Count, b.Count); i++) if (a[i] != b[i]) return a[i] - b[i];\n" +
        "            return a.Count - b.Count;\n" +
        "        });\n" +
        "        return sorted;\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble => "def normalize_combinations(combos):\n" +
        "    return sorted(sorted(c) for c in combos)\n";

    public List<TestCase> TestCases =>
    [
        new TestCase("[2, 3, 6, 7], 7", "[[2,2,3],[7]]"),
        new TestCase("[2, 3, 5], 8", "[[2,2,2,2],[2,3,3],[3,5]]"),
        new TestCase("[2], 1", "[]"),
        new TestCase("[1], 2", "[[1,1]]"),
        new TestCase("[5, 3], 4", "[]"),
        new TestCase("[8, 7, 4, 3], 11", "[[3,4,4],[3,8],[4,7]]"),
        new TestCase("[7, 3, 2], 10", "[[2,2,2,2,2],[2,2,3,3],[3,7]]"),
    ];

    public string CSharpCallTemplate => "CombinationNormalizer.Normalize(Solution.CombinationSum({input}))";
    public string PythonCallTemplate => "normalize_combinations(combination_sum({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] c = [2, 3, 6, 7];
        var steps = new List<VisualizationStep>();
        var frames = new List<string>();
        var path = new List<int>();
        var found = new List<string>();
        string Frame(int remaining) => $"path [{string.Join(", ", path)}], remaining {remaining}";
        steps.Add(new(new() { ["frames"] = new[] { Frame(7) } }, [], "Candidates [2, 3, 6, 7], target 7. Each call loops from its start index; picking i again allows reuse."));

        void Backtrack(int start, int remaining)
        {
            frames.Add(Frame(remaining));
            if (remaining == 0)
            {
                found.Add($"[{string.Join(", ", path)}]");
                steps.Add(new(new() { ["frames"] = frames.ToArray() }, [], $"remaining is 0: record [{string.Join(", ", path)}]. Found so far: {string.Join(", ", found)}."));
                frames.RemoveAt(frames.Count - 1);
                return;
            }
            for (var i = start; i < c.Length; i++)
            {
                if (c[i] > remaining)
                {
                    steps.Add(new(new() { ["frames"] = frames.ToArray() }, [], $"{c[i]} is more than the remaining {remaining}, and later candidates are larger still: stop this loop."));
                    break;
                }
                path.Add(c[i]);
                Backtrack(i, remaining - c[i]);
                path.RemoveAt(path.Count - 1);
            }
            frames.RemoveAt(frames.Count - 1);
        }

        Backtrack(0, 7);
        steps.Add(new(new() { ["frames"] = Array.Empty<string>() }, [], $"Done: {string.Join(", ", found)}. [3, 2, 2] was never built, because no call goes back to an earlier index."));
        return steps;
    }
}

namespace DsaAcademy.Content.Concepts;

public class TreeMaxPathSum : IConcept
{
    public string Id => "tree-max-path-sum";
    public string Track => "patterns";
    public string Title => "Transfer: Binary Tree Maximum Path Sum";
    public string OneLiner => "The largest sum of any path in a tree. Diameter's trick again: return the best single branch to the parent, update a global best with the path that bends here.";
    public string KeyTakeaway =>
        "At each node, the best path bending there is node + left gain + right gain, where a gain is the best " +
        "downward branch from a child, clamped at 0 (a negative branch is better left out). Update a global " +
        "best with that, but return node + the larger single gain to the parent, because a path through the " +
        "parent can only continue down one side.";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;
    public string? TransferOf => "tree-diameter";

    public string Explanation =>
        "This follows Diameter of a Binary Tree with lengths replaced by node values, which may be negative. " +
        "A path is any sequence of connected nodes, each used at most once; it need not pass through the root " +
        "and must contain at least one node. Return the largest sum of a path. For [-10, 9, 20, null, null, " +
        "15, 7] the answer is 42, the path 15 -> 20 -> 7.\n\n" +
        "Same shape as the diameter: every path climbs to one highest node and goes down from there, so at " +
        "each node consider the best path that bends at it. It is node.val + (best downward branch into the " +
        "left subtree) + (best downward branch into the right subtree). The new twist is negatives. A branch " +
        "whose best sum is negative only makes things worse, so take each gain as max(0, gain(child)), which " +
        "means \"don't go that way\".\n\n" +
        "So gain(node) does two things. As a side effect it updates best = max(best, node.val + leftGain + " +
        "rightGain). It returns node.val + max(leftGain, rightGain): to the parent, a path can continue down " +
        "only ONE side, because using both would visit the node from two directions. Returning the bend " +
        "instead of a single branch is the common wrong answer.\n\n" +
        "Start best at negative infinity (int.MinValue in C#), not 0: in an all-negative tree like [-2, -1] " +
        "the answer is -1, a single node. The clamp at 0 applies to children's gains, never to the node " +
        "itself. One post-order pass visits every node once: O(n) time, O(h) stack.\n\n" +
        "Explain why the same idea works: before you move on, write two or three sentences comparing this " +
        "with the diameter. What does each call return, what does it record on the side, and why can the " +
        "returned value use only one child?\n\n" +
        "The visualization runs [-10, 9, 20, null, null, 15, 7]; each step finishes one node.";

    public List<string> RecognitionSignals => [
        "\"Maximum path sum\" or \"longest path\" in a tree where the path can bend anywhere.",
        "Each node needs both children's results to update an answer, but its parent needs only one number from it.",
    ];

    public List<string> Gotchas => [
        "Returning node + left + right to the parent counts a path that forks: return only one branch.",
        "Starting best at 0 gives the wrong answer for all-negative trees.",
        "Clamp the children's gains at 0, not the node's own value: the path must include the node it bends at.",
    ];

    public List<string> ConfusableWith => [
        "Diameter of a Binary Tree is the same pattern counting edges, where no branch is ever harmful, so there is no clamping.",
        "Path Sum (root to leaf with a target) only follows downward paths from the root; this path can start and end anywhere.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    private static int best;\n" +
            "\n" +
            "    public static int MaxPathSum(TreeNode? root)\n" +
            "    {\n" +
            "        best = int.MinValue;\n" +
            "        Gain(root);\n" +
            "        return best;\n" +
            "    }\n" +
            "\n" +
            "    private static int Gain(TreeNode? node)\n" +
            "    {\n" +
            "        // TODO: Gain(null) = 0. left = max(0, Gain(node.Left)), right likewise.\n" +
            "        // Update best with node.Val + left + right (the path bending here), and\n" +
            "        // return node.Val + the larger of left and right (one branch only).\n" +
            "        return 0;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def max_path_sum(root):\n" +
            "    best = float(\"-inf\")\n" +
            "\n" +
            "    def gain(node):\n" +
            "        nonlocal best\n" +
            "        # TODO: gain(None) = 0. left = max(0, gain(node.left)), right likewise.\n" +
            "        # Update best with node.val + left + right (the path bending here), and\n" +
            "        # return node.val + the larger of left and right (one branch only).\n" +
            "        return 0\n" +
            "\n" +
            "    gain(root)\n" +
            "    return best\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.MaxPathSum",
        ["python"] = "max_path_sum",
    };

    public string? CSharpHarnessPreamble => TreeHelpers.CSharpPreamble;

    public string? PythonHarnessPreamble => TreeHelpers.PythonPreamble;

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3]", "6"),
        new TestCase("[-10, 9, 20, null, null, 15, 7]", "42"),
        new TestCase("[-3]", "-3"),
        new TestCase("[2, -1]", "2"),
        new TestCase("[-2, -1]", "-1"),
        new TestCase("[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]", "48"),
        new TestCase("[1, -2, -3, 1, 3, -2, null, -1]", "3"),
        new TestCase("[9, 6, -3, null, null, -6, 2, null, null, 2, null, -6, -6, -6]", "16"),
    ];

    public string CSharpCallTemplate => "Solution.MaxPathSum(LevelOrderTree.Build({input}))";
    public string PythonCallTemplate => "max_path_sum(build_level_order_tree({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        // [-10, 9, 20, null, null, 15, 7] keyed by heap index.
        var tree = new Dictionary<int, int> { [0] = -10, [1] = 9, [2] = 20, [5] = 15, [6] = 7 };
        var steps = new List<VisualizationStep>();
        var finished = new List<int>();
        var best = int.MinValue;
        steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree), ["collected"] = finished.ToArray() }, [], "Post-order: each node gets its children's gains (clamped at 0), records the path bending at it, and returns one branch upwards."));

        int Gain(int slot)
        {
            if (!tree.TryGetValue(slot, out var value)) return 0;
            var left = Math.Max(0, Gain(2 * slot + 1));
            var right = Math.Max(0, Gain(2 * slot + 2));
            var bend = value + left + right;
            var improved = bend > best;
            best = Math.Max(best, bend);
            finished.Add(value);
            var up = value + Math.Max(left, right);
            steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree), ["collected"] = finished.ToArray() }, [slot],
                $"Node {value}: gains left {left}, right {right}. Path bending here = {value} + {left} + {right} = {bend}{(improved ? $", the new best" : $", best stays {best}")}. Return {value} + {Math.Max(left, right)} = {up} to the parent."));
            return up;
        }

        Gain(0);
        steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree), ["collected"] = finished.ToArray() }, [], $"Maximum path sum = {best} (15 -> 20 -> 7). It bends at 20 and never touches the root."));
        return steps;
    }
}

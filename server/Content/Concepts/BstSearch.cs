namespace DsaAcademy.Content.Concepts;

public class BstSearch : IConcept
{
    public string Id => "bst-search";
    public string Track => "trees";
    public string Title => "Binary Search Trees: Search";
    public string OneLiner => "The same left/right comparison as Insert, but stop and report found instead of placing a new node.";
    public string KeyTakeaway =>
        "Searching a BST is Insert's comparison logic with the ending changed: instead of placing a " +
        "new node when you fall off the tree, falling off means the value isn't there. Same walk, same " +
        "O(h) cost (h = tree height -- O(log n) if balanced, O(n) if it's degenerated into a " +
        "linked-list shape).";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Start at the root and compare: found it, exact match -- done, return true. Target is smaller " +
        "-- it can ONLY be in the left subtree (everything in the right subtree is guaranteed bigger " +
        "or equal by the BST invariant, so bigger than the target), so move left and repeat. Target is bigger -- move right for the same " +
        "reason. If this walk ever reaches an empty spot (null) before finding a match, the value " +
        "isn't in the tree at all -- there's nowhere else it could be. This lesson gives you " +
        "`BuildBst` (the same insertion helper from the previous lesson) already implemented, so you " +
        "can focus purely on the search logic itself. Watch out for the direction mix-up: smaller " +
        "means left, not right -- easy to get backward under time pressure, and a backward search " +
        "will silently return wrong answers (false negatives) instead of crashing, which makes the " +
        "bug harder to notice.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    // Given: same insertion helper from the previous lesson.\n" +
            "    public static TreeNode? BuildBst(int[] values)\n" +
            "    {\n" +
            "        TreeNode? root = null;\n" +
            "        foreach (var v in values) root = Insert(root, v);\n" +
            "        return root;\n" +
            "    }\n" +
            "    private static TreeNode Insert(TreeNode? node, int val)\n" +
            "    {\n" +
            "        if (node == null) return new TreeNode(val);\n" +
            "        if (val < node.Val) node.Left = Insert(node.Left, val);\n" +
            "        else node.Right = Insert(node.Right, val);\n" +
            "        return node;\n" +
            "    }\n" +
            "\n" +
            "    public static bool SearchBst(int[] values, int target)\n" +
            "    {\n" +
            "        // TODO: build the tree with BuildBst(values), then walk from the root:\n" +
            "        // target == node.Val -> found. target < node.Val -> go left. Otherwise go right.\n" +
            "        // Falling off the tree (reaching null) means target isn't present.\n" +
            "        return false;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "# Given: same insertion helper from the previous lesson.\n" +
            "def build_bst(values):\n" +
            "    root = None\n" +
            "    for v in values:\n" +
            "        root = insert(root, v)\n" +
            "    return root\n" +
            "\n" +
            "def insert(node, val):\n" +
            "    if node is None:\n" +
            "        return TreeNode(val)\n" +
            "    if val < node.val:\n" +
            "        node.left = insert(node.left, val)\n" +
            "    else:\n" +
            "        node.right = insert(node.right, val)\n" +
            "    return node\n" +
            "\n" +
            "def search_bst(values, target):\n" +
            "    # TODO: build the tree with build_bst(values), then walk from the root:\n" +
            "    # target == node.val -> found. target < node.val -> go left. Otherwise go right.\n" +
            "    # Falling off the tree (reaching None) means target isn't present.\n" +
            "    return False\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.SearchBst",
        ["python"] = "search_bst",
    };

    // TreeNode is the only thing that needs to be hidden -- BuildBst/Insert are
    // deliberately VISIBLE starter code (given, not TODO) rather than harness
    // infrastructure, since re-reading the insertion logic from the previous lesson is
    // useful context here. This also sidesteps a real architecture gap: the current
    // call-template mechanism substitutes ONE joined literal for all arguments, so a
    // concept needing DIFFERENT wrapping per argument (e.g. build a tree from the first
    // arg, pass the second straight through) has no clean way to express that today.
    // Keeping both arguments plain (values, target) avoids needing that capability at
    // all, at the cost of the student re-typing (not re-thinking) the insert helper.
    public string? CSharpHarnessPreamble =>
        "public class TreeNode\n" +
        "{\n" +
        "    public int Val;\n" +
        "    public TreeNode? Left;\n" +
        "    public TreeNode? Right;\n" +
        "    public TreeNode(int val) { Val = val; }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "class TreeNode:\n" +
        "    def __init__(self, val):\n" +
        "        self.val = val\n" +
        "        self.left = None\n" +
        "        self.right = None\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), Lit.Int(4)), "true"),
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), Lit.Int(6)), "false"),
        new TestCase(Lit.Args(Lit.IntArray([5, 3, 8, 1, 4, 7, 9]), Lit.Int(5)), "true"),
        new TestCase(Lit.Args(Lit.IntArray([]), Lit.Int(1)), "false"),
        new TestCase(Lit.Args(Lit.IntArray([10]), Lit.Int(10)), "true"),
    ];

    public string CSharpCallTemplate => "Solution.SearchBst({input})";
    public string PythonCallTemplate => "search_bst({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        int[] insertOrder = [5, 3, 8, 1, 4, 7, 9];
        const int target = 7;
        var tree = new Dictionary<int, int>();

        void Insert(int v)
        {
            if (tree.Count == 0) { tree[0] = v; return; }
            var index = 0;
            while (true)
            {
                var goLeft = v < tree[index];
                var childIndex = goLeft ? 2 * index + 1 : 2 * index + 2;
                if (!tree.ContainsKey(childIndex)) { tree[childIndex] = v; return; }
                index = childIndex;
            }
        }
        foreach (var v in insertOrder) Insert(v);

        var steps = new List<VisualizationStep>();
        object Snapshot() => LevelOrderSnapshot(tree);

        steps.Add(new VisualizationStep(
            State: new Dictionary<string, object> { ["tree"] = Snapshot() },
            HighlightIndices: [],
            Message: $"Searching for {target}. Start at the root."
        ));

        var i = 0;
        while (true)
        {
            var current = tree[i];
            if (current == target)
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                    HighlightIndices: [i],
                    Message: $"{current} == {target} -- found it."
                ));
                break;
            }

            var goLeft = target < current;
            var childIndex = goLeft ? 2 * i + 1 : 2 * i + 2;
            steps.Add(new VisualizationStep(
                State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                HighlightIndices: [i],
                Message: $"{target} {(goLeft ? "<" : ">")} {current} -- go {(goLeft ? "left" : "right")}."
            ));

            if (!tree.ContainsKey(childIndex))
            {
                steps.Add(new VisualizationStep(
                    State: new Dictionary<string, object> { ["tree"] = Snapshot() },
                    HighlightIndices: [],
                    Message: $"Fell off the tree (no node there) -- {target} isn't present."
                ));
                break;
            }
            i = childIndex;
        }

        return steps;
    }

    private static object LevelOrderSnapshot(Dictionary<int, int> tree)
    {
        if (tree.Count == 0) return Array.Empty<int?>();
        var maxIndex = tree.Keys.Max();
        var result = new int?[maxIndex + 1];
        foreach (var kv in tree) result[kv.Key] = kv.Value;
        return result;
    }
}

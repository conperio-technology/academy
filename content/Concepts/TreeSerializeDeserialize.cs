namespace DsaAcademy.Content.Concepts;

public class TreeSerializeDeserialize : IConcept
{
    public string Id => "tree-serialize-deserialize";
    public string Track => "patterns";
    public string Title => "Trees: Serialize and Deserialize";
    public string OneLiner => "Turn a binary tree into a string and back. A preorder walk that writes a marker for every missing child records enough to rebuild the exact shape.";
    public string KeyTakeaway =>
        "Write the tree in preorder and emit a marker such as # for every null child. Because every null is " +
        "recorded, one traversal fixes the shape: reading the tokens back in the same order, each value is a " +
        "node whose left subtree comes next, then its right subtree, and # ends a branch. Both directions are " +
        "O(n).";
    public VisualizerKind VisualizerKind => VisualizerKind.Tree;

    public string Explanation =>
        "Write Serialize(root), which turns a binary tree into a string, and Deserialize(data), which turns " +
        "that string back into the same tree. The format is yours to choose. The grader builds a tree, runs " +
        "Deserialize(Serialize(tree)) and checks the result has exactly the same values and shape, so test " +
        "trees include negative and multi-digit values and lopsided shapes.\n\n" +
        "Why one traversal is enough here when Build From Preorder and Inorder needed two: that problem had " +
        "no record of where children were missing. Write the nulls down and the ambiguity disappears. A " +
        "preorder walk with # for null turns [1, 2, 3, null, null, 4, 5] into \"1,2,#,#,3,4,#,#,5,#,#\".\n\n" +
        "Serialize: if the node is null, append #. Otherwise append its value, then serialize the left child, " +
        "then the right child. Join the tokens with commas; a separator is what lets -12 and 34 stay distinct " +
        "values.\n\n" +
        "Deserialize: split on commas and read tokens with a running index. read(): take the next token; if " +
        "it is #, return null. Otherwise make a node from it, set its left child to read(), then its right " +
        "child to read(), and return it. The recursion consumes tokens in exactly the order Serialize " +
        "produced them, so it rebuilds the same tree.\n\n" +
        "Both directions touch each node and each null once. A tree with n nodes has n + 1 null children, so " +
        "the string has 2n + 1 tokens: O(n) time and O(n) space, plus O(h) recursion. A level-order (BFS) " +
        "format with null markers, like the one this site uses to print trees, works just as well.\n\n" +
        "The visualization deserializes \"1,2,#,#,3,4,#,#,5,#,#\" token by token.";

    public List<string> RecognitionSignals => [
        "Store, send or copy a tree (or any linked structure) and get the identical structure back.",
        "Rebuilding a shape from a single traversal: you must record the empty children.",
    ];

    public List<string> Gotchas => [
        "Without null markers, different trees serialize to the same string.",
        "Without a separator, values like 1 and 23 run together as 123.",
        "In Deserialize, the token index must be shared across the whole recursion (a field, a nonlocal or an iterator), not a parameter copied into each call.",
    ];

    public List<string> ConfusableWith => [
        "Build From Preorder and Inorder rebuilds from two traversals without null markers; here one traversal is enough because the nulls are written down.",
        "Clone Graph copies a structure in memory; serialization is the same walk but writes to text in between.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Codec\n" +
            "{\n" +
            "    public static string Serialize(TreeNode? root)\n" +
            "    {\n" +
            "        // TODO: preorder walk: append \"#\" for null, otherwise the value, then\n" +
            "        // the left subtree, then the right. Join the tokens with \",\".\n" +
            "        return \"\";\n" +
            "    }\n" +
            "\n" +
            "    public static TreeNode? Deserialize(string data)\n" +
            "    {\n" +
            "        // TODO: split on \",\", read tokens with a shared index: \"#\" -> null,\n" +
            "        // otherwise a node whose Left is read next, then its Right.\n" +
            "        return null;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def serialize(root):\n" +
            "    # TODO: preorder walk: append \"#\" for None, otherwise the value, then\n" +
            "    # the left subtree, then the right. Join the tokens with \",\".\n" +
            "    return \"\"\n" +
            "\n" +
            "\n" +
            "def deserialize(data):\n" +
            "    # TODO: split on \",\", read tokens with a shared index (or iter()): \"#\" -> None,\n" +
            "    # otherwise a node whose left is read next, then its right.\n" +
            "    return None\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Codec.Serialize",
        ["python"] = "serialize",
    };

    public string? CSharpHarnessPreamble => TreeHelpers.CSharpPreamble;

    public string? PythonHarnessPreamble => TreeHelpers.PythonPreamble;

    public List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 3, null, null, 4, 5]", "[1,2,3,null,null,4,5]"),
        new TestCase("[]", "[]"),
        new TestCase("[1]", "[1]"),
        new TestCase("[1, -2, 3]", "[1,-2,3]"),
        new TestCase("[5, 4, null, 3, null, 2]", "[5,4,null,3,null,2]"),
        new TestCase("[1, null, 2, null, 3]", "[1,null,2,null,3]"),
        new TestCase("[10, 20, 30, 40, 50, 60, 70]", "[10,20,30,40,50,60,70]"),
        new TestCase("[-100, null, 250]", "[-100,null,250]"),
    ];

    public string CSharpCallTemplate => "LevelOrderTree.ToList(Codec.Deserialize(Codec.Serialize(LevelOrderTree.Build({input}))))";
    public string PythonCallTemplate => "tree_to_list(deserialize(serialize(build_level_order_tree({input}))))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        var tokens = "1,2,#,#,3,4,#,#,5,#,#".Split(',');
        var tree = new Dictionary<int, int>();
        var steps = new List<VisualizationStep>
        {
            new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [], "Serialize([1, 2, 3, null, null, 4, 5]) wrote \"1,2,#,#,3,4,#,#,5,#,#\". Now read it back, one token at a time, in the same preorder."),
        };
        var next = 0;

        void Read(int slot, string where)
        {
            var token = tokens[next++];
            if (token == "#")
            {
                steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [], $"Token {next - 1} is #: {where} is empty, so this branch ends."));
                return;
            }
            tree[slot] = int.Parse(token);
            steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [slot], $"Token {next - 1} is {token}: make it {where}. The next tokens describe its left subtree, then its right."));
            Read(2 * slot + 1, $"the left child of {token}");
            Read(2 * slot + 2, $"the right child of {token}");
        }

        Read(0, "the root");
        steps.Add(new(new() { ["tree"] = TreeHelpers.HeapSnapshot(tree) }, [], "All 11 tokens used: 5 nodes and 6 null markers (n + 1 of them). Same tree as before serializing."));
        return steps;
    }
}

namespace DsaAcademy.Content.Concepts;

public class BlockGroupByKey : BuildingBlock
{
    public override string Id => "block-group-by-key";
    public override string Title => "Block: Group By a Key";
    public override string OneLiner => "Group words by their first letter (ignoring case), keeping groups in the order their key first appeared.";
    public override string KeyTakeaway =>
        "Grouping is a map from key to list: look the key up, start an empty list the first time, append. Group Anagrams is this block with a different key.";

    public override string Explanation =>
        "Given non-empty words, return lists of words grouped by first letter, ignoring case. Groups come in the order their letter first appeared, and words keep their input order inside a group. [\"apple\", \"Bob\", \"avocado\"] gives [[\"apple\", \"avocado\"], [\"Bob\"]].\n" +
        "\n" +
        "Work out the key for each word (its first character, lowercased), fetch that key's list, creating an empty one the first time, and append. Python dicts keep insertion order, so list(groups.values()) is already in first-appearance order. In C#, keep a separate list of keys in the order you created them rather than relying on Dictionary enumeration order.";

    protected override string[] Plan =>
    [
        "Make an empty map from key to list of words.",
        "For each word, work out its key: the first letter, lowercased.",
        "If the key is new, start an empty list for it and remember the order keys first appeared.",
        "Append the word to its key's list.",
        "Return the lists in the order their keys first appeared.",
    ];

    protected override string CSharpSignature => "public static List<List<string>> GroupByFirstLetter(string[] words)";
    protected override string CSharpReturnStub => "return new List<List<string>>();";
    protected override string PythonSignature => "def group_by_first_letter(words):";
    protected override string PythonReturnStub => "return []";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.GroupByFirstLetter",
        ["python"] = "group_by_first_letter",
    };

    public override List<TestCase> TestCases =>
    [
        new TestCase("[\"apple\", \"Bob\", \"avocado\", \"banana\", \"cherry\"]", "[[\"apple\",\"avocado\"],[\"Bob\",\"banana\"],[\"cherry\"]]"),
        new TestCase("[]", "[]"),
        new TestCase("[\"x\"]", "[[\"x\"]]"),
        new TestCase("[\"Ant\", \"ant\", \"ANT\"]", "[[\"Ant\",\"ant\",\"ANT\"]]"),
        new TestCase("[\"kiwi\", \"lime\", \"Kale\", \"Leek\", \"mint\"]", "[[\"kiwi\",\"Kale\"],[\"lime\",\"Leek\"],[\"mint\"]]"),
    ];

    public override string CSharpCallTemplate => "Solution.GroupByFirstLetter({input})";
    public override string PythonCallTemplate => "group_by_first_letter({input})";

    public override List<string> Gotchas =>
    [
        "Creating a new list for every word instead of once per key, which keeps only the last word of each group.",
    ];
}

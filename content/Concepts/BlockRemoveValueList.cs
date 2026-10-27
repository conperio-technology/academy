namespace DsaAcademy.Content.Concepts;

public class BlockRemoveValueList : BuildingBlock
{
    public override string Id => "block-remove-value-list";
    public override string Title => "Block: A Linked List Walk With a Dummy Node";
    public override string OneLiner => "Remove every node holding a given value from a linked list, using a dummy node so the head is not a special case.";
    public override string KeyTakeaway =>
        "A dummy node in front of the head means every real node has a predecessor, so deleting the head looks like deleting anything else. Return dummy.next, not head.";

    public override string Explanation =>
        "Return the head of the list with every node whose value equals val removed. The head itself, or every node, may need to go.\n" +
        "\n" +
        "Create a dummy node pointing at head and walk a pointer from the dummy. While pointer.next exists: if it holds val, link past it (pointer.next = pointer.next.next) and stay where you are, because the new next might also match; otherwise step forward. The answer is dummy.next.";

    protected override string[] Plan =>
    [
        "Make a dummy node whose next is the head, so removing the head is not a special case.",
        "Start a pointer at the dummy.",
        "While the pointer has a next node: if that node holds the value, link past it and stay put.",
        "Otherwise move the pointer forward one node.",
        "Return the dummy's next, the new head.",
    ];
    protected override string[] CSharpProvided => ["ListNode: int Val, ListNode? Next, new ListNode(val, next)"];
    protected override string[] PythonProvided => ["ListNode: val, next, ListNode(val, next=None)"];

    protected override string CSharpSignature => "public static ListNode? RemoveValue(ListNode? head, int val)";
    protected override string CSharpReturnStub => "return head;";
    protected override string PythonSignature => "def remove_value(head, val):";
    protected override string PythonReturnStub => "return head";

    public override Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.RemoveValue",
        ["python"] = "remove_value",
    };

    public override string? CSharpHarnessPreamble =>
        BlockHarness.ListNodeCSharp +
        "public static class RemoveValueHarness\n" +
        "{\n" +
        "    public static int[] Run(int[] values, int val) => ListBuilder.ToArray(Solution.RemoveValue(ListBuilder.FromArray(values), val));\n" +
        "}\n";

    public override string? PythonHarnessPreamble =>
        BlockHarness.ListNodePython +
        "\n" +
        "def run_remove_value(values, val):\n" +
        "    return list_to_array(remove_value(build_list(values), val))\n";

    public override List<TestCase> TestCases =>
    [
        new TestCase("[1, 2, 6, 3, 4, 5, 6], 6", "[1,2,3,4,5]"),
        new TestCase("[], 1", "[]"),
        new TestCase("[7, 7, 7, 7], 7", "[]"),
        new TestCase("[1, 2, 3], 4", "[1,2,3]"),
        new TestCase("[1, 1, 2], 1", "[2]"),
        new TestCase("[2, 1, 1], 1", "[2]"),
    ];

    public override string CSharpCallTemplate => "RemoveValueHarness.Run({input})";
    public override string PythonCallTemplate => "run_remove_value({input})";

    public override List<string> Gotchas =>
    [
        "Moving the pointer forward after unlinking, which skips the next node when two matches are adjacent.",
        "Returning head instead of dummy.next when the old head was removed.",
    ];
}

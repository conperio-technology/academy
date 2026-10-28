namespace DsaAcademy.Content.Tools;

public class ProbabilityCountingTool : ITool
{
    public string Id => "probability-counting";
    public string Section => "Data Structures & Algorithms";
    public string Track => "math";
    public int Order => 120;
    public string Title => "Probability and Counting for Programmers";
    public string OneLiner => "Permutations and combinations, the basic probability rules, expected value, and the birthday paradox, with a simulator and the link to hash collisions and randomized algorithms.";
    public string KeyTakeaway => "Multiply independent choices, use n! / permutations / combinations depending on whether order matters, and reach for the complement for 'at least one'. Expected value is each outcome times its probability. The birthday paradox (23 people, >50% shared) is why short hashes and ids collide after about the square root of their range.";

    public ToolKind ToolKind => ToolKind.ProbabilityCounting;

    public string Explanation =>
        "Counting and probability show up in test design, hash collisions, retries, randomized algorithms and interview brain teasers. This lesson gives the handful of counting rules and probability facts you need, plus a few results that surprise almost everyone." +
        "\n\n" +
        "Python checks the arithmetic, and a widget lets you see the birthday paradox exactly and by simulation. It ends with the classic interview questions and the idea behind each.";
}

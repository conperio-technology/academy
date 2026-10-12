namespace DsaAcademy.Content.Tools;

public class ComplexityExplainingTool : ITool
{
    public string Id => "complexity-explaining";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";
    public int Order => 7;

    public string Title => "Explaining Complexity Out Loud in an Interview";
    public string OneLiner => "A seven-step template for stating time and space and the reason for each, with weak and strong answers to six real problems.";
    public string KeyTakeaway =>
        "Interviewers grade the reasoning, not just the formula. Name the variables, count the dominant work, multiply what " +
        "is nested and add what is sequential, simplify, then give space separately (stack included) and mention the worst " +
        "case when it differs. Three or four sentences, in that order, every time.";

    public ToolKind ToolKind => ToolKind.ComplexityExplaining;

    public string Explanation =>
        "In a FAANG style interview, \"what's the complexity?\" usually comes right after you finish coding, and \"O(n)\" " +
        "on its own is a weak answer even when it is right. The interviewer wants to hear that you know WHY: what n is, " +
        "which part of the code dominates, and what each piece costs. A clear explanation also protects you when you are " +
        "slightly wrong, because the interviewer can see exactly which step to nudge.\n\n" +
        "The template has seven steps. First name every variable: n, and m, k, L, V and E when they exist. Then count the " +
        "dominant work, the loop trips or the recursion's branches and depth. Price each trip and multiply nested costs. " +
        "Add costs that happen one after another, like a sort before a loop. Drop constants and lower order terms. State " +
        "space separately, and include the call stack, because that is the cost most often forgotten. Finally, if best, " +
        "average and worst case differ (hash maps, quicksort, early exits), say which one you gave.\n\n" +
        "Good answers are short and concrete: \"Let n be the number of words and L the longest word. We sort each word, " +
        "O(L log L), once per word, so O(n · L log L). Space is O(n · L) for the groups.\" Weak answers skip the variables " +
        "(\"it's linear\"), pattern-match on shape (\"two loops, so n squared\"), or forget space entirely.\n\n" +
        "Below, each example shows the code and a weak answer. Tick the template steps it skipped, check yourself, then read " +
        "the strong version. When it feels automatic, take it to the Complexity Gym's Explain it mode, where you write the " +
        "explanation for new code yourself.";
}

namespace DsaAcademy.Content.Tools;

public class ComplexityGymTool : ITool
{
    public string Id => "complexity-gym";
    public string Section => "Data Structures & Algorithms";
    public string Track => "complexity";

    // Last in the complexity track: the lessons before it teach each idea, this is the
    // place to get fast at all of them mixed together.
    public int Order => 8;

    public string Title => "Complexity Gym: Time & Space Practice";
    public string OneLiner => "A bank of 144 C# and Python snippets. For each one, name the time AND the space, then read why, or write your own explanation and grade it.";
    public string KeyTakeaway =>
        "In an interview the number is half the answer. The other half is the reason: what n is, how many times the work " +
        "repeats, what each repetition costs, and where the memory goes. Practise both until the reasoning comes out in " +
        "the same order every time.";

    public ToolKind ToolKind => ToolKind.ComplexityGym;

    public string Explanation =>
        "Every snippet asks two questions, time and space, because interviewers ask both and the space answer is the one " +
        "people forget. The bank covers fifteen categories: single loops, nested and dependent loops, halving and doubling, " +
        "recursion, divide and conquer, amortized analysis, multiple variables, hidden library costs, data structure " +
        "operations, graphs, DP tables, backtracking, sorting and heaps, strings, and space itself. The bank spans easy, " +
        "medium and hard, and every category has snippets in both C# and Python.\n\n" +
        "Practice mode is the fast loop: filter by category, difficulty and language, answer both questions, and read the " +
        "model explanation in the same three steps as How to Analyze Time & Space Complexity (how many trips, cost per " +
        "trip, put together) plus a line on space. At the end you can retry only the snippets you missed.\n\n" +
        "Explain it mode is the interview loop: write your explanation in your own words before you see anything, pick " +
        "your answers, then compare with the model and tick the rubric items your explanation actually covered. Saying it " +
        "out loud while you type is even better practice.\n\n" +
        "The Stats tab keeps per-category accuracy in this browser and names your weakest categories, so you know where " +
        "the next fifteen minutes should go.";
}

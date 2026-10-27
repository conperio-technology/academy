using DsaAcademy.Content.Concepts;

namespace DsaAcademy.Content.Tools;

public class BlockRepsTool : ITool
{
    public string Id => "building-block-reps";
    public string Section => "Data Structures & Algorithms";
    public string Track => BuildingBlock.TrackName;
    public int Order => 98; // first in its track; the blocks themselves are at 99
    public string Title => "Today's Reps: Building Blocks Until They're Boring";
    public string OneLiner => "Write the same small templates from a blank editor, on a stopwatch, until they come out without thinking.";
    public string KeyTakeaway =>
        "Most medium problems are two building blocks glued together. Fluency with the blocks is what frees your attention for " +
        "the glue, and it comes from writing them by hand, again and again, not from reading them.";

    public ToolKind ToolKind => ToolKind.BlockReps;

    public string Explanation =>
        "A building block is a short template you will write in nearly every interview: counting with a hashmap, a stack, " +
        "BFS with a visited set, binary search on the answer, a sliding window, a heap of tuples, union-find, a DP table. " +
        "Each one has a lesson of its own in this track, with a wrapper so thin that a rep takes a few minutes.\n\n" +
        "Tier 1 is the simple constructs every solution is made of. Tier 2 is the algorithm blocks, and each one is offered " +
        "once you are fluent in the blocks it builds on (you can always open its lesson, or rep it from the table).\n\n" +
        "A session picks three or five blocks: the ones you are least fluent in first, simple constructs before algorithms. " +
        "Each rep opens a blank editor with only the signature, a stopwatch and the block's target time. A rep is clean when " +
        "it passes on the first run within the target, without opening the reference. Clean reps on three different days " +
        "make a block fluent; repeats on the same day are welcome but count once.\n\n" +
        "After each rep you see the block's plan, four or five plain-English steps, to compare with how you went about it, " +
        "and the bug it is most often written with. When a block is fluent, the table lists the existing lessons that glue " +
        "it to another idea.\n\n" +
        "Two habits ride along. Tick \"Plan first\" above the editor to write four or five plain-English steps before " +
        "it opens; they go into the starter as comments to fill in under, and after the pass they sit next to the block's " +
        "own plan (planning time counts toward the rep, as it would in an interview). And when a rep fails before it " +
        "passes, it asks what the bug was, for your Bug Log.\n\n" +
        "Reps are kept in this browser and included in the progress export on the dashboard.";
}

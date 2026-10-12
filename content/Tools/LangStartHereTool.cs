namespace DsaAcademy.Content.Tools;

// "Programming in C# & Python" section. Stage 1 is the "basics" track plus the
// "cheat sheets" track; later stages add "intermediate" and "advanced" tracks, which
// slot in between by Order (basics 0 to 999, intermediate 1000s, advanced 2000s, cheat
// sheets 5000s). The interactive content lives in client/src/langTrack/.
public class LangStartHereTool : ITool
{
    public string Id => "lang-start-here";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 0;
    public string Title => "Start Here: C# and Python Side by Side";
    public string OneLiner => "What each language is for, how your code actually runs, static versus dynamic typing, braces versus indentation, and how to use this section.";
    public string KeyTakeaway =>
        "C# is compiled before it runs (to IL, then to machine code by the JIT), checks types before anything runs, and marks " +
        "blocks with braces. Python is turned into bytecode and interpreted as it runs, checks types only when each line runs, " +
        "and marks blocks with indentation. The ideas underneath (variables, decisions, loops, functions, collections) are the " +
        "same, so learning both side by side means learning each idea once.";

    public ToolKind ToolKind => ToolKind.LangStartHere;

    public string Explanation =>
        "This section teaches programming from the ground up in two languages at once: C# (said \"C sharp\") and Python. A " +
        "programming language is a precise way to write instructions for a computer. You write the instructions as text, " +
        "called source code, and another program turns that text into something the computer can carry out. It suits " +
        "anyone from \"I've edited a PLC program but never written real code\" to \"I code daily and want to sharpen up for " +
        "interviews\": skim what you know and use the predict-the-output questions to find the gaps.\n\n" +
        "How C# runs: a compiler, a program that translates a whole program before it runs, checks your code for mistakes " +
        "and translates it into IL (intermediate language), a compact instruction list that isn't tied to any particular " +
        "processor. When the program starts, the .NET runtime (the software that supports a running C# program) uses its " +
        "JIT, or just-in-time compiler, to translate each method into the processor's own machine code the first time that " +
        "method is called. A method is C#'s name for a function: a named piece of code you can call.\n\n" +
        "How Python runs: there's no separate build step. When you run a file, the standard Python (called CPython) " +
        "translates it into bytecode, a similar compact instruction list, and an interpreter, a program that reads " +
        "instructions one at a time and carries each one out, runs that bytecode. The practical result: C# reports many " +
        "mistakes before the program runs and is fast on heavy loops; Python starts instantly and is quick to write, but is " +
        "often 10 to 100 times slower on tight number-crunching loops. Compiled vs Interpreted in Computer Fundamentals " +
        "goes deeper.\n\n" +
        "Types: a type is the kind of value something is, such as a whole number, text, or true or false. C# is statically " +
        "typed: every variable's type is fixed in the source and the compiler checks every line before the program runs. " +
        "Python is dynamically typed: a variable is just a name that can point at any value, and a type mistake shows up " +
        "only when that line runs.\n\n" +
        "Blocks: C# groups lines that belong together (the body of a loop, say) with curly braces and ends each statement " +
        "with a semicolon. Python uses indentation, the spaces at the start of a line: a line ending in a colon starts a " +
        "block, and the block is everything indented under it. Below, the same programs in both languages, the words used " +
        "in this section defined in plain English, and how the lessons and graded exercises here work.";
}

namespace DsaAcademy.Content.Tools;

public class AlgorithmIntroTool : ITool
{
    public string Id => "algorithm-intro";
    public string Section => "Data Structures & Algorithms";
    public string Track => "intro";

    // Ahead of even Big O Notation (Order = 0) -- this is the thing Big O, and every
    // other lesson in this section, silently assumes you already know.
    public int Order => -10;

    public string Title => "What Is an Algorithm?";
    public string OneLiner => "A finite, unambiguous sequence of steps that turns an input into an output -- independent of any programming language.";
    public string KeyTakeaway =>
        "An algorithm is the PLAN; code is just one way to write that plan down in a language a " +
        "computer happens to run. The same algorithm can become correct C#, correct Python, or plain " +
        "numbered English steps on a napkin -- which is exactly why every lesson in this app shows the " +
        "same problem solved in more than one language: the steps are the same, only the notation changes.";

    public ToolKind ToolKind => ToolKind.AlgorithmIntro;

    public string Explanation =>
        "An algorithm is a finite, unambiguous sequence of steps that takes an input and produces an " +
        "output. Every real algorithm has the same handful of properties, and it's worth naming them " +
        "once instead of leaving them implicit: it takes zero or more INPUTS and produces at least one " +
        "OUTPUT; every step is DEFINITE -- precise enough that there's no ambiguity about what to do " +
        "next (\"add the numbers\" is definite; \"handle it appropriately\" is not); the whole thing is " +
        "FINITE -- it has to actually stop after a limited number of steps, not run forever (this is " +
        "the exact thing a missing base case violates in Recursion: Factorial); and each individual " +
        "step is EFFECTIVE -- basic enough to actually be carried out, not another vague algorithm in " +
        "disguise. Notice none of that mentions a programming language. \"Find the largest of three " +
        "numbers\" is a complete algorithm as a numbered list on paper, before a single line of C# or " +
        "Python gets written -- that language-independent description is called PSEUDOCODE, and it's " +
        "usually the fastest way to plan an algorithm before fighting a specific language's syntax. " +
        "Try it below: edit the three numbers and step through the plain-English algorithm, then look " +
        "at the same exact logic written as real code underneath -- same steps, same order, same " +
        "decisions, just a different notation for writing them down.";
}

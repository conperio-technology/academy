namespace DsaAcademy.Content.Tools;

public class LangFunctionalTool : ITool
{
    public string Id => "lang-functional";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2700;
    public string Title => "Functional Style: Immutability, Pure Functions and Pipelines";
    public string OneLiner => "Pure functions and immutable data (records with with, frozen dataclasses, immutable collections), LINQ pipelines versus generator chains, folds, the itertools toolbox and its LINQ equivalents, partial application and composition.";
    public string KeyTakeaway =>
        "Build most of a program from pure functions over data that doesn't change, and push input, output and state to the edges: such code is easy to test, cache and run in parallel. LINQ and itertools are lazy pipeline toolkits; remember itertools.groupby only groups adjacent items.";

    public ToolKind ToolKind => ToolKind.LangFunctional;

    public string Explanation =>
        "Functional style is a way of writing ordinary C# and Python, not a separate language: functions that return results instead of changing things, data that's copied with changes instead of mutated, and processing written as a pipeline of small steps.\n\n" +
        "The lesson shows pure functions and immutable values in both languages, a parse-filter-group-summarise pipeline in LINQ and in generators, the itertools functions interviewers expect you to know and their LINQ counterparts, and partial application and composition with functools and lambdas.";
}

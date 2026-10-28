namespace DsaAcademy.Content.Tools;

public class DebuggingSystematicallyTool : ITool
{
    public string Id => "debugging-systematically";
    public string Section => "Professional Dev Skills";
    public string Track => "debugging";
    public int Order => 100;
    public string Title => "Debugging Systematically: Reproduce, Narrow Down, Fix the Cause";
    public string OneLiner => "A repeatable debugging loop, reading stack traces, debugger tools, logging, git bisect to find the breaking commit, rubber-duck debugging, and bugs with a recognisable shape.";
    public string KeyTakeaway => "Reproduce the failure, read the evidence, narrow the search by halving it, form a hypothesis and test it, then fix the cause rather than the symptom and add a test. Read stack traces from the error outwards, use conditional breakpoints and git bisect to search fast, and explain the problem out loud when stuck.";

    public ToolKind ToolKind => ToolKind.DebuggingSystematically;

    public string Explanation =>
        "Changing things until the symptom goes away is slow and often hides the bug. This lesson walks through a systematic loop instead, and the tools for each step: reading a stack trace, breakpoints and watches, logging, and binary search through history with git bisect." +
        "\n\n" +
        "The traces, the bisect run and the sample bug were all run to get the output shown. It ends with a table of bugs that have a recognisable shape, from 'works on my machine' to failures that only happen twice a year.";
}

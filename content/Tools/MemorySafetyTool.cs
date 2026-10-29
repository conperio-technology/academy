namespace DsaAcademy.Content.Tools;

public class MemorySafetyTool : ITool
{
    public string Id => "memory-safety";
    public string Section => "Concurrency & Memory";
    public string Track => "memory";
    public int Order => 90;
    public string Title => "Memory Safety: Buffer Overflows, Use-After-Free and Safe Languages";
    public string OneLiner => "The classes of memory-safety bug (buffer overflow, use-after-free, out-of-bounds read), why C and C++ allow them, the defenses that make them rarer and harder to exploit, and why new systems code is moving to memory-safe languages.";
    public string KeyTakeaway => "Memory-safety bugs are accesses to memory the program was never entitled to, caused by a missing bounds or lifetime check; they are the leading source of critical vulnerabilities in C and C++. Use bounds-aware APIs, compiler warnings, static analysis, sanitizers and fuzzing when you must use C or C++, and prefer a memory-safe language (Java, C#, Go, Python, or Rust for systems code) for new work, since it removes whole classes of these bugs by construction.";

    public ToolKind ToolKind => ToolKind.MemorySafety;

    public string Explanation =>
        "A large share of the most serious security vulnerabilities come from one root cause: a program reading or writing memory it was never meant to touch. This lesson explains the common classes of memory-safety bug and, crucially, how to avoid them." +
        "\n\n" +
        "It covers why C and C++ permit these bugs, the layered defenses (bounds-aware types, static analysis, stack canaries, NX, ASLR, sanitizers and fuzzing), and why so much new systems software is written in memory-safe languages like Rust. The aim is to recognise the dangerous patterns and pick tools that rule them out, not to exploit anything.";
}

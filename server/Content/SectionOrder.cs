namespace DsaAcademy.Content;

// Controls which Section renders first in the sidebar -- separate from IConcept/ITool's
// per-item Order, which only controls position WITHIN a section. Unlisted sections sort
// last (stable), so adding a new section without registering it here just puts it at
// the end rather than erroring.
public static class SectionOrder
{
    private static readonly Dictionary<string, int> Order = new()
    {
        ["Start Here"] = 0,
        ["Computer Fundamentals"] = 1,
        ["Programming in C# & Python"] = 2,
        ["Interview Prep"] = 3,
        ["Concurrency & Memory"] = 4,
        ["Data Structures & Algorithms"] = 5,
        ["Software Design & OOP"] = 6,
        ["Professional Dev Skills"] = 7,
        ["Linux & the Command Line"] = 8,
        ["Windows & PowerShell"] = 9,
        ["Networking"] = 10,
        ["System Design"] = 11,
        ["Cloud & DevOps"] = 12,
        ["AI & Machine Learning"] = 13,
        ["Behavioral Interviews"] = 14,
        ["Glossary"] = 15,
        ["Security"] = 16,
        ["Industrial & Embedded Systems"] = 17,
    };

    public static int For(string section) => Order.GetValueOrDefault(section, int.MaxValue);
}

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
        ["Databases"] = 7,
        ["Professional Dev Skills"] = 8,
        ["Linux & the Command Line"] = 9,
        ["Windows & PowerShell"] = 10,
        ["Networking"] = 11,
        ["System Design"] = 12,
        ["Cloud & DevOps"] = 13,
        ["AI & Machine Learning"] = 14,
        ["Behavioral Interviews"] = 15,
        ["Glossary"] = 16,
        ["Security"] = 17,
        ["Industrial & Embedded Systems"] = 18,
    };

    public static int For(string section) => Order.GetValueOrDefault(section, int.MaxValue);
}

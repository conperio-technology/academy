namespace DsaAcademy.Content.Tools;

public class DbSubqueriesCtesTool : ITool
{
    public string Id => "db-subqueries-ctes";
    public string Section => "Databases";
    public string Track => "sql";
    public int Order => 130;
    public string Title => "SQL Subqueries and CTEs, Including Recursive CTEs";
    public string OneLiner => "Answer questions in steps: scalar, IN and EXISTS subqueries, correlated subqueries, named CTE steps, and recursive CTEs for hierarchies.";
    public string KeyTakeaway => "Use a subquery or CTE when the question has steps; name the steps with WITH so each can be run on its own. Prefer NOT EXISTS to NOT IN, which returns nothing if the list holds a NULL. WITH RECURSIVE walks trees and graphs stored as rows.";

    public ToolKind ToolKind => ToolKind.DbSubqueriesCtes;

    public string Explanation =>
        "Real questions often have steps: work out an average, then compare against it; find each department's best, then list who matches. Subqueries put one query inside another, and common table expressions (CTEs) give each step a name so a long query reads top to bottom." +
        "\n\n" +
        "Recursive CTEs go further and let a query refer to its own output, which is how SQL walks an org chart, nested folders or any hierarchy of unknown depth. Every example here runs live; edit and rerun them.";
}

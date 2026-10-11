namespace DsaAcademy.Content.Tools;

public class ItStudyPathTool : ITool
{
    public string Id => "it-cs-study-path";
    public string Section => "Start Here";
    public string Track => "your path";
    public int Order => 0;
    public string Title => "Study Path: Well-rounded IT & CS";
    public string OneLiner =>
        "A week-by-week route through the whole academy for broad, practical computing knowledge: hardware, " +
        "programming, operating systems, networks, security, Linux, databases, Git, systems and AI.";
    public string KeyTakeaway =>
        "Breadth first, in the order things build on each other: how computers work, then programming, then " +
        "the operating system your code runs on, then the networks it talks over and how to secure them, then" +
        " data, tools and larger systems. A little every week beats a lot once, and the quizzes inside each " +
        "lesson are the real test of whether it stuck.";

    public ToolKind ToolKind => ToolKind.ItStudyPath;

    public string Explanation =>
        "Conperio Academy covers a lot, and it's hard to know where to start if you aren't preparing for a " +
        "particular interview. This path is for anyone in IT, automation or software who wants a solid " +
        "all-round foundation: the kind of knowledge that makes a networking problem, a security review, a " +
        "database question or a conversation about AI easy to follow.\n\nIt runs in five phases. How computers " +
        "work covers the math, data types, hardware, logic gates and number systems. Programming teaches C# " +
        "and Python side by side with graded exercises, plus a first look at algorithms and Big O. Operating " +
        "systems covers scheduling, system calls, processes, threads and memory, then real Linux in the " +
        "browser (and Windows and PowerShell as those lessons arrive). Networks and security runs from how " +
        "the internet fits together through subnetting, VLANs, routing, firewalls, VPNs and troubleshooting, " +
        "then passwords, phishing, web attacks, threat modeling, incident response and plant network " +
        "security. Data, tools and systems finishes with SQL, Git and testing, cloud and containers, system " +
        "design basics and AI.\n\nPick how many weeks you want to spread it over; the material is the same " +
        "either way. Graded exercises tick themselves when you pass them, and explainer lessons count once " +
        "you mark them worked through. The progress tab shows coverage by topic and suggests what to do next." +
        " The same tool also holds the FAANG interview plan; switch between them at the top. Your plan is " +
        "saved in this browser.";
}

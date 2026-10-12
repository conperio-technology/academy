namespace DsaAcademy.Content.Tools;

public class ServicesDependencyInjectionTool : ITool
{
    public string Id => "services-dependency-injection";
    public string Section => "Software Design & OOP";
    public string Track => "oop";
    public string Title => "Services & Dependency Injection: Handed Dependencies, Not Constructed Ones";
    public string OneLiner => "A class that builds its own dependencies is stuck with them forever; a class that receives its dependencies through its constructor (the special method that runs when an object is created with new) can be handed a completely different one without changing a single line.";
    public string KeyTakeaway =>
        "Dependency injection isn't really about a fancy DI container or framework -- it's the simple " +
        "idea that a class should RECEIVE the things it depends on (usually through its constructor) " +
        "instead of constructing them itself, which is what makes swapping a real implementation for a " +
        "fake/test one possible without touching the class's own code at all.";

    public ToolKind ToolKind => ToolKind.ServicesDependencyInjection;

    public string Explanation =>
        "A \"service\" in modern app architecture is usually a small, focused class that does ONE job " +
        "(send an email, read from a database, call an external API, the set of operations another system lets your code call) and holds little or no state of " +
        "its own between calls. The naive way to USE a service inside another class is to construct it " +
        "directly, right where it's needed -- `var emailer = new SmtpEmailService(); " +
        "emailer.Send(...)`. That works, but it permanently welds this class to SmtpEmailService " +
        "specifically: there's no way to test this class without ALSO sending a real email, and no way " +
        "to swap in a different email provider without editing this class's source code.\n\n" +
        "DEPENDENCY INJECTION flips that: instead of constructing its own dependency, a class RECEIVES " +
        "it -- usually through its constructor -- as anything satisfying an interface (see Interfaces & " +
        "Abstraction). The class doing the receiving never constructs an SmtpEmailService or a " +
        "FakeEmailService directly; it just calls `.Send()` (or `.Notify()`) on whatever it was handed. " +
        "That single change is what makes it possible to hand a real service in production and a fake, " +
        "no-op service in a test, with the exact same class code running unmodified either way.\n\n" +
        "ASP.NET Core apps do exactly this in Program.cs: " +
        "`builder.Services.AddDbContext<AppDbContext>(...)` registers the database context as a " +
        "service, and every endpoint that needs it just asks for an AppDbContext parameter. ASP.NET " +
        "Core's built-in DI container constructs it and hands it over, and the endpoint code never " +
        "calls `new AppDbContext()` itself.\n\n" +
        "Try it below -- the SAME \"complete order\" call runs against either a real or a fake " +
        "notification service, and the calling code doesn't change either way, only which service it " +
        "was handed.";
}

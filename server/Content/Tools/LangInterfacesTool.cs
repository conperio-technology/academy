namespace DsaAcademy.Content.Tools;

public class LangInterfacesTool : ITool
{
    public string Id => "lang-interfaces";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1200;
    public string Title => "Interfaces, Protocols and Abstract Classes";
    public string OneLiner => "Inheritance and overriding in one minute, C# interfaces versus Python duck typing and Protocol, abstract classes and ABC, type checks with is and isinstance, and when to use which.";
    public string KeyTakeaway =>
        "An interface is a promise of methods with no code; an abstract class shares code but leaves required gaps. C# " +
        "checks both at compile time and a class must declare them. Python uses duck typing: any object with the right " +
        "methods works, Protocol documents that for type checkers, and ABC refuses to create objects with unwritten abstract methods.";

    public ToolKind ToolKind => ToolKind.LangInterfaces;

    public string Explanation =>
        "Code is easier to change when it depends on what an object can do rather than exactly which class it is. A " +
        "function that sends alarms shouldn't care whether the alarm goes to the screen, an email or a test's list; it " +
        "only needs something it can call Raise on.\n\n" +
        "The lesson starts with inheritance, a subclass reusing and overriding a base class's members, because it's the " +
        "simplest way to get polymorphism: one call that does the right thing for each kind of object.\n\n" +
        "An interface goes further: it lists the methods a class promises to provide, with no code at all, and any class " +
        "can sign up. C# makes the promise explicit (class EmailSink : IAlarmSink) and checks it when compiling. Python " +
        "relies on duck typing: if an object has the method, it works, and if not, the call fails when it runs. Python's " +
        "Protocol writes the expectation down for type checkers without changing that.\n\n" +
        "An abstract class sits in between: real shared code and data, plus abstract members that every subclass must " +
        "fill in, and no objects of the abstract class itself. Python builds these with ABC and @abstractmethod. The " +
        "lesson ends with a table of which to reach for. The Software Design & OOP section takes these ideas further.";
}

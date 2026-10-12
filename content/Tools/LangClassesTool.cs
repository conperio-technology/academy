namespace DsaAcademy.Content.Tools;

public class LangClassesTool : ITool
{
    public string Id => "lang-classes";
    public string Section => "Programming in C# & Python";
    public string Track => "basics";
    public int Order => 80;
    public string Title => "Classes and Objects";
    public string OneLiner => "Defining a class, constructors versus __init__, methods, this versus self, C# properties versus Python attributes and @property, records and dataclasses, printing and comparing objects, and shared class data.";
    public string KeyTakeaway =>
        "A class bundles data with the methods that work on it; each object built from it has its own copy of the data. " +
        "Python makes the object explicit as self in every method; C# has an implicit this. Variables hold references to " +
        "objects, so assigning one to another shares the object, and == on an ordinary class compares identity unless you " +
        "use a C# record or a Python dataclass.";

    public ToolKind ToolKind => ToolKind.LangClasses;

    public string Explanation =>
        "So far, data and the code that works on it have lived apart: a list of readings here, a function to average them " +
        "there. A class puts them together. It's a blueprint describing what data each thing has (a motor's name, rated " +
        "speed and whether it's running) and what it can do (start, stop, describe itself). Each object, or instance, built " +
        "from the class has its own copy of the data. This style of programming is called object-oriented programming, OOP.\n\n" +
        "A constructor is the special method that sets up a new object: a method named after the class in C#, called with " +
        "new, and the method __init__ in Python. Methods are functions that belong to the class and work on one object, " +
        "which they refer to as this in C# (usually implicit) and self in Python (always written out).\n\n" +
        "C# declares an object's data up front as typed properties, which can control who may read or change each value " +
        "and can run checks when a value is set. Python objects get attributes simply by assigning to self.something, and " +
        "use @property when a value needs checking or computing.\n\n" +
        "Objects live on the heap and variables hold references to them, so two variables can refer to the same object, " +
        "and comparing two objects with == asks whether they are the same object unless the class says otherwise. C# " +
        "records and Python dataclasses are short ways to write classes that are mainly data and compare by value. " +
        "Inheritance and interfaces come later; OOP Basics in Software Design & OOP covers them in depth.";
}

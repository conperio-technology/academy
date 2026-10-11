namespace DsaAcademy.Content.Tools;

public class InterfacesAbstractionTool : ITool
{
    public string Id => "interfaces-abstraction";
    public string Section => "Software Design & OOP";
    public string Track => "oop";
    public string Title => "Interfaces & Abstraction: Program to a Contract, Not an Implementation";
    public string OneLiner => "Calling code that only knows about an interface never needs to change when a new implementation shows up -- this app is a live example of exactly that.";
    public string KeyTakeaway =>
        "\"Program to an interface, not an implementation\" means the code that USES an object should " +
        "only depend on WHAT it can do (its interface), never on HOW it does it or WHICH concrete class " +
        "it happens to be -- which is the actual mechanism behind this app's own IConcept/ITool design " +
        "letting every lesson be added as one new file, touching nothing else.";

    public ToolKind ToolKind => ToolKind.InterfacesAbstraction;

    public string Explanation =>
        "An INTERFACE is a contract: a list of methods (and their signatures: each method's name, parameters and return type) that a class promises to " +
        "implement, with zero information about HOW. Code that depends only on the interface -- \"give " +
        "me something that satisfies IAnimal\" -- never needs to know or care whether it's actually " +
        "holding a Dog, a Cat, or a Duck, only that whatever it's holding has a MakeSound() method. " +
        "That's ABSTRACTION: hiding the concrete details behind a shared, simpler surface.\n\n" +
        "The value shows up the moment a NEW implementation appears. Code written against the interface " +
        "keeps working, unmodified, for every class that satisfies it -- past, present, and future. Try " +
        "it below: the SAME calling function (shown underneath) runs unchanged no matter which animal " +
        "you pick, because it was written against IAnimal, not against Dog specifically.\n\n" +
        "This app is its own real example, not just a toy one: every practice lesson implements " +
        "IConcept, every reference lesson implements ITool (see server/Content/IConcept.cs and " +
        "ITool.cs), and the API, the executor, and the sidebar are all written against those interfaces. " +
        "None of them contain a single line of code that knows about BstInsert or PlcScanCycle by " +
        "name. That's exactly why this app could keep growing one brand-new lesson at a time as " +
        "\"one new file, nothing else touched\": the same property adding a Triangle demonstrated in " +
        "OOP Basics, at the scale of an entire application instead of one function.";
}

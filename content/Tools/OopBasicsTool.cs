namespace DsaAcademy.Content.Tools;

public class OopBasicsTool : ITool
{
    public string Id => "oop-basics";
    public string Section => "Software Design & OOP";
    public string Track => "oop";
    public string Title => "OOP Basics: Classes, Objects, and Polymorphism";
    public string OneLiner => "The same \"compute a shape's area\" problem, solved two ways -- one where adding a new shape means editing existing code, and one where it doesn't.";
    public string KeyTakeaway =>
        "Polymorphism means calling code can work with ANY shape that satisfies the interface (the named set of methods every shape promises to provide) without " +
        "knowing which concrete type it actually is -- a procedural if/switch (plain functions that branch on the " +
        "kind of shape) has to be told about every case up front; an OOP design lets you add a whole new case by writing a brand new class " +
        "and touching nothing that already exists and already works.";

    public ToolKind ToolKind => ToolKind.OopBasics;

    public string Explanation =>
        "Object-oriented programming organizes code around OBJECTS -- bundles of data (state) and the " +
        "behavior that operates on that state (methods) -- rather than a big pile of standalone " +
        "functions each juggling whatever data gets passed to them. A CLASS is the blueprint (Circle, " +
        "Rectangle); an OBJECT (or instance) is one actual thing built from that blueprint, with its " +
        "own state (this circle's radius, that circle's radius). ENCAPSULATION means an object " +
        "controls its own state -- other code asks it to DO something (`circle.Area()`) instead of " +
        "reaching in and recomputing that math itself from raw fields.\n\n" +
        "INHERITANCE lets one class build on another (a SavingsAccount could inherit from BankAccount, " +
        "keeping its deposit and withdraw and adding interest on top) -- useful, but easy to overuse, " +
        "and \"is-a\" in everyday speech isn't enough: a square IS a rectangle in geometry, yet a Square " +
        "class inheriting a Rectangle with settable Width and Height breaks code that sets them " +
        "separately (the Liskov Substitution trap in SOLID). COMPOSITION (an object " +
        "HOLDING a reference to another object instead of inheriting from it) is often the better tool, " +
        "since it doesn't force a rigid \"is-a\" relationship where a \"has-a\" one actually fits " +
        "better. POLYMORPHISM is the payoff: many different classes can all implement the same method " +
        "name (`Area()`) with completely different logic, and calling code that only knows \"this is a " +
        "Shape\" can call `.Area()` on any of them without an if/switch checking which concrete type " +
        "it's actually holding.\n\n" +
        "Compare the two versions below directly -- the procedural version has to know about every " +
        "shape by name inside one function, so adding a new shape means editing code every existing " +
        "shape already depends on. The OOP version's calling code never changes at all; adding a shape " +
        "means writing one new, completely separate class. That property -- extending behavior without " +
        "modifying existing, working code -- is worth its own name (the Open/Closed Principle), and " +
        "it's the same reason this app itself can add a new lesson as \"one new file,\" covered " +
        "properly in Interfaces & Abstraction.";
}

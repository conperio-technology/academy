namespace DsaAcademy.Content.Tools;

public class ParkingLotInterviewTool : ITool
{
    public string Id => "ood-interview-parking-lot";
    public string Section => "Software Design & OOP";
    public string Track => "object-oriented design";
    public int Order => 120;
    public string Title => "Design a Parking Lot (OOD)";
    public string OneLiner => "The classic \"design the classes\" round, stage by stage: use cases, classes, a class diagram, C# for the key methods, and the follow-ups.";
    public string KeyTakeaway =>
        "An OOD round is graded on clean responsibilities and on how well the design takes a new requirement, " +
        "not on how many patterns you name. For the parking lot: a spot that enforces its own rules, assignment " +
        "and pricing as swappable policies, one lock around \"find and take a spot\", a ticket status " +
        "(Active, PaymentPending, Closed) so only one exit can charge a ticket while the card call runs outside " +
        "the lock, and no Singleton.";

    public ToolKind ToolKind => ToolKind.DesignParkingLot;

    public string Explanation =>
        "This is a practice run of an object-oriented design interview, also called low-level design or a " +
        "\"design the classes for X\" round. Amazon, Microsoft, Uber and many others use it, often in place of " +
        "or next to a system design round. The widget plays the interviewer: it gives you the prompt and walks " +
        "through seven stages. In each one, write your own answer first, then press \"Compare with the model " +
        "answer\" and tick the points you really covered. Notes stay in this browser.\n\n" +
        "How it differs from system design. A system design round is about many machines: load balancers, " +
        "databases, caches, queues, and the numbers that size them. An OOD round is about one program: which " +
        "classes exist, what each is responsible for, how they relate, and what the important methods look like " +
        "in code. Nobody asks for requests per second. Instead you're expected to write real signatures and the " +
        "body of the one or two methods that hold the hard logic, in the language you'd use on the job (C# here).\n\n" +
        "The usual flow, about 45 minutes: 5 on requirements and use cases (actors, what's in and out), 5 on the " +
        "core objects (nouns to classes, one responsibility each), 6 on relationships (a class diagram with " +
        "inheritance, composition and multiplicity), 10 on key interfaces and methods (C#), 7 on patterns and " +
        "trade-offs, 6 walking one use case through your methods, and 6 on extensions, where the interviewer " +
        "adds a requirement and watches how much of your design has to change.\n\n" +
        "What's graded, roughly in order. Clarifying scope: asking before designing, and saying what you're " +
        "leaving out. Clean responsibilities: each class does one job you can say in a sentence, with no god " +
        "class called Manager doing everything. Sensible use of interfaces and composition: an interface where " +
        "a policy might change (how spots are assigned, how fees are priced), composition over deep inheritance, " +
        "and inheritance only where there's a real is-a with different behaviour. SOLID without dogma: the " +
        "principles should show up in the design, not as a lecture, and \"I didn't add an interface here because " +
        "nothing varies\" is a good answer. Extensibility: when the interviewer says \"now add electric vehicle " +
        "charging\", a good design takes a new class and a small edit. And code: correct, idiomatic signatures " +
        "and the bodies of the key methods, including concurrency where two callers can race.\n\n" +
        "The parking lot is the most common OOD question because it looks easy. The depth is in a few places: " +
        "whether vehicle and spot types need classes or just enums (a type with a fixed list of named values), where the \"does this vehicle fit\" rule " +
        "lives, keeping assignment and pricing out of the gate code, making sure two entry gates can't hand out " +
        "the same spot, not holding a lock while a card terminal is thinking, and making sure two exits can't " +
        "both charge the same ticket once that lock has been let go.";
}

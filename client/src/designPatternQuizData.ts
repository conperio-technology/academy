// Questions for "Which Pattern Is This?", the design pattern recognition quiz. Same
// shape as patternDrillData.ts: each question names its answer, the signals that give
// it away, and the sibling pattern it is most often confused with (`trap`, always shown
// as one of the options). `code` is optional and must follow the same rules as the code
// fields in designPatternsData.ts (no backticks, no dollar sign before a brace, no
// backslashes).

import type { PatternName } from "./designPatternsData";

export interface PatternQuestion {
  id: string;
  title: string;
  scenario: string;
  code?: string;
  answer: PatternName;
  trap: PatternName;
  signals: string[];
  why: string;
}

export const PATTERN_QUESTIONS: PatternQuestion[] = [
  {
    id: "stream-wrappers",
    title: "Stacked stream wrappers",
    scenario:
      "You wrap a FileStream in a BufferedStream and that in a GZipStream. Each one is still a Stream, and each adds one capability (buffering, compression) before passing bytes to the stream inside it.",
    code: `using var file = File.Create("log.gz");
using var buffered = new BufferedStream(file);
using var zip = new GZipStream(buffered, CompressionLevel.Optimal);
zip.Write(bytes);`,
    answer: "Decorator",
    trap: "Proxy",
    signals: ["every layer has the same interface (Stream)", "each layer adds one behavior", "layers are stacked in any combination"],
    why: "Same interface, added behavior, freely stacked: Decorator. A proxy would guard access to one real stream, not add features layer by layer.",
  },
  {
    id: "retrying-sender",
    title: "Retrying email sender",
    scenario:
      "RetryingEmailSender implements IEmailSender, receives another IEmailSender in its constructor, and calls it again up to three times when it times out. It always ends up calling the inner sender.",
    answer: "Decorator",
    trap: "Chain of Responsibility",
    signals: ["implements the same interface it wraps", "forwards every call to the inner object", "adds a cross cutting behavior (retry)"],
    why: "It wraps one object, keeps its contract and only adds behavior around the call, which is Decorator. A chain passes the request along a series of candidate handlers, any of which may handle it and stop.",
  },
  {
    id: "sms-vendor",
    title: "Wrapping a vendor SMS SDK",
    scenario:
      "Your code depends on ISmsSender.Send(phone, text). The vendor SDK you must use only offers client.Messages.Create(new CreateMessageOptions { To = ..., Body = ... }). You write a class that implements ISmsSender and calls the SDK inside.",
    answer: "Adapter",
    trap: "Facade",
    signals: ["implements an interface that already exists in your code", "translates calls to a different, fixed interface", "wraps one object"],
    why: "It converts one incompatible interface into the one your code expects: Adapter. A facade would simplify a whole subsystem behind a brand new interface.",
  },
  {
    id: "stream-reader",
    title: "StreamReader over a Stream",
    scenario:
      "A network Stream only reads bytes. You wrap it in a StreamReader, which lets you call ReadLine() and work with text, because StreamReader is a TextReader.",
    code: `using var reader = new StreamReader(networkStream, Encoding.UTF8);
string? line = reader.ReadLine();`,
    answer: "Adapter",
    trap: "Decorator",
    signals: ["the wrapper's interface (TextReader) differs from the wrapped one (Stream)", "the point is to make bytes usable as text"],
    why: "BufferedStream is a Decorator because it is still a Stream. StreamReader is not a Stream; it changes the interface, which makes it an Adapter.",
  },
  {
    id: "lazy-thumbnails",
    title: "Lazy high resolution images",
    scenario:
      "A gallery shows 500 thumbnails. Each Image object has the same interface as the real high resolution image, but it does not load the 20 MB file from disk until Draw() is first called.",
    answer: "Proxy",
    trap: "Decorator",
    signals: ["same interface as the real object", "delays creating or loading the real object", "controls access instead of adding features"],
    why: "A stand in that postpones the expensive real object until it is needed is a virtual Proxy. A decorator would be handed an already loaded image and add behavior.",
  },
  {
    id: "generated-client",
    title: "Generated RPC client",
    scenario:
      "A generated client class implements the same IOrderService interface as the server. Calling client.GetOrder(42) serializes the argument, sends an HTTP/2 request to another machine and deserializes the reply.",
    answer: "Proxy",
    trap: "Adapter",
    signals: ["same interface as the real service", "the real object lives in another process", "a network call made to look like a local call"],
    why: "It keeps the real object's interface and controls how calls reach it, across a network: a remote Proxy. An adapter would change the interface rather than mirror it.",
  },
  {
    id: "checkout-facade",
    title: "One call to place an order",
    scenario:
      "Placing an order needs inventory reservation, a payment charge, a shipping quote and a confirmation email, each a separate service with its own API. Controllers now call a single OrderPlacement.Place(cart) method that coordinates all four.",
    answer: "Facade",
    trap: "Adapter",
    signals: ["one simple entry point", "many subsystems behind it", "callers no longer coordinate the parts"],
    why: "Simplifying several subsystems behind one new, higher level interface is Facade. An adapter converts one object to fit an existing interface.",
  },
  {
    id: "read-all-text",
    title: "File.ReadAllText",
    scenario:
      "File.ReadAllText(path) opens a FileStream, wraps it in a StreamReader, detects the encoding, reads to the end and disposes everything, all in one call.",
    answer: "Facade",
    trap: "Decorator",
    signals: ["hides several cooperating classes", "a single convenience call", "you can still use the underlying classes directly"],
    why: "One simple call over a group of lower level classes is a Facade. Nothing here wraps an object behind its own interface to add behavior.",
  },
  {
    id: "bundle-pricing",
    title: "Products and bundles",
    scenario:
      "A pricing engine treats a single product and a bundle the same way: both implement IPriceable.Price(). A bundle's Price() adds up its items' prices, and a bundle can contain other bundles.",
    answer: "Composite",
    trap: "Decorator",
    signals: ["part and whole share one interface", "a container holds many children", "the operation recurses through nested containers"],
    why: "A tree of items where groups and single items are used interchangeably is Composite. A decorator holds exactly one inner object, not a list of children.",
  },
  {
    id: "nested-menus",
    title: "Menus with submenus",
    scenario:
      "A menu has MenuItems and SubMenus, and both implement IMenuEntry.Render(indent). A SubMenu renders its own title and then calls Render on each child, and a child may be another SubMenu.",
    answer: "Composite",
    trap: "Iterator",
    signals: ["leaf and container share an interface", "a container delegates to its children", "unbounded nesting"],
    why: "The structure itself (a tree where leaves and groups look the same) is Composite. Iterator would be a separate object for walking such a tree without exposing it.",
  },
  {
    id: "blocklist-middleware",
    title: "Blocking middleware",
    scenario: "This is registered in Program.cs ahead of authentication and the endpoints.",
    code: `app.Use(async (ctx, next) =>
{
    if (IsBlocked(ctx.Connection.RemoteIpAddress))
    {
        ctx.Response.StatusCode = 403;
        return;
    }
    await next(ctx);
});`,
    answer: "Chain of Responsibility",
    trap: "Decorator",
    signals: ["each step receives next", "a step may end the request (short circuit)", "registration order is handling order"],
    why: "ASP.NET Core middleware is Chain of Responsibility: each handler either deals with the request or passes it on. A decorator would always forward the call.",
  },
  {
    id: "ticket-escalation",
    title: "Support ticket escalation",
    scenario:
      "A ticket goes to a first line agent. If they cannot resolve it, it goes to a specialist, then to engineering. Each level decides whether to handle it or pass it up, and whoever opened the ticket never knows who finally solved it.",
    answer: "Chain of Responsibility",
    trap: "Observer",
    signals: ["handlers tried in sequence", "the first one able to handle it does", "the sender does not know the final receiver"],
    why: "One request passed along until someone takes it is Chain of Responsibility. Observer would notify every listener at once.",
  },
  {
    id: "delivery-options",
    title: "Customer picks a delivery option",
    scenario:
      "At checkout the customer chooses standard, express or same day delivery. Each option computes the cost differently, and the checkout calls option.Cost(order) without knowing which option it holds.",
    answer: "Strategy",
    trap: "State",
    signals: ["interchangeable algorithms for one job", "the caller chooses which one", "the choice does not change by itself afterwards"],
    why: "The caller selects one of several algorithms behind a shared interface: Strategy. In State the object would switch implementations itself as things happen.",
  },
  {
    id: "comparer",
    title: "Pluggable sort comparison",
    scenario:
      "You sort a list of customers by passing a comparer object. The sorting algorithm never changes; only the comparison you hand it does.",
    code: `customers.Sort(new ByLastNameThenFirstName());
customers.Sort(new ByLifetimeValueDescending());`,
    answer: "Strategy",
    trap: "Template Method",
    signals: ["the varying behavior is passed in as an object", "composition, not subclassing", "chosen per call by the caller"],
    why: "IComparer<T> is the classic .NET Strategy. Template Method would have you subclass the list and override a comparison step.",
  },
  {
    id: "document-workflow",
    title: "Draft, review, published",
    scenario:
      "A document is Draft, InReview or Published. Calling Submit() on a Draft moves it to InReview; Approve() on InReview moves it to Published; Submit() on Published throws. After each call the document replaces its own state object.",
    answer: "State",
    trap: "Strategy",
    signals: ["the same method does different things depending on status", "the object changes its own behavior", "explicit transitions between states"],
    why: "Behavior that changes as the object moves through states, with each state deciding the next, is State. A strategy would be picked from outside and stay put.",
  },
  {
    id: "vending-machine",
    title: "Vending machine",
    scenario: "Part of a vending machine class:",
    code: `public void InsertCoin()  => _state = _state.InsertCoin(this);
public void PressButton() => _state = _state.PressButton(this);

// NoCoinState.InsertCoin returns new HasCoinState()
// HasCoinState.PressButton dispenses and returns new NoCoinState()`,
    answer: "State",
    trap: "Command",
    signals: ["a _state field that is reassigned", "each state returns the next state", "the machine delegates every action to its current state"],
    why: "The context delegates to a state object and each state chooses its successor: State. Commands would be request objects queued or undone, not the machine's current mode.",
  },
  {
    id: "user-registered",
    title: "After a user signs up",
    scenario:
      "When a user signs up, UserService raises a UserRegistered event. The welcome emailer, the analytics tracker and the CRM sync each subscribed at startup, and UserService has no reference to any of them.",
    answer: "Observer",
    trap: "Chain of Responsibility",
    signals: ["one event, many independent listeners", "the subject does not know its subscribers", "listeners added without changing the subject"],
    why: "Every subscriber is notified of one event: Observer. A chain would hand the event to one handler at a time until one dealt with it.",
  },
  {
    id: "undo-stack",
    title: "Undo in a drawing app",
    scenario:
      "A drawing app turns every action (draw line, move shape, change color) into an object with Execute() and Undo(), pushes it on a stack after running it, and pops it to undo.",
    answer: "Command",
    trap: "Strategy",
    signals: ["each action is an object", "Execute and Undo", "a history of past requests"],
    why: "Requests captured as objects so they can be undone is the textbook Command. A strategy is a reusable algorithm, not a record of something that happened.",
  },
  {
    id: "report-queue",
    title: "Report requests on a queue",
    scenario:
      "The API accepts generate monthly report requests by putting a serialized GenerateReport { Month, UserId } message on a queue. A worker picks it up minutes later and runs it.",
    answer: "Command",
    trap: "Observer",
    signals: ["the request is an object with its own data", "executed later, by someone else", "can be queued, retried or logged"],
    why: "Packaging a request with its arguments so another component can run it later is Command. Observer broadcasts that something happened; it does not carry work to be done.",
  },
  {
    id: "game-skeleton",
    title: "A turn based game base class",
    scenario: "Every game in a collection derives from this class:",
    code: `public abstract class Game
{
    public void Play()
    {
        Setup();
        while (!IsOver()) TakeTurn();
        AnnounceWinner();
    }

    protected abstract void Setup();
    protected abstract bool IsOver();
    protected abstract void TakeTurn();
    protected virtual void AnnounceWinner() => Console.WriteLine("Game over");
}`,
    answer: "Template Method",
    trap: "Strategy",
    signals: ["a non virtual method fixes the order of steps", "abstract steps filled in by subclasses", "variation through inheritance"],
    why: "Play() is the template; subclasses only supply steps. Strategy would inject the varying steps as objects instead of overriding them.",
  },
  {
    id: "background-service",
    title: "Deriving from BackgroundService",
    scenario:
      "You derive from BackgroundService and override ExecuteAsync. The base class's StartAsync and StopAsync, which you never touch, call your method at the right moment and handle cancellation.",
    answer: "Template Method",
    trap: "Factory Method",
    signals: ["the base class owns the lifecycle", "you override one step", "the step does work rather than return a new object"],
    why: "The framework's fixed algorithm calls your override at a hook point: Template Method. It would only be a Factory Method if the overridden step's job were to create and return an object.",
  },
  {
    id: "paged-api",
    title: "Looping over a paged API",
    scenario:
      "A REST API returns customers 100 at a time. You write a method returning IEnumerable<Customer> that fetches the next page only when the caller's foreach reaches the end of the current one, so callers just loop.",
    answer: "Iterator",
    trap: "Proxy",
    signals: ["one element at a time", "storage and paging hidden from the caller", "foreach / yield return"],
    why: "Exposing a sequence element by element while hiding how it is fetched is Iterator. It is lazy, like a virtual proxy, but it walks many items rather than standing in for one object.",
  },
  {
    id: "bst-iterator",
    title: "BSTIterator",
    scenario:
      "An interview problem asks for a BSTIterator class with Next() and HasNext() that returns a binary search tree's values in sorted order using O(h) memory.",
    answer: "Iterator",
    trap: "Composite",
    signals: ["Next and HasNext", "traversal state kept outside the tree", "the tree's structure is not exposed"],
    why: "The tree is the composite structure; the class you are asked to write is the Iterator over it.",
  },
  {
    id: "notifier-switch",
    title: "Picking a notifier by channel",
    scenario: "Called with the user's preferred channel from their settings:",
    code: `public static INotifier Create(string channel) => channel switch
{
    "email" => new EmailNotifier(),
    "sms" => new SmsNotifier(),
    "push" => new PushNotifier(),
    _ => throw new ArgumentException(channel),
};`,
    answer: "Factory Method",
    trap: "Abstract Factory",
    signals: ["one method", "returns one kind of product (INotifier)", "picks the concrete class from runtime input"],
    why: "A single creation method choosing which concrete class to build is a Factory Method. Abstract Factory would create several related products that must match.",
  },
  {
    id: "db-provider",
    title: "Database provider objects",
    scenario:
      "The app supports SQL Server and PostgreSQL. A provider object creates the connection, the command and the parameter objects, and all three must come from the same vendor or the code breaks.",
    answer: "Abstract Factory",
    trap: "Factory Method",
    signals: ["a family of related products", "they must match each other", "several create methods on one object"],
    why: "One object producing a consistent family is Abstract Factory (ADO.NET's DbProviderFactory is exactly this). A Factory Method creates a single product.",
  },
  {
    id: "theme-factory",
    title: "Dark and light control sets",
    scenario:
      "A UI kit defines IThemeFactory with CreateButton(), CreateTextBox() and CreateMenu(). DarkThemeFactory and LightThemeFactory each produce a complete, matching set of controls.",
    answer: "Abstract Factory",
    trap: "Factory Method",
    signals: ["several creation methods on one interface", "products are swapped as a whole family", "client never names a concrete control"],
    why: "Switching a whole matching family by switching one factory object is Abstract Factory.",
  },
  {
    id: "request-builder",
    title: "Fluent request setup",
    scenario: "Building an outgoing HTTP request in a test helper:",
    code: `var request = new HttpRequestBuilder()
    .Get("https://api.example.com/orders")
    .WithHeader("Accept", "application/json")
    .WithTimeout(TimeSpan.FromSeconds(5))
    .Build();`,
    answer: "Builder",
    trap: "Factory Method",
    signals: ["many optional parts set step by step", "methods return the builder for chaining", "a final Build() produces the object"],
    why: "Assembling one object over several readable calls, then building it, is Builder. A factory method decides which class to create in a single call.",
  },
  {
    id: "web-app-builder",
    title: "WebApplication.CreateBuilder",
    scenario:
      "WebApplication.CreateBuilder(args) returns an object you add services, configuration and logging to over many lines. Calling Build() at the end produces the app, which can no longer have services added.",
    answer: "Builder",
    trap: "Facade",
    signals: ["configuration accumulated over several steps", "an explicit Build()", "the built object is fixed afterwards"],
    why: "Step by step configuration followed by Build() is Builder. CreateBuilder does hide complexity, but its defining feature is staged construction.",
  },
  {
    id: "lazy-instance",
    title: "A static Instance property",
    scenario:
      "A class has a private constructor, a static readonly Lazy<RateLimiterState> field, and a static Instance property that returns the same object to every caller in the process.",
    answer: "Singleton",
    trap: "Proxy",
    signals: ["private constructor", "static Instance", "exactly one object per process"],
    why: "Lazy<T> is a tiny virtual proxy, but the class as a whole exists to guarantee one shared instance: Singleton. In ASP.NET Core you would usually register it with AddSingleton instead.",
  },
  {
    id: "goblin-clones",
    title: "Spawning many goblins",
    scenario:
      "A game level spawns hundreds of enemies. You configure one goblin record (stats, sprite, AI settings) and create the rest with goblin with { X = 10, Y = 4 }.",
    answer: "Prototype",
    trap: "Factory Method",
    signals: ["new objects copied from a configured instance", "each copy changes only a few fields", "record with expressions"],
    why: "Creating objects by cloning an existing one is Prototype. A factory method would construct each goblin from scratch in code.",
  },
];

// Content for the design patterns track (Software Design & OOP section): the five SOLID
// principles and the seventeen patterns shown in the Creational, Structural and
// Behavioral lessons. The recognition quiz's questions live in designPatternQuizData.ts.
//
// Prose fields may wrap identifiers in backticks; the components render those spans as
// inline code. Code fields are template literals, so they must not contain a backtick,
// a dollar sign followed by an opening brace, or a backslash.

export type PatternFamily = "creational" | "structural" | "behavioral";

export const PATTERN_NAMES = [
  "Factory Method",
  "Abstract Factory",
  "Builder",
  "Singleton",
  "Prototype",
  "Adapter",
  "Decorator",
  "Facade",
  "Proxy",
  "Composite",
  "Strategy",
  "Observer",
  "Command",
  "State",
  "Template Method",
  "Iterator",
  "Chain of Responsibility",
] as const;

export type PatternName = (typeof PATTERN_NAMES)[number];

export interface PatternInfo {
  name: PatternName;
  family: PatternFamily;
  intent: string;
  useWhen: string[];
  avoidWhen: string[];
  structure: string;
  code: string;
  inTheWild: string[];
  interview: string;
  confusedWith: string;
}

// Lesson ids, matching the ITool classes in content/Tools.
export const SOLID_LESSON_ID = "solid-principles";
export const QUIZ_LESSON_ID = "design-pattern-quiz";
export const FAMILY_LESSON_ID: Record<PatternFamily, string> = {
  creational: "creational-patterns",
  structural: "structural-patterns",
  behavioral: "behavioral-patterns",
};
export const FAMILY_TITLE: Record<PatternFamily, string> = {
  creational: "Creational Patterns",
  structural: "Structural Patterns",
  behavioral: "Behavioral Patterns",
};

export const PATTERNS: PatternInfo[] = [
  // ---------------------------------------------------------------- creational
  {
    name: "Factory Method",
    family: "creational",
    intent:
      "Put object creation behind a method, so the caller depends only on the product's interface and a subclass or an input decides which concrete class gets built.",
    useWhen: [
      "Which class to create depends on runtime input or configuration (a format string, a channel name, a provider setting).",
      "A base class owns a workflow, but each subclass needs to supply its own product for one step of it.",
      "You want exactly one place to edit when a new product type is added.",
    ],
    avoidWhen: [
      "There is one concrete class and no realistic second one. A plain `new` is fine.",
      "The DI container can already resolve the right implementation. Register it and inject it.",
      "The factory only forwards its arguments to a single constructor. That is ceremony, not design.",
    ],
    structure: `ReportExporter (abstract)
+ Export(rows)        uses only IReportWriter
# CreateWriter()      <- the factory method
        ^
        | overrides
  +-----+--------+
  |              |
CsvExporter    JsonExporter
  |              |
  v              v
CsvWriter      JsonWriter   (both IReportWriter)`,
    code: `public interface IReportWriter
{
    void Write(string[] row);
}

public sealed class CsvWriter(TextWriter output) : IReportWriter
{
    public void Write(string[] row) => output.WriteLine(string.Join(",", row));
}

public abstract class ReportExporter
{
    // The factory method: subclasses decide which writer is built.
    protected abstract IReportWriter CreateWriter(TextWriter output);

    // The shared workflow never names a concrete writer.
    public void Export(IEnumerable<string[]> rows, TextWriter output)
    {
        var writer = CreateWriter(output);
        foreach (var row in rows) writer.Write(row);
    }
}

public sealed class CsvExporter : ReportExporter
{
    protected override IReportWriter CreateWriter(TextWriter output) => new CsvWriter(output);
}

// The everyday variant: a static factory method that picks by input.
public static class ReportWriters
{
    public static IReportWriter Create(string format, TextWriter output) => format switch
    {
        "csv" => new CsvWriter(output),
        "json" => new JsonWriter(output),
        _ => throw new ArgumentException($"Unknown format '{format}'"),
    };
}`,
    inTheWild: [
      "`ILoggerFactory.CreateLogger<T>()` and `IHttpClientFactory.CreateClient(\"github\")`: you ask for a product by type or name and never construct it yourself.",
      "The legacy `WebRequest.Create(uri)` returned an HttpWebRequest or an FtpWebRequest depending on the URI scheme, the textbook static factory method.",
      "This app: ToolView picks which React component to render from a lesson's `toolKind`. It is a factory written as a list of cases, and adding a lesson adds one case there.",
    ],
    interview:
      "Expect the follow up on Abstract Factory: Factory Method creates one product, usually through a single overridable or static method, while Abstract Factory is an object with several creation methods that return a matching family. Be ready to say why the factory beats `new`: the caller depends only on IReportWriter, so XML output is a new class plus one line in the factory and the caller is untouched (Open/Closed). In low level design rounds, a factory is the natural place to turn a config string or enum into the right object.",
    confusedWith:
      "Abstract Factory: one product from one method, versus a matching family from an object with several create methods.",
  },
  {
    name: "Abstract Factory",
    family: "creational",
    intent:
      "Provide one interface for creating a whole family of related objects that must be used together, without naming their concrete classes.",
    useWhen: [
      "Products come in families that must match: a dark button with a dark checkbox, a SQL Server connection with a SQL Server command.",
      "The whole family switches at once, based on platform, database provider, tenant or theme.",
      "Tests should get a factory that produces in memory fakes of everything the code under test creates.",
    ],
    avoidWhen: [
      "There is only one kind of product. That is a Factory Method.",
      "New product kinds are added often. Adding a CreateSlider() means editing every factory, which is this pattern's real cost.",
      "DI registrations per environment already hand each consumer the right set of implementations.",
    ],
    structure: `          IUiFactory
          + CreateButton(): IButton
          + CreateCheckbox(): ICheckbox
             ^                 ^
             |                 |
     LightUiFactory      DarkUiFactory
       |       |           |       |
  LightButton  |      DarkButton   |
         LightCheckbox       DarkCheckbox

Client holds an IUiFactory and never
names a concrete button or checkbox.`,
    code: `public interface IButton { string Render(); }
public interface ICheckbox { string Render(bool on); }

// One factory per family; every method returns a member of that family.
public interface IUiFactory
{
    IButton CreateButton(string label);
    ICheckbox CreateCheckbox();
}

public sealed class DarkUiFactory : IUiFactory
{
    public IButton CreateButton(string label) => new DarkButton(label);
    public ICheckbox CreateCheckbox() => new DarkCheckbox();
}

public sealed class LightUiFactory : IUiFactory
{
    public IButton CreateButton(string label) => new LightButton(label);
    public ICheckbox CreateCheckbox() => new LightCheckbox();
}

// The client is written once, against the abstractions only.
public sealed class SettingsPage(IUiFactory ui)
{
    public string Render() =>
        ui.CreateButton("Save").Render() + ui.CreateCheckbox().Render(on: true);
}

// The family is chosen in exactly one place, so pieces can never be mixed.
IUiFactory ui = prefersDark ? new DarkUiFactory() : new LightUiFactory();
var page = new SettingsPage(ui);`,
    inTheWild: [
      "ADO.NET's `DbProviderFactory`: `SqlClientFactory.Instance` and `SqliteFactory.Instance` each create a matching connection, command and parameter, so provider neutral data code never mixes a SQL Server command with a SQLite connection.",
      "Cross platform UI toolkits create a complete, matching set of native controls per platform (MAUI's handlers are the modern form of this).",
      "Test setups that pass a fake infrastructure factory to the code under test, so every clock, file system and HTTP client it creates is in memory.",
    ],
    interview:
      "The key sentence is that Abstract Factory guarantees consistency across a family. Interviewers like to ask what happens when you add a new product, say a Slider: every factory must change, so the pattern is open to new families but closed to new product kinds. Naming that tradeoff shows you understand the pattern rather than having memorized its diagram.",
    confusedWith:
      "Factory Method: if the factory only ever makes one kind of thing, it is a Factory Method, however many concrete classes sit behind it.",
  },
  {
    name: "Builder",
    family: "creational",
    intent:
      "Assemble a complex object step by step through readable calls, then produce the finished (often immutable) object in one final Build() step.",
    useWhen: [
      "A constructor would need many optional parameters (the telescoping constructor smell).",
      "Construction has rules that should be validated once, for the object as a whole, at Build() time.",
      "The finished object should be immutable while its setup stays flexible.",
    ],
    avoidWhen: [
      "The object has two or three fields. A constructor or a `record` with `init` properties is clearer.",
      "C# named and optional arguments, or `required` properties with an object initializer, already make the call readable.",
      "Build() would only copy fields with nothing to validate. Then the builder is pure boilerplate.",
    ],
    structure: `Client
  |  .To(..).Subject(..).Cc(..).Build()
  v
EmailBuilder                 EmailMessage
- fields collected so far    (immutable record)
+ To(addr): EmailBuilder
+ Subject(text): EmailBuilder
+ Cc(addr): EmailBuilder
+ Build()  validates, then => new EmailMessage(..)`,
    code: `public sealed record EmailMessage(
    string To, string Subject, string Body,
    IReadOnlyList<string> Cc, bool IsHtml);

public sealed class EmailBuilder
{
    private string? _to;
    private string _subject = "";
    private string _body = "";
    private bool _isHtml;
    private readonly List<string> _cc = [];

    public EmailBuilder To(string address) { _to = address; return this; }
    public EmailBuilder Subject(string text) { _subject = text; return this; }
    public EmailBuilder Cc(string address) { _cc.Add(address); return this; }
    public EmailBuilder Body(string text, bool html = false)
    {
        _body = text;
        _isHtml = html;
        return this;
    }

    // Validation happens once, for the object as a whole.
    public EmailMessage Build()
    {
        if (_to is null) throw new InvalidOperationException("To is required.");
        return new EmailMessage(_to, _subject, _body, _cc.ToList(), _isHtml);
    }
}

var mail = new EmailBuilder()
    .To("dev@example.com")
    .Subject("Build finished")
    .Cc("team@example.com")
    .Body("<b>All green</b>", html: true)
    .Build();`,
    inTheWild: [
      "An ASP.NET Core app's Program.cs: `WebApplication.CreateBuilder(args)` collects services and configuration over many lines, then `builder.Build()` produces the app.",
      "`StringBuilder` accumulates appends cheaply, then `ToString()` produces the immutable string.",
      "`DbContextOptionsBuilder` (the `options => options.UseSqlite(...)` lambda in Program.cs), `UriBuilder`, `ConfigurationBuilder` and `HostBuilder`.",
    ],
    interview:
      "Builder comes up in low level design whenever an object has many optional parts: a pizza order, an HTTP request, a SQL query. Say why you chose it over a constructor (readability and a single validation point). A strong answer also names the C# alternative: `required` and `init` properties with object initializers cover many cases without a builder, and saying when you would not use the pattern shows judgment.",
    confusedWith:
      "Factory Method and Abstract Factory decide which class to create, in one call. Builder decides how one object is assembled, over several calls.",
  },
  {
    name: "Singleton",
    family: "creational",
    intent: "Guarantee a class has exactly one instance in the process and give everything a way to reach it.",
    useWhen: [
      "There is genuinely one of something per process: a configuration snapshot, a cache, a connection pool, a hardware port.",
      "The object is expensive to create and safe to share across threads.",
      "Even then, prefer letting the DI container own the single instance with `services.AddSingleton<T>()`.",
    ],
    avoidWhen: [
      "You mainly want convenient global access. That is a global variable with extra steps, and every dependency on it is invisible.",
      "The code using it needs unit tests. A static `Instance` cannot be replaced with a fake.",
      "The object holds per request or per user state. That belongs in a scoped service.",
    ],
    structure: `Classic singleton
-------------------------------------
- static Lazy<Settings> _instance
- Settings()            (private ctor)
+ static Instance  ->  same object, always

DI instead (what .NET code usually does)
-------------------------------------
services.AddSingleton<ISettings, Settings>();
class Billing(ISettings s)   <- injected,
                                one instance,
                                fakeable in tests`,
    code: `// Classic: thread safe and lazy, thanks to Lazy<T>.
public sealed class SettingsCache
{
    private static readonly Lazy<SettingsCache> _instance = new(() => new SettingsCache());

    public static SettingsCache Instance => _instance.Value;

    private SettingsCache() { /* load settings once */ }

    public string Get(string key) => "";
}

// The caller has a hidden dependency that no test can replace.
var url = SettingsCache.Instance.Get("ApiUrl");

// Why DI usually replaces it: the container still creates exactly one
// instance, but consumers receive it through their constructor.
builder.Services.AddSingleton<ISettingsCache, SettingsCacheService>();

public sealed class ReportService(ISettingsCache settings)
{
    public string ApiUrl => settings.Get("ApiUrl"); // a test passes a fake
}`,
    inTheWild: [
      "ASP.NET Core: a service registered with `AddSingleton` in Program.cs is one instance shared by the whole app (for example one SemaphoreSlim that caps concurrent jobs), handed to whoever asks for it, with no static Instance property anywhere.",
      "This app: `ConceptRegistry` and `ToolRegistry` are static classes holding one shared list. That is singleton shaped, and fine here because the data is immutable and never needs faking.",
      ".NET: `ArrayPool<T>.Shared`, `TimeProvider.System`, and the advice to reuse one `HttpClient` (or use IHttpClientFactory) instead of creating one per request.",
    ],
    interview:
      "Be ready for three questions. Thread safety: show `Lazy<T>` or a static readonly field, and mention double checked locking only as history. Testability: a static Instance is a hidden dependency, which is why Singleton is often called an anti pattern. DI: `AddSingleton` gives you the single instance with an explicit, mockable dependency. Bonus points for the captive dependency trap: a singleton that holds a scoped service such as a DbContext keeps it alive far longer than intended.",
    confusedWith:
      "A static class (no instance at all, cannot implement an interface or be injected) and a DI singleton lifetime (one instance, but passed in and swappable).",
  },
  {
    name: "Prototype",
    family: "creational",
    intent: "Create new objects by copying an existing, already configured instance instead of building each one from scratch.",
    useWhen: [
      "Building an object is expensive or involved, and many copies differ only slightly (templates, presets, game entities).",
      "You need a copy of an object whose concrete type you do not know at compile time.",
    ],
    avoidWhen: [
      "Objects are cheap to construct. Just construct them.",
      "The object graph has shared references, cycles or resources such as streams, where copy is ambiguous. Shallow versus deep copy bugs are the classic failure.",
    ],
    structure: `InvoiceTemplate (configured once)
+ Clone(): InvoiceTemplate
       |
       | Clone()
       v
new InvoiceTemplate
(same values, its own Lines list)`,
    code: `// Records give you Prototype for free: 'with' copies, then changes.
public sealed record ShippingOptions(string Carrier, decimal Rate, bool Insured);

var standard = new ShippingOptions("UPS", 7.50m, Insured: false);
var insured = standard with { Insured = true }; // copy, change one field

// A hand written clone must decide shallow or deep for every reference.
public sealed class InvoiceTemplate
{
    public string Header { get; set; } = "";
    public List<string> Lines { get; set; } = [];

    public InvoiceTemplate Clone() => new()
    {
        Header = Header,
        Lines = [.. Lines], // deep: the clone gets its own list
    };
}`,
    inTheWild: [
      "C# `record` types and the `with` expression: prototype by copy, built into the language.",
      "`object.MemberwiseClone()` (a shallow copy) and the old `ICloneable` interface, which is discouraged because it never said whether a copy is deep or shallow.",
      "This app's React components copy state rather than mutate it, for example `[...missed, question]` in the drills: the same copy then change idea.",
    ],
    interview:
      "Prototype rarely gets a question of its own. When it does, the probe is shallow versus deep copy: be able to show two objects that accidentally share one List after a clone and explain the bug. Mentioning records and `with` is the idiomatic C# answer.",
    confusedWith: "Factory Method: a factory builds a new object from code; a prototype copies an existing configured instance.",
  },

  // ---------------------------------------------------------------- structural
  {
    name: "Adapter",
    family: "structural",
    intent:
      "Convert the interface of an existing class into the interface your code expects, so two things that do not fit can work together.",
    useWhen: [
      "You must use a third party or legacy class whose interface does not match the one your code depends on.",
      "Domain code should depend on your own interface rather than a vendor SDK, so the vendor can be replaced.",
      "Several similar services (payment providers, SMS gateways) must look identical to the rest of the app.",
    ],
    avoidWhen: [
      "You own both sides. Change one of the interfaces instead of adding a translation layer.",
      "The adapter starts adding features such as caching or retries. That part is a Decorator; keep the adapter a pure translation.",
    ],
    structure: `Client ----> IPaymentGateway         (yours)
             + ChargeAsync(amount, card)
                  ^
                  | implements
            AcmePayAdapter
            - client: AcmePayClient
            + ChargeAsync(..)
                  |
                  | translates the call
                  v
            AcmePayClient            (vendor's)
            + CreateCharge(request)`,
    code: `// The interface our code wants.
public interface IPaymentGateway
{
    Task<bool> ChargeAsync(decimal amount, string cardToken);
}

// A vendor SDK we cannot change, with its own shape and types.
public sealed class AcmePayClient
{
    public Task<AcmeChargeResult> CreateCharge(AcmeChargeRequest request) =>
        throw new NotImplementedException("vendor code");
}

// The adapter implements our interface and translates to theirs.
public sealed class AcmePayAdapter(AcmePayClient client) : IPaymentGateway
{
    public async Task<bool> ChargeAsync(decimal amount, string cardToken)
    {
        var result = await client.CreateCharge(new AcmeChargeRequest
        {
            AmountInCents = (long)(amount * 100),
            Source = cardToken,
        });
        return result.Status == "succeeded";
    }
}`,
    inTheWild: [
      "`StreamReader` adapts a byte oriented `Stream` to the character oriented `TextReader` interface, so you can call ReadLine() on a network stream.",
      "ADO.NET's `DbDataAdapter` (the pattern is in the name) adapts a database command to fill a DataSet.",
      "Logging providers: Serilog's provider adapts Serilog to the `Microsoft.Extensions.Logging.ILogger` interface that framework code writes to.",
    ],
    interview:
      "The phrase to use is anti corruption layer: wrapping a vendor SDK in an adapter keeps its types out of your domain, so switching vendors touches one class and tests fake your own interface. The classic follow up is how Adapter differs from Decorator and Facade. Adapter changes the interface of one object; Decorator keeps the interface and adds behavior; Facade defines a new, simpler interface over many objects.",
    confusedWith:
      "Decorator keeps the same interface and adds behavior. Facade simplifies many objects instead of converting one.",
  },
  {
    name: "Decorator",
    family: "structural",
    intent:
      "Add behavior to an object by wrapping it in another object with the same interface, so behaviors can be stacked and combined at runtime.",
    useWhen: [
      "You need cross cutting behavior (logging, caching, retries, metrics, compression) without editing the original class.",
      "Combinations vary, and a subclass per combination (CachedLoggedRetryingRepository) would explode.",
      "Each behavior should be optional and switched on per registration.",
    ],
    avoidWhen: [
      "The stack gets so deep that debugging means peeling six wrappers to find the real call.",
      "Order matters (is the cache outside or inside the retry?) and nobody writes it down.",
      "The interface is large. Every decorator must forward every member, which is a lot of boilerplate.",
    ],
    structure: `          IProductRepository
          + GetAsync(id)
           ^       ^         ^
           |       |         |
   SqlRepo   CachingRepo   LoggingRepo
             - inner       - inner
             (same interface, wraps another one)

new LoggingRepo(
    new CachingRepo(
        new SqlRepo(db)))   <- call goes outside in`,
    code: `public interface IProductRepository
{
    Task<Product?> GetAsync(int id);
}

public sealed class SqlProductRepository(AppDbContext db) : IProductRepository
{
    public async Task<Product?> GetAsync(int id) => await db.Products.FindAsync(id);
}

// Same interface, wraps another instance, adds exactly one behavior.
public sealed class CachingProductRepository(IProductRepository inner, IMemoryCache cache)
    : IProductRepository
{
    public Task<Product?> GetAsync(int id) =>
        cache.GetOrCreateAsync($"product:{id}", _ => inner.GetAsync(id));
}

public sealed class LoggingProductRepository(IProductRepository inner, ILogger log)
    : IProductRepository
{
    public async Task<Product?> GetAsync(int id)
    {
        log.LogInformation("Loading product {Id}", id);
        return await inner.GetAsync(id);
    }
}

// Stack them; callers only ever see IProductRepository.
IProductRepository repo =
    new LoggingProductRepository(
        new CachingProductRepository(new SqlProductRepository(db), cache), log);`,
    inTheWild: [
      "Streams: `new GZipStream(new BufferedStream(fileStream), CompressionLevel.Optimal)`. GZipStream, BufferedStream and CryptoStream are each a Stream that wraps another Stream and adds one thing.",
      "`DelegatingHandler` in HttpClient: each handler wraps the next one, which is how retry (Polly) and logging handlers are added to a client.",
      "DI helpers such as Scrutor's `services.Decorate<IRepo, CachingRepo>()` register a decorator around an existing registration.",
    ],
    interview:
      "Decorator versus Proxy is one of the most asked comparisons. Both wrap an object behind the same interface. A Decorator exists to add behavior, is usually stacked, and is composed by whoever builds the object. A Proxy exists to control access to the real object (lazy creation, permission checks, remote calls) and often creates or locates that object itself. Also expect why not inheritance: decorators compose at runtime and avoid a subclass for every combination.",
    confusedWith:
      "Proxy (same shape, but it controls access rather than adding behavior) and Chain of Responsibility (a decorator keeps the wrapped object's contract and normally forwards, though a caching decorator may answer from its cache; a chain hands responsibility along a series of handlers, any of which may stop the request).",
  },
  {
    name: "Facade",
    family: "structural",
    intent:
      "Offer one simple entry point to a complicated subsystem, so callers do not have to coordinate its parts themselves.",
    useWhen: [
      "Callers keep repeating the same multistep dance across several classes.",
      "You want layers: the rest of the app talks to one service, not to ten internals.",
      "You are wrapping a legacy subsystem as the first step of replacing it.",
    ],
    avoidWhen: [
      "The facade turns into a god class that every new feature adds a method to.",
      "Callers need the full power of the subsystem. Keep the facade optional instead of hiding the parts behind it completely.",
    ],
    structure: `Controller
    |
    v
CheckoutService (facade)
+ PlaceOrderAsync(cart, card)
    |          |          |          |
    v          v          v          v
Inventory  Payments   Shipping    Email
(each with its own API, rules and failure modes)`,
    code: `public sealed class CheckoutService(
    IInventory inventory,
    IPaymentGateway payments,
    IShippingCalculator shipping,
    IEmailSender email)
{
    // One call for the caller; four subsystems coordinated inside.
    public async Task<OrderResult> PlaceOrderAsync(Cart cart, string cardToken)
    {
        if (!await inventory.ReserveAsync(cart.Items))
            return OrderResult.OutOfStock;

        var total = cart.Subtotal + shipping.Quote(cart);
        if (!await payments.ChargeAsync(total, cardToken))
        {
            await inventory.ReleaseAsync(cart.Items);
            return OrderResult.PaymentDeclined;
        }

        await email.SendAsync(cart.CustomerEmail, "Order confirmed");
        return OrderResult.Placed;
    }
}`,
    inTheWild: [
      "EF Core's `DbContext` is a facade over connections, change tracking, SQL generation and transactions. It is also a Unit of Work (`SaveChanges` commits every tracked change in one transaction), and each `DbSet<T>` behaves like a Repository.",
      "`File.ReadAllText(path)` hides FileStream, StreamReader, encoding detection and disposal behind one call.",
      "This app: the functions in `client/src/api.ts` (such as `fetchLessons()`) hide where lessons and progress come from (JSON files, IndexedDB) from components, and `runCSharpInBrowser` in `csharpWasmRunner.ts` hides the Web Worker, loading the .NET runtime, and timeouts behind one call.",
    ],
    interview:
      "Facade is easy to define, so the probe is usually how it differs from Adapter (a facade simplifies many objects behind a new interface; an adapter makes one object fit an interface that already exists) and whether you know its failure mode, the god class. Describing a service layer or an API gateway as a facade is a good bridge into system design.",
    confusedWith:
      "Adapter: an adapter makes one object fit an interface that already exists; a facade defines a new, simpler interface over many objects.",
  },
  {
    name: "Proxy",
    family: "structural",
    intent:
      "Stand in for a real object behind the same interface, to control access to it: create it lazily, check permissions, or forward calls to another process.",
    useWhen: [
      "Virtual proxy: the real object is expensive and may never be needed, so load it on first use.",
      "Protection proxy: calls must pass an authorization check before reaching the real object.",
      "Remote proxy: the real object lives in another process or machine, and callers should not have to care.",
    ],
    avoidWhen: [
      "The extra code really adds behavior (logging, metrics). Call it a Decorator; the name tells readers what to expect.",
      "The proxy hides latency. Making a network call look like a property read invites N+1 query problems; EF lazy loading is the famous example.",
    ],
    structure: `Client ----> IReportStore
               ^             ^
               |             |
  SecureReportStoreProxy   BlobReportStore
  - real: Lazy<BlobStore>  (slow to create,
  + Download(id):           remote, sensitive)
      check permission
      create real on first use
      forward to real.Download(id)`,
    code: `public interface IReportStore
{
    byte[] Download(string reportId);
}

public sealed class BlobReportStore : IReportStore
{
    public BlobReportStore() { /* opens network connections: slow */ }
    public byte[] Download(string reportId) => []; // a network call in real life
}

// Same interface. It controls access to the real store: creates it only
// when first needed and refuses callers without permission.
public sealed class SecureReportStoreProxy(ICurrentUser user) : IReportStore
{
    private readonly Lazy<BlobReportStore> _real = new(() => new BlobReportStore());

    public byte[] Download(string reportId)
    {
        if (!user.HasPermission("reports:read"))
            throw new UnauthorizedAccessException();

        return _real.Value.Download(reportId);
    }
}`,
    inTheWild: [
      "EF Core lazy loading proxies (`UseLazyLoadingProxies()`): a generated subclass overrides navigation properties so the first access runs a query.",
      "gRPC client stubs and typed HTTP clients generated from OpenAPI are remote proxies: a method call becomes a network request.",
      "`Lazy<T>` is a minimal virtual proxy, and mocking libraries such as Moq generate proxy classes at runtime (via Castle DynamicProxy).",
    ],
    interview:
      "Know the three flavors (virtual, protection, remote) with one example each. The follow up is almost always Proxy versus Decorator: the structure is identical and the intent differs. A proxy controls access and usually creates or locates the real object itself; a decorator is handed an object and adds behavior. In system design, a reverse proxy such as nginx is the same idea at network scale.",
    confusedWith:
      "Decorator: identical structure. A proxy controls access to the real object and often creates it; a decorator is handed an object and adds behavior.",
  },
  {
    name: "Composite",
    family: "structural",
    intent: "Build objects into trees and let clients treat one item and a whole group of items through the same interface.",
    useWhen: [
      "The data is naturally a part and whole tree: folders and files, UI elements, menus, org charts, expression trees.",
      "Clients should not keep branching on whether something is a leaf or a container.",
      "Operations such as total size, render or price recurse naturally over the tree.",
    ],
    avoidWhen: [
      "The structure is flat. A list is simpler than a tree one level deep.",
      "Leaves and containers need very different operations. Forcing them into one interface leads to leaf methods that throw, an Interface Segregation smell.",
    ],
    structure: `          IFileNode
          + Size(): long
           ^          ^
           |          |
      FileNode      FolderNode
      - bytes       - children: List<IFileNode>
                    + Size() = sum of children
                      (a child may be a FolderNode)`,
    code: `public interface IFileNode
{
    string Name { get; }
    long Size();
}

public sealed record FileNode(string Name, long Bytes) : IFileNode
{
    public long Size() => Bytes;
}

public sealed class FolderNode(string name) : IFileNode
{
    private readonly List<IFileNode> _children = [];

    public string Name => name;

    public FolderNode Add(IFileNode child)
    {
        _children.Add(child);
        return this;
    }

    // The recursion is the point: a folder's children can be folders.
    public long Size() => _children.Sum(child => child.Size());
}

var src = new FolderNode("src")
    .Add(new FileNode("Program.cs", 4_200))
    .Add(new FolderNode("Content").Add(new FileNode("ITool.cs", 3_100)));

Console.WriteLine(src.Size()); // 7300; the caller never checks leaf or folder`,
    inTheWild: [
      "The React component tree in this app: ToolView contains sections, which contain widgets, which contain buttons, and React renders every node the same way.",
      "ASP.NET Core configuration: an `IConfigurationSection` is itself an `IConfiguration`, so a section of a section works exactly like the root.",
      "WPF and MAUI visual trees, `System.Linq.Expressions` expression trees, and `XElement` in LINQ to XML.",
    ],
    interview:
      "Composite appears in low level design prompts such as design a file system or design a menu with submenus. State the uniform interface and the recursive operation, then raise the design choice interviewers listen for: whether child management (Add, Remove) lives on the shared interface (uniform, but leaves must reject it) or only on the container (type safe, but callers must know which one they hold).",
    confusedWith:
      "Decorator also wraps objects behind the same interface, but it holds exactly one inner object to add behavior, not a list of children to aggregate.",
  },

  // ---------------------------------------------------------------- behavioral
  {
    name: "Strategy",
    family: "behavioral",
    intent: "Put each variant of an algorithm behind one interface and let the caller choose which one to use.",
    useWhen: [
      "A switch or if/else picks between several ways of doing the same job: pricing, shipping, sorting, routing, compression.",
      "The choice comes from configuration, user input or the caller, and may differ per call.",
      "Each algorithm should be testable on its own.",
    ],
    avoidWhen: [
      "There are two branches that will never grow. An if statement is fine.",
      "The variants differ by one value. Pass a parameter, not an object.",
      "In C#, a single method strategy is often just a delegate: a `Func<Order, decimal>` can beat a one method interface.",
    ],
    structure: `ShippingCalculator             IShippingStrategy
- strategy                     + Cost(order)
+ Quote(order)  delegates =>      ^      ^       ^
                                  |      |       |
                             Ground  Express  Freight

The CALLER decides which strategy is passed in.`,
    code: `public interface IShippingStrategy
{
    decimal Cost(Order order);
}

public sealed class GroundShipping : IShippingStrategy
{
    public decimal Cost(Order order) => 5m + 0.5m * order.WeightKg;
}

public sealed class ExpressShipping : IShippingStrategy
{
    public decimal Cost(Order order) => 15m + 1.2m * order.WeightKg;
}

public sealed class ShippingCalculator(IShippingStrategy strategy)
{
    public decimal Quote(Order order) => strategy.Cost(order);
}

// The caller chooses; ShippingCalculator never changes when an option is added.
var quote = new ShippingCalculator(new ExpressShipping()).Quote(order);

// The lightweight C# form of the same idea:
Func<Order, decimal> ground = o => 5m + 0.5m * o.WeightKg;`,
    inTheWild: [
      "`IComparer<T>` passed to `List<T>.Sort`, or the key selector passed to `OrderBy`: the sort algorithm is fixed and the comparison strategy is plugged in.",
      "ASP.NET Core authentication handlers and `IPasswordHasher<T>`: swappable algorithms behind one interface.",
      "This app: the five Sorting lessons are strategies for the same sort this array job, OOP Basics' shapes are strategies for computing an area, and the C# and Python runners behind the language tabs are two strategies for running code.",
    ],
    interview:
      "Strategy is the pattern most often asked for by name, usually as refactor this switch statement. Show the interface, two implementations and constructor injection, and mention that the switch moves to one factory or DI registration. Then expect Strategy versus State: in Strategy the client chooses the algorithm and it usually stays fixed for that object; in State the object swaps its own behavior as its internal state changes.",
    confusedWith:
      "State (same diagram, but the object switches states itself) and Template Method (varies a step through inheritance instead of an injected object).",
  },
  {
    name: "Observer",
    family: "behavioral",
    intent:
      "Let one object (the subject) notify any number of subscribers when something happens, without knowing who they are or what they do.",
    useWhen: [
      "Several independent parts of the system react to one event: an order is placed, so email, analytics and inventory all respond.",
      "The subject must not depend on its listeners, and new listeners should be added without touching it.",
      "UI that must update when the underlying model changes.",
    ],
    avoidWhen: [
      "The reactions must run in a guaranteed order or inside one transaction. Implicit fan out hides that.",
      "The event must survive a crash or cross a process boundary. In process events vanish with the process; use a message queue.",
      "You cannot guarantee unsubscription. A subject's event list keeps every subscriber alive, a classic memory leak.",
    ],
    structure: `OrderService (subject)
+ event OrderPlaced
+ Place(order) -> raises OrderPlaced
       |
       | notifies every subscriber;
       | knows nothing else about them
       v
+---------+   +-----------+   +-----------+
| Emailer |   | Analytics |   | Inventory |
+---------+   +-----------+   +-----------+`,
    code: `public sealed class OrderService
{
    // A C# event is the Observer pattern built into the language.
    public event EventHandler<Order>? OrderPlaced;

    public void Place(Order order)
    {
        // ... save the order ...
        OrderPlaced?.Invoke(this, order);
    }
}

var orders = new OrderService();
orders.OrderPlaced += (_, o) => emailer.SendConfirmation(o);
orders.OrderPlaced += (_, o) => analytics.Track("order_placed", o.Id);

// Keep a reference so you can unsubscribe when the listener goes away,
// otherwise the subject keeps it alive.
EventHandler<Order> reserve = (_, o) => inventory.Reserve(o);
orders.OrderPlaced += reserve;
orders.OrderPlaced -= reserve;`,
    inTheWild: [
      "Every C# `event`, `INotifyPropertyChanged` behind WPF and MAUI data binding, and `IObservable<T>` with `IObserver<T>`, the basis of Rx.NET.",
      "`IOptionsMonitor<T>.OnChange` calls you back whenever configuration reloads.",
      "This app: the Mixed Interview Set's open the lesson link calls `openLesson(id)`, which dispatches a window event that App.tsx subscribes to, so the link never needs a reference to App. Every React `onClick` is a smaller version of the same idea.",
    ],
    interview:
      "Interviewers probe the operational problems: leaks from forgotten unsubscriptions, what happens when one observer throws (the rest may never run), and synchronous versus asynchronous delivery. The distributed version is publish and subscribe through a broker such as Kafka or SNS; say that Observer is the in process pattern and pub/sub is how it scales across services.",
    confusedWith:
      "Chain of Responsibility: Observer delivers an event to every subscriber; a chain passes a request along until one handler deals with it.",
  },
  {
    name: "Command",
    family: "behavioral",
    intent: "Turn a request into an object, so it can be queued, logged, retried, undone or executed later by someone else.",
    useWhen: [
      "You need undo and redo: each command knows how to reverse itself.",
      "Requests must be queued, scheduled, persisted or sent to another worker.",
      "Several UI triggers (menu item, button, shortcut) should share one implementation of an action.",
    ],
    avoidWhen: [
      "The request runs immediately, once, in the code that created it. A method call is simpler.",
      "Every tiny operation becomes a class with a one line Execute. Unless you need undo or serialization, an `Action` delegate is enough.",
    ],
    structure: `Invoker (editor, queue, scheduler)
- history: Stack<ICommand>
+ Run(cmd):  cmd.Execute(); history.Push(cmd)
+ Undo():    history.Pop().Undo()
                 |
                 v
            ICommand
            + Execute()
            + Undo()
                 ^
                 |
      AppendTextCommand
      - doc, text   (the receiver and the arguments,
                     captured so it can run later)`,
    code: `public interface ICommand
{
    void Execute();
    void Undo();
}

public sealed class AppendTextCommand(Document doc, string text) : ICommand
{
    public void Execute() => doc.Append(text);
    public void Undo() => doc.RemoveLast(text.Length);
}

public sealed class Editor
{
    private readonly Stack<ICommand> _history = new();

    public void Run(ICommand command)
    {
        command.Execute();
        _history.Push(command);
    }

    public void Undo()
    {
        if (_history.TryPop(out var command)) command.Undo();
    }
}

var editor = new Editor();
editor.Run(new AppendTextCommand(doc, "Hello"));
editor.Run(new AppendTextCommand(doc, ", world"));
editor.Undo(); // the document is back to "Hello"`,
    inTheWild: [
      "`ICommand` in WPF and MAUI: a button binds to a command object with `Execute` and `CanExecute`.",
      "MediatR requests and CQRS commands such as `CreateOrderCommand`: a request object sent to a separate handler.",
      "Background jobs (Hangfire, a message on a queue): the job is a serialized command that a worker executes later.",
    ],
    interview:
      "The canonical interview use is undo and redo in a text editor or drawing app: two stacks of commands. Point out that a command captures everything needed to run later (the receiver and the arguments), which is why it can be queued or serialized. Distinguish it from Strategy: a strategy is a reusable way of doing something, while a command is one specific request, with its data, usually executed once.",
    confusedWith:
      "Strategy: a strategy is a reusable how; a command is one specific request (what to do, plus its arguments) that can be queued or undone.",
  },
  {
    name: "State",
    family: "behavioral",
    intent:
      "Let an object change its behavior when its internal state changes, by delegating to a state object that the object replaces itself.",
    useWhen: [
      "The same methods behave differently depending on a status field, and switches on that status appear in many methods.",
      "Transitions have rules (a shipped order cannot be cancelled) that should live with each state.",
      "Workflows: orders, documents, connections, vending machines, elevators.",
    ],
    avoidWhen: [
      "Two or three states with simple transitions. An enum with a switch, or a transition table, is easier to read.",
      "The states carry no behavior, only data. Then it is just an enum.",
    ],
    structure: `Order (context)
- state: IOrderState
+ Pay()    -> state = state.Pay()
+ Ship()   -> state = state.Ship()
+ Cancel() -> state = state.Cancel()
              |
         IOrderState
          ^     ^      ^         ^
          |     |      |         |
     Pending  Paid  Shipped  Cancelled

Each state returns the NEXT state:
Pending.Pay() returns new Paid()`,
    code: `public interface IOrderState
{
    IOrderState Pay();
    IOrderState Ship();
    IOrderState Cancel();
}

public sealed class Pending : IOrderState
{
    public IOrderState Pay() => new Paid();
    public IOrderState Ship() => throw new InvalidOperationException("Pay first.");
    public IOrderState Cancel() => new Cancelled();
}

public sealed class Paid : IOrderState
{
    public IOrderState Pay() => throw new InvalidOperationException("Already paid.");
    public IOrderState Ship() => new Shipped();
    public IOrderState Cancel() => new Cancelled(); // and issue a refund
}

public sealed class Shipped : IOrderState
{
    public IOrderState Pay() => throw new InvalidOperationException("Already paid.");
    public IOrderState Ship() => throw new InvalidOperationException("Already shipped.");
    public IOrderState Cancel() => throw new InvalidOperationException("Too late.");
}

public sealed class Cancelled : IOrderState
{
    public IOrderState Pay() => throw new InvalidOperationException("Cancelled.");
    public IOrderState Ship() => throw new InvalidOperationException("Cancelled.");
    public IOrderState Cancel() => this;
}

public sealed class Order
{
    private IOrderState _state = new Pending();

    public string Status => _state.GetType().Name;

    // The order swaps its own state; callers just call Pay, Ship, Cancel.
    public void Pay() => _state = _state.Pay();
    public void Ship() => _state = _state.Ship();
    public void Cancel() => _state = _state.Cancel();
}`,
    inTheWild: [
      "Connections: `DbConnection.State` (Closed, Connecting, Open) decides which calls are legal, and TCP's lifecycle (LISTEN, SYN_SENT, ESTABLISHED, TIME_WAIT) is the textbook state machine.",
      "Workflow libraries such as Stateless for .NET, and Durable Functions orchestrations, model states and transitions explicitly.",
      "This app: each recognition drill is a three state machine (answering, showing feedback, finished) kept in two React state variables rather than state classes, which is the right call for three states.",
    ],
    interview:
      "State usually arrives as design a vending machine, design an elevator, or model an order lifecycle. Draw the states and transitions first, then show that each state class owns its transitions so illegal moves fail in one obvious place. The follow up is Strategy versus State: the class diagram is the same, but states know about each other and trigger transitions, while strategies are independent and chosen from outside.",
    confusedWith:
      "Strategy: in Strategy the client picks the algorithm; in State the states pick each other as events arrive.",
  },
  {
    name: "Template Method",
    family: "behavioral",
    intent:
      "Fix the skeleton of an algorithm in a base class and let subclasses fill in specific steps without changing the overall order.",
    useWhen: [
      "Several classes run the same sequence of steps and differ in one or two of them (import: read, parse, validate, save).",
      "The base class must enforce the order and the invariant steps, such as logging, transactions or cleanup.",
      "Framework code calls your code at fixed hook points.",
    ],
    avoidWhen: [
      "The varying step could be passed in as an object or delegate (Strategy). Inheritance couples tightly, and C# allows only one base class.",
      "Subclasses start overriding the skeleton itself or need to skip steps. The template has the wrong shape.",
    ],
    structure: `DataImporter (abstract)
+ Import(path)      <- the template, not virtual
    lines = File.ReadAllLines(path)
    rows  = Parse(lines)      abstract step
    Validate(rows)            virtual hook
    Save(rows)                fixed step
        ^
        |
  CsvImporter          TsvImporter
  override Parse()     override Parse()`,
    code: `public abstract class DataImporter
{
    // The template method: fixed order, deliberately not virtual.
    public void Import(string path)
    {
        var lines = File.ReadAllLines(path);
        var rows = Parse(lines); // the step that varies
        Validate(rows);          // an optional hook
        Save(rows);              // a fixed step
    }

    protected abstract IReadOnlyList<Customer> Parse(string[] lines);

    protected virtual void Validate(IReadOnlyList<Customer> rows)
    {
        if (rows.Count == 0) throw new InvalidDataException("No rows.");
    }

    private void Save(IReadOnlyList<Customer> rows) { /* write to the database */ }
}

public sealed class CsvImporter : DataImporter
{
    protected override IReadOnlyList<Customer> Parse(string[] lines) =>
        lines.Select(line => line.Split(','))
             .Select(f => new Customer(f[0], f[1]))
             .ToList();
}`,
    inTheWild: [
      "`BackgroundService` in ASP.NET Core: `StartAsync` and `StopAsync` are written once in the base class and call your `ExecuteAsync` override at the right time.",
      "EF Core's `DbContext` calls your `OnModelCreating` and `OnConfiguring` overrides at fixed points; an app's own DbContext subclass overrides OnModelCreating to describe its tables.",
      "`Stream`: the base class implements helpers such as `CopyTo` and `ReadByte` in terms of the abstract `Read` that each concrete stream provides.",
    ],
    interview:
      "Contrast it with Strategy, which solves the same problem through composition. Template Method varies steps through inheritance (fixed at compile time, one base class); Strategy varies them through an injected object (swappable at runtime). Saying you would prefer Strategy unless the base class must enforce the order shows you know the composition over inheritance argument. You can also mention the Hollywood principle: don't call us, we'll call you.",
    confusedWith:
      "Strategy: Template Method varies a step by subclassing; Strategy varies it by passing in an object. (Factory Method is a Template Method whose varying step creates an object.)",
  },
  {
    name: "Iterator",
    family: "behavioral",
    intent: "Walk through the elements of a collection one at a time without exposing how the collection is stored.",
    useWhen: [
      "Callers should loop over your data without knowing whether it is an array, a tree, a paged API or a file.",
      "Elements should be produced lazily: huge or infinite sequences, or results streamed as they arrive.",
      "One structure needs several traversal orders (in order, level order).",
    ],
    avoidWhen: [
      "Hand writing an enumerator class in C#. `yield return` generates the state machine for you.",
      "Callers need random access or a count. Expose `IReadOnlyList<T>` instead of forcing a walk.",
      "A lazy `IEnumerable` over a database query is looped twice. It runs the query twice; materialize it once with `ToList()`.",
    ],
    structure: `IEnumerable<T>                IEnumerator<T>
+ GetEnumerator() ----------> + MoveNext(): bool
     ^                        + Current: T
     |                             ^
BinaryTree<T>                      |
(nodes stay private)        generated by the
                            compiler from yield

foreach (var x in tree) ...  only ever sees
                             MoveNext and Current`,
    code: `public sealed class TreeNode<T>(T value, TreeNode<T>? left = null, TreeNode<T>? right = null)
{
    public T Value => value;
    public TreeNode<T>? Left => left;
    public TreeNode<T>? Right => right;
}

public sealed class BinaryTree<T>(TreeNode<T>? root) : IEnumerable<T>
{
    // In order traversal, one element per MoveNext. The compiler turns
    // this method into an IEnumerator<T> state machine.
    public IEnumerator<T> GetEnumerator()
    {
        var stack = new Stack<TreeNode<T>>();
        var node = root;
        while (node is not null || stack.Count > 0)
        {
            while (node is not null)
            {
                stack.Push(node);
                node = node.Left;
            }
            node = stack.Pop();
            yield return node.Value;
            node = node.Right;
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

foreach (var value in tree) Console.WriteLine(value); // never sees a node`,
    inTheWild: [
      "`IEnumerable<T>` and `IEnumerator<T>`: every `foreach` and every LINQ operator is built on this pattern, and `yield return` writes the iterator for you.",
      "`IAsyncEnumerable<T>` with `await foreach`, which EF Core and gRPC streaming use to hand you rows as they arrive.",
      "This app: `useStepScrubber` walks a lesson's visualizer steps with next, previous and play, and the visualizer never knows how those steps were produced.",
    ],
    interview:
      "Iterator questions usually arrive as coding problems: implement an iterator over a binary search tree (LeetCode 173) or flatten a nested list iterator. The expected answer is the explicit stack shown here, with O(h) memory, not a full traversal copied into a list. In C# discussions, know what deferred execution means and why calling `ToList()` once avoids running a query twice.",
    confusedWith: "Composite: Composite is the tree itself; Iterator is how you walk it without exposing it.",
  },
  {
    name: "Chain of Responsibility",
    family: "behavioral",
    intent: "Pass a request along a chain of handlers, where each handler either deals with it, passes it on, or both.",
    useWhen: [
      "A request goes through a sequence of independent checks or transformations: authentication, validation, rate limiting, logging.",
      "Which handler deals with a request is decided at runtime (support escalation, approval limits).",
      "Steps should be added, removed or reordered without changing the others.",
    ],
    avoidWhen: [
      "Every request must be handled and the chain could silently drop one. Add a terminal handler or an explicit failure.",
      "The order matters but is not obvious from the setup code. Long chains are hard to debug.",
      "There is only one handler.",
    ],
    structure: `request
   |
   v
[ ApiKey ] -next-> [ RateLimit ] -next-> [ Endpoint ]
   |                    |
   may stop:            may stop:
   401                  429

Each handler does its work, then calls next (or does not).`,
    code: `// ASP.NET Core middleware is this pattern. Each component receives
// the next delegate and decides whether to call it.
app.Use(async (context, next) =>
{
    if (!context.Request.Headers.ContainsKey("X-Api-Key"))
    {
        context.Response.StatusCode = 401; // handled here: the chain stops
        return;
    }
    await next(context);                   // not mine: pass it on
});
app.UseRateLimiter();
app.MapGet("/orders", () => "ok");

// The same idea by hand, for an approval workflow.
public abstract class Approver
{
    private Approver? _next;

    public Approver SetNext(Approver next)
    {
        _next = next;
        return next;
    }

    public string Approve(decimal amount) =>
        CanApprove(amount)
            ? $"{GetType().Name} approved {amount:C}"
            : _next?.Approve(amount) ?? "Nobody can approve this amount";

    protected abstract bool CanApprove(decimal amount);
}

public sealed class TeamLead : Approver
{
    protected override bool CanApprove(decimal amount) => amount <= 1_000;
}

public sealed class Director : Approver
{
    protected override bool CanApprove(decimal amount) => amount <= 50_000;
}

var chain = new TeamLead();
chain.SetNext(new Director());
chain.Approve(12_000); // "Director approved $12,000.00"`,
    inTheWild: [
      "ASP.NET Core middleware: a typical Program.cs chains `UseCors`, `UseDefaultFiles` and `UseStaticFiles`. Static files stops the chain when it finds a matching file; otherwise the request carries on to the API endpoints.",
      "`DelegatingHandler` pipelines in HttpClient: each handler calls `base.SendAsync` to pass the request on, or returns early (a cached response, a circuit breaker).",
      "Event bubbling in the browser DOM: a click goes from the target up through its ancestors until a handler calls `stopPropagation()`.",
    ],
    interview:
      "Middleware is the answer interviewers hope to hear. Explain that order matters (exception handling first, authentication before authorization) and that any middleware can short circuit. Distinguish it from Decorator: both wrap the next thing, but a decorator always delegates and adds behavior, while a chain handler may end the request. An API gateway's filter chain is the same pattern in system design.",
    confusedWith:
      "Decorator: every decorator forwards the call; a chain handler can handle the request and stop it there.",
  },
];

export function patternsIn(family: PatternFamily): PatternInfo[] {
  return PATTERNS.filter((p) => p.family === family);
}

export function familyOf(name: PatternName): PatternFamily {
  return PATTERNS.find((p) => p.name === name)!.family;
}

// ---------------------------------------------------------------------- SOLID

export interface SolidPrinciple {
  letter: string;
  name: string;
  rule: string;
  smell: string;
  before: string;
  after: string;
  whyBetter: string;
  inTheWild: string;
  interview: string;
}

export const SOLID: SolidPrinciple[] = [
  {
    letter: "S",
    name: "Single Responsibility",
    rule: "A class should have one reason to change: it should answer to one group of people with one kind of request.",
    smell:
      "The class name needs And or Manager to be honest. It imports both a database client and an email client. Finance and support would both file tickets that end in this file.",
    before: `public class InvoiceService
{
    public decimal CalculateTotal(Invoice invoice) =>
        invoice.Lines.Sum(l => l.Price * l.Quantity) * 1.13m;

    public void Save(Invoice invoice)
    {
        using var conn = new SqlConnection("Server=db;Database=billing");
        conn.Execute("INSERT INTO Invoices ...", invoice);
    }

    public void EmailToCustomer(Invoice invoice)
    {
        using var smtp = new SmtpClient("smtp.example.com");
        smtp.Send("billing@example.com", invoice.CustomerEmail,
            "Your invoice", $"Total: {CalculateTotal(invoice):C}");
    }
}`,
    after: `public class InvoiceCalculator
{
    private const decimal TaxRate = 0.13m;

    public decimal Total(Invoice invoice) =>
        invoice.Lines.Sum(l => l.Price * l.Quantity) * (1 + TaxRate);
}

public interface IInvoiceRepository { void Save(Invoice invoice); }
public interface IInvoiceSender { void Send(Invoice invoice, decimal total); }

// Coordinates the three; owns none of their details.
public class BillingService(
    InvoiceCalculator calculator,
    IInvoiceRepository repository,
    IInvoiceSender sender)
{
    public void Issue(Invoice invoice)
    {
        var total = calculator.Total(invoice);
        repository.Save(invoice);
        sender.Send(invoice, total);
    }
}`,
    whyBetter:
      "Tax rules, the database schema and the email template change for different reasons, on different schedules, at the request of different people. Now each change touches one class, and the tax math can be unit tested without a database or a mail server.",
    inTheWild:
      "This app: each lesson is its own class in `content/Tools`, the registry only lists them, and the exporter only writes them out as files. Changing a lesson's text never touches the exporter or the sidebar.",
    interview:
      "Single Responsibility is about reasons to change, not do one thing. A class with five small methods can satisfy it, and a single 300 line method can violate it. Asking who would request this change is the test interviewers want to hear.",
  },
  {
    letter: "O",
    name: "Open/Closed",
    rule: "Software should be open for extension but closed for modification: add behavior by adding code, not by editing code that already works.",
    smell:
      "A switch on a type or an enum that grows every time a feature ships, especially when the same switch is copied into several files.",
    before: `public enum DiscountType { None, Student, Senior, Employee }

public class PriceCalculator
{
    public decimal Final(decimal price, DiscountType type) => type switch
    {
        DiscountType.None => price,
        DiscountType.Student => price * 0.90m,
        DiscountType.Senior => price * 0.85m,
        DiscountType.Employee => price * 0.70m,
        // A new discount means editing this method, and every
        // other switch on DiscountType in the codebase.
        _ => throw new ArgumentOutOfRangeException(nameof(type)),
    };
}`,
    after: `public interface IDiscount
{
    decimal Apply(decimal price);
}

public sealed class NoDiscount : IDiscount
{
    public decimal Apply(decimal price) => price;
}

public sealed class StudentDiscount : IDiscount
{
    public decimal Apply(decimal price) => price * 0.90m;
}

public sealed class SeniorDiscount : IDiscount
{
    public decimal Apply(decimal price) => price * 0.85m;
}

// A BlackFridayDiscount is one new class. This method never changes.
public class PriceCalculator
{
    public decimal Final(decimal price, IDiscount discount) => discount.Apply(price);
}`,
    whyBetter:
      "Tested code stays untouched when a new discount ships, so it cannot break. This is exactly the Strategy pattern, and it is the reason Strategy exists.",
    inTheWild:
      "This app: adding a lesson is a new ITool class plus one registry line, and the exporter and sidebar never change. ToolView's list of `toolKind` cases is the one place that does grow, a deliberate, contained tradeoff.",
    interview:
      "Do not claim code can be closed to every change. The skill is predicting the likely axis of change (new discount types) and making that axis cheap. One switch inside one factory is fine; the same switch copied in five places is the smell.",
  },
  {
    letter: "L",
    name: "Liskov Substitution",
    rule: "Anything that works with a base type must keep working, unchanged, when handed any subtype of it.",
    smell:
      "An override that throws NotSupportedException, does nothing, or accepts fewer inputs than the base. Callers that check `if (x is SomeSubtype)` before calling a method.",
    before: `public class Rectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }
    public int Area => Width * Height;
}

public class Square : Rectangle
{
    // A square must keep its sides equal, so setting one sets both.
    public override int Width
    {
        set { base.Width = value; base.Height = value; }
    }
    public override int Height
    {
        set { base.Width = value; base.Height = value; }
    }
}

static void Stretch(Rectangle r)
{
    r.Width = 5;
    r.Height = 4;
    Debug.Assert(r.Area == 20); // fails for a Square: Area is 16
}`,
    after: `public interface IShape
{
    int Area { get; }
}

// Immutable, and neither type promises the other's behavior.
public sealed record Rectangle(int Width, int Height) : IShape
{
    public int Area => Width * Height;
}

public sealed record Square(int Side) : IShape
{
    public int Area => Side * Side;
}

// Code that resizes works with Rectangle explicitly. Code that only
// needs an area takes IShape, and every IShape keeps that promise.
static int TotalArea(IEnumerable<IShape> shapes) => shapes.Sum(s => s.Area);`,
    whyBetter:
      "Inheritance promises behavior, not just a set of method names. A Square cannot keep Rectangle's promise that width and height change independently, so it should not inherit from it. With a shared interface that promises only what both can deliver, substitution is always safe.",
    inTheWild:
      ".NET's own cautionary tale: arrays are covariant, so `object[] items = new string[1]; items[0] = 42;` compiles and then throws ArrayTypeMismatchException. A `ReadOnlyCollection<T>` passed around as `IList<T>` throws on Add, the same smell, which is why `ICollection<T>.IsReadOnly` exists.",
    interview:
      "Rectangle and Square is the expected example. The stronger answer states the rule behind it: a subtype may not demand more from callers (stronger preconditions), deliver less (weaker postconditions) or throw new exceptions for inherited operations. If you need `is` checks before calling a method, the hierarchy is wrong.",
  },
  {
    letter: "I",
    name: "Interface Segregation",
    rule: "No client should be forced to depend on methods it does not use. Prefer several small, role shaped interfaces over one large one.",
    smell:
      "Implementations full of `throw new NotImplementedException()`. Test fakes that must stub ten members to test one. A change to a method breaks classes that never call it.",
    before: `public interface IMachine
{
    void Print(Document doc);
    void Scan(Document doc);
    void Fax(Document doc);
}

public class BasicPrinter : IMachine
{
    public void Print(Document doc) { /* prints */ }

    // Forced to promise things it cannot do.
    public void Scan(Document doc) => throw new NotImplementedException();
    public void Fax(Document doc) => throw new NotImplementedException();
}`,
    after: `public interface IPrinter { void Print(Document doc); }
public interface IScanner { void Scan(Document doc); }
public interface IFax { void Fax(Document doc); }

public class BasicPrinter : IPrinter
{
    public void Print(Document doc) { /* prints */ }
}

public class OfficeMachine : IPrinter, IScanner, IFax
{
    public void Print(Document doc) { /* ... */ }
    public void Scan(Document doc) { /* ... */ }
    public void Fax(Document doc) { /* ... */ }
}

// Each consumer asks for only what it uses.
public class InvoicePrinting(IPrinter printer)
{
    public void PrintAll(IEnumerable<Document> docs)
    {
        foreach (var doc in docs) printer.Print(doc);
    }
}`,
    whyBetter:
      "A class only promises what it can actually do, and each consumer depends on the smallest contract that works for it. Test fakes shrink to one method, and adding a fax feature cannot break the printing code.",
    inTheWild:
      ".NET's collection interfaces are segregated this way: `IEnumerable<T>` (iterate), `IReadOnlyCollection<T>` (plus Count), `IReadOnlyList<T>` (plus indexing), `ICollection<T>` (plus mutation). A method that only loops should accept IEnumerable<T>. In this app, ITool and IConcept are separate interfaces because tools have no tests or editor; ITool.cs explains why.",
    interview:
      "Role interfaces (named for what a client needs, like IPrinter) beat header interfaces (one interface that mirrors a whole class). Mention the balance too: splitting every interface into single methods is overkill. Split where different clients really need different things.",
  },
  {
    letter: "D",
    name: "Dependency Inversion",
    rule: "High level policy should depend on abstractions, not on low level details. The details implement abstractions that the policy owns.",
    smell:
      "`new SqlConnection`, `new SmtpClient`, `DateTime.Now` or `File.` calls inside business logic. You cannot unit test the class without a real database, network or clock.",
    before: `public class SubscriptionService
{
    public void Renew(int userId)
    {
        var repo = new SqlUserRepository("Server=prod;Database=app"); // concrete
        var user = repo.Get(userId);

        if (user.PaidUntil < DateTime.UtcNow)                        // hidden clock
            user.PaidUntil = DateTime.UtcNow.AddMonths(1);

        repo.Save(user);
        new SmtpEmailSender().Send(user.Email, "Renewed");          // concrete
    }
}`,
    after: `// The abstractions belong to the high level code that needs them.
public interface IUserRepository
{
    User Get(int id);
    void Save(User user);
}

public interface IEmailSender
{
    void Send(string to, string message);
}

public class SubscriptionService(IUserRepository users, IEmailSender email, TimeProvider clock)
{
    public void Renew(int userId)
    {
        var user = users.Get(userId);
        var now = clock.GetUtcNow().UtcDateTime;
        if (user.PaidUntil < now) user.PaidUntil = now.AddMonths(1);

        users.Save(user);
        email.Send(user.Email, "Renewed");
    }
}

// The composition root (Program.cs) is the only place naming concrete classes.
builder.Services.AddScoped<IUserRepository, SqlUserRepository>();
builder.Services.AddSingleton<IEmailSender, SmtpEmailSender>();
builder.Services.AddSingleton(TimeProvider.System);`,
    whyBetter:
      "The business rule no longer knows about SQL, SMTP or the system clock. Tests pass fakes (including a fake TimeProvider to test a renewal at the end of a month), and swapping the email provider is a one line change in Program.cs.",
    inTheWild:
      "ASP.NET Core: Program.cs registers services such as a DbContext with the container, and endpoints receive them as parameters instead of constructing them. Services & Dependency Injection walks through the same idea.",
    interview:
      "Separate the three terms interviewers hear mixed up: Dependency Inversion is the principle (depend on abstractions you own), Dependency Injection is the technique (pass dependencies in), and the DI container is the tool that automates it. Ownership is the subtle part: the interface lives with the code that uses it, not with the implementation.",
  },
];

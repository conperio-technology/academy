import { useState } from "react";
import { openLesson } from "../../api";
import { shuffle } from "../../random";
import { CodeTabs } from "./concurrencyShared";

// Part 1: one OrderService and each kind of double for its dependencies, in xUnit.
// Part 2: a "which test double is this?" quiz in the same card style as the design
// pattern quiz, reshuffled on every run.

const SERVICE = `public class OrderService(
    IPaymentGateway payments,
    IOrderRepository orders,
    IEmailSender email,
    ILogger<OrderService> log)
{
    public async Task<OrderResult> PlaceAsync(Order order)
    {
        var charge = await payments.ChargeAsync(order.CustomerId, order.Total);
        if (!charge.Succeeded)
        {
            log.LogInformation("Declined: {Reason}", charge.Reason);
            return OrderResult.Declined;
        }

        await orders.SaveAsync(order);
        await email.SendAsync(order.CustomerEmail, "Order confirmed");
        return OrderResult.Placed;
    }
}`;

const DOUBLES = [
  {
    label: "Dummy",
    code: `// The constructor needs a logger; this test doesn't care what it logs.
var log = NullLogger<OrderService>.Instance;`,
    note: "A dummy fills a parameter and plays no part in what the test checks. NullLogger accepts every call and does nothing. If a dummy ends up mattering to the outcome, it's really something else.",
  },
  {
    label: "Stub",
    code: `class DecliningGateway : IPaymentGateway
{
    public Task<ChargeResult> ChargeAsync(int customerId, decimal amount)
        => Task.FromResult(ChargeResult.Failed("card declined"));
}

[Fact]
public async Task PlaceAsync_CardDeclined_ReturnsDeclined()
{
    var service = new OrderService(new DecliningGateway(),
        new InMemoryOrderRepository(), new SpyEmailSender(),
        NullLogger<OrderService>.Instance);

    var result = await service.PlaceAsync(SampleOrder());

    Assert.Equal(OrderResult.Declined, result);   // check the output
}`,
    note: "A stub returns canned answers to steer the code down one path. The assertion is on the result (state verification), never on the stub.",
  },
  {
    label: "Spy",
    code: `class SpyEmailSender : IEmailSender
{
    public List<(string To, string Subject)> Sent { get; } = [];

    public Task SendAsync(string to, string subject)
    {
        Sent.Add((to, subject));
        return Task.CompletedTask;
    }
}

// ...arrange with an approving gateway, act...

var sent = Assert.Single(spy.Sent);
Assert.Equal("ana@example.com", sent.To);`,
    note: "A spy records the calls it receives, and the test inspects the record after the act step. It verifies behaviour, but after the fact and with ordinary asserts.",
  },
  {
    label: "Mock (Moq)",
    code: `var email = new Mock<IEmailSender>(MockBehavior.Strict);
email.Setup(e => e.SendAsync("ana@example.com", "Order confirmed"))
     .Returns(Task.CompletedTask)
     .Verifiable();

var gateway = new Mock<IPaymentGateway>();
gateway.Setup(g => g.ChargeAsync(It.IsAny<int>(), It.IsAny<decimal>()))
       .ReturnsAsync(ChargeResult.Ok());          // used as a stub

var service = new OrderService(gateway.Object, new InMemoryOrderRepository(),
    email.Object, NullLogger<OrderService>.Instance);

await service.PlaceAsync(SampleOrder());

email.Verify();   // fails if the expected call didn't happen`,
    note: "A mock is told up front which calls to expect; verifying fails the test if they didn't happen, and a strict mock also fails on any call it wasn't told about. Note that gateway is a Moq Mock object used purely as a stub: the library's name doesn't decide the role. The common email.Verify(e => ..., Times.Once()) after the act is technically spy-style; most teams just call it mocking.",
  },
  {
    label: "Fake",
    code: `class InMemoryOrderRepository : IOrderRepository
{
    private readonly Dictionary<int, Order> _byId = [];

    public Task SaveAsync(Order order)
    {
        _byId[order.Id] = order;
        return Task.CompletedTask;
    }

    public Task<Order?> FindAsync(int id)
        => Task.FromResult(_byId.GetValueOrDefault(id));
}

// It really works, so the test checks the resulting state:
Assert.NotNull(await repo.FindAsync(order.Id));`,
    note: "A fake is a working implementation with a shortcut that makes it unfit for production: memory instead of a database. Other common fakes: SQLite in memory for EF Core, FakeTimeProvider for the clock, a local fake SMTP server.",
  },
  {
    label: "NSubstitute",
    code: `var email = Substitute.For<IEmailSender>();
var gateway = Substitute.For<IPaymentGateway>();
gateway.ChargeAsync(default, default).ReturnsForAnyArgs(ChargeResult.Ok());

var service = new OrderService(gateway, new InMemoryOrderRepository(),
    email, NullLogger<OrderService>.Instance);
await service.PlaceAsync(SampleOrder());

await email.Received(1).SendAsync("ana@example.com", "Order confirmed");`,
    note: "The same test with NSubstitute: Returns for stubbing, Received to check interactions afterwards. Pick one library per codebase.",
  },
];

type Kind = "Dummy" | "Stub" | "Spy" | "Mock" | "Fake";
const KINDS: Kind[] = ["Dummy", "Stub", "Spy", "Mock", "Fake"];

interface Q {
  code: string;
  answer: Kind;
  why: string;
}

const QUESTIONS: Q[] = [
  {
    code: `var rates = new Mock<IExchangeRates>();
rates.Setup(r => r.GetRate("EUR")).Returns(1.1m);
var converter = new Converter(rates.Object);

decimal euros = converter.ToEuros(100m);

Assert.Equal(110m, euros);`,
    answer: "Stub",
    why: "It's a Moq Mock object, but all it does is supply a canned rate, and the assertion is on the output. Role, not library name, decides.",
  },
  {
    code: `var clock = new FakeTimeProvider(start);
var token = new ResetToken(clock, lifetime: TimeSpan.FromHours(24));

clock.Advance(TimeSpan.FromHours(25));

Assert.True(token.IsExpired);`,
    answer: "Fake",
    why: "FakeTimeProvider is a real, working TimeProvider whose time you control. That's why tests using it don't flake on the real clock.",
  },
  {
    code: `var service = new InvoiceService(repo, emailSender: null!);

decimal tax = service.CalculateTax(invoice);   // never sends email

Assert.Equal(21.00m, tax);`,
    answer: "Dummy",
    why: "The email sender only satisfies the constructor. Nothing in CalculateTax touches it.",
  },
  {
    code: `var audit = new Mock<IAuditLog>(MockBehavior.Strict);
audit.Setup(a => a.Record("refund", 42)).Verifiable();

refunds.Process(orderId: 42);

audit.Verify();`,
    answer: "Mock",
    why: "The expected interaction is declared before the act and verified after; a strict mock also rejects unexpected calls. The test passes or fails on what the code did to the audit log.",
  },
  {
    code: `class RecordingPublisher : IEventPublisher
{
    public List<object> Published { get; } = [];
    public void Publish(object e) => Published.Add(e);
}

shipping.Ship(order);

Assert.Contains(publisher.Published, e => e is OrderShipped);`,
    answer: "Spy",
    why: "It records what it was called with and the test inspects that record afterwards with a normal assert.",
  },
  {
    code: `services.AddDbContext<AppDb>(o =>
    o.UseSqlite(keepAliveConnection));   // "DataSource=:memory:"

await api.CreateCustomer("Ana");

Assert.Equal(1, await db.Customers.CountAsync());`,
    answer: "Fake",
    why: "An in-memory SQLite database is a real, working database standing in for SQL Server. It runs real SQL, though not SQL Server's dialect, so keep a few integration tests against the real engine.",
  },
  {
    code: `class FakeEmailSender : IEmailSender
{
    public List<string> To { get; } = [];
    public Task SendAsync(string to, string subject)
    {
        To.Add(to);
        return Task.CompletedTask;
    }
}

Assert.Equal(new[] { "ana@example.com" }, sender.To);`,
    answer: "Spy",
    why: "Despite its name. It doesn't do a simplified version of the real work; it records calls so the test can check them. Class names in test code are often loose.",
  },
  {
    code: `class AlwaysInStock : IInventory
{
    public bool InStock(int sku) => true;
}

var cart = new Cart(new AlwaysInStock());
cart.Add(sku: 7);

Assert.Single(cart.Lines);`,
    answer: "Stub",
    why: "A hand-written canned answer that steers the code down the in-stock path. The assertion is on the cart's state.",
  },
];

function DoubleQuiz() {
  const [order, setOrder] = useState<Q[]>(() => shuffle(QUESTIONS));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Kind | null>(null);
  const [missed, setMissed] = useState<{ q: Q; picked: Kind }[]>([]);
  const [correct, setCorrect] = useState(0);
  const done = index >= order.length;
  const q = order[index];

  function choose(k: Kind) {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setCorrect((c) => c + 1);
    else setMissed((m) => [...m, { q, picked: k }]);
  }

  function restart(qs: Q[]) {
    setOrder(shuffle(qs));
    setIndex(0);
    setPicked(null);
    setMissed([]);
    setCorrect(0);
  }

  if (done) {
    return (
      <div className="drill-card">
        <h3>
          Score: {correct} / {order.length}
        </h3>
        {missed.length === 0 ? (
          <p className="gate-note">A clean run.</p>
        ) : (
          <ul className="drill-misses">
            {missed.map((m, i) => (
              <li key={i}>
                You said {m.picked}, it was a {m.q.answer}: {m.q.why}
              </li>
            ))}
          </ul>
        )}
        <div className="darr-actions dp-actions">
          <button onClick={() => restart(QUESTIONS)}>Run all again</button>
          {missed.length > 0 && <button onClick={() => restart(missed.map((m) => m.q))}>Retry the ones I missed</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="drill-card">
      <div className="drill-progress">
        Question {index + 1} of {order.length}, score so far: {correct}
      </div>
      <pre className="algo-code dp-quiz-code">{q.code}</pre>
      <p className="gate-note">Which test double is this?</p>
      <div className="drill-options">
        {KINDS.map((k) => {
          const state = picked === null ? "" : k === q.answer ? "correct" : k === picked ? "wrong" : "dim";
          return (
            <button key={k} className={`drill-option ${state}`} onClick={() => choose(k)} disabled={picked !== null}>
              {k}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="drill-feedback">
          <p>
            <strong>{picked === q.answer ? "Correct." : `Not quite: it's a ${q.answer}.`}</strong>
          </p>
          <p>{q.why}</p>
          <div className="darr-actions">
            <button
              onClick={() => {
                setPicked(null);
                setIndex(index + 1);
              }}
            >
              {index + 1 < order.length ? "Next question" : "See results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TestDoubles() {
  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>The code under test</h3>
        <pre className="algo-code">{SERVICE}</pre>
        <p className="gate-note">
          Four dependencies, all injected through interfaces, which is what makes doubles possible. If OrderService created a SqlConnection itself,
          no test could replace it. Injection is covered in{" "}
          <button className="link-button" onClick={() => openLesson("services-dependency-injection")}>
            Services and Dependency Injection
          </button>
          .
        </p>
      </div>

      <div className="crypto-section">
        <h3>One double of each kind</h3>
        <CodeTabs samples={DOUBLES} />
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Double</th>
                <th>Does</th>
                <th>Test asserts on</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Dummy</td><td>nothing; fills a parameter</td><td>not involved</td></tr>
              <tr><td>Stub</td><td>returns canned answers</td><td>the code's output or state</td></tr>
              <tr><td>Spy</td><td>records calls (often also stubs)</td><td>the recorded calls, afterwards</td></tr>
              <tr><td>Mock</td><td>holds expected calls set up front</td><td>the interaction, via Verify</td></tr>
              <tr><td>Fake</td><td>really works, with a shortcut</td><td>the resulting state</td></tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Prefer state checks (stubs and fakes) and use interaction checks (spies and mocks) when the call itself is the requirement: the email
          must go out, the card must not be charged twice. Tests that verify every internal call break on every refactor.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Which test double is this?</h3>
        <DoubleQuiz />
      </div>
    </div>
  );
}

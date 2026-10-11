// Content for the object-oriented design (low-level design) walk-throughs. Same component and
// data model as the system design ones (DesignInterview.tsx, systemDesignInterviews.ts), with
// an OOD stage list instead: requirements and use cases, core objects, relationships (with a
// class diagram), key interfaces and methods, patterns and trade-offs, walking a scenario, and
// extensions. Model answers are in C#, the platform's main language.
//
// Model answer lines follow the same rules as the system design file, plus code blocks: a
// line starting with ``` opens a block and the next such line closes it. The code() helper
// below builds those lines from a template string so the samples stay readable here.

import type { DesignInterview, DesignStage, Diagram } from "./systemDesignInterviews";

export type OodId = "parkingLot" | "elevator" | "vendingMachine" | "ticketBooking" | "cardGame";

// One code block as model answer lines: an opening fence, the code with its common
// indentation removed, and a closing fence. Keep "${" and backslashes out of the samples,
// since this is a JS template string.
function code(src: string, lang = "csharp"): string[] {
  const lines = src.replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length));
  return ["```" + lang, ...lines.map((l) => l.slice(indent)), "```"];
}

// The OOD stage list. Names and timings are shared; instructions, points and answers are
// written per problem. 5 + 5 + 6 + 10 + 7 + 6 + 6 = 45 minutes.
const STAGES = {
  requirements: { name: "Requirements and use cases", minutes: 5 },
  objects: { name: "Core objects", minutes: 5 },
  relationships: { name: "Relationships", minutes: 6 },
  interfaces: { name: "Key interfaces and methods", minutes: 10 },
  patterns: { name: "Patterns and trade-offs", minutes: 7 },
  scenario: { name: "Walk a scenario", minutes: 6 },
  extensions: { name: "Extensions", minutes: 6 },
} as const;

function stage(
  id: keyof typeof STAGES,
  instruction: string,
  points: string[],
  model: string[],
  diagram?: Diagram,
): DesignStage {
  return { id, ...STAGES[id], instruction, points, model, diagram };
}

const OOD_REVIEW_TIP =
  "Look at the stages with the fewest ticks: those are the ones to rehearse. Most candidates lose points by " +
  "starting on classes before agreeing the use cases, by writing signatures without the one method that " +
  "holds the hard logic, and by redesigning from scratch when the interviewer adds a requirement.";

const parkingLot: DesignInterview = {
  id: "parkingLot",
  title: "Design a Parking Lot (OOD)",
  prompt:
    "\"Design the classes for a parking lot. It has several levels, spots of different sizes, and entry and exit " +
    "gates. Motorcycles, cars and trucks arrive; the system finds a spot, issues a ticket, and charges the driver " +
    "on the way out.\"",
  reviewTip: OOD_REVIEW_TIP,
  stages: [
    stage(
      "requirements",
      "Ask what the lot has to do before naming any class. Find the actors, list the use cases you'll support, " +
        "and say which ones you're leaving out. About 5 minutes.",
      [
        "Asks which vehicle types and spot sizes exist, and which vehicles may use which spots",
        "Asks how many levels and gates, and whether gates work at the same time",
        "Asks how pricing works: hourly, per vehicle type, a daily cap, where the driver pays",
        "Names the actors: driver, entry and exit gates, an admin who changes layout and rates",
        "Lists the use cases: park (issue a ticket), pay and exit (free the spot), show free spots",
        "Scopes out reservations, payment provider internals, plate recognition hardware and UI",
      ],
      [
        "Questions I'd ask: Which vehicles do we handle? What spot sizes are there, and can a car take a large spot if the compact ones are full? How many levels and gates, and can two gates issue tickets at the same instant? How is parking priced? Do drivers pay at the exit gate or at a kiosk? Do we need reservations or monthly passes?",
        "Assume: motorcycles, cars and trucks; small, compact and large spots; a vehicle may use any spot at least as big as it needs. Several levels, several entry and exit gates running at once. Hourly pricing by vehicle type with a daily cap, paid at the exit gate.",
        "Actors:",
        "- Driver: takes a ticket on entry, pays on exit.",
        "- Gates: entry gates ask for a spot and print tickets; exit gates take payment and open the barrier.",
        "- Admin: configures levels, spots and rates.",
        "Use cases I'll design for:",
        "- Park: find a suitable free spot, mark it taken, issue a ticket.",
        "- Exit: look up the ticket, compute the fee, take payment, free the spot.",
        "- Availability: free spots per level and size, for the signs at the entrance.",
        "Out of scope: reservations and passes (I'll come back to them as an extension), the card terminal's protocol, plate cameras, and any UI.",
      ],
    ),
    stage(
      "objects",
      "Turn the nouns from the requirements into classes, enums or interfaces, and give each one a single " +
        "responsibility you can say in a sentence. Say which nouns you're not turning into classes. About 5 minutes.",
      [
        "ParkingLot as the entry point, owning levels; Level owning spots",
        "ParkingSpot knows its size and occupant and whether a vehicle fits",
        "Ticket with fixed data (vehicle, spot, entry time) and a status that only the lot changes",
        "Vehicle type and spot size as enums, with a reason (they differ in data, not behaviour)",
        "Spot assignment and pricing pulled out into their own interfaces, not buried in the gate or the lot",
        "Avoids a god class that does assignment, pricing and payment in one place",
      ],
      [
        "Nouns from the requirements: lot, level, spot, vehicle, ticket, gate, rate, payment, sign. Not all of them deserve a class.",
        "- ParkingLot: the one object gates talk to. Holds the levels and the active tickets, and coordinates park and exit.",
        "- Level: a floor; owns its spots and answers \"which spots are free\".",
        "- ParkingSpot: id, size, current occupant. Knows whether a given vehicle fits and enforces that it holds at most one.",
        "- Vehicle: plate and type. A record, because two vehicles with the same plate are the same vehicle.",
        "- Ticket: id, vehicle, spot, entry time, which never change once issued, plus a status (Active, PaymentPending, Closed) that only the lot moves. The status is what stops two exits from both charging the same ticket.",
        "- ISpotAssigner: decides which free spot a vehicle gets. A policy, so it's an interface.",
        "- IPricingPolicy: computes the fee for a ticket at a given exit time.",
        "- IPayment: the card terminal at a gate, behind an interface so tests don't need hardware.",
        "VehicleType and SpotSize are enums. A Car, Motorcycle and Truck class hierarchy would only carry a size; until they behave differently, subclasses add types without adding behaviour. If the interviewer wants the hierarchy, it's a small change: an abstract Vehicle with a RequiredSize property.",
        "Gates are thin: they call the lot and drive the barrier. I'm not making a ParkingManager; ParkingLot already is the coordinator, and a second one would split its job in two.",
      ],
    ),
    stage(
      "relationships",
      "Sketch the class diagram: who owns whom, who only refers to whom, where inheritance or interface " +
        "implementation appears, and the multiplicity on each line. About 6 minutes.",
      [
        "Lot has many levels, level has many spots: composition, the parts don't outlive the whole",
        "Ticket refers to one vehicle and one spot: association, it doesn't own them",
        "A spot holds zero or one vehicle",
        "Interfaces for assignment and pricing, with concrete implementations behind them",
        "Explains why spot sizes are not subclasses (no extra behaviour), and when a subclass or component would be justified",
        "Gates depend on the lot, not on levels or spots directly",
      ],
      [
        "Composition down the physical tree: a ParkingLot has one or more Levels, each Level has many ParkingSpots. They're created with the lot and go away with it.",
        "Association for tickets: a Ticket points at exactly one Vehicle and one ParkingSpot but owns neither. The lot keeps active tickets in a dictionary by id.",
        "A ParkingSpot holds zero or one Vehicle at a time. That rule lives in the spot itself, not in the code that calls it.",
        "Interfaces: ParkingLot depends on ISpotAssigner and IPricingPolicy, given to it in the constructor. NearestFirstAssigner and HourlyPricing are the first implementations.",
        "No inheritance between spot types. CompactSpot extends ParkingSpot would add a class and no behaviour. If a spot type ever gains behaviour, like an EV charger, I'd give the spot an optional charger component rather than subclass it, so a spot can be large and have a charger without a LargeElectricSpot class.",
        "Gates only know the ParkingLot. They never reach into a Level or a spot, so the lot's internal layout can change without touching gate code.",
      ],
      {
        nodes: [
          { id: "entry", label: "EntryGate", col: 0 },
          { id: "exit", label: "ExitGate", col: 0 },
          { id: "lot", label: "ParkingLot", col: 1, sub: "coordinator" },
          { id: "assigner", label: "ISpotAssigner", col: 2, sub: "interface" },
          { id: "level", label: "Level", col: 2 },
          { id: "ticket", label: "Ticket", col: 2, sub: "status" },
          { id: "pricing", label: "IPricingPolicy", col: 2, sub: "interface" },
          { id: "nearest", label: "NearestFirst", col: 3, sub: "assigner" },
          { id: "spot", label: "ParkingSpot", col: 3, sub: "size, occupant" },
          { id: "vehicle", label: "Vehicle", col: 3, sub: "plate, type" },
          { id: "hourly", label: "HourlyPricing", col: 3, sub: "pricing" },
        ],
        edges: [
          { from: "entry", to: "lot", label: "uses" },
          { from: "exit", to: "lot", label: "uses" },
          { from: "lot", to: "assigner", label: "uses" },
          { from: "lot", to: "level", label: "has 1..*" },
          { from: "lot", to: "ticket", label: "issues" },
          { from: "lot", to: "pricing", label: "uses" },
          { from: "nearest", to: "assigner", label: "implements" },
          { from: "level", to: "spot", label: "has many" },
          { from: "ticket", to: "vehicle", label: "for 1" },
          { from: "spot", to: "vehicle", label: "holds 0..1" },
          { from: "hourly", to: "pricing", label: "implements" },
        ],
      },
    ),
    stage(
      "interfaces",
      "Write the signatures for the main classes, then the body of the one or two methods that hold the real " +
        "logic. Here that's parking (find, occupy, issue a ticket without two gates taking the same spot) and " +
        "exiting. About 10 minutes.",
      [
        "Spot.Fits expresses the size rule in one place",
        "Occupy refuses a taken spot, so a bug elsewhere can't put two vehicles in one spot",
        "Park finds and occupies the spot under one lock, so two gates can't get the same spot",
        "Assigner and pricing injected through the constructor; a clock injected for testable fees",
        "Exit claims the ticket under the lock (Active to PaymentPending), so only one exit can charge it",
        "Exit computes the fee and takes payment without holding the lock during the slow card call",
        "The spot is released only on the move to Closed; a payment idempotency key makes retries safe",
        "Clear failure paths: lot full, unknown ticket, already being processed, and a declined payment that puts the ticket back to Active with the spot still occupied",
      ],
      [
        "Data types first, then the lot. Members are internal where only the lot should call them.",
        ...code(`
          public enum VehicleType { Motorcycle, Car, Truck }
          public enum SpotSize { Small, Compact, Large }

          public enum TicketStatus { Active, PaymentPending, Closed }
          public enum ExitResult { Paid, Declined, AlreadyBeingProcessed }

          public sealed record Vehicle(string Plate, VehicleType Type);

          public sealed class Ticket(Guid id, Vehicle vehicle, ParkingSpot spot, DateTimeOffset enteredAt)
          {
              public Guid Id { get; } = id;
              public Vehicle Vehicle { get; } = vehicle;
              public ParkingSpot Spot { get; } = spot;
              public DateTimeOffset EnteredAt { get; } = enteredAt;
              public TicketStatus Status { get; internal set; } = TicketStatus.Active;  // changed only under the lot's lock
              public int PaymentAttempt { get; internal set; }
          }

          public sealed class ParkingSpot(string id, SpotSize size)
          {
              public string Id { get; } = id;
              public SpotSize Size { get; } = size;
              public Vehicle? Occupant { get; private set; }
              public bool IsFree => Occupant is null;

              public bool Fits(Vehicle v) => v.Type switch
              {
                  VehicleType.Motorcycle => true,
                  VehicleType.Car => Size >= SpotSize.Compact,
                  VehicleType.Truck => Size == SpotSize.Large,
                  _ => false,
              };

              internal void Occupy(Vehicle v)
              {
                  if (!IsFree) throw new InvalidOperationException($"Spot {Id} is taken");
                  Occupant = v;
              }

              internal void Release(Vehicle v)
              {
                  if (Occupant != v) throw new InvalidOperationException($"Spot {Id} isn't held by {v.Plate}");
                  Occupant = null;
              }
          }

          public sealed class Level(int number, IReadOnlyList<ParkingSpot> spots)
          {
              public int Number { get; } = number;
              public IEnumerable<ParkingSpot> FreeSpotsFor(Vehicle v) => spots.Where(s => s.IsFree && s.Fits(v));
          }

          public interface ISpotAssigner { ParkingSpot? FindSpot(IReadOnlyList<Level> levels, Vehicle v); }
          public interface IPricingPolicy { decimal Fee(Ticket ticket, DateTimeOffset exitAt); }
          public interface IPayment { bool Charge(decimal amount, string idempotencyKey); }
        `),
        "The lot. One lock covers \"find a free spot and take it\" and every change to a ticket's status. Two entry gates can race for a spot, and two exit calls can race for one ticket (a driver taps the card twice, or a gate retries after a timeout). A lot has a few thousand spots, so a scan under one lock is microseconds; I'd only split it per level if profiling showed contention.",
        ...code(`
          public sealed class ParkingLot(IReadOnlyList<Level> levels, ISpotAssigner assigner,
                                         IPricingPolicy pricing, TimeProvider clock)
          {
              private readonly Dictionary<Guid, Ticket> _active = new();
              private readonly object _lock = new();

              public Ticket Park(Vehicle v)
              {
                  lock (_lock)
                  {
                      var spot = assigner.FindSpot(levels, v) ?? throw new LotFullException(v.Type);
                      spot.Occupy(v);
                      var ticket = new Ticket(Guid.NewGuid(), v, spot, clock.GetUtcNow());
                      _active.Add(ticket.Id, ticket);
                      return ticket;
                  }
              }

              public ExitResult Exit(Guid ticketId, IPayment payment)
              {
                  Ticket ticket;
                  string paymentKey;
                  lock (_lock)
                  {
                      ticket = _active.GetValueOrDefault(ticketId) ?? throw new UnknownTicketException(ticketId);
                      if (ticket.Status != TicketStatus.Active) return ExitResult.AlreadyBeingProcessed;
                      ticket.Status = TicketStatus.PaymentPending;   // this call now owns the payment attempt
                      ticket.PaymentAttempt++;
                      paymentKey = ticket.Id + ":" + ticket.PaymentAttempt;
                  }

                  var fee = pricing.Fee(ticket, clock.GetUtcNow());
                  var paid = payment.Charge(fee, paymentKey);          // slow; no lock held

                  lock (_lock)
                  {
                      if (!paid)
                      {
                          ticket.Status = TicketStatus.Active;           // declined: spot stays taken, barrier stays down
                          return ExitResult.Declined;
                      }
                      ticket.Status = TicketStatus.Closed;
                      _active.Remove(ticketId);
                      ticket.Spot.Release(ticket.Vehicle);               // only on the move to Closed, so only once
                  }
                  return ExitResult.Paid;
              }
          }
        `),
        "The card charge happens outside the lock: a terminal that takes five seconds must not stop every other gate from issuing tickets. Because the lock is let go during the charge, Exit first claims the ticket by moving it from Active to PaymentPending under the lock. A second Exit for the same ticket, from a double tap or a retry, sees PaymentPending and gets \"already being processed\" instead of charging again. Only the move to Closed frees the spot, so Release runs once per ticket and can't clear a vehicle that parked there later; Release also checks the occupant as a second guard. A decline puts the ticket back to Active.",
        "Retries: the payment key is the ticket id plus the attempt number, and the card provider stores it, so if a gate times out and resends the same request, the provider returns the first result instead of charging twice. A timeout is not a decline, because the money may have moved: the ticket stays PaymentPending until a retry with the same key, or a lookup by that key, settles it. A new card after a decline is a new attempt with a new key. TimeProvider (built into .NET 8) is injected so a test can move time forward and check the fee.",
      ],
    ),
    stage(
      "patterns",
      "Name the patterns you used and the ones you decided against, each with a reason. Mention the design " +
        "principles they serve without lecturing. About 7 minutes.",
      [
        "Strategy for spot assignment and pricing, so new rules are new classes",
        "ParkingLot acts as a facade for the gates",
        "Rejects a static Singleton for the lot in favour of one instance wired by DI",
        "Observer (events) for availability signs instead of signs polling the lot",
        "Enums over subclasses for vehicle and spot types, with the condition that would change that",
        "Locking: one coarse lock plus a ticket status, and what would make it finer",
      ],
      [
        "- Strategy: ISpotAssigner and IPricingPolicy. Nearest-to-entrance, fill-from-the-top, or keep-large-spots-for-trucks are different assigners; weekend rates or a flat event price are different pricing policies. ParkingLot doesn't change for any of them (Open/Closed in practice, not as a slogan).",
        "- Facade: gates call Park and Exit and nothing else. They don't know levels exist.",
        "- Observer: the lot raises a SpotChanged event after Occupy and Release; the signs on each floor subscribe and keep their own counts. The lot doesn't know signs exist, and adding a mobile app feed is another subscriber.",
        "- Dependency injection: the assigner, pricing and clock come in through the constructor, which is what makes the fee logic testable without waiting an hour.",
        "Rejected:",
        "- Singleton ParkingLot. There's one lot per process, but a static instance makes tests share state and makes a second site (a company that runs ten lots) a rewrite. One instance registered in the DI container gives the same \"only one\" without the global.",
        "- A class per vehicle and per spot size. No behaviour differs, so it would be hierarchy for its own sake.",
        "- A State pattern for spots. A spot is free or taken; a nullable occupant says that fully.",
        "- A State pattern for tickets. Three statuses whose transitions all happen inside Exit fit an enum; state classes would spread a few lines across several files.",
        "Trade-off I'd say out loud: the coarse lock is simple, and it's correct only together with the ticket status. The lock can't be held across the card charge without blocking every gate, and once it's let go mid-operation, the status is what tells a second caller the work is already claimed. If one lot had many gates and heavy traffic, I'd keep a ConcurrentQueue of free spots per (level, size) and TryDequeue from it, which removes the scan and the lock but makes \"nearest spot\" harder to honour.",
      ],
    ),
    stage(
      "scenario",
      "Pick one use case and walk it through your classes method by method, with concrete values. This is " +
        "where gaps in the design show up. About 6 minutes.",
      [
        "Walks entry: gate calls Park, assigner picks a spot, Occupy, ticket returned and printed",
        "The assigner prefers the smallest spot that fits, so a car doesn't take a truck spot needlessly",
        "Shows the sign update coming from the event, not from the gate",
        "Walks exit with a real fee calculation, including rounding and the cap",
        "Covers a failure path: declined card, lost ticket or a full lot",
      ],
      [
        "A car, plate KX12 ABC, arrives at entry gate 2 at 09:00. Level 1's compact spots are full.",
        "- EntryGate.OnVehicleDetected calls lot.Park(new Vehicle(\"KX12 ABC\", VehicleType.Car)).",
        "- Inside the lock, NearestFirstAssigner walks levels in order and, on each, looks for the smallest size that fits: compact first, large only if no compact is free. Level 1 has no compact; level 2 has L2-C14.",
        "- L2-C14.Occupy(car) succeeds. The lot creates Ticket(id, car, L2-C14, 09:00), stores it in _active, and returns it. The SpotChanged event fires and the level 2 sign drops from 38 to 37 free compact spots.",
        "- The gate prints the ticket and raises the barrier.",
        "The driver leaves at 11:10 through exit gate 1.",
        "- ExitGate scans the ticket and calls lot.Exit(ticketId, terminal).",
        "- HourlyPricing.Fee: 2 hours 10 minutes rounds up to 3 started hours, at 4.00 per hour for a car = 12.00, under the 30.00 daily cap.",
        "- Under the lock, the ticket moves from Active to PaymentPending (attempt 1), and the lock is let go.",
        "- terminal.Charge(12.00, \"<ticket id>:1\") returns true. Under the lock the ticket becomes Closed and leaves _active, and L2-C14.Release(car) runs; the sign goes back to 38. Exit returns Paid.",
        "Failure paths: if the driver taps the card again while the first charge is running, the second Exit sees PaymentPending and returns AlreadyBeingProcessed, so nothing is charged twice. If the card is declined, Exit returns Declined, the ticket goes back to Active and the spot stays taken, so the driver can try another card (attempt 2, a new key). A lost ticket needs a lookup by plate, which this design doesn't have yet; that's a fair extension (an index from plate to active ticket, plus a lost-ticket fee in the pricing policy).",
      ],
    ),
    stage(
      "extensions",
      "The interviewer adds requirements. For each, say which classes change and which don't. A good design " +
        "absorbs most of them with a new class and a small edit. About 6 minutes.",
      [
        "EV charging spots: a charger component on the spot, an assigner rule, and a composite fee",
        "Monthly passes or reservations without rewriting Park",
        "Lost ticket: plate index and a pricing rule",
        "Higher concurrency: per-level locks or free-spot queues",
        "Multiple lots: one ParkingLot instance per site, no shared statics",
        "Names what the original design got wrong, if anything, instead of pretending it was perfect",
      ],
      [
        "\"We're adding EV spots that charge per kWh.\" ParkingSpot gets an optional IChargingPoint (composition, so any size can have one). Vehicle gets an IsElectric flag. The assigner gets a rule: only EVs use charger spots, unless the lot is nearly full. Pricing becomes a composite: a CompositePricing that sums the parking fee and the charging fee read from the charger. Park and Exit don't change.",
        "\"Monthly pass holders park for free in reserved spots.\" A pass registry (IPassRegistry) keyed by plate; spots get an optional ReservedFor. The assigner skips reserved spots for everyone else; a PassAwarePricing wraps the normal policy and returns zero for pass holders. Again, new classes plus one rule in the assigner.",
        "\"What if a driver loses the ticket?\" Add a plate index next to _active, updated in the same lock. ExitByPlate looks up the ticket, and the pricing policy charges the daily maximum for lost tickets, which is how real lots discourage it.",
        "\"Twenty gates at a stadium car park, all busy at once.\" First measure; the coarse lock is probably still fine. If not, lock per level and let the assigner try levels in order, or keep free-spot queues per (level, size) and take from them with TryDequeue.",
        "\"The company runs fifty lots.\" Nothing in the classes assumes one lot, because there's no Singleton or static state. Each site gets its own ParkingLot; a central service for reporting would read events, not call into lots.",
        "What I'd change in hindsight: Ticket holds a ParkingSpot reference. If tickets have to be stored in a database, it should hold the spot id instead, and the lot looks the spot up.",
      ],
    ),
  ],
};

const elevator: DesignInterview = {
  id: "elevator",
  title: "Design an Elevator System (OOD)",
  prompt:
    "\"Design the classes for the elevator system in an office building with N floors and M elevators. People " +
    "press up or down on a floor and choose a destination inside the car. Decide which elevator answers each " +
    "call and the order in which each car stops.\"",
  reviewTip: OOD_REVIEW_TIP,
  stages: [
    stage(
      "requirements",
      "Clarify what the controller has to do and what it's optimising for. Separate the two kinds of request " +
        "early, because the design splits along that line. About 5 minutes.",
      [
        "Separates hall calls (a floor plus a direction) from car calls (a destination pressed inside the car)",
        "Asks how many floors and cars, and about capacity or weight limits",
        "Asks what to optimise: waiting time, travel time, energy, and that no call waits forever",
        "Asks about special modes: fire service, maintenance, door held open",
        "Clarifies whether the design drives real hardware through events or a simulation with time steps",
        "Scopes out the motor control itself, displays and building access control",
      ],
      [
        "Questions I'd ask: How many floors and elevators? Do all cars serve all floors? What should we optimise: average wait, or the worst case? Is there a weight limit? What happens in a fire alarm or when a car is taken out for maintenance? Am I writing the controller for real hardware, or a simulation?",
        "Assume: 20 floors, 4 identical cars serving every floor. Minimise average wait, but never starve a call. Fire and maintenance modes exist; I'll design for them and implement normal operation. The controller is fed events (button pressed, car arrived at a floor) and the core logic advances in steps so it can be tested.",
        "Use cases:",
        "- A passenger on floor 7 presses Up: one car is assigned and eventually stops at 7 going up.",
        "- A passenger inside a car presses 15: that car adds 15 to its stops.",
        "- Each car serves its stops in an order that doesn't bounce up and down.",
        "- An operator takes a car out of service; its pending calls go to other cars.",
        "Out of scope: motor acceleration curves, door timing details, floor displays beyond \"they subscribe to position changes\", access cards.",
      ],
    ),
    stage(
      "objects",
      "List the classes and what each is responsible for. The key decision is where scheduling lives: which " +
        "car takes a call, versus the order one car visits its stops. About 5 minutes.",
      [
        "ElevatorSystem receives hall calls and owns the cars",
        "ElevatorCar owns its own stops, direction and current floor",
        "A dispatch strategy interface decides which car answers a hall call",
        "HallCall as a value type; Direction as an enum",
        "Hardware (motor, door) behind interfaces so the logic runs in tests",
        "Keeps \"which car\" and \"which order\" as separate responsibilities",
      ],
      [
        "- ElevatorSystem: the controller. Receives hall calls, asks the dispatcher which car takes each, and advances all cars each step.",
        "- ElevatorCar: one car. Knows its floor and direction, keeps its pending stops, decides its next move. Car calls go straight to it.",
        "- IDispatchStrategy: given a hall call and the cars, picks one. Nearest car first; zoning or destination dispatch later.",
        "- HallCall: a record of floor and direction.",
        "- Direction: Up, Down, Idle.",
        "- IMotor and IDoor: the hardware the car drives. Real implementations talk to the PLC; test fakes record calls.",
        "- CarPanel: the buttons inside a car; it just calls car.AddStop.",
        "The split that matters: the dispatcher decides which car, and the car decides the order of its own stops. If the dispatcher also ordered stops, every new dispatch policy would have to reimplement the sweep logic.",
        "Not classes: Building (it's just the floor count), Passenger (we never know who is in the car, only which buttons were pressed), Floor (a number is enough until floors have behaviour).",
      ],
    ),
    stage(
      "relationships",
      "Draw the class diagram with multiplicities. Show where the strategy plugs in and what each car " +
        "composes. About 6 minutes.",
      [
        "ElevatorSystem has many cars (composition) and uses one dispatch strategy",
        "Concrete strategies implement IDispatchStrategy",
        "Each car has one panel, one door and one motor",
        "Hall panels talk to the system, car panels talk to their car",
        "Hardware dependencies point at interfaces, not concrete drivers",
      ],
      [
        "ElevatorSystem has 1..M ElevatorCars, created with it. It holds one IDispatchStrategy, injected.",
        "NearestCarStrategy implements IDispatchStrategy; a ZoningStrategy would sit next to it.",
        "Each ElevatorCar has exactly one CarPanel, one IDoor and one IMotor. The car owns the panel; the door and motor are injected because they wrap hardware.",
        "HallPanel (one per floor) sends hall calls to the ElevatorSystem, never to a car directly: a floor button doesn't know which car will come. CarPanel sends to its own car only.",
        "No inheritance in the core. Different car behaviour (an express car, a service car) would come from configuration (served floors) or a different mode object, not from subclassing ElevatorCar.",
      ],
      {
        nodes: [
          { id: "hall", label: "HallPanel", col: 0, sub: "one per floor" },
          { id: "system", label: "ElevatorSystem", col: 1, sub: "controller" },
          { id: "strategy", label: "IDispatchStrategy", col: 2, sub: "interface" },
          { id: "car", label: "ElevatorCar", col: 2, sub: "floor, stops" },
          { id: "nearest", label: "NearestCar", col: 3, sub: "strategy" },
          { id: "panel", label: "CarPanel", col: 3, sub: "buttons inside" },
          { id: "motor", label: "IMotor", col: 3, sub: "hardware" },
          { id: "door", label: "IDoor", col: 3, sub: "hardware" },
        ],
        edges: [
          { from: "hall", to: "system", label: "hall call" },
          { from: "system", to: "strategy", label: "uses" },
          { from: "system", to: "car", label: "has 1..M" },
          { from: "nearest", to: "strategy", label: "implements" },
          { from: "car", to: "panel", label: "has 1" },
          { from: "car", to: "motor", label: "drives" },
          { from: "car", to: "door", label: "has 1" },
        ],
      },
    ),
    stage(
      "interfaces",
      "Write the car's stop handling and the dispatcher. The car's Step method (move one floor, stop if " +
        "needed, change direction when nothing is left ahead) is the part interviewers want to see. About 10 minutes.",
      [
        "Stops kept as two sorted sets, above and below the current floor",
        "Step continues in the current direction while stops remain ahead, then reverses or goes idle (LOOK)",
        "Dispatcher scores cars by distance, preferring idle cars or cars already heading that way",
        "Out-of-service cars are never chosen",
        "Button presses from many threads go through one control loop, so car state has a single writer",
        "Hardware called through IMotor and IDoor",
      ],
      [
        "The car keeps stops above it in an ascending set and stops below it in a descending one. While it moves up it only ever removes from the \"up\" set, so the invariant holds without extra checks.",
        ...code(`
          public enum Direction { Idle, Up, Down }
          public sealed record HallCall(int Floor, Direction Direction);

          public sealed class ElevatorCar(int id, IMotor motor, IDoor door)
          {
              private readonly SortedSet<int> _up = new();
              private readonly SortedSet<int> _down = new(Comparer<int>.Create((a, b) => b.CompareTo(a)));

              public int Id { get; } = id;
              public int Floor { get; private set; }
              public Direction Direction { get; private set; } = Direction.Idle;
              public bool InService { get; set; } = true;

              public void AddStop(int floor)
              {
                  if (floor > Floor) _up.Add(floor);
                  else if (floor < Floor) _down.Add(floor);
                  else door.Cycle();                       // already here: just open
              }

              // One floor of travel. The controller calls this on each tick (or on "arrived" events).
              public void Step()
              {
                  if (Direction == Direction.Idle)
                      Direction = _up.Count > 0 ? Direction.Up : _down.Count > 0 ? Direction.Down : Direction.Idle;
                  if (Direction == Direction.Idle) return;

                  var ahead = Direction == Direction.Up ? _up : _down;
                  var behind = Direction == Direction.Up ? _down : _up;

                  Floor += Direction == Direction.Up ? 1 : -1;
                  motor.MoveTo(Floor);
                  if (ahead.Remove(Floor)) door.Cycle();

                  if (ahead.Count == 0)
                      Direction = behind.Count > 0 ? Opposite(Direction) : Direction.Idle;
              }

              private static Direction Opposite(Direction d) => d == Direction.Up ? Direction.Down : Direction.Up;
          }
        `),
        "The dispatcher and the system. A car that's idle, or already moving towards the call in the call's direction, costs its distance; any other car gets a penalty of a full trip up and down the building.",
        ...code(`
          public interface IDispatchStrategy
          {
              ElevatorCar? Choose(HallCall call, IReadOnlyList<ElevatorCar> cars);
          }

          public sealed class NearestCarStrategy(int floors) : IDispatchStrategy
          {
              public ElevatorCar? Choose(HallCall call, IReadOnlyList<ElevatorCar> cars) =>
                  cars.Where(c => c.InService).MinBy(c => Cost(c, call));

              private int Cost(ElevatorCar c, HallCall call)
              {
                  int distance = Math.Abs(c.Floor - call.Floor);
                  bool onTheWay = c.Direction == Direction.Idle
                      || (c.Direction == Direction.Up && call.Direction == Direction.Up && call.Floor >= c.Floor)
                      || (c.Direction == Direction.Down && call.Direction == Direction.Down && call.Floor <= c.Floor);
                  return onTheWay ? distance : distance + 2 * floors;
              }
          }

          public sealed class ElevatorSystem(IReadOnlyList<ElevatorCar> cars, IDispatchStrategy strategy)
          {
              private readonly ConcurrentQueue<HallCall> _pending = new();

              public void RequestPickup(int floor, Direction dir) => _pending.Enqueue(new HallCall(floor, dir));

              // Runs on the single control thread: only this method touches car state.
              public void Tick()
              {
                  while (_pending.TryPeek(out var call))
                  {
                      var car = strategy.Choose(call, cars);
                      if (car is null) break;              // every car out of service: keep the call queued
                      _pending.TryDequeue(out _);
                      car.AddStop(call.Floor);
                  }
                  foreach (var car in cars) car.Step();
              }
          }
        `),
        "Car panel presses go through the same queue in a real build (a second queue of (carId, floor)), so AddStop is only ever called from the control thread. That's simpler and safer than a lock inside every car.",
      ],
    ),
    stage(
      "patterns",
      "Name the patterns and the alternatives you turned down. The State question comes up in almost every " +
        "elevator interview, so have a view on it. About 7 minutes.",
      [
        "Strategy for dispatch, so zoning or destination dispatch is a new class",
        "A considered answer on State pattern versus an enum for the car's mode",
        "Single-threaded control loop (an actor-like design) instead of locks spread across cars",
        "Observer for floor displays and monitoring",
        "Names the simplification in the stop sets (a down call can be picked up on the way up) and how to fix it",
      ],
      [
        "- Strategy: IDispatchStrategy. Nearest car, zoning (cars 1-2 serve floors 1-10), and destination dispatch are all policies over the same car model.",
        "- State: for normal operation, Direction plus the two stop sets is enough, and a State class per direction would just move three lines around. Modes are different: Normal, FireService (go to the lobby, ignore hall calls, doors open), Maintenance (ignore everything), Overloaded (doors stay open). Each changes how the car reacts to every input. Once there are two or more of those, I'd introduce an ICarMode with Normal, FireService and Maintenance classes and have Step and AddStop delegate to it. Each mode's rules then live together and adding one doesn't touch the others.",
        "- Single writer: hall and car buttons are pressed from many threads (or hardware interrupts). They only enqueue; one control loop applies them and moves cars. No car needs a lock, and the order of events is easy to log and replay.",
        "- Observer: cars raise FloorChanged and DoorsOpened events. Floor displays, the lobby screen and monitoring subscribe.",
        "Rejected:",
        "- One thread per car sharing the hall call list. It works, but every read of another car's position for dispatch becomes a race.",
        "- A Building or Elevator base class with subclasses per car type. Car differences are configuration.",
        "Known simplification: stops are floors, not (floor, direction) pairs. A car going up past floor 7 will stop for someone who pressed Down at 7. A real system keeps hall stops tagged with their direction and only serves a Down call on a down sweep. The fix is local to ElevatorCar: store Stop records and filter in Step.",
      ],
    ),
    stage(
      "scenario",
      "Walk one hall call from button press to doors opening, with concrete car positions, and show the " +
        "dispatcher's scores. About 6 minutes.",
      [
        "Sets up concrete car positions and directions",
        "Computes the dispatcher's cost for each car and picks one",
        "Steps the chosen car floor by floor, showing the stop sets",
        "Adds a car call from inside and shows where it lands",
        "Shows the car going idle (or reversing) when no stops are left ahead",
      ],
      [
        "20 floors, 3 cars. Car A idle at floor 1. Car B at 6 going up with a stop at 9. Car C at 10 going down to 2. Someone on floor 5 presses Up.",
        "- HallPanel(5) calls system.RequestPickup(5, Up); the call waits in the queue for the next Tick.",
        "- Tick: NearestCarStrategy scores the cars. A: idle, distance 4, cost 4. B: going up but already above 5, cost 1 + 40 = 41. C: going down, call is Up, cost 5 + 40 = 45. A wins.",
        "- A.AddStop(5): 5 > 1, so _up = {5}.",
        "- Same Tick, A.Step(): Idle becomes Up, floor 2, nothing to do. Next three ticks: floors 3, 4, 5. At 5, _up.Remove(5) is true, so door.Cycle(). _up and _down are both empty, so A goes Idle with its doors open.",
        "- The passenger presses 12 inside: CarPanel calls A.AddStop(12), _up = {12}. On the next Step A turns Up again and runs 6, 7, ... 12.",
        "- If someone at floor 3 had called while A was heading to 12, the cost check would see A moving away (going up, above 3) and pick another car, which is the behaviour we want.",
      ],
    ),
    stage(
      "extensions",
      "Take the interviewer's new requirements one at a time and say what changes. About 6 minutes.",
      [
        "Fire alarm: a mode on every car, recalling to the lobby",
        "Morning rush: a different dispatch strategy and an idle-parking rule",
        "Weight sensor: full cars skip hall stops but not car stops",
        "Car breaks down: reassign its hall calls, which needs the system to track assignments",
        "Destination dispatch: the hall call carries the destination",
      ],
      [
        "\"A fire alarm goes off.\" ElevatorSystem.EnterFireMode() switches every car to a FireServiceMode: clear hall stops, go to the lobby without stopping, open doors, accept only key-switch operation. This is the point where the mode classes from the patterns stage pay for themselves.",
        "\"At 8:30 everyone comes in through the lobby and goes up.\" A RushHourStrategy that prefers sending idle cars to the lobby, plus an idle-parking rule (park idle cars at the lobby before 10:00). New strategy class; ElevatorCar doesn't change.",
        "\"Cars have a weight sensor; a full car shouldn't stop for hall calls.\" The car reads load from the sensor; the strategy excludes cars over 80% full; the car skips hall stops (but still serves car stops) when full. That needs stops to remember where they came from, so the int sets become Stop records with a Source. This is the same change as fixing the direction simplification, so I'd do both at once.",
        "\"Car C breaks down between floors.\" Mark it out of service. Its car calls are lost with the passengers inside (they get the emergency phone), but its hall calls must be reassigned: the system needs a map from hall call to assigned car, so it can put C's calls back in the queue. Today the design forgets assignments once AddStop is called, which is the gap this follow-up exposes.",
        "\"We're installing destination dispatch: people type their floor in the lobby.\" The hall call gains a destination; the strategy can now group passengers by destination and tells the panel which car to take. Car panels disappear for those floors, but ElevatorCar's stop logic is unchanged.",
      ],
    ),
  ],
};

const vendingMachine: DesignInterview = {
  id: "vendingMachine",
  title: "Design a Vending Machine (OOD)",
  prompt:
    "\"Design the classes for a vending machine. It holds products in numbered slots, accepts coins, lets the " +
    "customer pick a product, dispenses it with change, and lets the customer cancel and get their money back. " +
    "An operator restocks it and empties the coin box.\"",
  reviewTip: OOD_REVIEW_TIP,
  stages: [
    stage(
      "requirements",
      "Pin down the purchase flow and every way it can go wrong before designing. The order of steps (pay " +
        "first or choose first) decides the states. About 5 minutes.",
      [
        "Asks the order of the flow: insert money then select, or select then pay",
        "Asks which coins are accepted and whether the machine gives change",
        "Asks what happens when it can't make change, or the slot is empty",
        "Cancel and refund at any point before the product drops",
        "Operator use cases: restock, set prices, collect cash, take the machine out of service",
        "Scopes out card payments, telemetry and hardware drivers for now, behind interfaces",
      ],
      [
        "Questions I'd ask: Does the customer pay first or choose first? Which coins? Do we give change, and what if we can't? Can the customer cancel? What does the operator do? Cards?",
        "Assume: coins only for now (5, 10, 25 cents and 1 dollar), pay first then choose, change given from the coins in the machine, cancel returns exactly the coins inserted. Cards come later as an extension.",
        "Customer use cases:",
        "- Insert coins; the display shows the credit.",
        "- Select a slot: dispense if paid enough, stock is there and change can be made; otherwise say why and wait.",
        "- Cancel: get the inserted coins back.",
        "Operator use cases:",
        "- Open the machine (service mode), restock slots, set prices, collect coins, close it again.",
        "Failure cases to design for: slot empty, not enough credit, can't make change, product jams while dispensing.",
        "Out of scope: card payments, remote monitoring, the coin validator's hardware protocol.",
      ],
    ),
    stage(
      "objects",
      "List the classes with one responsibility each. This problem is chosen to see whether you recognise a " +
        "state machine, so name the states here. About 5 minutes.",
      [
        "VendingMachine as the context that customers and the operator call",
        "Names the states: Idle, HasCredit, Dispensing, OutOfService",
        "Inventory (slots, products, counts) separate from cash handling",
        "A coin box that keeps the current customer's coins in escrow, separate from the change float",
        "Product as an immutable record; Coin as an enum with its value",
        "Hardware (dispenser, display) behind interfaces",
      ],
      [
        "- VendingMachine: the context. Exposes InsertCoin, Select, Cancel and the operator actions, and forwards each to its current state.",
        "- IVendingState with IdleState, HasCreditState, DispensingState and OutOfServiceState: what each input means in each situation.",
        "- Inventory: slots by code (\"B2\"), each with a Product and a count. Restock and decrement.",
        "- Product: name and price in cents. A record.",
        "- CoinBox: two pots. Escrow holds the current customer's coins, untouched until the sale completes; the float holds coins available for change. Plans change and commits a sale.",
        "- Coin: an enum whose value is the amount in cents.",
        "- IDispenser and IDisplay: hardware, injected.",
        "Escrow is the detail that makes cancel trivial and always possible: we give back the same coins, so a refund never depends on having change.",
      ],
    ),
    stage(
      "relationships",
      "Draw the classes: the machine and its parts, and the states implementing one interface. About 6 minutes.",
      [
        "The machine has exactly one current state, held as an interface",
        "Each state implements the state interface",
        "The machine composes one inventory and one coin box",
        "Inventory has many slots; each slot stocks one product type",
        "States are stateless, so one instance of each can be shared",
      ],
      [
        "VendingMachine holds one IVendingState at a time and replaces it on every transition.",
        "IdleState, HasCreditState, DispensingState and OutOfServiceState implement IVendingState. They hold no fields, so each is a single shared instance; all the data (credit, coins, stock) lives in the machine and its parts.",
        "VendingMachine has one Inventory and one CoinBox (composition). Inventory has many Slots; each Slot stocks one Product with a count.",
        "The machine also depends on IDispenser and IDisplay, not shown in the diagram to keep it readable.",
      ],
      {
        nodes: [
          { id: "machine", label: "VendingMachine", col: 0, sub: "context" },
          { id: "istate", label: "IVendingState", col: 1, sub: "interface" },
          { id: "inventory", label: "Inventory", col: 1 },
          { id: "coins", label: "CoinBox", col: 1, sub: "escrow + float" },
          { id: "idle", label: "IdleState", col: 2 },
          { id: "credit", label: "HasCreditState", col: 2 },
          { id: "dispensing", label: "DispensingState", col: 2 },
          { id: "oos", label: "OutOfService", col: 2 },
          { id: "slot", label: "Slot", col: 2, sub: "code, count" },
          { id: "product", label: "Product", col: 3, sub: "name, price" },
        ],
        edges: [
          { from: "machine", to: "istate", label: "current" },
          { from: "machine", to: "inventory", label: "has 1" },
          { from: "machine", to: "coins", label: "has 1" },
          { from: "idle", to: "istate", label: "implements" },
          { from: "credit", to: "istate", label: "implements" },
          { from: "dispensing", to: "istate", label: "implements" },
          { from: "oos", to: "istate", label: "implements" },
          { from: "inventory", to: "slot", label: "has many" },
          { from: "slot", to: "product", label: "stocks 1" },
        ],
      },
    ),
    stage(
      "interfaces",
      "Write the state interface, the machine, and the state with the most logic (the one that has credit and " +
        "receives a selection). Sketch the coin box's methods. About 10 minutes.",
      [
        "The state interface has one method per input, taking the machine",
        "The machine forwards every input to its current state and has no state checks of its own",
        "Select checks stock, credit and change in that order and reports each failure",
        "Change is planned before dispensing and only committed after the product drops",
        "Cancel returns the escrowed coins, so it can't fail",
        "Coins inserted while dispensing or out of service go straight back",
      ],
      [
        "The interface and the context:",
        ...code(`
          public enum Coin { Nickel = 5, Dime = 10, Quarter = 25, Dollar = 100 }
          public sealed record Product(string Name, int PriceCents);

          public interface IVendingState
          {
              void InsertCoin(VendingMachine m, Coin coin);
              void Select(VendingMachine m, string slot);
              void Cancel(VendingMachine m);
              void Dispensed(VendingMachine m, bool ok);   // callback from the dispenser hardware
          }

          public sealed class VendingMachine(Inventory inventory, CoinBox coins, IDispenser dispenser, IDisplay display)
          {
              internal Inventory Inventory { get; } = inventory;
              internal CoinBox Coins { get; } = coins;
              internal IDispenser Dispenser { get; } = dispenser;
              internal IDisplay Display { get; } = display;
              internal (string Slot, IReadOnlyList<Coin> Change)? PendingSale { get; set; }
              public IVendingState State { get; internal set; } = IdleState.Instance;

              public void InsertCoin(Coin c) => State.InsertCoin(this, c);
              public void Select(string slot) => State.Select(this, slot);
              public void Cancel() => State.Cancel(this);
              public void OnDispensed(bool ok) => State.Dispensed(this, ok);
          }
        `),
        "The state with the real decisions. Every failure leaves the machine in HasCreditState with the coins still in escrow, so the customer can add coins, pick something else or cancel.",
        ...code(`
          public sealed class HasCreditState : IVendingState
          {
              public static readonly HasCreditState Instance = new();

              public void InsertCoin(VendingMachine m, Coin c)
              {
                  m.Coins.Accept(c);
                  m.Display.Show($"Credit {m.Coins.Credit}c");
              }

              public void Select(VendingMachine m, string slot)
              {
                  var product = m.Inventory.Peek(slot);
                  if (product is null) { m.Display.Show("Sold out"); return; }
                  if (m.Coins.Credit < product.PriceCents)
                  {
                      m.Display.Show($"Insert {product.PriceCents - m.Coins.Credit}c more");
                      return;
                  }
                  var change = m.Coins.PlanChange(m.Coins.Credit - product.PriceCents);
                  if (change is null) { m.Display.Show("Exact change only"); return; }

                  m.PendingSale = (slot, change);
                  m.State = DispensingState.Instance;
                  m.Dispenser.Release(slot);          // completes later with m.OnDispensed(ok)
              }

              public void Cancel(VendingMachine m)
              {
                  m.Dispenser.ReturnCoins(m.Coins.RefundEscrow());
                  m.State = IdleState.Instance;
              }

              public void Dispensed(VendingMachine m, bool ok) { }   // not expected here
          }
        `),
        "DispensingState returns any coin straight away, ignores Select and Cancel, and on Dispensed(true) decrements the slot, calls Coins.CommitSale(change) (escrow into the float, change out), pays out the change and goes to Idle. On Dispensed(false), a jam, it refunds the escrow, disables the slot and goes back to Idle.",
        ...code(`
          public sealed class CoinBox(Dictionary<Coin, int> changeFloat, IChangeMaker changeMaker)
          {
              private readonly List<Coin> _escrow = new();
              public int Credit => _escrow.Sum(c => (int)c);

              public void Accept(Coin c) => _escrow.Add(c);
              public IReadOnlyList<Coin> RefundEscrow() { var r = _escrow.ToList(); _escrow.Clear(); return r; }

              // Coins that make exactly 'amount' from the float plus escrow, or null if it can't be done.
              public IReadOnlyList<Coin>? PlanChange(int amount) =>
                  changeMaker.Plan(amount, Enum.GetValues<Coin>().ToDictionary(
                      c => c, c => changeFloat.GetValueOrDefault(c) + _escrow.Count(e => e == c)));

              // Escrow joins the float; the planned change leaves it.
              public void CommitSale(IReadOnlyList<Coin> change)
              {
                  foreach (var c in _escrow) changeFloat[c] = changeFloat.GetValueOrDefault(c) + 1;
                  foreach (var c in change) changeFloat[c]--;
                  _escrow.Clear();
              }
          }
        `),
      ],
    ),
    stage(
      "patterns",
      "Explain why the State pattern fits here and what it costs, then the smaller decisions. About 7 minutes.",
      [
        "State pattern: each state's rules in one class instead of a switch in every method",
        "Says the cost honestly: more classes, states need access to the machine's internals",
        "States as shared stateless instances (the data lives in the context)",
        "Change making as its own concern, and that greedy can fail with a limited float",
        "Mentions a transition table as a valid alternative",
        "Rejects Singleton for the machine and inheritance for machine variants",
      ],
      [
        "- State. Without it, every public method is a switch on an enum: InsertCoin checks Idle, HasCredit, Dispensing, OutOfService; Select checks them again; Cancel again. Adding a Maintenance state means editing every switch, and missing one is a bug. With State, each class answers \"what does each input mean right now?\" in one place, and a new state is a new class plus the transitions into it.",
        "- What it costs: four or five small classes, and the states need the machine's internals, which I expose as internal members rather than public ones. For a machine with two states I'd use an enum; this one has four, with the operator mode still coming.",
        "- Shared state instances: the states hold no fields, so IdleState.Instance can be shared. That's not a Singleton in the problematic sense: it's an immutable object with no global data.",
        "- Escrow over computing a refund: refunding the exact coins always works; computing change for a refund can fail.",
        "- Change making: with US coins and an unlimited float, greedy (largest coin first) is optimal. With a limited float it can fail when an answer exists: 30 cents with quarters and dimes but no nickels, greedy takes a quarter and is stuck, but three dimes work. With four denominations, a small bounded search over counts is cheap. That's why CoinBox takes an IChangeMaker: greedy for a quick first version, the search when the float runs low, swapped without touching the states.",
        "Alternatives:",
        "- A transition table, Dictionary<(State, Event), handler>. Good when there are many states and events with simple actions; harder to read when actions have logic like Select does.",
        "Rejected:",
        "- Singleton VendingMachine: a company runs thousands, and tests need fresh ones.",
        "- SnackMachine and DrinkMachine subclasses: the difference is the inventory, not the behaviour.",
      ],
    ),
    stage(
      "scenario",
      "Walk one purchase coin by coin through the states, then one failure. About 6 minutes.",
      [
        "Shows each transition: Idle to HasCredit on the first coin, HasCredit to Dispensing on a good selection",
        "Computes credit and change with real numbers",
        "Shows change planned before dispensing and committed after",
        "Walks a failure: can't make change, or a jam, and where the coins end up",
        "Shows a coin inserted during dispensing being returned",
      ],
      [
        "B2 holds crisps at 65 cents, 4 in stock. The float has plenty of dimes. The customer inserts three quarters and selects B2.",
        "- InsertCoin(Quarter): IdleState accepts it into escrow (credit 25) and switches to HasCreditState.",
        "- Two more quarters: HasCreditState accepts each; credit 75.",
        "- Select(\"B2\"): Peek finds crisps at 65; 75 >= 65; PlanChange(10) returns [Dime]. PendingSale = (B2, [Dime]); state becomes Dispensing; Dispenser.Release(\"B2\").",
        "- While the spiral turns, the customer pushes in another dime: DispensingState returns it immediately.",
        "- OnDispensed(true): B2 drops to 3, CommitSale moves three quarters into the float and takes one dime out, the dime goes to the tray, credit is 0, state is Idle.",
        "Failure: if the float had no dimes or nickels, PlanChange(10) returns null, the display says \"Exact change only\", and the state stays HasCredit with 75 cents in escrow. Cancel returns the same three quarters.",
        "Jam: OnDispensed(false) refunds the escrow, marks B2 unavailable so nobody else pays for a stuck product, and returns to Idle.",
      ],
    ),
    stage(
      "extensions",
      "Absorb the interviewer's follow-ups. Most of them should be a new state or a new class behind an " +
        "existing interface. About 6 minutes.",
      [
        "Card payments: a payment abstraction and a select-then-pay path with its own state",
        "Operator service mode as a new state",
        "Promotions or time-based prices through a pricing strategy",
        "Telemetry (empty slot, coin box full) through events",
        "Power cut mid-sale: what's persisted and what the hardware already guarantees",
      ],
      [
        "\"Add contactless card payments.\" Cards flip the flow: choose first, then pay. Add an AwaitingCardState: Select in Idle with a card reader present goes there, the machine asks an ICardTerminal to authorise the price, and on approval goes to Dispensing. Credit-based logic stays where it is; payment-specific checks move behind an IPaymentMethod if both flows grow.",
        "\"The operator needs to restock and collect cash.\" A MaintenanceState entered with the operator's key: customer inputs are rejected (coins returned), restock and collect are allowed, and leaving it returns to Idle. No existing state changes except a transition from Idle.",
        "\"Drinks are 20% off between 3 and 5 pm.\" Price lookup moves from Product.PriceCents to an IPricingPolicy (time-aware, injected with a clock). HasCreditState asks the policy instead of the product.",
        "\"Head office wants to know when a slot is empty or the coin box is full.\" Inventory and CoinBox raise events; a telemetry subscriber batches and sends them. The states don't know.",
        "\"What if power is cut while dispensing?\" The coins in escrow are physically held in the escrow cup, so the safe default on boot is to refund the escrow. The only data worth persisting is stock counts and the pending sale; on restart with a pending sale, the drop sensor's reading decides whether to commit or refund.",
      ],
    ),
  ],
};

const ticketBooking: DesignInterview = {
  id: "ticketBooking",
  title: "Design a Movie Ticket Booking System (OOD)",
  prompt:
    "\"Design the classes for a movie ticket booking system like Fandango or BookMyShow. Users browse movies and " +
    "showtimes, pick seats on a seat map, hold them while they pay, and get a booking. Two users must never end up " +
    "with the same seat for the same show.\"",
  reviewTip: OOD_REVIEW_TIP,
  stages: [
    stage(
      "requirements",
      "Clarify the flow, then focus on the hard requirement: no seat sold twice. Ask the question that " +
        "decides how you'll enforce it (one process or many servers). About 5 minutes.",
      [
        "Lists actors and use cases: browse shows, pick seats, hold, pay, cancel; admin sets up cinemas and shows",
        "Asks how long a hold lasts and what happens on timeout or a failed payment",
        "States the invariant: a seat for a given show is sold at most once, even under concurrent requests",
        "Asks whether a booking can include several seats, and whether that's all-or-nothing",
        "Asks if this runs in one process or on many servers sharing a database",
        "Scopes out search, recommendations, payment provider internals and notifications",
      ],
      [
        "Questions I'd ask: Can one booking include several seats? How long does a hold last before seats go back? What if payment fails or is slow? Can users cancel, and until when? Does this run on one server or many? Are there seat categories with different prices?",
        "Assume: up to 10 seats per booking, all or nothing. Holds last 8 minutes. Standard and premium seats at different prices. Cancellation allowed until 2 hours before the show. I'll design the classes as if in one process, with the seat inventory behind an interface, then show the database version, because production runs many servers.",
        "Use cases:",
        "- Browse: movies, cinemas, shows, and a seat map with each seat's status for one show.",
        "- Hold: select seats; either all are held for me for 8 minutes, or none are and I'm told which were taken.",
        "- Checkout: pay for a live hold and get a booking.",
        "- Cancel: a booking before the cutoff, seats go back on sale.",
        "- Admin: add cinemas, screens with their seat layout, movies and shows.",
        "The invariant everything else serves: for a given show, a seat is in at most one live hold or booking at any moment.",
        "Out of scope: search, recommendations, the payment provider's API, emails and push notifications.",
      ],
    ),
    stage(
      "objects",
      "Name the classes. The modelling insight interviewers look for is where a seat's availability lives: it " +
        "belongs to a seat in a particular show, not to the physical seat. About 5 minutes.",
      [
        "Separates the physical layout (Cinema, Screen, Seat) from scheduling (Movie, Show)",
        "ShowSeat (or equivalent) holds the status of one seat for one show",
        "SeatHold with an owner, seats and an expiry time",
        "Booking created only from a live hold, with the payment reference",
        "A seat inventory interface that owns all status changes, so locking lives in one place",
        "BookingService orchestrating hold, pay and confirm; payment behind an interface",
      ],
      [
        "Physical layout, changes rarely:",
        "- Cinema has Screens; Screen has Seats (row, number, category).",
        "Scheduling:",
        "- Movie: title, duration, rating.",
        "- Show: a movie on a screen at a start time.",
        "Availability, changes constantly:",
        "- ShowSeat: one seat in one show, with status Available, Held or Booked, and the hold or booking that owns it. Seat.IsBooked would be wrong: the same seat is free at 17:00 and taken at 20:00.",
        "- SeatHold: id, show, seat ids, user, expiry.",
        "- Booking: id, show, seats, user, amount, payment reference, status (Confirmed, Cancelled).",
        "Services:",
        "- ISeatInventory: the only code that changes ShowSeat status. TryHold, Confirm, Release. In-memory and database implementations.",
        "- BookingService: hold, checkout and cancel, coordinating the inventory, pricing and payments.",
        "- IPaymentGateway: authorise, capture, void, refund.",
        "- IPricingPolicy: price for a hold (seat categories, later time-of-day pricing).",
      ],
    ),
    stage(
      "relationships",
      "Draw the class diagram: the physical tree, the per-show seat state, and the service with its " +
        "dependencies. About 6 minutes.",
      [
        "Cinema has many screens, screen has many seats (composition)",
        "Show refers to one movie and one screen, and has one ShowSeat per seat in that screen",
        "Booking refers to one show and one or more ShowSeats",
        "BookingService depends on interfaces for inventory and payment",
        "A database-backed inventory implements the same interface as the in-memory one",
      ],
      [
        "Physical: a Cinema has many Screens, a Screen has many Seats. Composition: seats don't exist without their screen.",
        "Scheduling: a Show plays one Movie on one Screen (associations; the movie and screen exist independently). When a show is created it gets one ShowSeat per Seat on its screen.",
        "A ShowSeat points at exactly one Seat and belongs to one Show. A Booking is for one Show and covers 1..10 ShowSeats.",
        "BookingService uses ISeatInventory and IPaymentGateway (and IPricingPolicy, not drawn) through the constructor, and creates Bookings. DbSeatInventory implements ISeatInventory for the multi-server case; InMemorySeatInventory implements it for one process and tests.",
        "The Show to Screen line isn't drawn, to keep the diagram readable.",
      ],
      {
        nodes: [
          { id: "service", label: "BookingService", col: 0 },
          { id: "dbinv", label: "DbSeatInventory", col: 0, sub: "SQL" },
          { id: "cinema", label: "Cinema", col: 0 },
          { id: "payment", label: "IPaymentGateway", col: 1, sub: "interface" },
          { id: "booking", label: "Booking", col: 1 },
          { id: "inventory", label: "ISeatInventory", col: 1, sub: "interface" },
          { id: "screen", label: "Screen", col: 1 },
          { id: "show", label: "Show", col: 2, sub: "movie at a time" },
          { id: "showseat", label: "ShowSeat", col: 2, sub: "status, hold" },
          { id: "seat", label: "Seat", col: 2, sub: "row, number" },
          { id: "movie", label: "Movie", col: 3 },
        ],
        edges: [
          { from: "service", to: "payment", label: "uses" },
          { from: "service", to: "inventory", label: "uses" },
          { from: "service", to: "booking", label: "creates" },
          { from: "dbinv", to: "inventory", label: "implements" },
          { from: "cinema", to: "screen", label: "has many" },
          { from: "inventory", to: "showseat", label: "guards" },
          { from: "booking", to: "show", label: "for 1" },
          { from: "screen", to: "seat", label: "has many" },
          { from: "show", to: "showseat", label: "has many" },
          { from: "showseat", to: "seat", label: "for 1" },
          { from: "show", to: "movie", label: "plays 1" },
        ],
      },
    ),
    stage(
      "interfaces",
      "Write the inventory interface and the hold and confirm logic, first for one process, then as the " +
        "database statements that keep the same guarantee across servers. Then checkout. About 10 minutes.",
      [
        "TryHold is all-or-nothing: checks every seat, then marks every seat, inside one critical section",
        "Expired holds count as free when checked (lazy expiry), so correctness doesn't depend on a timer",
        "Confirm succeeds only if the hold is still live and still owns the seats",
        "Lock per show, not one global lock",
        "Database version: a conditional UPDATE and a row count check, plus a unique constraint as the last defence",
        "Checkout order: authorise payment, confirm seats, then capture (or void if confirm failed), with an idempotency key",
      ],
      [
        "The contract. Callers never set seat status themselves.",
        ...code(`
          public enum SeatStatus { Available, Held, Booked }

          public sealed record SeatHold(Guid Id, Guid ShowId, IReadOnlyList<string> SeatIds,
                                        string UserId, DateTimeOffset ExpiresAt);

          public interface ISeatInventory
          {
              SeatHold? TryHold(Guid showId, IReadOnlyList<string> seatIds, string userId, TimeSpan ttl);
              SeatHold? GetHold(Guid holdId);
              bool Confirm(Guid holdId, Guid bookingId);   // Held -> Booked, only while the hold is live
              void Release(Guid holdId);                   // Held -> Available (cancel or payment failed)
          }
        `),
        "In one process: one lock per show. Check every seat first, then change them all, so a request for F7 and F8 never ends up holding only F7.",
        ...code(`
          public sealed class InMemorySeatInventory(TimeProvider clock) : ISeatInventory
          {
              private sealed class ShowSeat
              {
                  public SeatStatus Status;
                  public Guid OwnerId;                 // hold id while Held, booking id once Booked
                  public DateTimeOffset HoldExpires;
              }

              private sealed class ShowSeats(Dictionary<string, ShowSeat> seats)
              {
                  public readonly object Lock = new();
                  public readonly Dictionary<string, ShowSeat> Seats = seats;
              }

              private readonly ConcurrentDictionary<Guid, ShowSeats> _shows = new();
              private readonly ConcurrentDictionary<Guid, SeatHold> _holds = new();

              public SeatHold? TryHold(Guid showId, IReadOnlyList<string> seatIds, string userId, TimeSpan ttl)
              {
                  var show = _shows[showId];
                  var now = clock.GetUtcNow();
                  lock (show.Lock)
                  {
                      foreach (var id in seatIds)
                      {
                          var s = show.Seats[id];
                          bool free = s.Status == SeatStatus.Available
                                   || (s.Status == SeatStatus.Held && s.HoldExpires <= now);
                          if (!free) return null;               // all or nothing: nothing changed yet
                      }
                      var hold = new SeatHold(Guid.NewGuid(), showId, seatIds, userId, now + ttl);
                      foreach (var id in seatIds)
                      {
                          var s = show.Seats[id];
                          (s.Status, s.OwnerId, s.HoldExpires) = (SeatStatus.Held, hold.Id, hold.ExpiresAt);
                      }
                      _holds[hold.Id] = hold;
                      return hold;
                  }
              }

              public SeatHold? GetHold(Guid holdId) => _holds.GetValueOrDefault(holdId);

              public bool Confirm(Guid holdId, Guid bookingId)
              {
                  if (!_holds.TryGetValue(holdId, out var hold)) return false;
                  var show = _shows[hold.ShowId];
                  lock (show.Lock)
                  {
                      var now = clock.GetUtcNow();
                      var seats = hold.SeatIds.Select(id => show.Seats[id]).ToList();
                      if (seats.Any(s => s.Status != SeatStatus.Held || s.OwnerId != holdId || s.HoldExpires <= now))
                          return false;                         // expired, and maybe someone else holds it now
                      foreach (var s in seats) (s.Status, s.OwnerId) = (SeatStatus.Booked, bookingId);
                      _holds.TryRemove(holdId, out _);
                      return true;
                  }
              }

              public void Release(Guid holdId) { /* same lock; Held seats owned by holdId -> Available */ }
          }
        `),
        "Across many servers, the database is the lock. The same two steps, as conditional updates inside one transaction:",
        ...code(
          `
          -- TryHold: succeeds only if every requested seat was free; otherwise ROLLBACK
          UPDATE show_seats
             SET status = 'Held', owner_id = @holdId, hold_expires = @expiresAt
           WHERE show_id = @showId AND seat_id IN (@seatIds)
             AND (status = 'Available' OR (status = 'Held' AND hold_expires <= @now));
          -- if rows affected <> number of seats requested: ROLLBACK, else COMMIT

          -- Confirm: only the live hold that owns the seats can book them
          UPDATE show_seats
             SET status = 'Booked', owner_id = @bookingId
           WHERE owner_id = @holdId AND status = 'Held' AND hold_expires > @now;
          -- rows affected must equal the hold's seat count
        `,
          "sql",
        ),
        "And a booked_seats table with a unique index on (show_id, seat_id): if a bug ever slips past the updates, the second insert fails instead of selling the seat twice.",
        "Checkout. Money and seats must agree: never take money for seats you can't confirm, never confirm seats you couldn't charge for.",
        ...code(`
          public sealed class BookingService(ISeatInventory inventory, IPaymentGateway payments,
                                             IPricingPolicy pricing, IBookingRepository bookings)
          {
              public async Task<Booking> CheckoutAsync(Guid holdId, string userId, PaymentDetails details, CancellationToken ct)
              {
                  var hold = inventory.GetHold(holdId);
                  if (hold is null || hold.UserId != userId) throw new HoldExpiredException();

                  var amount = pricing.Total(hold);
                  var auth = await payments.AuthorizeAsync(details, amount, idempotencyKey: hold.Id.ToString(), ct);
                  if (!auth.Approved) throw new PaymentDeclinedException();   // hold stays: they can try another card

                  var bookingId = Guid.NewGuid();
                  if (!inventory.Confirm(hold.Id, bookingId))
                  {
                      await payments.VoidAsync(auth.Id, ct);       // hold expired while they were paying
                      throw new HoldExpiredException();
                  }
                  await payments.CaptureAsync(auth.Id, ct);
                  return bookings.Save(new Booking(bookingId, hold.ShowId, hold.SeatIds, hold.UserId, amount, auth.Id));
              }
          }
        `),
      ],
    ),
    stage(
      "patterns",
      "Talk about the concurrency choices as trade-offs, and the patterns around them. Interviewers will push " +
        "on lock granularity and on distributed locks. About 7 minutes.",
      [
        "Compares lock granularity: global, per show, per seat (and the deadlock risk of per-seat locks)",
        "Pessimistic lock in memory versus optimistic conditional update in the database",
        "Explains why a distributed lock (for example in Redis) shouldn't be the only guarantee",
        "Lazy expiry versus a background timer, and why lazy is the correct one",
        "Repository-style interface for the inventory so both implementations are swappable",
        "Strategy for pricing; Observer or push updates for live seat maps",
      ],
      [
        "Lock granularity:",
        "- One global lock: correct, but every show in the country waits on every other.",
        "- Per seat: maximum concurrency, but a booking takes several seats, so two users taking F7+F8 and F8+F7 can deadlock unless locks are always taken in sorted order. Even then it's more locks than the problem needs.",
        "- Per show: a show has a few hundred seats and a hold takes microseconds, so this is the sweet spot. Contention only matters for a blockbuster's opening night, which I'd handle separately (see extensions).",
        "Pessimistic in memory, optimistic in the database: the conditional UPDATE doesn't lock anything ahead of time; it checks the condition and writes in one statement, and the row count tells us whether we won. Losers get \"those seats were just taken\" and a refreshed map.",
        "Distributed locks: a Redis lock with a timeout can expire while the holder is paused (a long GC, a slow network), and then two servers both believe they hold it. Fine as an optimisation to reduce database contention, never as the only guarantee. The database's conditional write and unique index are the source of truth.",
        "Expiry: holds expire by comparison with the current time when seats are checked. A background sweep that flips expired holds to Available is only tidying; if it falls behind, nothing is double-sold and nothing stays stuck.",
        "Patterns: ISeatInventory is a repository-style abstraction with an in-memory and a SQL implementation. IPricingPolicy is a Strategy. Seat map updates are pushed to other viewers of the show (Observer, in practice a WebSocket channel per show), so people stop clicking seats that just went.",
        "Rejected: putting status on Seat (wrong lifetime), letting the controller update seats directly (locking spread everywhere), and capturing payment before confirming (refunds instead of voids, and angry customers).",
      ],
    ),
    stage(
      "scenario",
      "Walk the race: two users ask for the same seats at the same moment. Then the slow payment case. About 6 minutes.",
      [
        "Two concurrent TryHold calls for overlapping seats: exactly one wins, the other changes nothing",
        "The loser's UI gets a clear message and fresh availability",
        "Checkout on the winning hold: authorise, confirm, capture",
        "The hold expires mid-payment: another user takes the seat, the first confirm fails and the authorisation is voided",
        "Shows the invariant held in every path",
      ],
      [
        "The 19:30 show, seats F7 and F8. Alice and Bob click Continue at the same instant, on different servers.",
        "- Both servers run the TryHold UPDATE for (F7, F8). The database serialises the two updates on those rows. Alice's commits first: 2 rows affected, hold A expires at 19:10 (it's 19:02).",
        "- Bob's update now sees status Held with an expiry in the future: 0 rows affected, rollback. Bob sees \"Those seats were just taken\" and a refreshed map.",
        "- Alice pays: AuthorizeAsync for 2 x 12.50 = 25.00 with idempotency key = hold A's id. Approved. Confirm(A, booking B1): the UPDATE matches 2 rows, seats are Booked. CaptureAsync. Booking B1 is saved and shown.",
        "The slow card: suppose Alice's bank's 3-D Secure check takes 9 minutes.",
        "- At 19:10 hold A expires. At 19:11 Bob tries again: the TryHold UPDATE sees Held with hold_expires <= now, so it matches, and Bob holds F7 and F8.",
        "- At 19:11:30 Alice's authorisation comes back approved. Confirm(A) matches 0 rows, because owner_id is now Bob's hold. CheckoutAsync voids Alice's authorisation and tells her the hold expired. She's not charged, and the seats are sold once, to Bob.",
        "- If the client retries Alice's checkout after a timeout, the same idempotency key stops a second authorisation.",
      ],
    ),
    stage(
      "extensions",
      "Handle the interviewer's follow-ups, keeping the no-double-sell guarantee in each. About 6 minutes.",
      [
        "Many servers: the database version of the inventory, or a single writer per show",
        "Opening night with tens of thousands of users on one show: a waiting room or queue",
        "Cancellation and refunds with a cutoff, returning seats to sale",
        "\"Best available\" and keeping a group together as a strategy",
        "Extending a hold once, with a cap",
        "A payment webhook that arrives after the hold expired",
      ],
      [
        "\"It runs on 20 servers.\" Swap InMemorySeatInventory for DbSeatInventory; BookingService doesn't change. An alternative at high scale is a single writer per show: route all holds for a show to one partition (by show id) and keep the in-memory version there.",
        "\"Opening night: 50,000 people hit one show at 9:00.\" The per-show lock (or the rows for that show) becomes the hot spot, and most of those people will lose anyway. Put a virtual waiting room in front: admit users to the seat map in batches, so the number of concurrent holds stays near the number of seats.",
        "\"Users can cancel up to 2 hours before.\" Booking gets a status (Confirmed, Cancelled). Cancel checks the cutoff through an ICancellationPolicy, refunds through the gateway, and sets the ShowSeats back to Available in the same transaction that marks the booking cancelled.",
        "\"Pick the best 4 seats together for me.\" An ISeatSelectionStrategy reads the seat map and proposes seats (same row, nearest the centre); the proposal still goes through TryHold, so the strategy can be wrong without breaking anything.",
        "\"Let users extend their hold once by 5 minutes.\" ExtendHold(holdId) is a conditional update on the hold's own seats that only succeeds if the hold is live and hasn't been extended (an extended flag on the hold).",
        "\"The payment provider sends its confirmation by webhook, sometimes late.\" The webhook handler runs the same Confirm; if it fails because the hold expired, it voids or refunds. A reconciliation job compares captured payments with bookings daily, because webhooks get lost.",
      ],
    ),
  ],
};

const cardGame: DesignInterview = {
  id: "cardGame",
  title: "Design a Deck of Cards and Blackjack (OOD)",
  prompt:
    "\"Design a generic deck of cards, then use it to implement Blackjack: a dealer and one or more players, each " +
    "player hits or stands, the dealer draws to 17, and an ace counts as 1 or 11.\"",
  reviewTip: OOD_REVIEW_TIP,
  stages: [
    stage(
      "requirements",
      "Separate what's generic (cards, decks) from what's Blackjack, and agree which Blackjack rules are in " +
        "scope. About 5 minutes.",
      [
        "Separates the reusable deck from the game rules, and says why (the deck should work for poker too)",
        "Asks: how many decks, how many players, betting in or out",
        "Asks about splits, doubling down and insurance, and scopes them",
        "States the scoring rules: aces 1 or 11, face cards 10, bust over 21, two-card 21 is blackjack",
        "Asks whether the dealer hits on soft 17",
        "Shuffling must be fair and testable",
      ],
      [
        "Questions I'd ask: One deck or a shoe of several? How many players? Are we handling bets and payouts? Splits, doubling, insurance? Does the dealer hit on soft 17? Is the player a human at a console, a bot, or both?",
        "Assume: a shoe of 1 to 8 decks, 1 to 7 players, a human or bot decides for each player. First version: hit and stand only, no betting; betting and splits come as extensions. Dealer stands on all 17s, configurable.",
        "Generic deck use cases: build a deck of 52 cards (times n decks), shuffle, deal one card, know how many are left.",
        "Blackjack use cases:",
        "- Deal two cards to each player and the dealer (one dealer card face up).",
        "- Each player in turn hits until they stand, reach 21 or bust.",
        "- The dealer then draws to 17.",
        "- Settle each player: win, lose, push, or blackjack.",
        "Rules to get right: number cards at face value, J/Q/K count 10, an ace counts 11 unless that busts the hand, then 1. A two-card 21 is a blackjack and beats a 21 made with more cards.",
        "Out of scope: UI, networking, persistence, card counting detection.",
      ],
    ),
    stage(
      "objects",
      "Name the classes and keep the generic ones free of Blackjack knowledge. About 5 minutes.",
      [
        "Suit and Rank as enums; Card as an immutable value type",
        "Deck: builds, shuffles with an injected random source, deals",
        "Hand: an ordered list of cards, with no scoring rules inside",
        "Blackjack scoring in its own class, so the deck stays reusable",
        "Player and Dealer, and a decision interface so human and bot players are interchangeable",
        "BlackjackGame runs a round; it owns the turn order and settlement",
      ],
      [
        "Generic, reusable for any card game:",
        "- Suit, Rank: enums.",
        "- Card: an immutable record struct of rank and suit. Equality by value, cheap to copy.",
        "- Deck: n packs of 52, Shuffle (Fisher-Yates, with an injected Random so tests can seed it), Deal, Remaining.",
        "- Hand: the cards someone holds. Add and read; nothing about scoring.",
        "Blackjack-specific:",
        "- BlackjackScore: static scoring rules: value of a rank, total with aces, soft or hard, bust, blackjack.",
        "- Participant: has a hand and decides whether to take another card. Player and Dealer extend it.",
        "- IPlayerPolicy: how a player decides (console input, basic strategy bot). The dealer doesn't need one: its rule is fixed by the table.",
        "- BlackjackGame: deals, runs turns, settles.",
        "- Outcome: Win, Lose, Push, Blackjack.",
        "A card's Blackjack value is not a property of the card: in poker a king isn't worth 10. That's why scoring isn't Card.Value.",
      ],
    ),
    stage(
      "relationships",
      "Draw the classes, marking where you chose inheritance and where composition, and say why. About 6 minutes.",
      [
        "Deck has 52 times n cards; a hand holds the cards dealt to it",
        "Participant has one or more hands (more once splits arrive)",
        "Player and Dealer extend Participant: a shallow hierarchy with a real behaviour difference",
        "Player delegates decisions to an IPlayerPolicy (composition) rather than HumanPlayer and BotPlayer subclasses",
        "The game uses one deck and has 2 to 8 participants",
      ],
      [
        "BlackjackGame uses one Deck and has 2..8 Participants (1..7 players plus the dealer).",
        "A Deck has 52 x n Cards; a Hand holds the Cards dealt to it. Cards are values, so \"owns\" isn't really meaningful: the same Card value can be in the deck at the start of one round and a hand in the next.",
        "Participant has 1..* Hands. One for now, but splitting a pair gives a player two hands, so the model allows a list. The code below keeps a single Hand property to stay short, and it becomes a list when splits arrive.",
        "Inheritance: Player and Dealer extend Participant. They share the hand, and differ in one real behaviour, how they decide to draw, plus the dealer's face-down card. One level deep, nothing else will extend it, so inheritance is fine here.",
        "Composition: a Player has an IPlayerPolicy. HumanPlayer and BotPlayer subclasses would tie \"who decides\" to the class, so a player couldn't switch to auto-play mid-game. With a policy object they can.",
      ],
      {
        nodes: [
          { id: "game", label: "BlackjackGame", col: 0 },
          { id: "deck", label: "Deck", col: 1, sub: "n packs" },
          { id: "participant", label: "Participant", col: 1, sub: "abstract" },
          { id: "card", label: "Card", col: 2, sub: "rank, suit" },
          { id: "hand", label: "Hand", col: 2 },
          { id: "player", label: "Player", col: 2 },
          { id: "dealer", label: "Dealer", col: 2, sub: "draws to 17" },
          { id: "policy", label: "IPlayerPolicy", col: 3, sub: "interface" },
          { id: "console", label: "ConsoleInput", col: 4, sub: "human" },
          { id: "basic", label: "BasicStrategy", col: 4, sub: "bot" },
        ],
        edges: [
          { from: "game", to: "deck", label: "deals from" },
          { from: "game", to: "participant", label: "has 2..8" },
          { from: "deck", to: "card", label: "has 52 x n" },
          { from: "participant", to: "hand", label: "has 1..*" },
          { from: "hand", to: "card", label: "holds" },
          { from: "player", to: "participant", label: "extends" },
          { from: "dealer", to: "participant", label: "extends" },
          { from: "player", to: "policy", label: "asks" },
          { from: "console", to: "policy", label: "implements" },
          { from: "basic", to: "policy", label: "implements" },
        ],
      },
    ),
    stage(
      "interfaces",
      "Write the card and deck, the scoring (the ace rule is where most candidates slip), the participants, and " +
        "one round of the game. About 10 minutes.",
      [
        "Card as a value type with enums; deck built from the cross product of suits and ranks",
        "Fisher-Yates shuffle with an injected Random, not OrderBy(random)",
        "Ace scoring: count aces as 1, add 10 once if it doesn't bust, and report whether the total is soft",
        "Dealer rule as code: hit below 17, optionally on soft 17",
        "Round: deal two each, dealer checks for blackjack, players then dealer take turns, settle",
        "Settlement order: player bust loses even if the dealer busts; blackjack beats a multi-card 21",
      ],
      [
        "The generic part:",
        ...code(`
          public enum Suit { Clubs, Diamonds, Hearts, Spades }
          public enum Rank { Ace = 1, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King }

          public readonly record struct Card(Rank Rank, Suit Suit);

          public sealed class Deck(int packs = 1, Random? rng = null)
          {
              private readonly Random _rng = rng ?? Random.Shared;
              private readonly List<Card> _cards = new();
              public int Remaining => _cards.Count;

              public void Reset()
              {
                  _cards.Clear();
                  for (int p = 0; p < packs; p++)
                      foreach (var s in Enum.GetValues<Suit>())
                          foreach (var r in Enum.GetValues<Rank>())
                              _cards.Add(new Card(r, s));
              }

              public void Shuffle()                          // Fisher-Yates: every order equally likely
              {
                  for (int i = _cards.Count - 1; i > 0; i--)
                  {
                      int j = _rng.Next(i + 1);
                      (_cards[i], _cards[j]) = (_cards[j], _cards[i]);
                  }
              }

              public Card Deal()
              {
                  if (_cards.Count == 0) throw new InvalidOperationException("The deck is empty");
                  var top = _cards[^1];
                  _cards.RemoveAt(_cards.Count - 1);
                  return top;
              }
          }

          public sealed class Hand
          {
              private readonly List<Card> _cards = new();
              public IReadOnlyList<Card> Cards => _cards;
              public void Add(Card c) => _cards.Add(c);
          }
        `),
        "Blackjack scoring. Only one ace can ever count as 11 (two would be 22), so count every ace as 1 and add 10 once if it fits.",
        ...code(`
          public static class BlackjackScore
          {
              public static int Value(Rank r) => r >= Rank.Ten ? 10 : (int)r;   // Ace = 1 here

              public static (int Total, bool Soft) Score(Hand h)
              {
                  int total = h.Cards.Sum(c => Value(c.Rank));
                  bool hasAce = h.Cards.Any(c => c.Rank == Rank.Ace);
                  return hasAce && total + 10 <= 21 ? (total + 10, true) : (total, false);
              }

              public static bool IsBust(Hand h) => Score(h).Total > 21;
              public static bool IsBlackjack(Hand h) => h.Cards.Count == 2 && Score(h).Total == 21;
          }
        `),
        "Participants and one round:",
        ...code(`
          public enum Move { Hit, Stand }
          public enum Outcome { Win, Lose, Push, Blackjack }

          public interface IPlayerPolicy { Move Decide(Hand hand, Card dealerUpCard); }

          public abstract class Participant
          {
              public Hand Hand { get; private set; } = new();
              public void NewHand() => Hand = new Hand();
              public abstract bool WantsCard(Card dealerUpCard);
          }

          public sealed class Player(string name, IPlayerPolicy policy) : Participant
          {
              public string Name { get; } = name;
              public override bool WantsCard(Card up) => policy.Decide(Hand, up) == Move.Hit;
          }

          public sealed class Dealer(bool hitsSoft17 = false) : Participant
          {
              public override bool WantsCard(Card _)
              {
                  var (total, soft) = BlackjackScore.Score(Hand);
                  return total < 17 || (hitsSoft17 && total == 17 && soft);
              }
          }

          public sealed class BlackjackGame(Deck deck, IReadOnlyList<Player> players, Dealer dealer, int reshuffleBelow = 30)
          {
              public Dictionary<Player, Outcome> PlayRound()
              {
                  if (deck.Remaining < reshuffleBelow) { deck.Reset(); deck.Shuffle(); }

                  var seats = players.Cast<Participant>().Append(dealer).ToList();   // dealer acts last
                  seats.ForEach(p => p.NewHand());
                  for (int i = 0; i < 2; i++) seats.ForEach(p => p.Hand.Add(deck.Deal()));

                  var upCard = dealer.Hand.Cards[0];
                  if (!BlackjackScore.IsBlackjack(dealer.Hand))                       // dealer peeks
                      foreach (var p in seats)
                          while (BlackjackScore.Score(p.Hand).Total < 21 && p.WantsCard(upCard))
                              p.Hand.Add(deck.Deal());

                  return players.ToDictionary(p => p, p => Settle(p.Hand, dealer.Hand));
              }

              private static Outcome Settle(Hand p, Hand d)
              {
                  if (BlackjackScore.IsBust(p)) return Outcome.Lose;            // player busts first: loses regardless
                  bool pbj = BlackjackScore.IsBlackjack(p), dbj = BlackjackScore.IsBlackjack(d);
                  if (pbj || dbj) return pbj && dbj ? Outcome.Push : pbj ? Outcome.Blackjack : Outcome.Lose;
                  if (BlackjackScore.IsBust(d)) return Outcome.Win;
                  int pt = BlackjackScore.Score(p).Total, dt = BlackjackScore.Score(d).Total;
                  return pt > dt ? Outcome.Win : pt < dt ? Outcome.Lose : Outcome.Push;
              }
          }
        `),
        "The first round finds the new deck empty, below the reshuffle mark, so it builds and shuffles it; after that the mark works like a casino's cut card.",
      ],
    ),
    stage(
      "patterns",
      "Name the patterns and principles in play, and the designs you rejected. About 7 minutes.",
      [
        "Strategy for player decisions; dealer rule variants as configuration",
        "Template-method-like loop: the game owns the turn, participants answer one question",
        "Single responsibility: deck knows nothing of Blackjack; scoring lives apart",
        "Injected Random for deterministic tests",
        "Rejects Card.Value, 52 card subclasses, and a Singleton deck",
        "Knows when a State machine for game phases would be worth it",
      ],
      [
        "- Strategy: IPlayerPolicy. ConsoleInput reads h or s; BasicStrategy looks up the standard chart from (player total, soft, dealer up card). A test policy replays a fixed list of moves.",
        "- The game loop asks each participant one question, WantsCard, and does the drawing itself. Participants can't draw from the deck directly, so the rules (no drawing past 21, dealer acts last) can't be bypassed by a new policy.",
        "- Separation: Card, Deck and Hand know nothing about Blackjack. BlackjackScore holds all the counting rules. A poker game reuses the first three and adds a PokerHandEvaluator.",
        "- Testability: Deck takes a Random. A seeded Random gives a known order, so \"dealer has soft 17\" is a reproducible unit test instead of luck.",
        "Rejected:",
        "- Card.Value or Card.BlackjackValue: puts one game's rules into the generic type.",
        "- A class per card (AceOfSpades) or per suit: 52 classes that differ only in data.",
        "- Singleton Deck: a casino has many tables, and tests need fresh decks.",
        "- OrderBy(_ => rng.Next()) for shuffling: works, but it's O(n log n) and people often get the random comparison version wrong (a comparer that returns random results isn't a valid sort). Fisher-Yates is O(n) and provably uniform. In .NET 8 Random.Shuffle does the same.",
        "Would change with requirements: the round is a synchronous loop. If players act over a network or a UI waits for clicks, the round becomes a state machine (Betting, Dealing, PlayerTurn, DealerTurn, Settled) driven by events, and IPlayerPolicy becomes asynchronous.",
      ],
    ),
    stage(
      "scenario",
      "Play one round through the code with specific cards, including an ace, and settle it. About 6 minutes.",
      [
        "Deals concrete cards and shows each Score call",
        "Shows the player's policy deciding against the dealer's up card",
        "Shows the dealer's rule with an ace counted as 1 because 11 would bust",
        "Settles the hand with the right outcome",
        "Mentions the dealer-blackjack peek skipping everyone's turn",
      ],
      [
        "One player, Sam, with BasicStrategy; dealer stands on soft 17; a seeded deck.",
        "- Deal: Sam gets Ten of Clubs and Six of Hearts. The dealer gets Nine of Spades (up) and Seven of Diamonds.",
        "- Peek: the dealer's hand scores 16, not a blackjack, so turns go ahead.",
        "- Sam's turn: Score = 16, hard. 16 < 21, so the game asks WantsCard(Nine of Spades). Basic strategy for hard 16 against a 9 says hit. Sam draws Four of Clubs: 20. Still under 21, WantsCard again: hard 20 stands. Loop ends.",
        "- Dealer's turn: 16, WantsCard says total < 17, draw. Ace of Hearts. Score: 9 + 7 + 1 = 17; there's an ace, but 17 + 10 = 27 would bust, so it's hard 17. WantsCard: not below 17, not soft, stand.",
        "- Settle(Sam, dealer): Sam isn't bust; neither hand is a two-card 21; dealer isn't bust; 20 > 17, so Win.",
        "If the dealer's two cards had been Ace and King, the peek would see a blackjack, nobody would play, and Settle would give Lose to everyone except a player who also had a blackjack, who'd get Push.",
      ],
    ),
    stage(
      "extensions",
      "Absorb the follow-ups. Splitting is the classic one, so check your model can take more than one hand " +
        "per player. About 6 minutes.",
      [
        "Betting and payouts with configurable table rules (3:2 or 6:5)",
        "Splitting pairs: several hands per player, each with its own bet",
        "Doubling down as a new move with a rule for when it's allowed",
        "Reusing the deck for poker, and making it generic for non-standard cards",
        "Testing the shuffle's fairness",
      ],
      [
        "\"Add betting. Blackjack pays 3 to 2.\" Player gets a Bankroll; each hand gets a Bet placed before the deal. Settle still returns an Outcome, and an IPayoutRules maps it to money: Win 1:1, Blackjack 3:2 (or 6:5 at a stingy table), Push returns the bet. Rules vary by table, so they're injected.",
        "\"Let players split a pair.\" This is why the model gives Participant 1..* hands: the single Hand property in the code becomes a List<Hand>. Move gains Split; the game moves the second card to a new Hand with a copy of the bet, deals one card to each, and plays them in order. The loop becomes \"for each hand of each player\". Split aces usually get one card each, which is a rule in the game, not the hand.",
        "\"Add double down.\" Move gains Double: double the bet, take exactly one card, stand. The game checks it's allowed (first two cards only, enough bankroll) and policies may only return it when it is.",
        "\"Reuse the deck for poker.\" Card, Deck and Hand work as they are; add a PokerHandEvaluator. For a game with different cards (Uno), make it Deck<TCard> with a function that builds one pack.",
        "\"How would you test that shuffling is fair?\" Unit tests seed the Random to check the deal order. For fairness, shuffle a small deck a million times and check, with a chi-squared test, that each card lands in each position about equally often. That catches the classic bug of picking j from the whole range instead of 0..i.",
      ],
    ),
  ],
};

export const OOD_INTERVIEWS: Record<OodId, DesignInterview> = {
  parkingLot,
  elevator,
  vendingMachine,
  ticketBooking,
  cardGame,
};

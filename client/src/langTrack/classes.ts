import { src, type LangLessonData } from "./types.ts";

export const classes: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "A class: data plus the code that works on it",
      csharp: src`
var conveyor = new Motor("Conveyor 1", 1500);
conveyor.Start();
conveyor.Start();
Console.WriteLine(conveyor.Describe());   // Conveyor 1: running, 2 starts
var fan = new Motor("Fan 4", 900);
Console.WriteLine(fan.Describe());        // Fan 4: stopped, 0 starts

class Motor
{
    // Properties: the object's data
    public string Name { get; }               // set only in the constructor
    public int RatedRpm { get; }
    public bool IsRunning { get; private set; }  // anyone can read, only Motor can change
    public int StartCount { get; private set; }

    // Constructor: runs once, when "new Motor(...)" creates an object
    public Motor(string name, int ratedRpm)
    {
        Name = name;
        RatedRpm = ratedRpm;
    }

    // Methods: what the object can do
    public void Start()
    {
        IsRunning = true;
        StartCount++;                         // same as this.StartCount++
    }

    public string Describe() => $"{Name}: {(IsRunning ? "running" : "stopped")}, {StartCount} starts";
}
`,
      python: src`
class Motor:
    def __init__(self, name, rated_rpm):
        # Attributes: the object's data, created by assigning to self
        self.name = name
        self.rated_rpm = rated_rpm
        self.is_running = False
        self.start_count = 0

    # Methods: what the object can do; self is the object itself
    def start(self):
        self.is_running = True
        self.start_count += 1

    def describe(self):
        state = "running" if self.is_running else "stopped"
        return f"{self.name}: {state}, {self.start_count} starts"


conveyor = Motor("Conveyor 1", 1500)   # no "new" in Python
conveyor.start()
conveyor.start()
print(conveyor.describe())   # Conveyor 1: running, 2 starts
fan = Motor("Fan 4", 900)
print(fan.describe())        # Fan 4: stopped, 0 starts
`,
      notes: [
        "A class is a blueprint that bundles data with the functions that work on that data. An object (or instance) is one thing built from the blueprint: `conveyor` and `fan` are two separate Motor objects, each with its own name and start count. Functions that belong to a class are called methods.",
        "The constructor sets up a new object. In C# it's a method with the class's name and no return type, called by `new Motor(...)`. In Python it's the method named `__init__` (two underscores each side), called when you write `Motor(...)`.",
        "Inside a method the object needs a name for itself. Python makes it explicit: every method's first parameter is `self`, and you must write `self.name` to reach the object's data. C#'s equivalent is `this`, and it's usually left out: plain `StartCount` means `this.StartCount`.",
        "C# declares the data up front as properties with types and access rules (`get;` to read, `private set;` so only the class can change it). Python objects simply get attributes when you assign to `self.something`, normally all in `__init__`; nothing stops outside code from changing them.",
      ],
    },
    {
      kind: "code",
      title: "Properties: controlled access to data",
      csharp: src`
var pump = new Pump();
pump.Speed = 5000;
Console.WriteLine(pump.Speed);     // 3000: the setter clamped it
pump.Speed = -10;
Console.WriteLine(pump.Speed);     // 0
Console.WriteLine(pump.IsIdle);    // True: computed each time

class Pump
{
    private int _speed;            // a private field holds the value

    public int Speed
    {
        get => _speed;
        set => _speed = Math.Clamp(value, 0, 3000);   // value = what was assigned
    }

    public bool IsIdle => _speed == 0;                // read-only, computed
}
`,
      python: src`
class Pump:
    def __init__(self):
        self._speed = 0            # leading underscore: "internal, please don't touch"

    @property
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, value):
        self._speed = max(0, min(value, 3000))

    @property
    def is_idle(self):             # read-only, computed
        return self._speed == 0


pump = Pump()
pump.speed = 5000
print(pump.speed)       # 3000: the setter clamped it
pump.speed = -10
print(pump.speed)       # 0
print(pump.is_idle)     # True
`,
      notes: [
        "Encapsulation means an object guards its own data so it can't be put into a nonsense state. A C# property looks like a variable from outside (`pump.Speed = 5000`) but runs code: the `get` part when it's read, the `set` part when it's assigned, where `value` is the incoming value. Behind it sits a private field, which only the class itself can touch.",
        "Python attributes are plain variables by default. When you need checks or a computed value, `@property` turns a method into something read like an attribute, and `@name.setter` adds the assignment side. Python has no truly private members: a leading underscore is a convention meaning \"internal\". The `@` lines are decorators, covered in a later stage.",
      ],
    },
    {
      kind: "code",
      title: "Printing objects and comparing them",
      csharp: src`
var a = new Tag("PT-101", 4.2);
var b = new Tag("PT-101", 4.2);
Console.WriteLine(a);              // Tag { Name = PT-101, Value = 4.2 }
Console.WriteLine(a == b);         // True: records compare their data

var m1 = new Meter("FT-1");
var m2 = new Meter("FT-1");
Console.WriteLine(m1 == m2);       // False: two different objects
Console.WriteLine(m1);             // FT-1 (our ToString)

record Tag(string Name, double Value);   // a whole class in one line

class Meter
{
    public string Name { get; }
    public Meter(string name) => Name = name;
    public override string ToString() => Name;
}
`,
      python: src`
from dataclasses import dataclass


@dataclass
class Tag:                         # generates __init__, __repr__ and __eq__
    name: str
    value: float


class Meter:
    def __init__(self, name):
        self.name = name

    def __str__(self):             # what print() shows
        return self.name


a = Tag("PT-101", 4.2)
b = Tag("PT-101", 4.2)
print(a)                 # Tag(name='PT-101', value=4.2)
print(a == b)            # True: dataclasses compare their data

m1 = Meter("FT-1")
m2 = Meter("FT-1")
print(m1 == m2)          # False: two different objects
print(m1)                # FT-1 (our __str__)
`,
      notes: [
        "By default, `==` on two objects of an ordinary class asks \"are these the same object?\", not \"do they hold the same data?\". To get data equality without writing it by hand, C# has `record` types and Python has `@dataclass`; both also generate a readable text form for printing.",
        "To control how an object prints, override `ToString()` in C# or define `__str__` in Python (and `__repr__` for the developer-facing form shown in the interactive prompt and inside lists). Without one, C# prints the class name and Python prints something like `<__main__.Meter object at 0x7f...>`.",
      ],
    },
    {
      kind: "code",
      title: "Class-level data: shared by every object",
      csharp: src`
var w1 = new WorkOrder("Replace bearing");
var w2 = new WorkOrder("Grease chain");
Console.WriteLine($"{w2.Number}: {w2.Task}");   // 2: Grease chain
Console.WriteLine(WorkOrder.Created);           // 2

class WorkOrder
{
    public static int Created;      // one copy, shared by the class
    public int Number { get; }      // one per object
    public string Task { get; }

    public WorkOrder(string task)
    {
        Created++;
        Number = Created;
        Task = task;
    }
}
`,
      python: src`
class WorkOrder:
    created = 0                     # class attribute: one copy, shared

    def __init__(self, task):
        WorkOrder.created += 1
        self.number = WorkOrder.created   # instance attribute: one per object
        self.task = task


w1 = WorkOrder("Replace bearing")
w2 = WorkOrder("Grease chain")
print(f"{w2.number}: {w2.task}")   # 2: Grease chain
print(WorkOrder.created)           # 2
`,
      notes: [
        "Most data belongs to each object. Data marked `static` in C#, or assigned in the class body in Python (a class attribute), belongs to the class itself, with one copy shared by all objects. Use it sparingly: shared, changeable data is a common source of surprises (see the questions below) and of bugs when several threads run at once.",
        "Inheritance (a class that extends another), interfaces and design principles are the subject of the Software Design & OOP section, and of stage 2 of this one.",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
var a = new Counter();
var b = a;
b.Increment();
Console.WriteLine(a.Count);

class Counter
{
    public int Count { get; private set; }
    public void Increment() => Count++;
}
`,
      output: "1",
      distractors: ["0", "2", "Compile error"],
      why: "`var b = a;` copies the reference, not the object: both variables point at the same Counter, so incrementing through `b` is visible through `a`. (A C# `struct` would be copied instead; classes are far more common.)",
    },
    {
      lang: "python",
      code: src`
class Tank:
    alarms = []

    def __init__(self, name):
        self.name = name

    def alarm(self, msg):
        self.alarms.append(msg)

a = Tank("A")
b = Tank("B")
a.alarm("high")
print(len(b.alarms))
`,
      output: "1",
      distractors: ["0", "AttributeError", "2"],
      why: "`alarms = []` in the class body creates one list that belongs to the class and is shared by every Tank. Give each object its own list in `__init__`: `self.alarms = []`.",
    },
    {
      lang: "csharp",
      code: src`
var p1 = new Point(1, 2);
var p2 = new Point(1, 2);
var r1 = new PointRecord(1, 2);
var r2 = new PointRecord(1, 2);
Console.WriteLine($"{p1 == p2} {r1 == r2}");

class Point
{
    public int X, Y;
    public Point(int x, int y) { X = x; Y = y; }
}
record PointRecord(int X, int Y);
`,
      output: "False True",
      distractors: ["True True", "False False", "True False"],
      why: "For a class, `==` checks whether both sides are the same object; these are two objects. A record generates value equality, comparing X and Y.",
    },
    {
      lang: "python",
      code: src`
from dataclasses import dataclass

@dataclass
class P:
    x: int
    y: int

class Q:
    def __init__(self, x):
        self.x = x

print(P(1, 2) == P(1, 2), Q(1) == Q(1))
print(P(1, 2))
`,
      output: "True False\nP(x=1, y=2)",
      distractors: ["True True\nP(x=1, y=2)", "False False\nP(1, 2)", "True False\n(1, 2)"],
      why: "`@dataclass` writes `__eq__` and `__repr__` for you from the field list. The plain class Q falls back to identity: two separate objects are never equal.",
    },
    {
      lang: "csharp",
      code: src`
var m = new Motor();
m.Speed = 5000;
Console.WriteLine(m.Speed);

class Motor
{
    private int _speed;
    public int Speed
    {
        get => _speed;
        set => _speed = Math.Clamp(value, 0, 3000);
    }
}
`,
      output: "3000",
      distractors: ["5000", "0", "ArgumentOutOfRangeException"],
      why: "Assigning to a property runs its `set` code, which clamps the value into 0 to 3000 before storing it.",
    },
    {
      lang: "python",
      code: src`
class Greeter:
    def hello():
        return "hi"

try:
    print(Greeter().hello())
except TypeError:
    print("TypeError")
`,
      output: "TypeError",
      distractors: ["hi", "AttributeError", "None"],
      why: "Calling a method on an object passes the object in as the first argument automatically. `hello` takes no parameters, so Python reports a `TypeError`: hello() takes 0 positional arguments but 1 was given. Every instance method needs `self` first.",
    },
    {
      lang: "csharp",
      code: src`
new Widget();
new Widget();
var w = new Widget();
Console.WriteLine($"{Widget.Created} {w.Id}");

class Widget
{
    public static int Created;
    public int Id { get; }
    public Widget() { Created++; Id = Created; }
}
`,
      output: "3 3",
      distractors: ["1 1", "3 1", "1 3"],
      why: "`Created` is static, so all three constructors increment the same counter. Each object stores the counter's value at the time it was made, and `w` was third.",
    },
  ],
  pitfalls: [
    "Forgetting `self` as the first parameter of a Python method, or forgetting `self.` when reading an attribute inside one.",
    "Putting a list or dict in a Python class body when each object needs its own. Create it in `__init__`.",
    "Expecting `==` to compare data on ordinary classes. Use a C# `record`, a Python `@dataclass`, or define equality yourself.",
    "Public fields that anyone can set to nonsense. Use properties (C#) or `@property` (Python) when values need checking.",
    "Huge classes that do everything. One class, one job; the Software Design & OOP section covers why and how.",
  ],
  next: [
    { id: "oop-basics", label: "OOP Basics: Classes, Objects, and Polymorphism (Software Design & OOP)" },
    { id: "interfaces-abstraction", label: "Interfaces & Abstraction" },
    { id: "basics-rectangle-class", label: "Exercise: A Rectangle Class" },
    { id: "lang-cheat-csharp", label: "Cheat sheets: C#, Python and the translation table" },
  ],
};

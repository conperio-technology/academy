import { src, type LangLessonData } from "./types.ts";

export const interfaces: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Inheritance in one minute",
      csharp: src`
Device[] devices = [new Pump("P-1"), new Fan("F-2"), new Device("D-3")];
foreach (var d in devices)
    Console.WriteLine(d.Describe());
// P-1 is a pump
// F-2 is a fan
// D-3 is a device

class Device
{
    public string Name { get; }
    public Device(string name) => Name = name;
    public virtual string Kind => "device";       // virtual: subclasses may replace it
    public string Describe() => $"{Name} is a {Kind}";
}

class Pump : Device                               // Pump inherits from Device
{
    public Pump(string name) : base(name) { }     // run Device's constructor
    public override string Kind => "pump";
}

class Fan : Device
{
    public int Speed { get; set; }
    public Fan(string name) : base(name) { }
    public override string Kind => "fan";
}
`,
      python: src`
class Device:
    def __init__(self, name):
        self.name = name

    def kind(self):
        return "device"

    def describe(self):
        return f"{self.name} is a {self.kind()}"


class Pump(Device):                  # Pump inherits from Device
    def kind(self):                  # any method can be overridden
        return "pump"


class Fan(Device):
    def __init__(self, name):
        super().__init__(name)       # run Device's __init__ first
        self.speed = 0

    def kind(self):
        return "fan"


for d in [Pump("P-1"), Fan("F-2"), Device("D-3")]:
    print(d.describe())
# P-1 is a pump
# F-2 is a fan
# D-3 is a device
`,
      notes: [
        "Inheritance lets one class (the subclass, or derived class) start from everything another class (the base class) has, and then add or change things. A Pump is a Device, so it has a Name and a `Describe` method without writing them again. Changing an inherited method in the subclass is called overriding.",
        "`Describe` is written once in Device, yet it prints \"pump\" for a Pump: the call to `Kind` picks the version belonging to the object's real class at run time. That's polymorphism, and it's what lets one loop treat many kinds of object the same way. In C#, a member can only be overridden if the base class marks it `virtual` (or `abstract`) and the subclass says `override`; in Python every method can be overridden.",
        "A subclass constructor must make sure the base class gets set up: `: base(name)` in C#, `super().__init__(name)` in Python. Python doesn't do this for you if you write your own `__init__`, a common source of missing attributes.",
      ],
    },
    {
      kind: "code",
      title: "Interfaces and protocols: a promise, with no code",
      csharp: src`
IAlarmSink[] sinks = [new ConsoleSink(), new CountingSink()];
foreach (var s in sinks)
    s.Raise("High pressure");             // ALARM: High pressure
var counter = (CountingSink)sinks[1];
Console.WriteLine(counter.Count);         // 1

interface IAlarmSink
{
    void Raise(string message);           // no body: just the promise
}

class ConsoleSink : IAlarmSink
{
    public void Raise(string message) => Console.WriteLine($"ALARM: {message}");
}

class CountingSink : IAlarmSink
{
    public int Count { get; private set; }
    public void Raise(string message) => Count++;
}
`,
      python: src`
from typing import Protocol


class AlarmSink(Protocol):
    def raise_alarm(self, message: str) -> None: ...


class ConsoleSink:                       # no base class: it just has the method
    def raise_alarm(self, message: str) -> None:
        print(f"ALARM: {message}")


class CountingSink:
    def __init__(self) -> None:
        self.count = 0

    def raise_alarm(self, message: str) -> None:
        self.count += 1


def notify_all(sinks: list[AlarmSink], message: str) -> None:
    for s in sinks:
        s.raise_alarm(message)


counter = CountingSink()
notify_all([ConsoleSink(), counter], "High pressure")   # ALARM: High pressure
print(counter.count)                                    # 1
`,
      notes: [
        "An interface lists methods a class promises to have, without saying how they work. Code that only needs \"something that can raise an alarm\" asks for an `IAlarmSink` and works with any class that implements it: one that prints, one that counts (handy in tests), one that sends an email. C# interface names start with `I` by convention, and a class can implement many interfaces but inherit from only one class.",
        "Python works by duck typing: \"if it walks like a duck and quacks like a duck, it's a duck\". `notify_all` just calls `raise_alarm`; any object with that method works, and one without it fails with AttributeError when the call is reached. A `Protocol` writes the expectation down for type checkers and editors (it's ignored when the program runs), and classes match it simply by having the right methods, with no need to inherit from it. That's called structural typing. The `...` is a placeholder body.",
      ],
    },
    {
      kind: "code",
      title: "Abstract classes: shared code with required gaps",
      csharp: src`
Sensor[] sensors = [new TempSensor(), new LevelSensor()];
foreach (var s in sensors)
    Console.WriteLine(s.Report());     // Temp: 21.5, then Level: 73.0
// new Sensor();                       // compile error CS0144: abstract

abstract class Sensor
{
    public abstract string Name { get; }
    protected abstract double ReadRaw();                     // every subclass must write this
    public string Report() => $"{Name}: {ReadRaw():F1}";    // shared by all
}

class TempSensor : Sensor
{
    public override string Name => "Temp";
    protected override double ReadRaw() => 21.46;
}

class LevelSensor : Sensor
{
    public override string Name => "Level";
    protected override double ReadRaw() => 73;
}
`,
      python: src`
from abc import ABC, abstractmethod


class Sensor(ABC):
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def read_raw(self) -> float: ...

    def report(self) -> str:                         # shared by all
        return f"{self.name()}: {self.read_raw():.1f}"


class TempSensor(Sensor):
    def name(self):
        return "Temp"

    def read_raw(self):
        return 21.46


class LevelSensor(Sensor):
    def name(self):
        return "Level"

    def read_raw(self):
        return 73


for s in [TempSensor(), LevelSensor()]:
    print(s.report())          # Temp: 21.5, then Level: 73.0
try:
    Sensor()
except TypeError as e:
    print("TypeError")         # Can't instantiate abstract class Sensor ...
`,
      notes: [
        "An abstract class sits between a normal class and an interface: it can hold real code and data (`Report`), but it also declares abstract members with no body that every subclass must supply. You can't create an object of the abstract class itself, only of a complete subclass. This shape, where the base class fixes the overall steps and subclasses fill in one, is called the Template Method pattern.",
        "Python's version uses `ABC` (abstract base class) from the `abc` module and the `@abstractmethod` decorator (a `@` line that adds behaviour to the function below it). Python checks when you create an object: a class with any abstract method left unwritten raises TypeError. C# checks at compile time. `protected` in C# means \"visible to this class and its subclasses only\".",
      ],
    },
    {
      kind: "code",
      title: "Asking what an object is",
      csharp: src`
object[] things = [new Pump("P-1"), "text", 42, 7];
foreach (var t in things)
{
    string what = t switch
    {
        Pump p => $"pump {p.Name}",
        string s => $"string of length {s.Length}",
        int n when n > 40 => "big int",
        _ => "something else",
    };
    Console.WriteLine(what);
}
// pump P-1 / string of length 4 / big int / something else

record Pump(string Name);
`,
      python: src`
class Pump:
    def __init__(self, name):
        self.name = name


for t in [Pump("P-1"), "text", 42, 7]:
    if isinstance(t, Pump):
        print(f"pump {t.name}")
    elif isinstance(t, str):
        print(f"string of length {len(t)}")
    elif isinstance(t, int) and t > 40:
        print("big int")
    else:
        print("something else")
# pump P-1 / string of length 4 / big int / something else
`,
      notes: [
        "C# type patterns (`Pump p` in a `switch` expression, or `if (t is Pump p)`) test the type and give you a typed variable in one step. Python's `isinstance(obj, Class)` is true for the class and any subclass of it.",
        "Use these at the edges of a program, where data of mixed types arrives. Inside your own code, prefer polymorphism: if you keep writing \"if it's a Pump do this, if it's a Fan do that\", that behaviour probably belongs in a method each class overrides.",
      ],
    },
    {
      kind: "table",
      title: "Which one to use",
      head: ["", "C# interface", "C# abstract class", "Python Protocol", "Python ABC"],
      rows: [
        ["Holds code", "Only default methods (C# 8+), rarely used", "Yes", "No (it's a description)", "Yes"],
        ["Holds data (fields)", "No", "Yes", "No", "Yes"],
        ["How a class signs up", "`: IName`, many allowed", "`: Base`, only one", "Nothing: having the methods is enough", "Inherit from it"],
        ["Checked", "Compile time", "Compile time", "By a type checker, before running", "When an object is created"],
        ["Reach for it when", "Different classes share a capability", "Related classes share code and steps", "Describing what a function needs", "You want shared code and a runtime check"],
      ],
      notes: [
        "Most C# code depends on interfaces, which is also what makes test doubles and dependency injection easy (see Interfaces & Abstraction and Services & Dependency Injection in Software Design & OOP). Prefer composition, an object holding other objects, over deep inheritance chains.",
      ],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
Base b = new Derived();
Console.WriteLine(b.Who() + " " + b.Hidden());

class Base
{
    public virtual string Who() => "base";
    public string Hidden() => "base";
}
class Derived : Base
{
    public override string Who() => "derived";
    public new string Hidden() => "derived";
}
`,
      output: "derived base",
      distractors: ["derived derived", "base base", "base derived"],
      why: "`override` replaces the virtual method, so the object's real class decides: \"derived\". `new` only hides the base method for code that sees the variable as a Derived; through a Base variable, the base version runs. Hiding with `new` is almost always a mistake.",
    },
    {
      lang: "python",
      code: src`
class A:
    def hello(self):
        return "A"

class B(A):
    def hello(self):
        return "B" + super().hello()

class C(B):
    pass

print(C().hello())
`,
      output: "BA",
      distractors: ["A", "B", "CBA"],
      why: "C defines nothing, so Python looks up `hello` in B, the next class up. B's version adds \"B\" in front of what A's version returns.",
    },
    {
      lang: "python",
      code: src`
class Duck:
    def speak(self):
        return "quack"

class Robot:
    def speak(self):
        return "beep"

class Rock:
    pass

for thing in [Duck(), Robot(), Rock()]:
    try:
        print(thing.speak())
    except AttributeError:
        print("silent")
`,
      output: "quack\nbeep\nsilent",
      distractors: ["quack\nbeep", "quack\nquack\nsilent", "TypeError"],
      why: "Duck typing: Duck and Robot share no base class, but both have `speak`, so both work. Rock has no `speak`, and the failure only shows up when the call runs.",
    },
    {
      lang: "python",
      code: src`
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self): ...

class Square(Shape):
    def __init__(self, s):
        self.s = s

try:
    print(Square(2).area())
except TypeError:
    print("TypeError")
`,
      output: "TypeError",
      distractors: ["None", "4", "AttributeError"],
      why: "Square never writes `area`, so it's still abstract and creating one raises TypeError before `area` is even called.",
    },
    {
      lang: "csharp",
      code: src`
new Child();

class Parent
{
    public Parent() => Console.WriteLine("Parent");
}
class Child : Parent
{
    public Child() => Console.WriteLine("Child");
}
`,
      output: "Parent\nChild",
      distractors: ["Child\nParent", "Child", "Parent"],
      why: "Building a Child runs the base class constructor first (C# calls the parameterless one automatically), then the Child constructor's body.",
    },
    {
      lang: "python",
      code: src`
class Parent:
    def __init__(self):
        self.ready = True

class Child(Parent):
    def __init__(self):
        self.name = "c"

c = Child()
print(hasattr(c, "name"), hasattr(c, "ready"))
`,
      output: "True False",
      distractors: ["True True", "False True", "AttributeError"],
      why: "Child's `__init__` replaces Parent's and never calls `super().__init__()`, so `ready` is never set. Unlike C#, Python doesn't run the base constructor for you.",
    },
    {
      lang: "csharp",
      code: src`
ILogger log = new Quiet();
log.Info("x");
Console.WriteLine(log.Prefix("y"));

interface ILogger
{
    void Info(string msg);
    string Prefix(string msg) => $"[app] {msg}";
}
class Quiet : ILogger
{
    public void Info(string msg) { }
}
`,
      output: "[app] y",
      distractors: ["x\n[app] y", "y", "Compile error"],
      why: "Since C# 8 an interface can give a method a default body, used by classes that don't write their own. `Info` does nothing in Quiet, so only the prefixed text prints.",
    },
    {
      lang: "csharp",
      code: src`
object?[] xs = [3, "3", 3.0, null, 4L];
int count = 0;
foreach (var x in xs)
    if (x is int) count++;
Console.WriteLine(count);
`,
      output: "1",
      distractors: ["2", "3", "4"],
      why: "Only the first item is an int. \"3\" is a string, 3.0 a double, `4L` a long, and `null is int` is false.",
    },
    {
      lang: "python",
      code: src`
class Animal:
    pass

class Dog(Animal):
    pass

d = Dog()
print(isinstance(d, Animal), type(d) == Animal, issubclass(Dog, Animal))
`,
      output: "True False True",
      distractors: ["True True True", "False False True", "True False False"],
      why: "`isinstance` accepts subclasses: a Dog is an Animal. `type(d)` is exactly Dog, so comparing it with Animal is false. That's why `isinstance` is usually what you want.",
    },
  ],
  pitfalls: [
    "Forgetting `virtual` and `override` in C#, or using `new`, so the base version runs when you expected the subclass's.",
    "Writing `__init__` in a Python subclass and forgetting `super().__init__(...)`.",
    "Deep inheritance trees (A, then B, then C, then D) where a change at the top breaks things far below. Prefer small interfaces and composition.",
    "Creating an interface for every class \"just in case\". Add one when there's a second implementation or a test needs a stand-in.",
    "Long chains of `is` / `isinstance` checks instead of a method each class overrides.",
  ],
  next: [
    { id: "inter-shape-areas", label: "Exercise: Shapes with an Abstract Base Class" },
    { id: "lang-generics", label: "Generics and Type Hints" },
    { id: "interfaces-abstraction", label: "Interfaces & Abstraction: Program to a Contract (Software Design & OOP)" },
    { id: "oop-basics", label: "OOP Basics: Classes, Objects, and Polymorphism" },
  ],
};

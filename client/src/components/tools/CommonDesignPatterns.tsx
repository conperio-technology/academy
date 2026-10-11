import { useState } from "react";
import { openLesson } from "../../api";
import { FAMILY_LESSON_ID, QUIZ_LESSON_ID, SOLID_LESSON_ID } from "../../designPatternsData";

interface Pattern {
  key: string;
  label: string;
  description: string;
  code: string;
}

const PATTERNS: Pattern[] = [
  {
    key: "strategy",
    label: "Strategy",
    description:
      "Swap an algorithm's behavior at runtime by handing in a different implementation of a shared " +
      "interface, instead of branching on a type flag inside one big function -- OOP Basics' Shape " +
      "example already IS this pattern (each shape is a different \"strategy\" for computing area). " +
      "This app's five Sorting concepts (Bubble/Insertion/Selection/Merge/Quick) are all different " +
      "strategies for the same \"sort this array\" goal.",
    code: "interface ISortStrategy { void Sort(int[] data); }\nclass BubbleSort : ISortStrategy { /* ... */ }\nclass QuickSort : ISortStrategy { /* ... */ }",
  },
  {
    key: "factory",
    label: "Factory",
    description:
      "A method whose entire job is constructing and returning the right concrete object, so calling " +
      "code never has to know which concrete class to instantiate -- just what it asked for. Useful " +
      "the moment \"which class to build\" depends on runtime information (a config value, a user's " +
      "input) rather than being known at compile time.",
    code: 'static IShape CreateShape(string kind) => kind switch\n{\n    "circle" => new Circle(),\n    "rectangle" => new Rectangle(),\n    _ => throw new ArgumentException(kind),\n};',
  },
  {
    key: "observer",
    label: "Observer",
    description:
      "One object (the SUBJECT) keeps a list of other objects (OBSERVERS) and notifies all of them " +
      "when something happens, without needing to know anything about who's listening or what they'll " +
      "do about it. Every onClick handler in this app's own React frontend is this pattern in " +
      "miniature -- the button is the subject, your handler function is the observer.",
    code: "button.onClick(() => {\n    // this handler is an \"observer\" -- the button doesn't know\n    // or care what it does, just that it should run when clicked\n});",
  },
  {
    key: "singleton",
    label: "Singleton",
    description:
      "Guarantees exactly one instance of a class exists, accessible globally -- useful for something " +
      "genuinely one-of-a-kind app-wide (this app's ConceptRegistry and ToolRegistry are effectively " +
      "singletons: one static, shared list, read everywhere, constructed once). Worth the caution that " +
      "comes with it, though: singletons create hidden global state that's easy to lean on too " +
      "heavily, and modern designs increasingly prefer registering something once via dependency " +
      "injection (see Services & Dependency Injection) over a hard-coded singleton, specifically " +
      "because an injected dependency can be swapped for a test double and a singleton can't.",
    code: "public static class ConceptRegistry\n{\n    private static readonly List<IConcept> All = [ /* ... */ ]; // one shared list, whole app\n    public static IReadOnlyList<IConcept> GetAll() => All;\n}",
  },
];

// This lesson stays the short intro; these point into the full track that follows it.
const DEEPER_LINKS = [
  { id: SOLID_LESSON_ID, label: "SOLID Principles", note: "the five smells and their fixes" },
  { id: FAMILY_LESSON_ID.creational, label: "Creational Patterns", note: "Factory Method, Abstract Factory, Builder, Singleton, Prototype" },
  { id: FAMILY_LESSON_ID.structural, label: "Structural Patterns", note: "Adapter, Decorator, Facade, Proxy, Composite" },
  { id: FAMILY_LESSON_ID.behavioral, label: "Behavioral Patterns", note: "Strategy, Observer, Command, State and three more" },
  { id: QUIZ_LESSON_ID, label: "Which Pattern Is This?", note: "30 recognition questions" },
];

export function CommonDesignPatterns() {
  const [selected, setSelected] = useState("strategy");
  const pattern = PATTERNS.find((p) => p.key === selected)!;

  return (
    <div className="tool-widget">
      <div className="arch-cards">
        {PATTERNS.map((p) => (
          <button key={p.key} className={`arch-card ${selected === p.key ? "selected" : ""}`} onClick={() => setSelected(p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="arch-detail">
        <strong>{pattern.label}</strong>
        <p>{pattern.description}</p>
      </div>

      <pre className="algo-code">{pattern.code}</pre>

      <div className="dp-deeper">
        <strong>Go deeper: the design patterns track</strong>
        <p>
          These four are the short version. The track that follows this lesson covers SOLID and seventeen patterns in
          full, each with when not to use it, a structure diagram, idiomatic C#, real .NET examples and the interview
          angle, then a recognition quiz.
        </p>
        <ul>
          {DEEPER_LINKS.map((link) => (
            <li key={link.id}>
              <button className="link-button" onClick={() => openLesson(link.id)}>
                {link.label}
              </button>{" "}
              <span className="gate-note">{link.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

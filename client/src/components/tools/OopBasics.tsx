import { useState } from "react";

const PROCEDURAL_BASE = `double CalculateArea(string shapeType, double a, double b)
{
    if (shapeType == "circle") return Math.PI * a * a;
    if (shapeType == "rectangle") return a * b;`;

const PROCEDURAL_TRIANGLE_LINE = `
    if (shapeType == "triangle") return 0.5 * a * b;  // <- edited into the SAME function`;

const PROCEDURAL_TAIL = `
    throw new ArgumentException("Unknown shape: " + shapeType);
}`;

const OOP_BASE = `interface IShape { double Area(); }

class Circle : IShape
{
    public double Radius;
    public double Area() => Math.PI * Radius * Radius;
}

class Rectangle : IShape
{
    public double Width, Height;
    public double Area() => Width * Height;
}`;

const OOP_TRIANGLE_BLOCK = `

class Triangle : IShape                    // <- a whole new file, nothing above changed
{
    public double Base, Height;
    public double Area() => 0.5 * Base * Height;
}`;

export function OopBasics() {
  const [addTriangle, setAddTriangle] = useState(false);
  const [tab, setTab] = useState<"procedural" | "oop">("procedural");

  const proceduralCode = PROCEDURAL_BASE + (addTriangle ? PROCEDURAL_TRIANGLE_LINE : "") + PROCEDURAL_TAIL;
  const oopCode = OOP_BASE + (addTriangle ? OOP_TRIANGLE_BLOCK : "");

  return (
    <div className="tool-widget">
      <div className="language-tabs">
        <button className={`language-tab ${tab === "procedural" ? "active" : ""}`} onClick={() => setTab("procedural")}>
          Procedural
        </button>
        <button className={`language-tab ${tab === "oop" ? "active" : ""}`} onClick={() => setTab("oop")}>
          OOP
        </button>
      </div>

      <pre className="algo-code">{tab === "procedural" ? proceduralCode : oopCode}</pre>

      <div className="darr-actions">
        <button onClick={() => setAddTriangle((v) => !v)}>
          {addTriangle ? "✓ Triangle added -- see what changed" : "+ add a Triangle shape"}
        </button>
      </div>

      <p className="gate-note">
        {addTriangle
          ? tab === "procedural"
            ? "The procedural version required editing the SAME function every other shape already depends on -- a typo here risks breaking Circle or Rectangle too."
            : "The OOP version only required a brand new, completely separate class -- nothing above it changed at all."
          : 'Toggle "add a Triangle shape" to see what changes in each version.'}
      </p>
    </div>
  );
}

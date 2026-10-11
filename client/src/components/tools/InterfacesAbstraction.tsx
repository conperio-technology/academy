import { useState } from "react";

interface Animal {
  name: string;
  sound: string;
  code: string;
}

const ANIMALS: Animal[] = [
  { name: "Dog", sound: "Woof!", code: 'class Dog : IAnimal { public string MakeSound() => "Woof!"; }' },
  { name: "Cat", sound: "Meow!", code: 'class Cat : IAnimal { public string MakeSound() => "Meow!"; }' },
  { name: "Duck", sound: "Quack!", code: 'class Duck : IAnimal { public string MakeSound() => "Quack!"; }' },
  { name: "Cow", sound: "Moo!", code: 'class Cow : IAnimal { public string MakeSound() => "Moo!"; }' },
];

export function InterfacesAbstraction() {
  const [selected, setSelected] = useState(ANIMALS[0]);

  return (
    <div className="tool-widget">
      <p className="gate-note">This calling code never changes, no matter which animal is picked:</p>
      <pre className="algo-code">{"void Announce(IAnimal a)\n{\n    Console.WriteLine(a.MakeSound());\n}"}</pre>

      <div className="arch-cards">
        {ANIMALS.map((a) => (
          <button
            key={a.name}
            className={`arch-card ${selected.name === a.name ? "selected" : ""}`}
            onClick={() => setSelected(a)}
          >
            {a.name}
          </button>
        ))}
      </div>

      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Announce(new {selected.name}())</span>
          <span className="readout-value">"{selected.sound}"</span>
        </div>
      </div>

      <pre className="algo-code">{selected.code}</pre>
    </div>
  );
}

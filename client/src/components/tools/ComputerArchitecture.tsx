import { useState } from "react";

interface Component {
  key: string;
  label: string;
  layer: "software" | "hardware";
  description: string;
}

const COMPONENTS: Component[] = [
  {
    key: "app",
    label: "Your Code",
    layer: "software",
    description:
      "The C# or Python you write in this app. It never talks to hardware directly -- every \"read this file\" or " +
      "\"allocate this memory\" is really a request handed down to the operating system.",
  },
  {
    key: "os",
    label: "Operating System",
    layer: "software",
    description:
      "Windows, macOS, or Linux. Manages every other component on this page so your code doesn't have to know " +
      "the specifics: which CPU, how much RAM is free, what kind of disk. This is the hardware/software boundary.",
  },
  {
    key: "cpu",
    label: "CPU",
    layer: "hardware",
    description:
      "The general-purpose processor. A handful of powerful cores, each capable of running completely " +
      "different instructions one after another -- everything else exists to feed it data or store what it " +
      "produces. Built from billions of logic gates (see Logic Gates).",
  },
  {
    key: "gpu",
    label: "GPU",
    layer: "hardware",
    description:
      "A specialized processor built the opposite way from a CPU: thousands of small, simple cores that all " +
      "run the SAME operation on different pieces of data at once. Originally for computing the color of " +
      "millions of screen pixels in parallel, and now also the workhorse behind training AI models -- same " +
      "shape of problem, the same math applied across huge arrays of numbers.",
  },
  {
    key: "ram",
    label: "RAM",
    layer: "hardware",
    description:
      "Main memory. Holds whatever's actively being worked on -- fast, but volatile: it's wiped the instant power " +
      "is lost, which is why unsaved work disappears on a crash.",
  },
  {
    key: "storage",
    label: "Storage (SSD/HDD)",
    layer: "hardware",
    description:
      "Long-term storage. Much slower than RAM, but it survives being powered off -- files are still there when " +
      "you turn the computer back on.",
  },
  {
    key: "motherboard",
    label: "Motherboard",
    layer: "hardware",
    description:
      "The wiring (buses) connecting every other component so they can exchange data with each other and with " +
      "the CPU.",
  },
];

const MEMORY_HIERARCHY = [
  { level: "CPU Registers", size: "~1 KB", speed: "< 1 ns" },
  { level: "CPU Cache (L1-L3)", size: "KB - tens of MB", speed: "1-10 ns" },
  { level: "RAM", size: "GBs", speed: "~100 ns" },
  { level: "SSD", size: "hundreds of GB - TBs", speed: "~10-100 μs" },
  { level: "HDD", size: "TBs+", speed: "~1-10 ms" },
];

export function ComputerArchitecture() {
  const [selected, setSelected] = useState<string>("cpu");
  const component = COMPONENTS.find((c) => c.key === selected)!;

  return (
    <div className="tool-widget">
      <div className="arch-layers">
        <div className="arch-layer arch-layer-software">
          <span className="arch-layer-label">software</span>
          <div className="arch-cards">
            {COMPONENTS.filter((c) => c.layer === "software").map((c) => (
              <button
                key={c.key}
                className={`arch-card ${selected === c.key ? "selected" : ""}`}
                onClick={() => setSelected(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="arch-layer arch-layer-hardware">
          <span className="arch-layer-label">hardware</span>
          <div className="arch-cards">
            {COMPONENTS.filter((c) => c.layer === "hardware").map((c) => (
              <button
                key={c.key}
                className={`arch-card ${selected === c.key ? "selected" : ""}`}
                onClick={() => setSelected(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="arch-detail">
        <strong>{component.label}</strong>
        <p>{component.description}</p>
      </div>

      <table className="bigo-table">
        <thead>
          <tr>
            <th>Memory hierarchy level</th>
            <th>Typical size</th>
            <th>Typical latency</th>
          </tr>
        </thead>
        <tbody>
          {MEMORY_HIERARCHY.map((row) => (
            <tr key={row.level}>
              <td>{row.level}</td>
              <td className="mono">{row.size}</td>
              <td className="mono">{row.speed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

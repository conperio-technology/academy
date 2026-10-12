import { src, type LangLessonData } from "./types.ts";

export const startHere: LangLessonData = {
  parts: [
    {
      kind: "code",
      title: "Your first program in each language",
      csharp: src`
// hello.cs
Console.WriteLine("Hello, world!");
`,
      python: src`
# hello.py
print("Hello, world!")
`,
      notes: [
        "Both print one line of text. `Console.WriteLine` is C#'s built-in way to write a line to the console (the text window a program runs in); `print` is Python's.",
        "In C#, text inside double quotes is a string (a piece of text), each statement (one complete instruction) ends with a semicolon, and `//` starts a comment, a note for humans that the computer ignores. Python strings can use double or single quotes, a line break ends a statement, and `#` starts a comment.",
        "To run them yourself: with the .NET 10 SDK installed, `dotnet run hello.cs` compiles and runs the C# file (bigger programs live in a project made by `dotnet new console`). With Python installed, `python hello.py` (or `python3 hello.py` on Linux and macOS) runs the Python file.",
      ],
    },
    {
      kind: "code",
      title: "A slightly bigger program: braces versus indentation",
      csharp: src`
int total = 0;
for (int i = 1; i <= 5; i++)
{
    if (i % 2 == 1)
    {
        total = total + i;
    }
}
Console.WriteLine($"Sum of the odd numbers 1 to 5: {total}");
`,
      python: src`
total = 0
for i in range(1, 6):
    if i % 2 == 1:
        total = total + i
print(f"Sum of the odd numbers 1 to 5: {total}")
`,
      notes: [
        "Same program, same output (`Sum of the odd numbers 1 to 5: 9`). The loop runs `i` through 1, 2, 3, 4, 5; `%` gives the remainder after division, so `i % 2 == 1` means \"i is odd\".",
        "C# marks which lines belong to the loop and to the `if` with curly braces `{ }`. The indentation is only for people reading it; the compiler ignores it. Python has no braces: a line ending in a colon starts a block, and the block is every following line indented further. The indentation is the meaning, so a line that is indented wrongly either fails or quietly moves out of the loop.",
        "C# says `int total = 0;`: the variable `total` holds an `int` (a whole number) and can never hold anything else. Python just says `total = 0`. Both `$\"...{total}\"` in C# and `f\"...{total}\"` in Python build a string with a value dropped into the braces; the Strings lesson covers them.",
      ],
    },
    {
      kind: "code",
      title: "Static versus dynamic typing: when a type mistake is caught",
      csharp: src`
int count = 5;
count = "five";   // error CS0029: Cannot implicitly convert type 'string' to 'int'
Console.WriteLine(count);
`,
      python: src`
count = 5
count = "five"     # fine: the name now points at a string
print(count + 1)   # TypeError: can only concatenate str (not "int") to str
`,
      notes: [
        "A type is the kind of value something is: a whole number, a decimal number, text, true or false. C# is statically typed: every variable's type is fixed in the source code, and the compiler checks every line before anything runs. The C# program above never starts; the build fails with error CS0029 pointing at line 2.",
        "Python is dynamically typed: a variable is just a name that can point at any value, and types are checked only when a line actually runs. The Python program above prints nothing until it reaches the last line, then stops with a `TypeError`. If that line sat inside a branch that rarely runs, the mistake could hide for months.",
        "Python does have optional type hints (`count: int = 5`), which editors and tools such as mypy check for you. Python itself ignores them when the program runs.",
      ],
      expectError: { csharp: "CS0029", python: "TypeError" },
    },
    {
      kind: "terms",
      title: "Words used in this section, in plain English",
      terms: [
        { term: "Source code", meaning: "The text of a program, as a person writes it." },
        { term: "Compiler", meaning: "A program that translates source code into another form, all at once, before the program runs. It also reports mistakes it can find without running anything." },
        { term: "Interpreter", meaning: "A program that reads instructions one at a time and carries each one out immediately." },
        { term: "IL (intermediate language)", meaning: "What the C# compiler produces: a compact list of instructions for no particular processor, stored in a .dll file." },
        { term: "JIT (just-in-time) compiler", meaning: "Part of the .NET runtime that turns IL into the processor's own machine code while the program runs, each method the first time it's called." },
        { term: "Bytecode", meaning: "What Python turns your source into before running it: a compact list of instructions that Python's interpreter then carries out." },
        { term: "Runtime", meaning: "The software that runs alongside your program and supports it: the .NET runtime for C#, the Python interpreter for Python. It manages memory, reports errors and more." },
        { term: "Statement and expression", meaning: "A statement is one complete instruction (`total = total + i`). An expression is a piece of code that produces a value (`total + i`). Statements are made of expressions." },
        { term: "Variable", meaning: "A name for a value, so you can store it and use it later." },
        { term: "Type", meaning: "The kind of value: whole number, decimal number, text, true or false, a list, and so on. It decides what you can do with the value." },
        { term: "Static typing", meaning: "Types are fixed in the source and checked by the compiler before the program runs (C#)." },
        { term: "Dynamic typing", meaning: "Types belong to values, not names, and are checked as each line runs (Python)." },
        { term: "Block", meaning: "A group of statements that belong together, like the body of a loop. Braces in C#, indentation in Python." },
        { term: "Function (or method)", meaning: "A named, reusable piece of code that takes inputs and can return a result. In C# functions live inside classes and are called methods." },
        { term: "Sandbox", meaning: "A locked-down place to run code where it can't touch files, the network or other programs. The academy runs your C# in one, inside your browser." },
      ],
    },
    {
      kind: "text",
      title: "What each language is for",
      paragraphs: [
        "C# (said \"C sharp\") is Microsoft's main language for the .NET platform. It's used for business applications, web services and APIs, Windows desktop tools, games built with Unity, and a lot of the software around industrial systems, such as HMI add-ons, data collectors and test tools. Its compiler catches many mistakes early, which helps on large programs that many people work on for years.",
        "Python is the most common language for scripting and automation, data analysis, machine learning and AI, and quick one-off tools. It needs very little ceremony, so programs are short. That also makes it popular for coding interviews, where you write a solution in 30 minutes on a whiteboard or in a shared editor.",
        "Both are general purpose: you can write almost anything in either. The ideas in the basics track (variables, decisions, loops, functions, collections, errors, classes) are the same in both, so learning them side by side means you learn each idea once and see two spellings of it.",
      ],
    },
    {
      kind: "steps",
      title: "How to use this section",
      steps: [
        "The switch at the top of every lesson shows C# and Python side by side, or just one of them. Your choice is remembered in this browser.",
        "Each lesson ends with predict-the-output questions: read the program, decide what it prints, then pick an answer to see the explanation.",
        "The graded exercises in this track (the lessons with a code editor) give you a function to finish. Pick C# or Python with the language tab above the editor, write your code, then press Run Tests. Each test calls your function with an input and compares what it returns with the expected answer.",
        "Exercises are graded on the value your function returns, not on what it prints. In fact, printing with `Console.WriteLine` is blocked in C# exercises, because your C# runs in a sandbox that only allows plain computation. Both languages run entirely in your browser.",
        "Stuck? The reference solution unlocks once you pass, or after a few attempts. Read it, then close it and write your own version from memory.",
        "The cheat sheets at the end of the section are one-page references for both languages, with a C# to Python translation table, a search box, copy buttons, and a layout that prints cleanly.",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
for i in range(3):
    print("a")
print("b")
`,
      output: "a\na\na\nb",
      distractors: ["a\nb\na\nb\na\nb", "a\na\na", "a\nb"],
      why: "Only the indented line belongs to the loop, so `a` prints three times. `print(\"b\")` is not indented, so it runs once, after the loop finishes.",
    },
    {
      lang: "csharp",
      code: src`
for (int i = 0; i < 3; i++)
    Console.WriteLine("a");
    Console.WriteLine("b");
`,
      output: "a\na\na\nb",
      distractors: ["a\nb\na\nb\na\nb", "a\na\na", "Compile error"],
      why: "Without braces, a C# loop owns exactly one statement: the first `WriteLine`. The second one is indented to look like part of the loop, but C# ignores indentation, so it runs once after the loop. This is why most C# style guides insist on braces.",
    },
    {
      lang: "csharp",
      code: src`
Console.WriteLine(1 + 2 + "3");
Console.WriteLine("1" + 2 + 3);
`,
      output: "33\n123",
      distractors: ["6\n6", "123\n123", "33\n15"],
      why: "C# works left to right. In the first line `1 + 2` is number addition (3), then adding a string turns the 3 into text and joins: \"33\". In the second, `\"1\" + 2` is already text (\"12\"), and adding 3 joins again: \"123\".",
    },
    {
      lang: "python",
      code: src`
x = 5
x = "five"
print(x)
`,
      output: "five",
      distractors: ["5", "TypeError", "5five"],
      why: "A Python variable is a name, not a typed box. The second line simply points `x` at a string instead of a number. The C# equivalent wouldn't compile.",
    },
  ],
  pitfalls: [
    "Mixing tabs and spaces for indentation in Python. Use four spaces (every editor can insert them when you press Tab).",
    "Forgetting the colon at the end of a Python `if`, `for`, `while` or `def` line. The error is a `SyntaxError` pointing at that line.",
    "Forgetting a semicolon or a closing brace in C#. The compiler's error often points at the line after the real mistake.",
    "Assuming Python checks types for you. It checks when a line runs, so test every branch, or use type hints and a checker.",
  ],
  next: [
    { id: "compiled-vs-interpreted", label: "Compiled vs Interpreted: how C# and Python really run (Computer Fundamentals)" },
    { id: "lang-variables-types", label: "Next: Variables, Types and Expressions" },
  ],
};

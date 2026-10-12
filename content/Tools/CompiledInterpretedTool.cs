namespace DsaAcademy.Content.Tools;

public class CompiledInterpretedTool : ITool
{
    public string Id => "compiled-vs-interpreted";
    public string Section => "Computer Fundamentals";
    public string Track => "operating systems and runtimes";
    public string Title => "Compiled vs Interpreted: How C# and Python Run";
    public string OneLiner => "Roslyn to IL to JIT or AOT for C#, source to bytecode on a virtual machine for Python, and why \"compiled language\" is the wrong question.";
    public string KeyTakeaway =>
        "Compiled and interpreted describe implementations, not languages, and most real runtimes mix both. C# is " +
        "compiled by Roslyn to intermediate language (IL), and at run time the .NET JIT compiles each method to native " +
        "code on first call, first quickly (tier 0) and then again with full optimization once the method proves hot " +
        "(tier 1). Native AOT does that compilation at build time instead. CPython compiles Python source to bytecode and " +
        "then interprets the bytecode in a loop, which is why pure Python is typically 10 to 100 times slower than C# on tight loops.";

    public ToolKind ToolKind => ToolKind.CompiledInterpreted;

    public string Explanation =>
        "A compiler translates a whole program into another form before it runs. An interpreter reads a program and " +
        "carries it out as it goes. Ahead-of-time (AOT) compilation to machine code (the CPU's own binary instructions), as C, C++, Rust and Go do, gives fast " +
        "startup and fast steady-state code but produces a binary per operating system and CPU. Pure interpretation is " +
        "portable and quick to start, but every operation pays for decoding and dispatch. A just-in-time (JIT) compiler " +
        "sits between: it compiles to machine code while the program runs, so it can target the exact CPU it's on and " +
        "optimize based on how the code is actually used.\n\n" +
        "C# takes the managed route. Roslyn, the C# compiler (also what powers IDE analyzers), parses your code, binds " +
        "names and types, reports errors, and emits an assembly: a .dll containing IL, a stack-based instruction set " +
        "that isn't tied to any CPU, plus metadata describing every type and method. When the app runs, the CLR (Common Language Runtime, " +
        "the engine that runs .NET programs) loads the assembly and, the first time each method is called, the RyuJIT compiler (.NET's JIT) turns that method's IL into " +
        "native x64 or ARM64 code. That's why the first call to anything is slower than the second.\n\n" +
        "Since .NET Core 3.0 the JIT is tiered. Tier 0 compiles quickly with few optimizations, so startup is fast. The " +
        "runtime counts calls, and once a method has been called 30 times it is recompiled in the background at tier 1 " +
        "with full optimization (inlining, which copies small methods into their callers; register allocation, which keeps values in CPU registers; loop optimizations) and calls switch to the new code. " +
        "Methods with loops that run long can be swapped mid-loop through on-stack replacement (OSR), which swaps optimized code in while the loop is still running. Since .NET 8, " +
        "dynamic profile-guided optimization (PGO) is on by default: tier 0 code records which types and branches actually " +
        "occur, and tier 1 uses that, for example to inline the one implementation an interface call nearly always hits.\n\n" +
        "Two options move work to build time. ReadyToRun ships precompiled native code inside the assembly to cut " +
        "startup, and the JIT can still recompile hot methods at tier 1. Native AOT (ahead of time) compiles the whole app to " +
        "a single native executable with no JIT at run time: fast startup and low memory, good for containers and command-line " +
        "tools, but it trims (removes) unused code, and anything that generates code at run time (Reflection.Emit, some " +
        "serializers and dependency-injection containers) must be avoided or replaced by source generators.\n\n" +
        "CPython, the standard Python, also compiles first. It tokenizes and parses the source into an abstract syntax tree " +
        "(a tree that represents the structure of the code), compiles that to bytecode in code objects, and caches the bytecode of imported modules as .pyc files in " +
        "__pycache__. Then the interpreter, a big loop in C, executes the bytecode on a stack-based virtual machine, one " +
        "instruction at a time, with every value a heap object whose type is checked at run time. Python 3.11 added a " +
        "specializing adaptive interpreter that rewrites hot instructions into type-specific versions (adding two ints, " +
        "say), and 3.13 added an experimental JIT that is off by default. PyPy is an alternative Python with a tracing JIT.\n\n" +
        "Linking is the other half of building native code: see Linkers, Libraries and Loading for how separately " +
        "compiled pieces become one program.";
}

namespace DsaAcademy.Content.Tools;

public class LinkersLibrariesTool : ITool
{
    public string Id => "linkers-libraries";
    public string Section => "Computer Fundamentals";
    public string Track => "operating systems and runtimes";
    public string Title => "Linkers, Libraries and Loading";
    public string OneLiner => "How separately compiled files become one program, what \"undefined reference\" really means, and static vs dynamic libraries.";
    public string KeyTakeaway =>
        "A compiler turns each source file into an object file that defines some symbols and refers to others it " +
        "can't see. The linker combines the object files and libraries, matches every reference to exactly one " +
        "definition, lays the code out in memory, and patches each call with its final address. No definition gives an " +
        "\"undefined reference\" error; two definitions give \"multiple definition\". Static libraries are copied into " +
        "the executable at link time; shared libraries (.so, .dll) are found and bound when the program loads.";

    public ToolKind ToolKind => ToolKind.LinkersLibraries;

    public string Explanation =>
        "C and C++ compile one source file at a time. Compiling main.c produces main.o, an object file with machine " +
        "code, data, and a symbol table: the names this file defines (main) and the names it uses but doesn't define " +
        "(parse_args, printf). At every place the code uses an undefined name, the compiler leaves a placeholder " +
        "address and a relocation entry that says \"put the address of parse_args here\". The compiler never sees the " +
        "other files, which is why a declaration in a header (a file of declarations shared between source files) is enough to compile a call but not to run it.\n\n" +
        "The linker (ld, lld or MSVC's link.exe) does four things. It reads all the object files and libraries. It " +
        "resolves symbols, matching each undefined reference to exactly one definition. It merges the sections (all " +
        "code together, all data together) and assigns every function and global a final address. Then it applies the " +
        "relocations, patching each placeholder with the real address, and writes an executable. If a reference has no " +
        "definition you get \"undefined reference to parse_args\" (LNK2019 on Windows). If two object files both define " +
        "the same non-static symbol, you get \"multiple definition\" (LNK2005). Marking a C function static, or putting it " +
        "in an anonymous namespace in C++, makes it local to its file so it never clashes.\n\n" +
        "A static library (libfoo.a, foo.lib) is an archive of object files. The linker copies in only the members that " +
        "resolve a symbol something still needs, and the code becomes part of your executable: one self-contained file, " +
        "but every program carries its own copy and must be relinked to pick up a fix. GNU ld also scans archives in " +
        "command-line order, so a library listed before the files that use it can still produce undefined references. " +
        "A shared library (libc.so.6, kernel32.dll) is linked dynamically: the linker records only that the program needs " +
        "it, and the dynamic linker loads it and binds the symbols when the program starts, often lazily on first call " +
        "through a procedure linkage table. One copy in memory is shared by every process, and a security fix to the " +
        "library fixes every program, but the program fails at startup if the library is missing or incompatible.\n\n" +
        "Managed languages move most of this to run time. A C# project references other assemblies by name and " +
        "version; the CLR finds, loads and binds them when a method first needs them, so a missing assembly shows up as " +
        "a FileNotFoundException at run time, not a link error. Native AOT brings a real link step back, and the IL " +
        "trimmer removes unused code first. Python resolves import statements when they execute, which is why a typo in " +
        "an import inside a rarely called function only fails when that function runs. For what happens when the program " +
        "is started and the dynamic linker runs, see What Happens When You Run a Program.";
}

import { src, type OpsLessonData } from "../types.ts";

export const memorySafety: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "A whole category of the most serious security bugs comes down to one thing: a program reading or writing memory it was never meant to touch. These are memory-safety bugs, and for decades they have been the leading cause of critical vulnerabilities in software written in C and C++, including operating systems, browsers and network services. Microsoft and Google have both reported that around 70% of their severe security issues are memory-safety bugs.",
        "This lesson is about understanding the problem so you can avoid it, not exploiting it. It explains what the common classes of memory bug are, why languages like C and C++ let them happen, the defenses that have been built to make them harder, and why so much new systems code is now written in memory-safe languages. The goal is to recognise the dangerous patterns in your own code and choose tools that rule them out.",
      ],
    },
    {
      kind: "table",
      title: "The common classes of memory-safety bug",
      head: ["Bug", "What happens", "Why it is dangerous"],
      rows: [
        ["Buffer overflow", "writing past the end of an array or buffer into whatever memory sits next to it", "corrupts nearby data or control information, causing crashes or letting an attacker change what the program does"],
        ["Out-of-bounds read", "reading past the end (or before the start) of a buffer", "leaks whatever happened to be in that memory, such as another user's data or secrets (Heartbleed was this)"],
        ["Use-after-free", "using a pointer to memory that has already been freed", "that memory may now hold something else, so the program acts on the wrong data or an attacker's data"],
        ["Double free", "freeing the same allocation twice", "corrupts the allocator's bookkeeping, which can be turned into a write to an attacker's chosen place"],
        ["Uninitialized memory", "reading a variable or buffer before anything was written to it", "its value is leftover bytes: unpredictable results, and sometimes a leak of old data"],
        ["Integer overflow into allocation", "a size calculation wraps around to a small number, so too little memory is allocated", "the following write runs off the end: a buffer overflow with an innocent-looking cause"],
      ],
      notes: ["The thread running through all of these is a missing check: nothing stopped the program from using an index, a pointer or a size that was out of range. A memory-safe language adds those checks for you; C and C++ leave them to the programmer."],
    },
    {
      kind: "text",
      title: "Why C and C++ let this happen",
      paragraphs: [
        "C and C++ were designed for speed and direct control of the machine, and they trust the programmer completely. An array is just an address plus the convention that its elements sit next to each other; the language does not record the length or check an index against it at runtime. Memory is allocated and freed by hand (malloc and free, new and delete), and a freed pointer still holds its old address, so nothing stops you using it again. These choices make the languages fast and close to the hardware, which is why operating systems and high-performance code were written in them, but they put the burden of every bounds check and every lifetime decision on the developer.",
        "The trouble is that humans are not reliable at this. A single off-by-one in a loop, a length taken from untrusted input and not validated, or a pointer kept after the thing it pointed to was freed is enough. The bug often does nothing visible in testing, because the memory it touches happens to be harmless that day, and only becomes a crash or a vulnerability under the right input. That is why these bugs survive for years in well-reviewed code.",
      ],
    },
    {
      kind: "code",
      title: "The unsafe pattern, and the checked version",
      blocks: [
        {
          lang: "text",
          label: "C: the dangerous pattern and a safer one",
          code: src`
// UNSAFE: copies the whole input with no regard for the buffer size.
// If input is longer than 16 bytes, it writes past 'name' into
// neighbouring memory. This is the classic buffer overflow.
void greet_unsafe(const char *input) {
    char name[16];
    strcpy(name, input);          // no length limit: overflows on long input
    printf("Hello, %s\n", name);
}

// SAFER: the destination size is passed in and respected, and the
// result is always terminated. The copy can never run past 'name'.
void greet_safer(const char *input) {
    char name[16];
    snprintf(name, sizeof name, "%s", input);   // bounded by sizeof name
    printf("Hello, %s\n", name);
}`,
        },
      ],
      notes: [
        "The only difference that matters is whether the size of the destination is enforced. strcpy trusts the input's length; snprintf (and the bounds-aware functions generally) is told how much room there is and stops. The fix for a whole class of bugs is this small, which is exactly why static analysis and modern compilers flag the unsafe forms.",
        "This snippet is here to recognise the shape of the bug, not to exploit it: what an attacker can do once memory is corrupted is a specialist topic and not covered here. The lesson for day-to-day code is simply never to copy or index without a bound you control.",
      ],
    },
    {
      kind: "terms",
      title: "Terms you will hear",
      terms: [
        { term: "Memory safety", meaning: "the guarantee that a program can only read and write memory it is entitled to: every access is in bounds and to a live object. A language or tool provides it by checking accesses that C and C++ leave unchecked." },
        { term: "Undefined behaviour", meaning: "in C and C++, an operation the standard gives no meaning, such as an out-of-bounds access. The compiler may do anything, so a memory bug can produce wrong results, a crash, or a security hole, and may differ between builds." },
        { term: "Dangling pointer", meaning: "a pointer that still holds the address of memory that has been freed or has gone out of scope. Using it is a use-after-free." },
        { term: "Bounds checking", meaning: "verifying that an index or length is within the valid range before the access. Memory-safe languages do it automatically; its absence is the root of buffer overflows." },
        { term: "Spatial vs temporal safety", meaning: "spatial safety is staying within an object's bounds (no overflow); temporal safety is only using an object while it is alive (no use-after-free). Memory safety means both." },
      ],
    },
    {
      kind: "table",
      title: "Defenses: making the bugs rarer and harder to exploit",
      head: ["Defense", "Where it lives", "What it does"],
      rows: [
        ["Bounds-aware APIs", "your code", "use snprintf, std::vector with .at(), std::string and std::span instead of raw buffers and strcpy, so lengths are tracked and checked"],
        ["Compiler warnings and static analysis", "build time", "compilers and tools (clang-tidy, Coverity, the compiler's own warnings) flag unsafe calls, missing checks and likely overflows before you ship"],
        ["Stack canaries", "compiler", "a known value placed before the return information on the stack; if an overflow overwrites it, the program detects the change and aborts instead of continuing"],
        ["Non-executable memory (NX / DEP)", "CPU and OS", "marks data memory as not executable, so even if an attacker writes code into a buffer, the CPU refuses to run it"],
        ["ASLR", "OS", "address space layout randomization places the stack, heap and libraries at random addresses each run, so an attacker cannot rely on where anything is"],
        ["Sanitizers and fuzzing", "testing", "AddressSanitizer catches out-of-bounds and use-after-free as they happen during tests; fuzzers feed random and malformed input to trigger the bugs before attackers do"],
      ],
      notes: ["These layer up: safer APIs prevent many bugs, static analysis and sanitizers catch more during development, and the runtime defenses (canaries, NX, ASLR) make the survivors far harder to turn into working attacks. None of them is complete on its own, which is why the industry has turned to languages that remove the bugs by construction."],
    },
    {
      kind: "text",
      title: "Memory-safe languages",
      paragraphs: [
        "A memory-safe language makes whole classes of these bugs impossible to write by accident. Java, C#, Go, Python and JavaScript are memory-safe: arrays know their length and throw or raise on an out-of-bounds index, and a garbage collector frees memory only once nothing can reach it, so there is no use-after-free or double free. You pay for this with the garbage collector's overhead and less direct control of memory, which is usually a fine trade outside the tightest performance work.",
        "Rust is the interesting case: it is memory-safe without a garbage collector. Its compiler enforces an ownership and borrowing model that proves, at compile time, that every reference points at live memory and that nothing is modified through two references at once. Code that would be a use-after-free or a data race simply does not compile. That is why Rust is being adopted for systems software (parts of the Linux kernel, Windows and Android) where C and C++ used to be the only option. Government and industry guidance now actively recommends memory-safe languages for new code; the US Cybersecurity and Infrastructure Security Agency has urged exactly this.",
        "The practical takeaway: for new systems-level code, prefer a memory-safe language. When you must work in C or C++, lean hard on the defenses above (bounds-aware types, warnings as errors, static analysis, sanitizers and fuzzing in testing) and treat every length and pointer lifetime as something to check, not to trust.",
      ],
    },
  ],
  quiz: [
    {
      question: "What do buffer overflow, use-after-free and out-of-bounds read have in common?",
      answer: "The program accesses memory outside what it was entitled to, because a check was missing",
      distractors: ["They only happen in multithreaded code", "They are caused by the garbage collector", "They can only crash the program, never leak data"],
      why: "Each is an access that was never bounds- or lifetime-checked. That missing check is exactly what memory-safe languages add for you.",
    },
    {
      question: "Why are C and C++ especially prone to memory-safety bugs?",
      answer: "They do no automatic bounds checking and leave memory lifetimes to the programmer",
      distractors: ["They have no arrays or pointers", "Their compilers are less mature than others", "They always run without an operating system"],
      why: "The languages trust the programmer for speed and control, so a single off-by-one or a stale pointer is enough, and it often passes testing unnoticed.",
    },
    {
      question: "What does ASLR (address space layout randomization) do?",
      answer: "Places the stack, heap and libraries at random addresses each run",
      distractors: ["Encrypts all data in memory", "Checks every array index at runtime", "Frees memory as soon as it is unused"],
      why: "By moving everything around, it stops an attacker from relying on where code or data sits, making a memory bug much harder to exploit. It does not prevent the bug itself.",
    },
    {
      question: "How does Rust achieve memory safety without a garbage collector?",
      answer: "Its compiler enforces ownership and borrowing rules, so unsafe references fail to compile",
      distractors: ["It checks every access at runtime like Python", "It forbids pointers entirely", "It runs every program in a virtual machine"],
      why: "Ownership and borrowing are checked at compile time, so use-after-free and data races are rejected before the program runs, with no runtime collector.",
    },
  ],
  pitfalls: [
    "Copying or concatenating into a fixed buffer without enforcing its size (strcpy, strcat, sprintf on untrusted input).",
    "Trusting a length or index that came from input or a file instead of validating it against the real buffer.",
    "Using a pointer or reference after the thing it pointed to was freed or went out of scope.",
    "Assuming a bug that never showed up in testing is harmless: memory bugs often do nothing until the exact wrong input arrives.",
    "Reaching for C or C++ for new code out of habit when a memory-safe language would remove a whole class of vulnerabilities.",
  ],
  next: [
    { id: "stack-heap-gc", label: "Stack vs Heap and Garbage Collection" },
    { id: "race-conditions", label: "Race Conditions: Why count++ Isn't Safe" },
    { id: "sec-crypto-fundamentals", label: "Cryptography Fundamentals" },
  ],
};

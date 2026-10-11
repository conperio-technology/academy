namespace DsaAcademy.Content.Tools;

public class StackHeapGcTool : ITool
{
    public string Id => "stack-heap-gc";
    public string Section => "Concurrency & Memory";
    public string Track => "memory";
    public int Order => 70;
    public string Title => "Stack vs Heap and Garbage Collection";
    public string OneLiner => "Step through a C# program and watch frames push and pop, value types copy, references share one object, and the garbage collector find what nothing can reach.";
    public string KeyTakeaway =>
        "Each thread's stack holds call frames with their locals and is freed instantly when a method returns. " +
        "Objects created with new from a class live on the shared heap, and a variable holds only a reference " +
        "to them. Assigning a struct copies its fields; assigning a class reference makes two names for one " +
        "object. The garbage collector frees heap objects that no root (a live local, a static, a CPU register) " +
        "can reach, and .NET's generational GC makes that cheap by collecting young objects most often.";

    public ToolKind ToolKind => ToolKind.StackHeapGc;

    public string Explanation =>
        "Every thread has a stack: a contiguous block of memory (1 MB by default on Windows, typically 8 MB for the main thread on Linux) where each method call " +
        "pushes a frame holding its parameters, local variables and return address (where to carry on in the caller afterwards). When the method returns, " +
        "its frame is popped by moving one pointer (a value holding a memory address), so stack allocation and freeing are essentially " +
        "free. The stack is also why deep recursion (a method calling itself, thousands of levels deep) throws StackOverflowException: the frames simply run out " +
        "of room.\n\n" +
        "The heap is one big shared region where objects with a lifetime that is not tied to a single method " +
        "call live. In C#, new on a class (a reference type: string, List<T>, arrays, your own classes) " +
        "allocates the object on the heap, and the variable holds a reference, effectively the object's " +
        "address. Structs and the built-in numeric types are value types: the variable holds the value " +
        "itself. So Point q = p; copies every field, and changing q leaves p alone, while Node b = a; copies " +
        "only the reference, so b.Value = 11 changes the object a sees too. Step through the program below to " +
        "see both.\n\n" +
        "\"Value types live on the stack\" is a common oversimplification that interviewers enjoy probing. A " +
        "value type lives wherever its container lives: a struct local is in the stack frame, but a struct " +
        "field of a class object, or the elements of an int[], are on the heap inside that object. Locals captured " +
        "by a lambda (a small inline function), or kept across an await, are moved to a heap object as well. Boxing (assigning " +
        "an int to an object variable) copies the value into a new heap object.\n\n" +
        "Nothing in C# frees heap memory explicitly. The garbage collector does it by tracing: starting from " +
        "the roots (locals and parameters in every thread's live frames, static fields, CPU registers), it " +
        "marks every object it can reach by following references, and everything left unmarked is garbage. " +
        "Then it sweeps the dead space and, in .NET, usually compacts the survivors together so new " +
        "allocations stay a fast pointer bump. Reference counting, used by Python and Swift, frees an object " +
        "the moment its count drops to zero, but cannot by itself free two objects that refer to each other; " +
        "tracing handles cycles naturally, because reachability is all that matters.\n\n" +
        "Tracing a big heap is expensive, so .NET's GC is generational, built on the observation that most " +
        "objects die young. New objects go in generation 0, which is collected often and quickly. Survivors " +
        "are promoted to gen 1, and survivors of that to gen 2, which is collected rarely. Objects of 85,000 " +
        "bytes or more go straight to the Large Object Heap, which is collected with gen 2. A memory leak in a " +
        "garbage collected language is therefore not forgotten frees; it is something still reachable that you " +
        "no longer need, such as an ever-growing static cache or an event handler that is never unsubscribed. " +
        "For unmanaged resources (files, sockets), the GC is too late and too unpredictable: that is what " +
        "IDisposable and using are for.";
}

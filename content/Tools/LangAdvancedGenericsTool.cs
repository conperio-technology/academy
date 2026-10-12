namespace DsaAcademy.Content.Tools;

public class LangAdvancedGenericsTool : ITool
{
    public string Id => "lang-advanced-generics";
    public string Section => "Programming in C# & Python";
    public string Track => "advanced";
    public int Order => 2500;
    public string Title => "Advanced Generics: Constraints, Variance and Protocols";
    public string OneLiner => "Generic math with INumber<T> and static abstract members, the full set of constraints, covariance and contravariance (in and out), Python's bounds versus constraints, ParamSpec for typing decorators, TypedDict and overloads.";
    public string KeyTakeaway =>
        "Static abstract interface members let one generic method use operators and T.Zero for every number type. A read-only producer is covariant (IEnumerable<out T>, Sequence), a consumer is contravariant (Action<in T>, Callable parameters), and a mutable list is invariant. Python's generics are for the type checker only.";

    public ToolKind ToolKind => ToolKind.LangAdvancedGenerics;

    public string Explanation =>
        "The intermediate track introduced generics and type hints. This lesson covers the questions that come next: how to write one method for every number type, why a list of strings isn't a list of objects but a sequence of strings is, and how to keep type checking working through decorators.\n\n" +
        "C# answers with generic math (INumber<T>, IParsable<T>, static abstract interface members) and in/out variance annotations. Python answers with bounded and constrained type variables, Sequence and Mapping in place of list and dict, ParamSpec, TypedDict and @overload, all checked by mypy or pyright rather than at run time.";
}

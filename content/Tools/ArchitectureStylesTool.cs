namespace DsaAcademy.Content.Tools;

public class ArchitectureStylesTool : ITool
{
    public string Id => "architecture-styles";
    public string Section => "Software Design & OOP";
    public string Track => "architecture";
    public int Order => 130;
    public string Title => "Architecture Styles: Monoliths, Microservices, Layers and Events";
    public string OneLiner => "How a system is deployed (monolith, modular monolith, microservices, serverless) and how its code is organized (layered, hexagonal, clean, vertical slices), plus event-driven communication and when each is worth it.";
    public string KeyTakeaway => "There's no best architecture, only trade-offs. Start with a modular monolith and extract services only for a concrete reason; microservices solve an organizational problem and cost a distributed system. Hexagonal and clean architecture point dependencies inwards so business logic doesn't depend on the database or framework. Events decouple services at the price of eventual consistency.";

    public ToolKind ToolKind => ToolKind.ArchitectureStyles;

    public string Explanation =>
        "Architecture is how a system is split into parts and how they talk, and the choices are expensive to change later. This lesson covers the common styles at two levels: how the whole system is deployed, and how the code inside one application is organized." +
        "\n\n" +
        "It explains when microservices are actually worth it, what makes a good service boundary, and event-driven architecture, with a set of questions that decide which style suits a given team and domain.";
}

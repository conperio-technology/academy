namespace DsaAcademy.Content.Tools;

public class TicketBookingInterviewTool : ITool
{
    public string Id => "ood-interview-ticket-booking";
    public string Section => "Software Design & OOP";
    public string Track => "object-oriented design";
    public int Order => 123;
    public string Title => "Design a Movie Ticket Booking System (OOD)";
    public string OneLiner => "Shows, seat maps, holds that expire, and checkout, with one hard rule: a seat is never sold twice.";
    public string KeyTakeaway =>
        "Seat status belongs to a seat in a particular show, not to the physical seat, and only one component " +
        "may change it. Hold all requested seats or none in one critical section (a per-show lock in memory, a " +
        "conditional UPDATE across servers), treat expired holds as free when checking, and authorise payment " +
        "before confirming seats, capturing only after.";

    public ToolKind ToolKind => ToolKind.DesignTicketBooking;

    public string Explanation =>
        "Same format as the other OOD walk-throughs: write your answer for each stage first, then compare and " +
        "tick what you covered. The parking lot walk-through explains what an OOD round grades.\n\n" +
        "What's specific to ticket booking. The class model itself is not hard (cinema, screen, seat, movie, " +
        "show, booking), apart from one modelling decision interviewers watch for: availability is a property " +
        "of a seat in one show, so it needs its own object (a ShowSeat). The real test is concurrency. Two " +
        "people click the same seats at the same moment; a hold expires while someone is still typing their " +
        "card number; a payment confirmation arrives late. The design has to keep \"no seat sold twice\" true " +
        "in every one of those cases, and you have to show it in code.\n\n" +
        "Expect to discuss lock granularity (global, per show, per seat, and the deadlock risk of the last), " +
        "pessimistic locking in memory versus optimistic conditional updates in a database, and why a " +
        "distributed lock with a timeout shouldn't be the only guarantee. The model answer gives both an " +
        "in-memory implementation and the SQL that keeps the same guarantee across many servers, behind one " +
        "interface, and orders the payment steps so money and seats always agree.";
}

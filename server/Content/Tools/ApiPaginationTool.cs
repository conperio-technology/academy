namespace DsaAcademy.Content.Tools;

public class ApiPaginationTool : ITool
{
    public string Id => "sd-api-pagination";
    public string Section => "System Design";
    public string Track => "api design";
    public int Order => 17;
    public string Title => "Pagination: Offset vs Cursor";
    public string OneLiner => "Why page 2 shows posts you already saw when new ones arrive, and how a cursor fixes it and stays fast on page 10,000.";
    public string KeyTakeaway =>
        "Offset pagination (LIMIT 20 OFFSET 40) is simple and lets users jump to page 37, but it counts positions, so rows " +
        "inserted or deleted between requests shift every later page: the client sees duplicates or silently misses items. It " +
        "also gets slower the deeper you go, because the database still reads and throws away every skipped row. Cursor, or " +
        "keyset, pagination remembers the last item's sort key (WHERE (created_at, id) < (last_created_at, last_id)) and uses " +
        "an index to start right there, so pages are stable under writes and equally fast at any depth. Sort by a unique key, " +
        "or add the id as a tie-breaker, and hand the client an opaque cursor rather than raw values.";

    public ToolKind ToolKind => ToolKind.ApiPagination;

    public string Explanation =>
        "Any endpoint that returns a collection needs pagination: returning all 40 million orders in one response would take " +
        "minutes, use gigabytes of memory on both ends and time out on the way. The API returns one page at a time and tells " +
        "the client how to ask for the next. There are two families of answer, and choosing between them is a standard " +
        "interview question for feeds, timelines, search results and admin tables.\n\n" +
        "Offset pagination asks for a position: GET /posts?limit=20&offset=40 (or page=3&per_page=20), which becomes SELECT " +
        "... ORDER BY created_at DESC LIMIT 20 OFFSET 40. It's easy to build, easy to understand and supports jumping straight " +
        "to any page, which a numbered page list in an admin screen needs. It has two problems. The first is drift. The offset " +
        "counts rows, not items, so if three new posts arrive while the user reads page 1, every older post moves three places " +
        "down, and page 2 starts with the last three posts of page 1 again: duplicates. If a post on page 1 is deleted, every " +
        "later post moves up one, and the first post that should have been on page 2 now sits at the end of page 1, which the " +
        "client fetched before the delete: it is skipped and never seen. In an infinite-scroll feed with constant writes this happens on " +
        "nearly every page. The second problem is cost. The database can't jump to row 100,000 of an ordering; it walks the " +
        "index (or sorts the table) and discards the first 100,000 rows before returning 20, so deep pages get slower in direct " +
        "proportion to the offset, and a scraper walking every page puts quadratic total load on the database.\n\n" +
        "Cursor pagination asks for \"the items after this one\". The response for page 1 includes a cursor, a token " +
        "describing the last item returned, and the next request passes it back: GET /posts?limit=20&cursor=eyJ0Ijo... . On " +
        "the server the cursor decodes to the last item's sort values, and the query becomes a range condition: WHERE " +
        "(created_at, id) < ('2026-10-01 09:14:03', 8812) ORDER BY created_at DESC, id DESC LIMIT 20. With an index on " +
        "(created_at, id) the database seeks straight to that point and reads 20 rows, no matter how deep the page is. This is " +
        "also called keyset pagination, because the cursor is a set of key values. New posts at the top don't move the " +
        "boundary, and a deleted post simply isn't returned, so pages never repeat or skip. The trade-offs: you can't jump to " +
        "page 37, only go forward (and backward, with a reversed condition), and an exact total count is a separate, often " +
        "expensive question that many APIs answer only approximately or not at all.\n\n" +
        "The sort key must be unique, or the cursor needs a tie-breaker. Suppose four posts share the timestamp 09:14:03 and " +
        "page 1 ends on the second of them. WHERE created_at < '09:14:03' skips the other two forever, and WHERE created_at <= " +
        "'09:14:03' returns the first two again. Adding the unique id to both the ORDER BY and the comparison, as above, fixes " +
        "it. The simulator has a mode that shows this bug.\n\n" +
        "Make the cursor opaque: base64-encode a small JSON object (and sign or encrypt it if its contents are sensitive) and " +
        "document it as a meaningless string. Clients that can't parse it can't depend on its format, so you can later change " +
        "the sort, add a shard number or switch databases without breaking anyone. Put the filters and sort in the cursor too, " +
        "or reject a cursor reused with different filters. The response usually looks like {\"data\": [...], " +
        "\"next_cursor\": \"...\"}, with next_cursor null on the last page, or uses a Link header with rel=\"next\" as GitHub " +
        "does. Cap the page size on the server (for example at most 100) whatever the client asks for.\n\n" +
        "In practice: use cursors for anything users scroll, any large or fast-changing collection, and any public API (Stripe, " +
        "Slack, Twitter/X and Facebook's Graph API all use them). Offset is fine for small, slow-changing admin tables where " +
        "jumping to a page matters. For a feed built by merging several sources, the cursor can hold one position per source.\n\n" +
        "How the simulator works. A feed of posts, newest first, with ids that increase over time. Fetch page 1, then change the " +
        "data (new posts arrive at the top, or a post you already saw is deleted), then fetch page 2 with each strategy and " +
        "compare it to what page 2 should be. The cost readout counts rows the database reads for each page: offset plus limit " +
        "for offset pagination, limit for a cursor with a matching index.";
}

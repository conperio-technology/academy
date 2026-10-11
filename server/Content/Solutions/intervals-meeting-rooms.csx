public class Solution
{
    public static int MinMeetingRooms(int[][] intervals)
    {
        var starts = intervals.Select(iv => iv[0]).OrderBy(t => t).ToArray();
        var ends = intervals.Select(iv => iv[1]).OrderBy(t => t).ToArray();
        int rooms = 0, e = 0;
        foreach (var s in starts)
        {
            if (s >= ends[e]) e++; // the earliest-ending meeting is over: reuse its room
            else rooms++;          // every room is busy: open a new one
        }
        return rooms;
    }
}

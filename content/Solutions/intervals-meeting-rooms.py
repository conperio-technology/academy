def min_meeting_rooms(intervals):
    starts = sorted(iv[0] for iv in intervals)
    ends = sorted(iv[1] for iv in intervals)
    rooms = 0
    e = 0
    for s in starts:
        if s >= ends[e]:  # the earliest-ending meeting is over: reuse its room
            e += 1
        else:
            rooms += 1  # every room is busy: open a new one
    return rooms

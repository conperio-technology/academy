public class StepRange : IEnumerable<int>
{
    private readonly int _start, _stop, _step;

    public StepRange(int start, int stop, int step) => (_start, _stop, _step) = (start, stop, step);

    public int Count => _stop < _start ? 0 : (int)(((long)_stop - _start) / _step + 1);

    public int this[int i]
    {
        get
        {
            if (i < 0 || i >= Count) throw new ArgumentOutOfRangeException(nameof(i));
            return (int)(_start + (long)i * _step);
        }
    }

    public bool Contains(int x) =>
        x >= _start && x <= _stop && ((long)x - _start) % _step == 0;

    public IEnumerator<int> GetEnumerator()
    {
        for (long v = _start; v <= _stop; v += _step) yield return (int)v;
    }

    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
}

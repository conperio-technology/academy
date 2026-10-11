namespace DsaAcademy.Content.Tools;

public class MathInterviewTool : ITool
{
    public string Id => "math-for-interviews";
    public string Section => "Data Structures & Algorithms";
    public string Track => "math";
    public int Order => 120;

    public string Title => "Math for Coding Interviews: Modulo, GCD, Primes, Powers and Overflow";
    public string OneLiner => "The number theory and counting that interview problems quietly assume: remainders (and how C# and Python disagree on negatives), Euclid's GCD, the sieve, fast power, overflow and nCr.";
    public string KeyTakeaway =>
        "Five tools cover most interview math: % and modular arithmetic (reduce after every step, and know that " +
        "-7 % 3 is -1 in C# but 2 in Python), Euclid's gcd(a, b) = gcd(b, a % b), the Sieve of Eratosthenes for " +
        "all primes below n, square-and-multiply for a^b in O(log b), and n choose k for counting. Around all of " +
        "them: C# ints are 32 bits and wrap silently, Python ints never overflow.";

    public ToolKind ToolKind => ToolKind.MathInterview;

    public string Explanation =>
        "Coding interviews rarely need advanced math, but a handful of facts come up again and again, and they're " +
        "easy to get subtly wrong under pressure. This lesson builds on The Math You Need (Start Here), which " +
        "covers powers of two, logarithms and sums.\n\n" +
        "Modular arithmetic is arithmetic on remainders. a mod m is what's left after dividing a by m, so 17 mod 5 " +
        "is 2. The useful fact is that you can reduce at every step: (a + b) mod m = ((a mod m) + (b mod m)) mod " +
        "m, and the same for multiplication. That's why problems say \"return the answer modulo 1,000,000,007\" " +
        "(a large prime, often written 1e9+7): the true answer is astronomically large, but if you take % after " +
        "every addition and multiplication, every intermediate value stays small. Subtraction can go negative, and " +
        "that's where the languages differ. C# % truncates toward zero, so the result takes the sign of the left " +
        "operand: -7 % 3 is -1. Python % floors, so the result takes the sign of the right operand: -7 % 3 is 2. " +
        "In C#, write ((a % m) + m) % m to get a value in 0 to m - 1. Integer division follows the same split: " +
        "-7 / 2 is -3 in C# and -7 // 2 is -4 in Python. Division itself doesn't reduce modulo m; for a prime m " +
        "you multiply by the modular inverse, b^(m - 2) mod m, by Fermat's little theorem.\n\n" +
        "The greatest common divisor (GCD) of a and b is the largest number dividing both; the least common " +
        "multiple (LCM) is the smallest number both divide. Euclid's algorithm computes gcd(a, b) = gcd(b, a % b) " +
        "until b is 0, in O(log min(a, b)) steps, and lcm(a, b) = a / gcd(a, b) * b, dividing first so it doesn't " +
        "overflow. A prime is a number above 1 with no divisors but 1 and itself. To test one number, try " +
        "divisors up to its square root, O(sqrt n). For every prime below n, use the Sieve of Eratosthenes: cross " +
        "out the multiples of each prime starting from its square, O(n log log n).\n\n" +
        "Fast exponentiation (square-and-multiply) computes a^b using the binary digits of b: square the base once " +
        "per bit and multiply it into the result for every 1 bit, so O(log b) multiplications instead of b. With " +
        "% m after each multiply it is modular exponentiation, built into Python as pow(a, b, m) and into .NET " +
        "as BigInteger.ModPow.\n\n" +
        "Overflow: a C# int holds -2,147,483,648 to 2,147,483,647 (about 2.1 billion) and a long about 9.2 * " +
        "10^18. Arithmetic is unchecked by default, so int.MaxValue + 1 silently becomes int.MinValue; a " +
        "checked(...) expression or block throws OverflowException instead. Two ints multiply as an int even if " +
        "you assign the result to a long, so write (long)a * b. Classic traps: mid = (lo + hi) / 2 (use lo + (hi - " +
        "lo) / 2), sums of large arrays, products of two values below 1e9+7 (about 10^18, so long is needed), and " +
        "Math.Abs(int.MinValue), which throws. Python ints are arbitrary precision, so none of this happens, but " +
        "when a problem says \"32-bit\" you have to enforce the limits yourself, and huge ints get slower.\n\n" +
        "Counting: n! (n factorial, 1 * 2 * ... * n) orders n things. Choosing k of n where order matters is n! / " +
        "(n - k)!; where it doesn't, it's \"n choose k\" = n! / (k! (n - k)!), also written C(n, k) or nCr. " +
        "Pascal's triangle builds them without factorials: C(n, k) = C(n - 1, k - 1) + C(n - 1, k), which is also " +
        "a DP. A grid walk of r downs and c rights has C(r + c, r) routes, n items have 2^n subsets, and n " +
        "people shaking hands make C(n, 2) = n(n - 1) / 2 handshakes. Factorials overflow quickly: 13! already " +
        "passes int range and 21! passes long, which is why counting answers come modulo 1e9+7. Python has " +
        "math.comb and math.perm.\n\n" +
        "Each widget below is one of these tools; the graded lessons after this one practise them.";
}

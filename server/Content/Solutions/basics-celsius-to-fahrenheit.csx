public class Solution
{
    public static double CelsiusToFahrenheit(double celsius)
    {
        // celsius is a double, so this is floating point division (9 / 5 alone would be 1).
        double fahrenheit = celsius * 9 / 5 + 32;
        return Math.Round(fahrenheit, 1);
    }
}

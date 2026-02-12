using System.Text.RegularExpressions;

namespace CarCheck.Domain.ValueObjects;

public sealed partial class RegistrationNumber : IEquatable<RegistrationNumber>
{
    public string Value { get; }

    private RegistrationNumber(string value)
    {
        Value = value;
    }

    public static RegistrationNumber Create(string registrationNumber)
    {
        if (string.IsNullOrWhiteSpace(registrationNumber))
            throw new ArgumentException("Registration number is required.", nameof(registrationNumber));

        var normalized = registrationNumber.ToUpperInvariant().Trim();

        if (normalized.Length < 2 || normalized.Length > 10)
            throw new ArgumentException("Registration number must be between 2 and 10 characters.", nameof(registrationNumber));

        if (!AlphanumericRegex().IsMatch(normalized))
            throw new ArgumentException("Registration number must contain only letters, digits, and spaces.", nameof(registrationNumber));

        return new RegistrationNumber(normalized);
    }

    public bool Equals(RegistrationNumber? other) => other is not null && Value == other.Value;

    public override bool Equals(object? obj) => obj is RegistrationNumber other && Equals(other);

    public override int GetHashCode() => Value.GetHashCode();

    public override string ToString() => Value;

    public static bool operator ==(RegistrationNumber? left, RegistrationNumber? right) => Equals(left, right);

    public static bool operator !=(RegistrationNumber? left, RegistrationNumber? right) => !Equals(left, right);

    [GeneratedRegex(@"^[A-Z0-9 ]+$")]
    private static partial Regex AlphanumericRegex();
}

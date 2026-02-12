namespace CarCheck.Domain.Entities;

public class Car
{
    public Guid Id { get; private set; }
    public string RegistrationNumber { get; private set; } = string.Empty;
    public string Brand { get; private set; } = string.Empty;
    public string Model { get; private set; } = string.Empty;
    public int Year { get; private set; }
    public int Mileage { get; private set; }

    private Car() { }

    public static Car Create(string registrationNumber, string brand, string model, int year, int mileage)
    {
        if (string.IsNullOrWhiteSpace(registrationNumber))
            throw new ArgumentException("Registration number is required.", nameof(registrationNumber));

        if (string.IsNullOrWhiteSpace(brand))
            throw new ArgumentException("Brand is required.", nameof(brand));

        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("Model is required.", nameof(model));

        if (year < 1886 || year > DateTime.UtcNow.Year + 1)
            throw new ArgumentOutOfRangeException(nameof(year), "Year is out of valid range.");

        if (mileage < 0)
            throw new ArgumentOutOfRangeException(nameof(mileage), "Mileage cannot be negative.");

        return new Car
        {
            Id = Guid.NewGuid(),
            RegistrationNumber = registrationNumber.ToUpperInvariant().Trim(),
            Brand = brand.Trim(),
            Model = model.Trim(),
            Year = year,
            Mileage = mileage
        };
    }

    public void UpdateMileage(int newMileage)
    {
        if (newMileage < 0)
            throw new ArgumentOutOfRangeException(nameof(newMileage), "Mileage cannot be negative.");

        Mileage = newMileage;
    }
}

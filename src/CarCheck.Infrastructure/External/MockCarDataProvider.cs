using CarCheck.Application.Interfaces;

namespace CarCheck.Infrastructure.External;

/// <summary>
/// Mock data provider for development and testing.
/// Replace with real API integration (e.g., Transportstyrelsen, Biluppgifter) in production.
/// </summary>
public class MockCarDataProvider : ICarDataProvider
{
    private static readonly Dictionary<string, CarDataResult> MockData = new(StringComparer.OrdinalIgnoreCase)
    {
        ["ABC123"] = new CarDataResult(
            "ABC123", "Volvo", "XC60", 2021, 35000,
            "Diesel", 235, "Black",
            InsuranceIncidents: 0, ManufacturerRecalls: 0,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-3), InspectionPassed: true,
            MarketValueSek: 385000m),

        ["DEF456"] = new CarDataResult(
            "DEF456", "BMW", "320d", 2018, 87000,
            "Diesel", 190, "White",
            InsuranceIncidents: 1, ManufacturerRecalls: 1,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-8), InspectionPassed: true,
            MarketValueSek: 215000m),

        ["GHI789"] = new CarDataResult(
            "GHI789", "Toyota", "Corolla", 2015, 142000,
            "Petrol", 132, "Silver",
            InsuranceIncidents: 2, ManufacturerRecalls: 0,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-14), InspectionPassed: false,
            MarketValueSek: 95000m),

        ["JKL012"] = new CarDataResult(
            "JKL012", "Tesla", "Model 3", 2023, 12000,
            "Electric", 283, "Red",
            InsuranceIncidents: 0, ManufacturerRecalls: 2,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-1), InspectionPassed: true,
            MarketValueSek: 420000m),

        ["MNO345"] = new CarDataResult(
            "MNO345", "Volkswagen", "Golf", 2010, 245000,
            "Petrol", 105, "Blue",
            InsuranceIncidents: 3, ManufacturerRecalls: 1,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-26), InspectionPassed: false,
            MarketValueSek: 42000m)
    };

    public Task<CarDataResult?> FetchByRegistrationAsync(string registrationNumber, CancellationToken cancellationToken = default)
    {
        MockData.TryGetValue(registrationNumber.Trim().ToUpperInvariant(), out var result);
        return Task.FromResult(result);
    }
}

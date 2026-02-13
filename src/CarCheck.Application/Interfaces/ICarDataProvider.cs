namespace CarCheck.Application.Interfaces;

public interface ICarDataProvider
{
    Task<CarDataResult?> FetchByRegistrationAsync(string registrationNumber, CancellationToken cancellationToken = default);
}

public record CarDataResult(
    string RegistrationNumber,
    string Brand,
    string Model,
    int Year,
    int Mileage,
    string? FuelType,
    int? HorsePower,
    string? Color,
    int? InsuranceIncidents,
    int? ManufacturerRecalls,
    DateTime? LastInspectionDate,
    bool? InspectionPassed,
    decimal? MarketValueSek);

namespace CarCheck.Application.Cars.DTOs;

public record CarSearchRequest(string RegistrationNumber);

public record CarSearchResponse(
    Guid CarId,
    string RegistrationNumber,
    string Brand,
    string Model,
    int Year,
    int Mileage,
    string? FuelType,
    int? HorsePower,
    string? Color,
    decimal? MarketValueSek);

public record CarAnalysisResponse(
    Guid AnalysisId,
    Guid CarId,
    string RegistrationNumber,
    string Brand,
    string Model,
    int Year,
    decimal Score,
    string Recommendation,
    AnalysisBreakdown Breakdown,
    DateTime CreatedAt);

public record AnalysisBreakdown(
    decimal AgeScore,
    decimal MileageScore,
    decimal InsuranceScore,
    decimal RecallScore,
    decimal InspectionScore);

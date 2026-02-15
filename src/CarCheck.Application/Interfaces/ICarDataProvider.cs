using CarCheck.Application.Cars.DTOs;

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
    decimal? MarketValueSek)
{
    // Owner history
    public int? NumberOfOwners { get; init; }
    public bool? IsCompanyOwned { get; init; }
    public DateTime? FirstRegistrationDate { get; init; }

    // Debt & finance
    public decimal? OutstandingDebtSek { get; init; }
    public decimal? TaxDebtSek { get; init; }
    public bool? HasPurchaseBlock { get; init; }

    // Environment & tax
    public string? EuroClass { get; init; }
    public int? Co2EmissionsGPerKm { get; init; }
    public decimal? AnnualTaxSek { get; init; }
    public bool? BonusMalusApplies { get; init; }

    // Market value (MarketValueSek already exists as constructor param)
    public decimal? AverageMarketPriceSek { get; init; }
    public decimal? DepreciationRatePercent { get; init; }

    // Service history
    public int? ServiceCount { get; init; }
    public bool? AuthorizedServiceUsed { get; init; }
    public DateTime? LastServiceDate { get; init; }
    public bool? CompleteServiceHistory { get; init; }

    // Theft & security
    public string? TheftRiskCategory { get; init; }
    public int? EuroNcapRating { get; init; }
    public bool? HasAlarmSystem { get; init; }

    // Drivetrain & reliability
    public decimal? ReliabilityRating { get; init; }
    public int? CommonIssuesCount { get; init; }
    public decimal? AverageRepairCostSek { get; init; }

    // Detail lists for factor drill-down
    public List<InspectionRecord>? Inspections { get; init; }
    public List<ServiceRecord>? ServiceRecords { get; init; }
    public List<OwnerRecord>? OwnerRecords { get; init; }
    public List<InsuranceIncidentRecord>? InsuranceIncidentRecords { get; init; }
    public List<RecallRecord>? RecallRecords { get; init; }
    public List<DebtRecord>? DebtRecords { get; init; }
    public List<MileageReadingRecord>? MileageReadings { get; init; }
    public List<MarketComparisonRecord>? SimilarCars { get; init; }
    public List<string>? KnownIssues { get; init; }
    public List<string>? SecurityFeatures { get; init; }
    public bool? IsImported { get; init; }
}

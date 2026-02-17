namespace CarCheck.Application.Cars.DTOs;

public record CarSearchRequest(string RegistrationNumber, string? CaptchaToken = null);

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
    DateTime CreatedAt,
    AnalysisDetails? Details = null);

public record AnalysisBreakdown(
    decimal AgeScore,
    decimal MileageScore,
    decimal InsuranceScore,
    decimal RecallScore,
    decimal InspectionScore,
    decimal DebtFinanceScore,
    decimal ServiceHistoryScore,
    decimal DrivetrainScore,
    decimal OwnerHistoryScore,
    decimal MarketValueScore,
    decimal EnvironmentScore,
    decimal TheftSecurityScore);

// Detail record types for factor drill-down views
public record InspectionRecord(DateTime Date, bool Passed, string? Remarks);
public record ServiceRecord(DateTime Date, string? Workshop, string Type, int? MileageAtService);
public record OwnerRecord(DateTime From, DateTime? To, bool IsCompany, string? Region);
public record InsuranceIncidentRecord(DateTime Date, string Type, string Severity);
public record RecallRecord(DateTime Date, string Description, bool Resolved);
public record DebtRecord(string Type, decimal AmountSek, DateTime Date);
public record MileageReadingRecord(DateTime Date, int Mileage, string Source);
public record MarketComparisonRecord(string Model, int Year, decimal PriceSek);

public record AnalysisDetails(
    List<InspectionRecord> Inspections,
    List<ServiceRecord> Services,
    List<OwnerRecord> Owners,
    List<InsuranceIncidentRecord> InsuranceIncidents,
    List<RecallRecord> Recalls,
    List<DebtRecord> Debts,
    bool HasPurchaseBlock,
    string? EuroClass,
    int? Co2EmissionsGPerKm,
    decimal? AnnualTaxSek,
    bool? BonusMalusApplies,
    decimal? MarketValueSek,
    decimal? AverageMarketPriceSek,
    decimal? DepreciationRatePercent,
    List<MarketComparisonRecord> SimilarCars,
    decimal? ReliabilityRating,
    List<string> KnownIssues,
    decimal? AverageRepairCostSek,
    string? TheftRiskCategory,
    int? EuroNcapRating,
    bool? HasAlarmSystem,
    List<string> SecurityFeatures,
    DateTime? FirstRegistrationDate,
    bool? IsImported,
    List<MileageReadingRecord> MileageHistory,
    List<string> FactoryEquipment,
    List<string> FactoryOptions,
    decimal? TaxWithoutBonusMalusSek);

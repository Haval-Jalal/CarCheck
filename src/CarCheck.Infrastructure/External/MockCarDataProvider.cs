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
            MarketValueSek: 385000m)
        {
            NumberOfOwners = 1, IsCompanyOwned = false,
            FirstRegistrationDate = new DateTime(2021, 3, 15, 0, 0, 0, DateTimeKind.Utc),
            OutstandingDebtSek = 0m, TaxDebtSek = 0m, HasPurchaseBlock = false,
            EuroClass = "Euro 6d", Co2EmissionsGPerKm = 149, AnnualTaxSek = 1_891m, BonusMalusApplies = true,
            AverageMarketPriceSek = 395000m, DepreciationRatePercent = 12m,
            ServiceCount = 5, AuthorizedServiceUsed = true,
            LastServiceDate = DateTime.UtcNow.AddMonths(-4), CompleteServiceHistory = true,
            TheftRiskCategory = "Low", EuroNcapRating = 5, HasAlarmSystem = true,
            ReliabilityRating = 85m, CommonIssuesCount = 1, AverageRepairCostSek = 4500m
        },

        ["DEF456"] = new CarDataResult(
            "DEF456", "BMW", "320d", 2018, 87000,
            "Diesel", 190, "White",
            InsuranceIncidents: 1, ManufacturerRecalls: 1,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-8), InspectionPassed: true,
            MarketValueSek: 215000m)
        {
            NumberOfOwners = 2, IsCompanyOwned = false,
            FirstRegistrationDate = new DateTime(2018, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            OutstandingDebtSek = 45_000m, TaxDebtSek = 0m, HasPurchaseBlock = false,
            EuroClass = "Euro 6", Co2EmissionsGPerKm = 119, AnnualTaxSek = 1_360m, BonusMalusApplies = true,
            AverageMarketPriceSek = 230000m, DepreciationRatePercent = 15m,
            ServiceCount = 6, AuthorizedServiceUsed = true,
            LastServiceDate = DateTime.UtcNow.AddMonths(-6), CompleteServiceHistory = true,
            TheftRiskCategory = "Medium", EuroNcapRating = 5, HasAlarmSystem = true,
            ReliabilityRating = 72m, CommonIssuesCount = 3, AverageRepairCostSek = 8500m
        },

        ["GHI789"] = new CarDataResult(
            "GHI789", "Toyota", "Corolla", 2015, 142000,
            "Petrol", 132, "Silver",
            InsuranceIncidents: 2, ManufacturerRecalls: 0,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-14), InspectionPassed: false,
            MarketValueSek: 95000m)
        {
            NumberOfOwners = 3, IsCompanyOwned = false,
            FirstRegistrationDate = new DateTime(2015, 1, 20, 0, 0, 0, DateTimeKind.Utc),
            OutstandingDebtSek = 0m, TaxDebtSek = 0m, HasPurchaseBlock = false,
            EuroClass = "Euro 5", Co2EmissionsGPerKm = 135, AnnualTaxSek = 1_006m, BonusMalusApplies = false,
            AverageMarketPriceSek = 105000m, DepreciationRatePercent = 10m,
            ServiceCount = 7, AuthorizedServiceUsed = false,
            LastServiceDate = DateTime.UtcNow.AddMonths(-18), CompleteServiceHistory = false,
            TheftRiskCategory = "Low", EuroNcapRating = 4, HasAlarmSystem = false,
            ReliabilityRating = 90m, CommonIssuesCount = 1, AverageRepairCostSek = 2500m
        },

        ["JKL012"] = new CarDataResult(
            "JKL012", "Tesla", "Model 3", 2023, 12000,
            "Electric", 283, "Red",
            InsuranceIncidents: 0, ManufacturerRecalls: 2,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-1), InspectionPassed: true,
            MarketValueSek: 420000m)
        {
            NumberOfOwners = 1, IsCompanyOwned = true,
            FirstRegistrationDate = new DateTime(2023, 9, 10, 0, 0, 0, DateTimeKind.Utc),
            OutstandingDebtSek = 120_000m, TaxDebtSek = 0m, HasPurchaseBlock = false,
            EuroClass = "Euro 6d", Co2EmissionsGPerKm = 0, AnnualTaxSek = 360m, BonusMalusApplies = true,
            AverageMarketPriceSek = 450000m, DepreciationRatePercent = 20m,
            ServiceCount = 3, AuthorizedServiceUsed = true,
            LastServiceDate = DateTime.UtcNow.AddMonths(-2), CompleteServiceHistory = true,
            TheftRiskCategory = "Medium", EuroNcapRating = 5, HasAlarmSystem = true,
            ReliabilityRating = 75m, CommonIssuesCount = 2, AverageRepairCostSek = 12000m
        },

        ["MNO345"] = new CarDataResult(
            "MNO345", "Volkswagen", "Golf", 2010, 245000,
            "Petrol", 105, "Blue",
            InsuranceIncidents: 3, ManufacturerRecalls: 1,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-26), InspectionPassed: false,
            MarketValueSek: 42000m)
        {
            NumberOfOwners = 5, IsCompanyOwned = false,
            FirstRegistrationDate = new DateTime(2010, 4, 5, 0, 0, 0, DateTimeKind.Utc),
            OutstandingDebtSek = 0m, TaxDebtSek = 3500m, HasPurchaseBlock = false,
            EuroClass = "Euro 4", Co2EmissionsGPerKm = 169, AnnualTaxSek = 1_478m, BonusMalusApplies = false,
            AverageMarketPriceSek = 38000m, DepreciationRatePercent = 8m,
            ServiceCount = 4, AuthorizedServiceUsed = false,
            LastServiceDate = DateTime.UtcNow.AddMonths(-30), CompleteServiceHistory = false,
            TheftRiskCategory = "High", EuroNcapRating = 3, HasAlarmSystem = false,
            ReliabilityRating = 55m, CommonIssuesCount = 6, AverageRepairCostSek = 9000m
        }
    };

    public Task<CarDataResult?> FetchByRegistrationAsync(string registrationNumber, CancellationToken cancellationToken = default)
    {
        MockData.TryGetValue(registrationNumber.Trim().ToUpperInvariant(), out var result);
        return Task.FromResult(result);
    }
}

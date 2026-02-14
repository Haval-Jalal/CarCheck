using CarCheck.Application.Cars.DTOs;
using CarCheck.Application.Interfaces;

namespace CarCheck.Application.Cars;

public class CarAnalysisEngine
{
    // Weights for each scoring category (must sum to 1.0)
    private const decimal DebtFinanceWeight = 0.15m;
    private const decimal AgeWeight = 0.12m;
    private const decimal MileageWeight = 0.12m;
    private const decimal InspectionWeight = 0.10m;
    private const decimal InsuranceWeight = 0.09m;
    private const decimal ServiceHistoryWeight = 0.08m;
    private const decimal DrivetrainWeight = 0.08m;
    private const decimal RecallWeight = 0.06m;
    private const decimal OwnerHistoryWeight = 0.05m;
    private const decimal MarketValueWeight = 0.05m;
    private const decimal EnvironmentWeight = 0.05m;
    private const decimal TheftSecurityWeight = 0.05m;

    public (decimal Score, string Recommendation, AnalysisBreakdown Breakdown) Analyze(CarDataResult data)
    {
        var ageScore = CalculateAgeScore(data.Year);
        var mileageScore = CalculateMileageScore(data.Mileage, data.Year);
        var insuranceScore = CalculateInsuranceScore(data.InsuranceIncidents);
        var recallScore = CalculateRecallScore(data.ManufacturerRecalls);
        var inspectionScore = CalculateInspectionScore(data.LastInspectionDate, data.InspectionPassed);
        var debtFinanceScore = CalculateDebtFinanceScore(data.HasPurchaseBlock, data.OutstandingDebtSek, data.TaxDebtSek);
        var serviceHistoryScore = CalculateServiceHistoryScore(data.ServiceCount, data.Year, data.CompleteServiceHistory, data.AuthorizedServiceUsed, data.LastServiceDate);
        var drivetrainScore = CalculateDrivetrainScore(data.ReliabilityRating, data.CommonIssuesCount, data.AverageRepairCostSek);
        var ownerHistoryScore = CalculateOwnerHistoryScore(data.NumberOfOwners, data.IsCompanyOwned, data.FirstRegistrationDate);
        var marketValueScore = CalculateMarketValueScore(data.MarketValueSek, data.AverageMarketPriceSek, data.DepreciationRatePercent);
        var environmentScore = CalculateEnvironmentScore(data.EuroClass, data.Co2EmissionsGPerKm, data.AnnualTaxSek, data.FuelType);
        var theftSecurityScore = CalculateTheftSecurityScore(data.TheftRiskCategory, data.EuroNcapRating, data.HasAlarmSystem);

        var totalScore = Math.Round(
            ageScore * AgeWeight +
            mileageScore * MileageWeight +
            insuranceScore * InsuranceWeight +
            recallScore * RecallWeight +
            inspectionScore * InspectionWeight +
            debtFinanceScore * DebtFinanceWeight +
            serviceHistoryScore * ServiceHistoryWeight +
            drivetrainScore * DrivetrainWeight +
            ownerHistoryScore * OwnerHistoryWeight +
            marketValueScore * MarketValueWeight +
            environmentScore * EnvironmentWeight +
            theftSecurityScore * TheftSecurityWeight,
            1);

        totalScore = Math.Clamp(totalScore, 0, 100);

        var recommendation = GenerateRecommendation(totalScore);
        var breakdown = new AnalysisBreakdown(
            Math.Round(ageScore, 1),
            Math.Round(mileageScore, 1),
            Math.Round(insuranceScore, 1),
            Math.Round(recallScore, 1),
            Math.Round(inspectionScore, 1),
            Math.Round(debtFinanceScore, 1),
            Math.Round(serviceHistoryScore, 1),
            Math.Round(drivetrainScore, 1),
            Math.Round(ownerHistoryScore, 1),
            Math.Round(marketValueScore, 1),
            Math.Round(environmentScore, 1),
            Math.Round(theftSecurityScore, 1));

        return (totalScore, recommendation, breakdown);
    }

    // ===== Existing factors (unchanged logic) =====

    internal static decimal CalculateAgeScore(int year)
    {
        var age = DateTime.UtcNow.Year - year;
        return age switch
        {
            <= 1 => 100,
            <= 3 => 90,
            <= 5 => 80,
            <= 8 => 65,
            <= 12 => 50,
            <= 18 => 35,
            <= 25 => 20,
            _ => 10
        };
    }

    internal static decimal CalculateMileageScore(int mileage, int year)
    {
        var age = Math.Max(1, DateTime.UtcNow.Year - year);
        var annualAverage = mileage / age;

        // Swedish average ~12,000 km/year
        return annualAverage switch
        {
            <= 8_000 => 100,
            <= 12_000 => 85,
            <= 16_000 => 70,
            <= 22_000 => 55,
            <= 30_000 => 35,
            _ => 15
        };
    }

    internal static decimal CalculateInsuranceScore(int? incidents)
    {
        if (incidents is null) return 70; // Unknown — neutral score

        return incidents.Value switch
        {
            0 => 100,
            1 => 75,
            2 => 50,
            3 => 30,
            _ => 10
        };
    }

    internal static decimal CalculateRecallScore(int? recalls)
    {
        if (recalls is null) return 80; // Unknown — slightly positive

        return recalls.Value switch
        {
            0 => 100,
            1 => 80,
            2 => 60,
            3 => 40,
            _ => 20
        };
    }

    internal static decimal CalculateInspectionScore(DateTime? lastInspection, bool? passed)
    {
        if (lastInspection is null) return 50; // No data

        var monthsSinceInspection = (int)(DateTime.UtcNow - lastInspection.Value).TotalDays / 30;

        var recencyScore = monthsSinceInspection switch
        {
            <= 6 => 100m,
            <= 12 => 85m,
            <= 18 => 65m,
            <= 24 => 45m,
            _ => 25m
        };

        // If failed inspection, halve the score
        if (passed == false)
            recencyScore *= 0.5m;

        return recencyScore;
    }

    // ===== New factors =====

    internal static decimal CalculateDebtFinanceScore(bool? hasPurchaseBlock, decimal? outstandingDebtSek, decimal? taxDebtSek)
    {
        if (hasPurchaseBlock == true) return 0; // Deal-breaker

        if (outstandingDebtSek is null && taxDebtSek is null && hasPurchaseBlock is null) return 50; // Fallback

        var score = outstandingDebtSek switch
        {
            null => 50m,
            0 => 100m,
            <= 20_000 => 80m,
            <= 50_000 => 60m,
            <= 100_000 => 40m,
            <= 200_000 => 20m,
            _ => 5m
        };

        if (taxDebtSek is > 0)
            score -= 15m;

        return Math.Clamp(score, 0, 100);
    }

    internal static decimal CalculateOwnerHistoryScore(int? numberOfOwners, bool? isCompanyOwned, DateTime? firstRegistrationDate)
    {
        if (numberOfOwners is null && isCompanyOwned is null && firstRegistrationDate is null) return 60; // Fallback

        var score = numberOfOwners switch
        {
            null => 60m,
            1 => 100m,
            2 => 85m,
            3 => 65m,
            4 => 45m,
            _ => 25m
        };

        if (isCompanyOwned == true)
            score -= 10m;

        // If sat unsold > 1 year (gap between first registration and now vs expected ownership)
        if (firstRegistrationDate is not null)
        {
            var yearsSinceFirstReg = (DateTime.UtcNow - firstRegistrationDate.Value).TotalDays / 365.25;
            if (yearsSinceFirstReg > 1 && numberOfOwners is 0 or null)
                score -= 5m;
        }

        return Math.Clamp(score, 0, 100);
    }

    internal static decimal CalculateEnvironmentScore(string? euroClass, int? co2EmissionsGPerKm, decimal? annualTaxSek, string? fuelType)
    {
        if (euroClass is null && co2EmissionsGPerKm is null && annualTaxSek is null) return 60; // Fallback

        // Electric vehicles get top score
        if (fuelType?.Equals("Electric", StringComparison.OrdinalIgnoreCase) == true)
            return 100m;

        var score = (euroClass?.ToUpperInvariant()) switch
        {
            "EURO 7" or "EURO 6D" => 100m,
            "EURO 6" => 85m,
            "EURO 5" => 60m,
            "EURO 4" => 40m,
            null => 60m,
            _ => 20m // Euro 3 or below
        };

        // CO2 modifier
        if (co2EmissionsGPerKm is not null)
        {
            score += co2EmissionsGPerKm.Value switch
            {
                <= 50 => 0m,
                <= 120 => -5m,
                <= 180 => -10m,
                _ => -20m
            };
        }

        // Tax modifier
        if (annualTaxSek is not null)
        {
            score += annualTaxSek.Value switch
            {
                <= 500 => 0m,
                <= 2_000 => -5m,
                <= 5_000 => -10m,
                _ => -15m
            };
        }

        return Math.Clamp(score, 0, 100);
    }

    internal static decimal CalculateMarketValueScore(decimal? marketValueSek, decimal? averageMarketPriceSek, decimal? depreciationRatePercent)
    {
        if (marketValueSek is null || averageMarketPriceSek is null || averageMarketPriceSek == 0) return 50; // Fallback

        var priceRatio = marketValueSek.Value / averageMarketPriceSek.Value;

        var score = priceRatio switch
        {
            <= 0.80m => 95m,
            <= 0.95m => 85m,
            <= 1.05m => 75m,
            <= 1.15m => 55m,
            _ => 35m
        };

        // Depreciation modifier
        if (depreciationRatePercent is not null)
        {
            score += depreciationRatePercent.Value switch
            {
                <= 8m => 5m,
                <= 15m => 0m,
                <= 22m => -5m,
                _ => -10m
            };
        }

        return Math.Clamp(score, 0, 100);
    }

    internal static decimal CalculateServiceHistoryScore(int? serviceCount, int year, bool? completeServiceHistory, bool? authorizedServiceUsed, DateTime? lastServiceDate)
    {
        if (serviceCount is null && completeServiceHistory is null && lastServiceDate is null) return 40; // Fallback

        var age = Math.Max(1, DateTime.UtcNow.Year - year);

        // Service frequency vs age
        var ratio = serviceCount is not null ? (decimal)serviceCount.Value / age : 0m;

        var score = ratio switch
        {
            >= 1.0m => 90m,
            >= 0.75m => 70m,
            >= 0.50m => 50m,
            >= 0.25m => 30m,
            _ => 15m
        };

        if (completeServiceHistory == true)
            score += 10m;

        if (authorizedServiceUsed == true)
            score += 5m;

        // Penalty if last service was >24 months ago
        if (lastServiceDate is not null)
        {
            var monthsSinceService = (int)(DateTime.UtcNow - lastServiceDate.Value).TotalDays / 30;
            if (monthsSinceService > 24)
                score -= 10m;
        }

        return Math.Clamp(score, 0, 100);
    }

    internal static decimal CalculateTheftSecurityScore(string? theftRiskCategory, int? euroNcapRating, bool? hasAlarmSystem)
    {
        if (theftRiskCategory is null && euroNcapRating is null && hasAlarmSystem is null) return 60; // Fallback

        var riskScore = (theftRiskCategory?.ToUpperInvariant()) switch
        {
            "LOW" => 100m,
            "MEDIUM" => 65m,
            "HIGH" => 30m,
            _ => 60m
        };

        var ncapScore = euroNcapRating switch
        {
            5 => 100m,
            4 => 80m,
            3 => 60m,
            2 => 40m,
            1 => 20m,
            _ => 60m
        };

        // 50/50 weighting between theft risk and NCAP
        var score = (riskScore + ncapScore) / 2m;

        if (hasAlarmSystem == true)
            score += 5m;

        return Math.Clamp(score, 0, 100);
    }

    internal static decimal CalculateDrivetrainScore(decimal? reliabilityRating, int? commonIssuesCount, decimal? averageRepairCostSek)
    {
        if (reliabilityRating is null && commonIssuesCount is null && averageRepairCostSek is null) return 55; // Fallback

        var score = reliabilityRating ?? 55m;

        // Common issues modifier
        if (commonIssuesCount is not null)
        {
            score += commonIssuesCount.Value switch
            {
                0 => 0m,
                <= 2 => -5m,
                <= 4 => -10m,
                <= 6 => -15m,
                _ => -25m
            };
        }

        // Repair cost modifier
        if (averageRepairCostSek is not null)
        {
            score += averageRepairCostSek.Value switch
            {
                <= 3_000 => 0m,
                <= 8_000 => -5m,
                <= 15_000 => -10m,
                _ => -15m
            };
        }

        return Math.Clamp(score, 0, 100);
    }

    private static string GenerateRecommendation(decimal score) => score switch
    {
        >= 85 => "Excellent condition. This vehicle appears to be a strong choice with minimal risk factors.",
        >= 70 => "Good condition. The vehicle is generally sound with some minor considerations.",
        >= 55 => "Fair condition. There are some factors to be aware of — consider a professional inspection.",
        >= 40 => "Below average. Multiple risk factors present — proceed with caution and get a thorough inspection.",
        _ => "Poor condition. Significant risk factors identified — we recommend exploring other options."
    };
}

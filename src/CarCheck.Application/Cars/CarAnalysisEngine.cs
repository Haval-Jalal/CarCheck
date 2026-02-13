using CarCheck.Application.Cars.DTOs;
using CarCheck.Application.Interfaces;

namespace CarCheck.Application.Cars;

public class CarAnalysisEngine
{
    // Weights for each scoring category (must sum to 1.0)
    private const decimal AgeWeight = 0.25m;
    private const decimal MileageWeight = 0.25m;
    private const decimal InsuranceWeight = 0.20m;
    private const decimal RecallWeight = 0.15m;
    private const decimal InspectionWeight = 0.15m;

    public (decimal Score, string Recommendation, AnalysisBreakdown Breakdown) Analyze(CarDataResult data)
    {
        var ageScore = CalculateAgeScore(data.Year);
        var mileageScore = CalculateMileageScore(data.Mileage, data.Year);
        var insuranceScore = CalculateInsuranceScore(data.InsuranceIncidents);
        var recallScore = CalculateRecallScore(data.ManufacturerRecalls);
        var inspectionScore = CalculateInspectionScore(data.LastInspectionDate, data.InspectionPassed);

        var totalScore = Math.Round(
            ageScore * AgeWeight +
            mileageScore * MileageWeight +
            insuranceScore * InsuranceWeight +
            recallScore * RecallWeight +
            inspectionScore * InspectionWeight,
            1);

        totalScore = Math.Clamp(totalScore, 0, 100);

        var recommendation = GenerateRecommendation(totalScore);
        var breakdown = new AnalysisBreakdown(
            Math.Round(ageScore, 1),
            Math.Round(mileageScore, 1),
            Math.Round(insuranceScore, 1),
            Math.Round(recallScore, 1),
            Math.Round(inspectionScore, 1));

        return (totalScore, recommendation, breakdown);
    }

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

    private static string GenerateRecommendation(decimal score) => score switch
    {
        >= 85 => "Excellent condition. This vehicle appears to be a strong choice with minimal risk factors.",
        >= 70 => "Good condition. The vehicle is generally sound with some minor considerations.",
        >= 55 => "Fair condition. There are some factors to be aware of — consider a professional inspection.",
        >= 40 => "Below average. Multiple risk factors present — proceed with caution and get a thorough inspection.",
        _ => "Poor condition. Significant risk factors identified — we recommend exploring other options."
    };
}

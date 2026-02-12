using CarCheck.Application.Cars;
using CarCheck.Application.Interfaces;

namespace CarCheck.Application.Tests.Cars;

public class CarAnalysisEngineTests
{
    private readonly CarAnalysisEngine _sut = new();

    // ===== Age Score =====

    [Theory]
    [InlineData(2026, 100)]  // 0 years old
    [InlineData(2025, 100)]  // 1 year old
    [InlineData(2023, 90)]   // 3 years old
    [InlineData(2021, 80)]   // 5 years old
    [InlineData(2018, 65)]   // 8 years old
    [InlineData(2014, 50)]   // 12 years old
    [InlineData(2008, 35)]   // 18 years old
    [InlineData(2001, 20)]   // 25 years old
    [InlineData(1990, 10)]   // 36 years old
    public void CalculateAgeScore_ReturnsExpectedScore(int year, decimal expectedScore)
    {
        var score = CarAnalysisEngine.CalculateAgeScore(year);
        Assert.Equal(expectedScore, score);
    }

    // ===== Mileage Score =====

    [Theory]
    [InlineData(5000, 2025, 100)]    // 5000 km/year
    [InlineData(24000, 2024, 85)]    // 12000 km/year
    [InlineData(48000, 2023, 70)]    // 16000 km/year
    [InlineData(66000, 2023, 55)]    // 22000 km/year
    [InlineData(90000, 2023, 35)]    // 30000 km/year
    [InlineData(150000, 2023, 15)]   // 50000 km/year
    public void CalculateMileageScore_ReturnsExpectedScore(int mileage, int year, decimal expectedScore)
    {
        var score = CarAnalysisEngine.CalculateMileageScore(mileage, year);
        Assert.Equal(expectedScore, score);
    }

    [Fact]
    public void CalculateMileageScore_WithCurrentYearCar_DoesNotDivideByZero()
    {
        // Year = current year means age=0, but we use Math.Max(1, age)
        var score = CarAnalysisEngine.CalculateMileageScore(5000, DateTime.UtcNow.Year);
        Assert.True(score > 0);
    }

    // ===== Insurance Score =====

    [Theory]
    [InlineData(0, 100)]
    [InlineData(1, 75)]
    [InlineData(2, 50)]
    [InlineData(3, 30)]
    [InlineData(5, 10)]
    public void CalculateInsuranceScore_ReturnsExpectedScore(int incidents, decimal expectedScore)
    {
        var score = CarAnalysisEngine.CalculateInsuranceScore(incidents);
        Assert.Equal(expectedScore, score);
    }

    [Fact]
    public void CalculateInsuranceScore_WithNull_ReturnsNeutralScore()
    {
        var score = CarAnalysisEngine.CalculateInsuranceScore(null);
        Assert.Equal(70, score);
    }

    // ===== Recall Score =====

    [Theory]
    [InlineData(0, 100)]
    [InlineData(1, 80)]
    [InlineData(2, 60)]
    [InlineData(3, 40)]
    [InlineData(5, 20)]
    public void CalculateRecallScore_ReturnsExpectedScore(int recalls, decimal expectedScore)
    {
        var score = CarAnalysisEngine.CalculateRecallScore(recalls);
        Assert.Equal(expectedScore, score);
    }

    [Fact]
    public void CalculateRecallScore_WithNull_ReturnsSlightlyPositive()
    {
        var score = CarAnalysisEngine.CalculateRecallScore(null);
        Assert.Equal(80, score);
    }

    // ===== Inspection Score =====

    [Fact]
    public void CalculateInspectionScore_RecentAndPassed_ReturnsHighScore()
    {
        var score = CarAnalysisEngine.CalculateInspectionScore(DateTime.UtcNow.AddMonths(-3), true);
        Assert.Equal(100, score);
    }

    [Fact]
    public void CalculateInspectionScore_RecentButFailed_ReturnsHalvedScore()
    {
        var score = CarAnalysisEngine.CalculateInspectionScore(DateTime.UtcNow.AddMonths(-3), false);
        Assert.Equal(50.0m, score);
    }

    [Fact]
    public void CalculateInspectionScore_OldInspection_ReturnsLowerScore()
    {
        var score = CarAnalysisEngine.CalculateInspectionScore(DateTime.UtcNow.AddMonths(-20), true);
        Assert.Equal(45, score);
    }

    [Fact]
    public void CalculateInspectionScore_NoData_ReturnsNeutral()
    {
        var score = CarAnalysisEngine.CalculateInspectionScore(null, null);
        Assert.Equal(50, score);
    }

    // ===== Full Analysis =====

    [Fact]
    public void Analyze_ExcellentCar_ReturnsHighScore()
    {
        var data = new CarDataResult(
            "ABC123", "Volvo", "XC60", 2024, 10000,
            "Diesel", 235, "Black",
            InsuranceIncidents: 0, ManufacturerRecalls: 0,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-2), InspectionPassed: true,
            MarketValueSek: 400000m);

        var (score, recommendation, breakdown) = _sut.Analyze(data);

        Assert.True(score >= 85, $"Expected score >= 85 but got {score}");
        Assert.Contains("Excellent", recommendation);
        Assert.NotNull(breakdown);
    }

    [Fact]
    public void Analyze_PoorCar_ReturnsLowScore()
    {
        var data = new CarDataResult(
            "OLD999", "Saab", "9-3", 2000, 350000,
            "Petrol", 150, "Gray",
            InsuranceIncidents: 4, ManufacturerRecalls: 5,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-30), InspectionPassed: false,
            MarketValueSek: 15000m);

        var (score, recommendation, breakdown) = _sut.Analyze(data);

        Assert.True(score < 40, $"Expected score < 40 but got {score}");
        Assert.Contains("risk", recommendation, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Analyze_ScoreIsBetween0And100()
    {
        var data = new CarDataResult(
            "TEST01", "Test", "Car", 2015, 150000,
            "Petrol", 100, "White",
            InsuranceIncidents: 2, ManufacturerRecalls: 1,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-10), InspectionPassed: true,
            MarketValueSek: 80000m);

        var (score, _, _) = _sut.Analyze(data);

        Assert.InRange(score, 0, 100);
    }

    [Fact]
    public void Analyze_BreakdownContainsAllCategories()
    {
        var data = new CarDataResult(
            "TEST02", "Test", "Car", 2020, 50000,
            "Electric", 200, "Blue",
            InsuranceIncidents: 0, ManufacturerRecalls: 0,
            LastInspectionDate: DateTime.UtcNow.AddMonths(-6), InspectionPassed: true,
            MarketValueSek: 250000m);

        var (_, _, breakdown) = _sut.Analyze(data);

        Assert.True(breakdown.AgeScore >= 0 && breakdown.AgeScore <= 100);
        Assert.True(breakdown.MileageScore >= 0 && breakdown.MileageScore <= 100);
        Assert.True(breakdown.InsuranceScore >= 0 && breakdown.InsuranceScore <= 100);
        Assert.True(breakdown.RecallScore >= 0 && breakdown.RecallScore <= 100);
        Assert.True(breakdown.InspectionScore >= 0 && breakdown.InspectionScore <= 100);
    }
}

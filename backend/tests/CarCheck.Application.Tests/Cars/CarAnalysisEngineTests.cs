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

    // ===== Debt & Finance Score =====

    [Fact]
    public void CalculateDebtFinanceScore_PurchaseBlock_ReturnsZero()
    {
        var score = CarAnalysisEngine.CalculateDebtFinanceScore(true, 0, 0);
        Assert.Equal(0, score);
    }

    [Fact]
    public void CalculateDebtFinanceScore_NoDebt_Returns100()
    {
        var score = CarAnalysisEngine.CalculateDebtFinanceScore(false, 0, 0);
        Assert.Equal(100, score);
    }

    [Theory]
    [InlineData(0, 100)]
    [InlineData(15000, 80)]
    [InlineData(40000, 60)]
    [InlineData(80000, 40)]
    [InlineData(150000, 20)]
    [InlineData(300000, 5)]
    public void CalculateDebtFinanceScore_ByDebtLevel_ReturnsExpected(decimal debt, decimal expected)
    {
        var score = CarAnalysisEngine.CalculateDebtFinanceScore(false, debt, 0);
        Assert.Equal(expected, score);
    }

    [Fact]
    public void CalculateDebtFinanceScore_WithTaxDebt_DeductsFifteen()
    {
        var score = CarAnalysisEngine.CalculateDebtFinanceScore(false, 0, 5000);
        Assert.Equal(85, score); // 100 - 15
    }

    [Fact]
    public void CalculateDebtFinanceScore_AllNull_ReturnsFallback()
    {
        var score = CarAnalysisEngine.CalculateDebtFinanceScore(null, null, null);
        Assert.Equal(50, score);
    }

    // ===== Owner History Score =====

    [Theory]
    [InlineData(1, 100)]
    [InlineData(2, 85)]
    [InlineData(3, 65)]
    [InlineData(4, 45)]
    [InlineData(6, 25)]
    public void CalculateOwnerHistoryScore_ByOwnerCount_ReturnsExpected(int owners, decimal expected)
    {
        var score = CarAnalysisEngine.CalculateOwnerHistoryScore(owners, false, null);
        Assert.Equal(expected, score);
    }

    [Fact]
    public void CalculateOwnerHistoryScore_CompanyOwned_DeductsTen()
    {
        var score = CarAnalysisEngine.CalculateOwnerHistoryScore(1, true, null);
        Assert.Equal(90, score); // 100 - 10
    }

    [Fact]
    public void CalculateOwnerHistoryScore_AllNull_ReturnsFallback()
    {
        var score = CarAnalysisEngine.CalculateOwnerHistoryScore(null, null, null);
        Assert.Equal(60, score);
    }

    [Fact]
    public void CalculateOwnerHistoryScore_UnsoldOverOneYear_DeductsFive()
    {
        // No owners, registered >1 year ago => -5
        var score = CarAnalysisEngine.CalculateOwnerHistoryScore(null, false, DateTime.UtcNow.AddYears(-2));
        Assert.Equal(55, score); // 60 (null owners) - 5
    }

    [Fact]
    public void CalculateOwnerHistoryScore_ClampsToZero()
    {
        // 6 owners (25) + company owned (-10) = 15
        var score = CarAnalysisEngine.CalculateOwnerHistoryScore(6, true, null);
        Assert.Equal(15, score);
    }

    // ===== Environment Score =====

    [Theory]
    [InlineData("Euro 6d", 100)]
    [InlineData("Euro 7", 100)]
    [InlineData("Euro 6", 85)]
    [InlineData("Euro 5", 60)]
    [InlineData("Euro 4", 40)]
    [InlineData("Euro 3", 20)]
    public void CalculateEnvironmentScore_ByEuroClass_ReturnsExpected(string euroClass, decimal expected)
    {
        var score = CarAnalysisEngine.CalculateEnvironmentScore(euroClass, null, null, "Diesel");
        Assert.Equal(expected, score);
    }

    [Fact]
    public void CalculateEnvironmentScore_Electric_Returns100()
    {
        var score = CarAnalysisEngine.CalculateEnvironmentScore("Euro 6d", 0, 360, "Electric");
        Assert.Equal(100, score);
    }

    [Fact]
    public void CalculateEnvironmentScore_HighCo2_DeductsPoints()
    {
        // Euro 6 (85) + CO2 > 180 (-20) = 65
        var score = CarAnalysisEngine.CalculateEnvironmentScore("Euro 6", 200, null, "Diesel");
        Assert.Equal(65, score);
    }

    [Fact]
    public void CalculateEnvironmentScore_HighTax_DeductsPoints()
    {
        // Euro 6 (85) + Tax > 5000 (-15) = 70
        var score = CarAnalysisEngine.CalculateEnvironmentScore("Euro 6", null, 6000, "Diesel");
        Assert.Equal(70, score);
    }

    [Fact]
    public void CalculateEnvironmentScore_AllNull_ReturnsFallback()
    {
        var score = CarAnalysisEngine.CalculateEnvironmentScore(null, null, null, "Petrol");
        Assert.Equal(60, score);
    }

    // ===== Market Value Score =====

    [Fact]
    public void CalculateMarketValueScore_GoodDeal_ReturnsHigh()
    {
        // Price ratio 0.75 => 95
        var score = CarAnalysisEngine.CalculateMarketValueScore(150000, 200000, null);
        Assert.Equal(95, score);
    }

    [Fact]
    public void CalculateMarketValueScore_FairPrice_ReturnsMid()
    {
        // Price ratio 1.0 => 75
        var score = CarAnalysisEngine.CalculateMarketValueScore(200000, 200000, null);
        Assert.Equal(75, score);
    }

    [Fact]
    public void CalculateMarketValueScore_Overpriced_ReturnsLow()
    {
        // Price ratio 1.2 => 35
        var score = CarAnalysisEngine.CalculateMarketValueScore(240000, 200000, null);
        Assert.Equal(35, score);
    }

    [Fact]
    public void CalculateMarketValueScore_LowDepreciation_AddsBonus()
    {
        // Price ratio 1.0 (75) + depr <=8% (+5) = 80
        var score = CarAnalysisEngine.CalculateMarketValueScore(200000, 200000, 7);
        Assert.Equal(80, score);
    }

    [Fact]
    public void CalculateMarketValueScore_HighDepreciation_DeductsPoints()
    {
        // Price ratio 1.0 (75) + depr >22% (-10) = 65
        var score = CarAnalysisEngine.CalculateMarketValueScore(200000, 200000, 25);
        Assert.Equal(65, score);
    }

    [Fact]
    public void CalculateMarketValueScore_NullData_ReturnsFallback()
    {
        var score = CarAnalysisEngine.CalculateMarketValueScore(null, null, null);
        Assert.Equal(50, score);
    }

    // ===== Service History Score =====

    [Fact]
    public void CalculateServiceHistoryScore_ExcellentService_ReturnsHigh()
    {
        // 5 services / 5 year age = ratio 1.0 => 90, +10 complete, +5 authorized = 100 (clamped)
        var score = CarAnalysisEngine.CalculateServiceHistoryScore(5, 2021, true, true, DateTime.UtcNow.AddMonths(-6));
        Assert.Equal(100, score);
    }

    [Fact]
    public void CalculateServiceHistoryScore_PoorService_ReturnsLow()
    {
        // 1 service / 10 year age = ratio 0.1 => 15, no complete, no authorized
        var score = CarAnalysisEngine.CalculateServiceHistoryScore(1, 2016, false, false, DateTime.UtcNow.AddMonths(-30));
        Assert.Equal(5, score); // 15 - 10 (old service)
    }

    [Fact]
    public void CalculateServiceHistoryScore_CompleteHistory_AddsBonus()
    {
        // 3 services / 5 year age = ratio 0.6 => 50, +10 complete = 60
        var score = CarAnalysisEngine.CalculateServiceHistoryScore(3, 2021, true, false, DateTime.UtcNow.AddMonths(-12));
        Assert.Equal(60, score);
    }

    [Fact]
    public void CalculateServiceHistoryScore_OldLastService_Penalty()
    {
        // 5 services / 5 year age = ratio 1.0 => 90, last service >24 mo => -10 = 80
        var score = CarAnalysisEngine.CalculateServiceHistoryScore(5, 2021, false, false, DateTime.UtcNow.AddMonths(-30));
        Assert.Equal(80, score);
    }

    [Fact]
    public void CalculateServiceHistoryScore_AllNull_ReturnsFallback()
    {
        var score = CarAnalysisEngine.CalculateServiceHistoryScore(null, 2020, null, null, null);
        Assert.Equal(40, score);
    }

    // ===== Theft & Security Score =====

    [Theory]
    [InlineData("Low", 5, true, 100)]   // (100+100)/2 + 5 = 105 => clamped 100
    [InlineData("High", 1, false, 25)]   // (30+20)/2 = 25
    [InlineData("Medium", 3, false, 62.5)] // (65+60)/2 = 62.5
    public void CalculateTheftSecurityScore_Scenarios_ReturnsExpected(string risk, int ncap, bool alarm, decimal expected)
    {
        var score = CarAnalysisEngine.CalculateTheftSecurityScore(risk, ncap, alarm);
        Assert.Equal(expected, score);
    }

    [Fact]
    public void CalculateTheftSecurityScore_LowRiskHighNcapWithAlarm_ReturnsCapped100()
    {
        var score = CarAnalysisEngine.CalculateTheftSecurityScore("Low", 5, true);
        Assert.Equal(100, score); // (100+100)/2 + 5 = 105 => clamped to 100
    }

    [Fact]
    public void CalculateTheftSecurityScore_AllNull_ReturnsFallback()
    {
        var score = CarAnalysisEngine.CalculateTheftSecurityScore(null, null, null);
        Assert.Equal(60, score);
    }

    // ===== Drivetrain Score =====

    [Fact]
    public void CalculateDrivetrainScore_HighReliability_ReturnsHigh()
    {
        var score = CarAnalysisEngine.CalculateDrivetrainScore(90, 0, 2000);
        Assert.Equal(90, score);
    }

    [Fact]
    public void CalculateDrivetrainScore_ManyIssues_DeductsPoints()
    {
        // 80 - 25 (>=7 issues) = 55
        var score = CarAnalysisEngine.CalculateDrivetrainScore(80, 8, null);
        Assert.Equal(55, score);
    }

    [Fact]
    public void CalculateDrivetrainScore_HighRepairCost_DeductsPoints()
    {
        // 70 - 15 (>15k repair cost) = 55
        var score = CarAnalysisEngine.CalculateDrivetrainScore(70, null, 20000);
        Assert.Equal(55, score);
    }

    [Fact]
    public void CalculateDrivetrainScore_AllNull_ReturnsFallback()
    {
        var score = CarAnalysisEngine.CalculateDrivetrainScore(null, null, null);
        Assert.Equal(55, score);
    }

    [Fact]
    public void CalculateDrivetrainScore_CombinedPenalties_ClampsToZero()
    {
        // 20 (reliability) - 25 (>=7 issues) - 15 (>15k repair) = -20 => clamped 0
        var score = CarAnalysisEngine.CalculateDrivetrainScore(20, 10, 25000);
        Assert.Equal(0, score);
    }

    // ===== Full Analysis =====

    [Fact]
    public void Analyze_ExcellentCar_ReturnsHighScore()
    {
        var data = CreateTestData(2024, 10000, insuranceIncidents: 0, recalls: 0,
            lastInspection: DateTime.UtcNow.AddMonths(-2), inspectionPassed: true) with
        {
            NumberOfOwners = 1, IsCompanyOwned = false,
            OutstandingDebtSek = 0, TaxDebtSek = 0, HasPurchaseBlock = false,
            EuroClass = "Euro 6d", Co2EmissionsGPerKm = 100, AnnualTaxSek = 800,
            AverageMarketPriceSek = 420000, DepreciationRatePercent = 10,
            ServiceCount = 3, CompleteServiceHistory = true, AuthorizedServiceUsed = true,
            LastServiceDate = DateTime.UtcNow.AddMonths(-3),
            TheftRiskCategory = "Low", EuroNcapRating = 5, HasAlarmSystem = true,
            ReliabilityRating = 90, CommonIssuesCount = 0, AverageRepairCostSek = 2000
        };

        var (score, recommendation, breakdown) = _sut.Analyze(data);

        Assert.True(score >= 85, $"Expected score >= 85 but got {score}");
        Assert.Contains("Utmärkt", recommendation);
        Assert.NotNull(breakdown);
    }

    [Fact]
    public void Analyze_PoorCar_ReturnsLowScore()
    {
        var data = CreateTestData(2000, 350000, insuranceIncidents: 4, recalls: 5,
            lastInspection: DateTime.UtcNow.AddMonths(-30), inspectionPassed: false) with
        {
            NumberOfOwners = 6, IsCompanyOwned = false,
            OutstandingDebtSek = 250000, TaxDebtSek = 5000, HasPurchaseBlock = false,
            EuroClass = "Euro 3", Co2EmissionsGPerKm = 220, AnnualTaxSek = 6000,
            AverageMarketPriceSek = 12000, DepreciationRatePercent = 30,
            ServiceCount = 1, CompleteServiceHistory = false, AuthorizedServiceUsed = false,
            LastServiceDate = DateTime.UtcNow.AddMonths(-40),
            TheftRiskCategory = "High", EuroNcapRating = 1, HasAlarmSystem = false,
            ReliabilityRating = 20, CommonIssuesCount = 10, AverageRepairCostSek = 25000
        };

        var (score, recommendation, breakdown) = _sut.Analyze(data);

        Assert.True(score < 40, $"Expected score < 40 but got {score}");
        Assert.Contains("riskfaktorer", recommendation, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Analyze_ScoreIsBetween0And100()
    {
        var data = CreateTestData(2015, 150000, insuranceIncidents: 2, recalls: 1,
            lastInspection: DateTime.UtcNow.AddMonths(-10), inspectionPassed: true);

        var (score, _, _) = _sut.Analyze(data);

        Assert.InRange(score, 0, 100);
    }

    [Fact]
    public void Analyze_BreakdownContainsAllTwelveCategories()
    {
        var data = CreateTestData(2020, 50000, insuranceIncidents: 0, recalls: 0,
            lastInspection: DateTime.UtcNow.AddMonths(-6), inspectionPassed: true) with
        {
            NumberOfOwners = 2, OutstandingDebtSek = 0, HasPurchaseBlock = false,
            EuroClass = "Euro 6", ServiceCount = 4, CompleteServiceHistory = true,
            TheftRiskCategory = "Low", EuroNcapRating = 5,
            ReliabilityRating = 80, AverageMarketPriceSek = 260000
        };

        var (_, _, breakdown) = _sut.Analyze(data);

        Assert.True(breakdown.AgeScore >= 0 && breakdown.AgeScore <= 100);
        Assert.True(breakdown.MileageScore >= 0 && breakdown.MileageScore <= 100);
        Assert.True(breakdown.InsuranceScore >= 0 && breakdown.InsuranceScore <= 100);
        Assert.True(breakdown.RecallScore >= 0 && breakdown.RecallScore <= 100);
        Assert.True(breakdown.InspectionScore >= 0 && breakdown.InspectionScore <= 100);
        Assert.True(breakdown.DebtFinanceScore >= 0 && breakdown.DebtFinanceScore <= 100);
        Assert.True(breakdown.ServiceHistoryScore >= 0 && breakdown.ServiceHistoryScore <= 100);
        Assert.True(breakdown.DrivetrainScore >= 0 && breakdown.DrivetrainScore <= 100);
        Assert.True(breakdown.OwnerHistoryScore >= 0 && breakdown.OwnerHistoryScore <= 100);
        Assert.True(breakdown.MarketValueScore >= 0 && breakdown.MarketValueScore <= 100);
        Assert.True(breakdown.EnvironmentScore >= 0 && breakdown.EnvironmentScore <= 100);
        Assert.True(breakdown.TheftSecurityScore >= 0 && breakdown.TheftSecurityScore <= 100);
    }

    [Fact]
    public void Analyze_PurchaseBlock_ResultsInVeryLowScore()
    {
        var data = CreateTestData(2022, 30000, insuranceIncidents: 0, recalls: 0,
            lastInspection: DateTime.UtcNow.AddMonths(-2), inspectionPassed: true) with
        {
            HasPurchaseBlock = true,
            NumberOfOwners = 1, OutstandingDebtSek = 0
        };

        var (_, _, breakdown) = _sut.Analyze(data);

        Assert.Equal(0, breakdown.DebtFinanceScore);
    }

    [Fact]
    public void Analyze_WithNullNewFields_UsesFallbackScores()
    {
        // Old-style data with no new fields — all new factors should use fallback
        var data = CreateTestData(2020, 50000, insuranceIncidents: 0, recalls: 0,
            lastInspection: DateTime.UtcNow.AddMonths(-6), inspectionPassed: true);

        var (score, _, breakdown) = _sut.Analyze(data);

        Assert.Equal(50, breakdown.DebtFinanceScore);
        Assert.Equal(40, breakdown.ServiceHistoryScore);
        Assert.Equal(55, breakdown.DrivetrainScore);
        Assert.Equal(60, breakdown.OwnerHistoryScore);
        Assert.Equal(50, breakdown.MarketValueScore);
        Assert.Equal(60, breakdown.EnvironmentScore);
        Assert.Equal(60, breakdown.TheftSecurityScore);
        Assert.InRange(score, 0, 100);
    }

    // Helper to create test CarDataResult with minimal new fields (all null)
    private static CarDataResult CreateTestData(
        int year, int mileage,
        int? insuranceIncidents = null, int? recalls = null,
        DateTime? lastInspection = null, bool? inspectionPassed = null,
        decimal? marketValue = 200000m)
    {
        return new CarDataResult(
            "TEST01", "Test", "Car", year, mileage,
            "Petrol", 100, "White",
            insuranceIncidents, recalls,
            lastInspection, inspectionPassed,
            marketValue);
    }
}

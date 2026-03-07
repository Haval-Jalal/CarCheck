using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Tests.Entities;

public class AnalysisResultTests
{
    private readonly Guid _validCarId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreateResult()
    {
        var result = AnalysisResult.Create(_validCarId, 85.5m, "Good condition, recommended purchase.");

        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(_validCarId, result.CarId);
        Assert.Equal(85.5m, result.Score);
        Assert.Equal("Good condition, recommended purchase.", result.Recommendation);
        Assert.True(result.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithEmptyCarId_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            AnalysisResult.Create(Guid.Empty, 85.5m, "Recommendation"));
    }

    [Theory]
    [InlineData(-0.1)]
    [InlineData(-50)]
    public void Create_WithScoreBelowZero_ShouldThrow(decimal score)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            AnalysisResult.Create(_validCarId, score, "Recommendation"));
    }

    [Theory]
    [InlineData(100.1)]
    [InlineData(200)]
    public void Create_WithScoreAbove100_ShouldThrow(decimal score)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            AnalysisResult.Create(_validCarId, score, "Recommendation"));
    }

    [Fact]
    public void Create_WithScoreZero_ShouldSucceed()
    {
        var result = AnalysisResult.Create(_validCarId, 0m, "Very poor condition.");

        Assert.Equal(0m, result.Score);
    }

    [Fact]
    public void Create_WithScore100_ShouldSucceed()
    {
        var result = AnalysisResult.Create(_validCarId, 100m, "Perfect condition.");

        Assert.Equal(100m, result.Score);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidRecommendation_ShouldThrow(string? recommendation)
    {
        Assert.Throws<ArgumentException>(() =>
            AnalysisResult.Create(_validCarId, 50m, recommendation!));
    }
}

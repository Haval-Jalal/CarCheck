using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Tests.Entities;

public class SearchHistoryTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateEntry()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        var entry = SearchHistory.Create(userId, carId);

        Assert.NotEqual(Guid.Empty, entry.Id);
        Assert.Equal(userId, entry.UserId);
        Assert.Equal(carId, entry.CarId);
        Assert.True(entry.SearchedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            SearchHistory.Create(Guid.Empty, Guid.NewGuid()));
    }

    [Fact]
    public void Create_WithEmptyCarId_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            SearchHistory.Create(Guid.NewGuid(), Guid.Empty));
    }

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        var entry1 = SearchHistory.Create(userId, carId);
        var entry2 = SearchHistory.Create(userId, carId);

        Assert.NotEqual(entry1.Id, entry2.Id);
    }
}

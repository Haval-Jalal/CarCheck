using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Tests.Entities;

public class FavoriteTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateFavorite()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        var favorite = Favorite.Create(userId, carId);

        Assert.NotEqual(Guid.Empty, favorite.Id);
        Assert.Equal(userId, favorite.UserId);
        Assert.Equal(carId, favorite.CarId);
        Assert.True(favorite.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            Favorite.Create(Guid.Empty, Guid.NewGuid()));
    }

    [Fact]
    public void Create_WithEmptyCarId_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            Favorite.Create(Guid.NewGuid(), Guid.Empty));
    }

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        var fav1 = Favorite.Create(userId, carId);
        var fav2 = Favorite.Create(userId, carId);

        Assert.NotEqual(fav1.Id, fav2.Id);
    }
}

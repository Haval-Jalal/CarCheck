using CarCheck.Application.Favorites;
using CarCheck.Application.Favorites.DTOs;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using NSubstitute;

namespace CarCheck.Application.Tests.Favorites;

public class FavoriteServiceTests
{
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly ICarRepository _carRepository;
    private readonly FavoriteService _sut;

    public FavoriteServiceTests()
    {
        _favoriteRepository = Substitute.For<IFavoriteRepository>();
        _carRepository = Substitute.For<ICarRepository>();
        _sut = new FavoriteService(_favoriteRepository, _carRepository);
    }

    // ===== Get Favorites =====

    [Fact]
    public async Task GetFavorites_ReturnsPaginatedResults()
    {
        var userId = Guid.NewGuid();
        var car = Car.Create("ABC123", "Volvo", "XC60", 2021, 35000);
        var favorite = Favorite.Create(userId, car.Id);

        _favoriteRepository.GetByUserIdAsync(userId, 1, 20, Arg.Any<CancellationToken>())
            .Returns(new List<Favorite> { favorite });
        _carRepository.GetByIdAsync(car.Id, Arg.Any<CancellationToken>())
            .Returns(car);

        var result = await _sut.GetFavoritesAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value!.Items);
        Assert.Equal("Volvo", result.Value.Items[0].Brand);
        Assert.Equal("XC60", result.Value.Items[0].Model);
    }

    [Fact]
    public async Task GetFavorites_Empty_ReturnsEmptyPage()
    {
        var userId = Guid.NewGuid();

        _favoriteRepository.GetByUserIdAsync(userId, 1, 20, Arg.Any<CancellationToken>())
            .Returns(new List<Favorite>());

        var result = await _sut.GetFavoritesAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value!.Items);
    }

    // ===== Add Favorite =====

    [Fact]
    public async Task AddFavorite_WithValidCar_ReturnsSuccess()
    {
        var userId = Guid.NewGuid();
        var car = Car.Create("DEF456", "BMW", "320d", 2018, 87000);

        _carRepository.GetByIdAsync(car.Id, Arg.Any<CancellationToken>())
            .Returns(car);
        _favoriteRepository.ExistsAsync(userId, car.Id, Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await _sut.AddFavoriteAsync(userId, new AddFavoriteRequest(car.Id));

        Assert.True(result.IsSuccess);
        Assert.Equal("BMW", result.Value!.Brand);
        Assert.Equal(car.Id, result.Value.CarId);
        await _favoriteRepository.Received(1).AddAsync(Arg.Any<Favorite>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddFavorite_CarNotFound_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        _carRepository.GetByIdAsync(carId, Arg.Any<CancellationToken>())
            .Returns((Car?)null);

        var result = await _sut.AddFavoriteAsync(userId, new AddFavoriteRequest(carId));

        Assert.False(result.IsSuccess);
        Assert.Equal("Car not found.", result.Error);
    }

    [Fact]
    public async Task AddFavorite_AlreadyExists_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        var car = Car.Create("ABC123", "Volvo", "XC60", 2021, 35000);

        _carRepository.GetByIdAsync(car.Id, Arg.Any<CancellationToken>())
            .Returns(car);
        _favoriteRepository.ExistsAsync(userId, car.Id, Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _sut.AddFavoriteAsync(userId, new AddFavoriteRequest(car.Id));

        Assert.False(result.IsSuccess);
        Assert.Equal("Car is already in favorites.", result.Error);
    }

    // ===== Remove Favorite =====

    [Fact]
    public async Task RemoveFavorite_Exists_ReturnsSuccess()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        _favoriteRepository.ExistsAsync(userId, carId, Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _sut.RemoveFavoriteAsync(userId, carId);

        Assert.True(result.IsSuccess);
        await _favoriteRepository.Received(1).RemoveAsync(userId, carId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RemoveFavorite_NotFound_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        _favoriteRepository.ExistsAsync(userId, carId, Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await _sut.RemoveFavoriteAsync(userId, carId);

        Assert.False(result.IsSuccess);
        Assert.Equal("Favorite not found.", result.Error);
    }

    // ===== Check Favorite =====

    [Fact]
    public async Task CheckFavorite_WhenExists_ReturnsTrue()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        _favoriteRepository.ExistsAsync(userId, carId, Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _sut.CheckFavoriteAsync(userId, carId);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value);
    }

    [Fact]
    public async Task CheckFavorite_WhenNotExists_ReturnsFalse()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();

        _favoriteRepository.ExistsAsync(userId, carId, Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await _sut.CheckFavoriteAsync(userId, carId);

        Assert.True(result.IsSuccess);
        Assert.False(result.Value);
    }
}

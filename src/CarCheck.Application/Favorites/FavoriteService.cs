using CarCheck.Application.Auth;
using CarCheck.Application.Favorites.DTOs;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;

namespace CarCheck.Application.Favorites;

public class FavoriteService
{
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly ICarRepository _carRepository;

    public FavoriteService(
        IFavoriteRepository favoriteRepository,
        ICarRepository carRepository)
    {
        _favoriteRepository = favoriteRepository;
        _carRepository = carRepository;
    }

    public async Task<Result<FavoritePageResponse>> GetFavoritesAsync(
        Guid userId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 1;
        if (pageSize > 100) pageSize = 100;

        var favorites = await _favoriteRepository.GetByUserIdAsync(userId, page, pageSize, cancellationToken);

        var items = new List<FavoriteResponse>();
        foreach (var fav in favorites)
        {
            var car = await _carRepository.GetByIdAsync(fav.CarId, cancellationToken);
            items.Add(new FavoriteResponse(
                fav.Id,
                fav.CarId,
                car?.RegistrationNumber.Value,
                car?.Brand,
                car?.Model,
                car?.Year,
                fav.CreatedAt));
        }

        return Result<FavoritePageResponse>.Success(
            new FavoritePageResponse(items, page, pageSize));
    }

    public async Task<Result<FavoriteResponse>> AddFavoriteAsync(
        Guid userId, AddFavoriteRequest request, CancellationToken cancellationToken = default)
    {
        var car = await _carRepository.GetByIdAsync(request.CarId, cancellationToken);
        if (car is null)
            return Result<FavoriteResponse>.Failure("Car not found.");

        if (await _favoriteRepository.ExistsAsync(userId, request.CarId, cancellationToken))
            return Result<FavoriteResponse>.Failure("Car is already in favorites.");

        var favorite = Favorite.Create(userId, request.CarId);
        await _favoriteRepository.AddAsync(favorite, cancellationToken);

        return Result<FavoriteResponse>.Success(new FavoriteResponse(
            favorite.Id,
            favorite.CarId,
            car.RegistrationNumber.Value,
            car.Brand,
            car.Model,
            car.Year,
            favorite.CreatedAt));
    }

    public async Task<Result<bool>> CheckFavoriteAsync(
        Guid userId, Guid carId, CancellationToken cancellationToken = default)
    {
        var exists = await _favoriteRepository.ExistsAsync(userId, carId, cancellationToken);
        return Result<bool>.Success(exists);
    }

    public async Task<Result<bool>> RemoveFavoriteAsync(
        Guid userId, Guid carId, CancellationToken cancellationToken = default)
    {
        if (!await _favoriteRepository.ExistsAsync(userId, carId, cancellationToken))
            return Result<bool>.Failure("Favorite not found.");

        await _favoriteRepository.RemoveAsync(userId, carId, cancellationToken);
        return Result<bool>.Success(true);
    }
}

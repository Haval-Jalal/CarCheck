using CarCheck.Application.History;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using NSubstitute;

namespace CarCheck.Application.Tests.History;

public class SearchHistoryServiceTests
{
    private readonly ISearchHistoryRepository _searchHistoryRepository;
    private readonly ICarRepository _carRepository;
    private readonly SearchHistoryService _sut;

    public SearchHistoryServiceTests()
    {
        _searchHistoryRepository = Substitute.For<ISearchHistoryRepository>();
        _carRepository = Substitute.For<ICarRepository>();
        _sut = new SearchHistoryService(_searchHistoryRepository, _carRepository);
    }

    [Fact]
    public async Task GetHistory_ReturnsPagedResults()
    {
        var userId = Guid.NewGuid();
        var car = Car.Create("ABC123", "Volvo", "XC60", 2021, 35000);
        var entry = SearchHistory.Create(userId, car.Id);

        _searchHistoryRepository.GetByUserIdAsync(userId, 1, 20, Arg.Any<CancellationToken>())
            .Returns(new List<SearchHistory> { entry });
        _searchHistoryRepository.GetCountByUserIdTodayAsync(userId, Arg.Any<CancellationToken>())
            .Returns(3);
        _carRepository.GetByIdAsync(car.Id, Arg.Any<CancellationToken>())
            .Returns(car);

        var result = await _sut.GetHistoryAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value!.Items);
        Assert.Equal("Volvo", result.Value.Items[0].Brand);
        Assert.Equal("ABC123", result.Value.Items[0].RegistrationNumber);
        Assert.Equal(3, result.Value.TodayCount);
        Assert.Equal(1, result.Value.Page);
    }

    [Fact]
    public async Task GetHistory_WithDeletedCar_ReturnsNullFields()
    {
        var userId = Guid.NewGuid();
        var carId = Guid.NewGuid();
        var entry = SearchHistory.Create(userId, carId);

        _searchHistoryRepository.GetByUserIdAsync(userId, 1, 20, Arg.Any<CancellationToken>())
            .Returns(new List<SearchHistory> { entry });
        _searchHistoryRepository.GetCountByUserIdTodayAsync(userId, Arg.Any<CancellationToken>())
            .Returns(1);
        _carRepository.GetByIdAsync(carId, Arg.Any<CancellationToken>())
            .Returns((Car?)null);

        var result = await _sut.GetHistoryAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value!.Items);
        Assert.Null(result.Value.Items[0].Brand);
        Assert.Null(result.Value.Items[0].RegistrationNumber);
    }

    [Fact]
    public async Task GetHistory_EmptyResults_ReturnsEmptyPage()
    {
        var userId = Guid.NewGuid();

        _searchHistoryRepository.GetByUserIdAsync(userId, 1, 20, Arg.Any<CancellationToken>())
            .Returns(new List<SearchHistory>());
        _searchHistoryRepository.GetCountByUserIdTodayAsync(userId, Arg.Any<CancellationToken>())
            .Returns(0);

        var result = await _sut.GetHistoryAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value!.Items);
        Assert.Equal(0, result.Value.TodayCount);
    }

    [Fact]
    public async Task GetHistory_ClampsPageSize()
    {
        var userId = Guid.NewGuid();

        _searchHistoryRepository.GetByUserIdAsync(userId, 1, 100, Arg.Any<CancellationToken>())
            .Returns(new List<SearchHistory>());
        _searchHistoryRepository.GetCountByUserIdTodayAsync(userId, Arg.Any<CancellationToken>())
            .Returns(0);

        var result = await _sut.GetHistoryAsync(userId, page: 0, pageSize: 999);

        Assert.True(result.IsSuccess);
        Assert.Equal(100, result.Value!.PageSize);
        Assert.Equal(1, result.Value.Page);
    }
}

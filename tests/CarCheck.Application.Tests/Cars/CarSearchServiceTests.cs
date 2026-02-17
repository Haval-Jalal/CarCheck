using CarCheck.Application.Cars;
using CarCheck.Application.Cars.DTOs;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using CarCheck.Domain.ValueObjects;
using NSubstitute;

namespace CarCheck.Application.Tests.Cars;

public class CarSearchServiceTests
{
    private readonly ICarRepository _carRepository;
    private readonly IAnalysisResultRepository _analysisResultRepository;
    private readonly ISearchHistoryRepository _searchHistoryRepository;
    private readonly ICarDataProvider _carDataProvider;
    private readonly ICacheService _cacheService;
    private readonly CarAnalysisEngine _analysisEngine;
    private readonly CarSearchService _sut;

    public CarSearchServiceTests()
    {
        _carRepository = Substitute.For<ICarRepository>();
        _analysisResultRepository = Substitute.For<IAnalysisResultRepository>();
        _searchHistoryRepository = Substitute.For<ISearchHistoryRepository>();
        _carDataProvider = Substitute.For<ICarDataProvider>();
        _cacheService = Substitute.For<ICacheService>();
        _analysisEngine = new CarAnalysisEngine();

        _sut = new CarSearchService(
            _carRepository,
            _analysisResultRepository,
            _searchHistoryRepository,
            _carDataProvider,
            _cacheService,
            _analysisEngine);
    }

    // ===== Search =====

    [Fact]
    public async Task Search_WhenCached_ReturnsCachedResult()
    {
        var userId = Guid.NewGuid();
        var cachedResponse = new CarSearchResponse(
            Guid.NewGuid(), "ABC123", "Volvo", "XC60", 2021, 35000,
            "Diesel", 235, "Black", 385000m);

        _cacheService.GetAsync<CarSearchResponse>("car:ABC123").Returns(cachedResponse);

        var result = await _sut.SearchByRegistrationAsync(userId, new CarSearchRequest("ABC123"));

        Assert.True(result.IsSuccess);
        Assert.Equal("ABC123", result.Value!.RegistrationNumber);
        await _carDataProvider.DidNotReceive().FetchByRegistrationAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _searchHistoryRepository.Received(1).AddAsync(Arg.Any<SearchHistory>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Search_WhenInDb_ReturnsDbResultWithExtraFieldsAndCaches()
    {
        var userId = Guid.NewGuid();
        var car = Car.Create("ABC123", "Volvo", "XC60", 2021, 35000);
        var externalData = new CarDataResult(
            "ABC123", "Volvo", "XC60", 2021, 35000,
            "Diesel", 235, "Black", 0, 0,
            DateTime.UtcNow, true, 385000m);

        _cacheService.GetAsync<CarSearchResponse>(Arg.Any<string>()).Returns((CarSearchResponse?)null);
        _carRepository.GetByRegistrationNumberAsync(Arg.Any<RegistrationNumber>()).Returns(car);
        _carDataProvider.FetchByRegistrationAsync("ABC123", Arg.Any<CancellationToken>()).Returns(externalData);

        var result = await _sut.SearchByRegistrationAsync(userId, new CarSearchRequest("ABC123"));

        Assert.True(result.IsSuccess);
        Assert.Equal("Volvo", result.Value!.Brand);
        Assert.Equal("Diesel", result.Value.FuelType);
        Assert.Equal(235, result.Value.HorsePower);
        Assert.Equal(385000m, result.Value.MarketValueSek);
        await _cacheService.Received(1).SetAsync(Arg.Any<string>(), Arg.Any<CarSearchResponse>(), Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>());
        await _carDataProvider.Received(1).FetchByRegistrationAsync("ABC123", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Search_WhenNotInDbOrCache_FetchesFromProvider()
    {
        var userId = Guid.NewGuid();
        var externalData = new CarDataResult(
            "DEF456", "BMW", "320d", 2018, 87000,
            "Diesel", 190, "White", 1, 1,
            DateTime.UtcNow.AddMonths(-8), true, 215000m);

        _cacheService.GetAsync<CarSearchResponse>(Arg.Any<string>()).Returns((CarSearchResponse?)null);
        _carRepository.GetByRegistrationNumberAsync(Arg.Any<RegistrationNumber>()).Returns((Car?)null);
        _carDataProvider.FetchByRegistrationAsync("DEF456").Returns(externalData);

        var result = await _sut.SearchByRegistrationAsync(userId, new CarSearchRequest("DEF456"));

        Assert.True(result.IsSuccess);
        Assert.Equal("BMW", result.Value!.Brand);
        Assert.Equal(2018, result.Value.Year);
        await _carRepository.Received(1).AddAsync(Arg.Any<Car>(), Arg.Any<CancellationToken>());
        await _cacheService.Received(1).SetAsync(Arg.Any<string>(), Arg.Any<CarSearchResponse>(), Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Search_WhenProviderReturnsNull_ReturnsFailure()
    {
        var userId = Guid.NewGuid();

        _cacheService.GetAsync<CarSearchResponse>(Arg.Any<string>()).Returns((CarSearchResponse?)null);
        _carRepository.GetByRegistrationNumberAsync(Arg.Any<RegistrationNumber>()).Returns((Car?)null);
        _carDataProvider.FetchByRegistrationAsync(Arg.Any<string>()).Returns((CarDataResult?)null);

        var result = await _sut.SearchByRegistrationAsync(userId, new CarSearchRequest("UNKNOWN"));

        Assert.False(result.IsSuccess);
        Assert.Equal("No vehicle found with this registration number.", result.Error);
    }

    [Fact]
    public async Task Search_AlwaysRecordsSearchHistory()
    {
        var userId = Guid.NewGuid();
        var car = Car.Create("ABC123", "Volvo", "XC60", 2021, 35000);

        _cacheService.GetAsync<CarSearchResponse>(Arg.Any<string>()).Returns((CarSearchResponse?)null);
        _carRepository.GetByRegistrationNumberAsync(Arg.Any<RegistrationNumber>()).Returns(car);

        await _sut.SearchByRegistrationAsync(userId, new CarSearchRequest("ABC123"));

        await _searchHistoryRepository.Received(1).AddAsync(
            Arg.Is<SearchHistory>(sh => sh.UserId == userId),
            Arg.Any<CancellationToken>());
    }

    // ===== Analysis =====

    [Fact]
    public async Task Analyze_WhenCached_ReturnsCachedResult()
    {
        var carId = Guid.NewGuid();
        var cachedAnalysis = new CarAnalysisResponse(
            Guid.NewGuid(), carId, "ABC123", "Volvo", "XC60", 2021,
            88.5m, "Excellent condition.", new AnalysisBreakdown(90, 85, 100, 100, 100, 100, 80, 85, 90, 75, 80, 70),
            DateTime.UtcNow);

        _cacheService.GetAsync<CarAnalysisResponse>($"analysis:{carId}").Returns(cachedAnalysis);

        var result = await _sut.AnalyzeCarAsync(carId);

        Assert.True(result.IsSuccess);
        Assert.Equal(88.5m, result.Value!.Score);
        await _carDataProvider.DidNotReceive().FetchByRegistrationAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Analyze_WhenCarNotFound_ReturnsFailure()
    {
        var carId = Guid.NewGuid();

        _cacheService.GetAsync<CarAnalysisResponse>(Arg.Any<string>()).Returns((CarAnalysisResponse?)null);
        _analysisResultRepository.GetLatestByCarIdAsync(carId).Returns((AnalysisResult?)null);
        _carRepository.GetByIdAsync(carId).Returns((Car?)null);

        var result = await _sut.AnalyzeCarAsync(carId);

        Assert.False(result.IsSuccess);
        Assert.Equal("Car not found.", result.Error);
    }

    [Fact]
    public async Task Analyze_WhenProviderReturnsNull_ReturnsFailure()
    {
        var carId = Guid.NewGuid();
        var car = Car.Create("XYZ999", "Saab", "9-5", 2010, 200000);

        _cacheService.GetAsync<CarAnalysisResponse>(Arg.Any<string>()).Returns((CarAnalysisResponse?)null);
        _analysisResultRepository.GetLatestByCarIdAsync(carId).Returns((AnalysisResult?)null);
        _carRepository.GetByIdAsync(carId).Returns(car);
        _carDataProvider.FetchByRegistrationAsync("XYZ999").Returns((CarDataResult?)null);

        var result = await _sut.AnalyzeCarAsync(carId);

        Assert.False(result.IsSuccess);
        Assert.Equal("Unable to fetch vehicle data for analysis.", result.Error);
    }

    [Fact]
    public async Task Analyze_FreshData_RunsEngineAndPersists()
    {
        var car = Car.Create("ABC123", "Volvo", "XC60", 2021, 35000);
        var carId = car.Id;
        var externalData = new CarDataResult(
            "ABC123", "Volvo", "XC60", 2021, 35000,
            "Diesel", 235, "Black", 0, 0,
            DateTime.UtcNow.AddMonths(-2), true, 385000m);

        _cacheService.GetAsync<CarAnalysisResponse>(Arg.Any<string>()).Returns((CarAnalysisResponse?)null);
        _analysisResultRepository.GetLatestByCarIdAsync(carId).Returns((AnalysisResult?)null);
        _carRepository.GetByIdAsync(carId).Returns(car);
        _carDataProvider.FetchByRegistrationAsync("ABC123").Returns(externalData);

        var result = await _sut.AnalyzeCarAsync(carId);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value!.Score > 0);
        Assert.NotEmpty(result.Value.Recommendation);
        await _analysisResultRepository.Received(1).AddAsync(Arg.Any<AnalysisResult>(), Arg.Any<CancellationToken>());
        await _cacheService.Received(1).SetAsync(Arg.Any<string>(), Arg.Any<CarAnalysisResponse>(), Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Analyze_FreshData_IncludesDetails()
    {
        var car = Car.Create("ABC123", "Volvo", "XC60", 2021, 35000);
        var carId = car.Id;
        var externalData = new CarDataResult(
            "ABC123", "Volvo", "XC60", 2021, 35000,
            "Diesel", 235, "Black", 0, 0,
            DateTime.UtcNow.AddMonths(-2), true, 385000m)
        {
            EuroClass = "Euro 6d",
            HasPurchaseBlock = false,
            Inspections = [new InspectionRecord(DateTime.UtcNow.AddMonths(-6), true, null)],
            ServiceRecords = [new ServiceRecord(DateTime.UtcNow.AddMonths(-4), "Volvo", "Stor service", 30000)],
            OwnerRecords = [new OwnerRecord(new DateTime(2021, 3, 1, 0, 0, 0, DateTimeKind.Utc), null, false, "Stockholm")],
            MileageReadings = [new MileageReadingRecord(DateTime.UtcNow.AddMonths(-6), 35000, "Besiktning")]
        };

        _cacheService.GetAsync<CarAnalysisResponse>(Arg.Any<string>()).Returns((CarAnalysisResponse?)null);
        _analysisResultRepository.GetLatestByCarIdAsync(carId).Returns((AnalysisResult?)null);
        _carRepository.GetByIdAsync(carId).Returns(car);
        _carDataProvider.FetchByRegistrationAsync("ABC123").Returns(externalData);

        var result = await _sut.AnalyzeCarAsync(carId);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value!.Details);
        Assert.Single(result.Value.Details!.Inspections);
        Assert.True(result.Value.Details.Inspections[0].Passed);
        Assert.Single(result.Value.Details.Services);
        Assert.Single(result.Value.Details.Owners);
        Assert.Single(result.Value.Details.MileageHistory);
        Assert.Equal("Euro 6d", result.Value.Details.EuroClass);
        Assert.False(result.Value.Details.HasPurchaseBlock);
    }

    [Fact]
    public async Task Analyze_FreshData_WithNullDetails_ReturnsEmptyLists()
    {
        var car = Car.Create("XYZ999", "Saab", "9-5", 2010, 200000);
        var carId = car.Id;
        var externalData = new CarDataResult(
            "XYZ999", "Saab", "9-5", 2010, 200000,
            "Petrol", 150, "Gray", 2, 1,
            DateTime.UtcNow.AddMonths(-10), true, 45000m);

        _cacheService.GetAsync<CarAnalysisResponse>(Arg.Any<string>()).Returns((CarAnalysisResponse?)null);
        _analysisResultRepository.GetLatestByCarIdAsync(carId).Returns((AnalysisResult?)null);
        _carRepository.GetByIdAsync(carId).Returns(car);
        _carDataProvider.FetchByRegistrationAsync("XYZ999").Returns(externalData);

        var result = await _sut.AnalyzeCarAsync(carId);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value!.Details);
        Assert.Empty(result.Value.Details!.Inspections);
        Assert.Empty(result.Value.Details.Services);
        Assert.Empty(result.Value.Details.Owners);
        Assert.Empty(result.Value.Details.MileageHistory);
    }
}

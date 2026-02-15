using CarCheck.Application.Auth;
using CarCheck.Application.Cars.DTOs;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using CarCheck.Domain.ValueObjects;

namespace CarCheck.Application.Cars;

public class CarSearchService
{
    private readonly ICarRepository _carRepository;
    private readonly IAnalysisResultRepository _analysisResultRepository;
    private readonly ISearchHistoryRepository _searchHistoryRepository;
    private readonly ICarDataProvider _carDataProvider;
    private readonly ICacheService _cacheService;
    private readonly CarAnalysisEngine _analysisEngine;

    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);
    private const string CacheKeyPrefix = "car:";
    private const string AnalysisCacheKeyPrefix = "analysis:";

    public CarSearchService(
        ICarRepository carRepository,
        IAnalysisResultRepository analysisResultRepository,
        ISearchHistoryRepository searchHistoryRepository,
        ICarDataProvider carDataProvider,
        ICacheService cacheService,
        CarAnalysisEngine analysisEngine)
    {
        _carRepository = carRepository;
        _analysisResultRepository = analysisResultRepository;
        _searchHistoryRepository = searchHistoryRepository;
        _carDataProvider = carDataProvider;
        _cacheService = cacheService;
        _analysisEngine = analysisEngine;
    }

    public async Task<Result<CarSearchResponse>> SearchByRegistrationAsync(
        Guid userId, CarSearchRequest request, CancellationToken cancellationToken = default)
    {
        var regNum = request.RegistrationNumber.Trim().ToUpperInvariant();

        // Check cache first
        var cacheKey = $"{CacheKeyPrefix}{regNum}";
        var cached = await _cacheService.GetAsync<CarSearchResponse>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            await RecordSearch(userId, cached.CarId, cancellationToken);
            return Result<CarSearchResponse>.Success(cached);
        }

        // Check DB
        var regVo = RegistrationNumber.Create(regNum);
        var existingCar = await _carRepository.GetByRegistrationNumberAsync(regVo, cancellationToken);

        if (existingCar is not null)
        {
            var response = MapToResponse(existingCar, null);
            await _cacheService.SetAsync(cacheKey, response, CacheDuration, cancellationToken);
            await RecordSearch(userId, existingCar.Id, cancellationToken);
            return Result<CarSearchResponse>.Success(response);
        }

        // Fetch from external provider
        var externalData = await _carDataProvider.FetchByRegistrationAsync(regNum, cancellationToken);
        if (externalData is null)
            return Result<CarSearchResponse>.Failure("No vehicle found with this registration number.");

        // Persist car
        var car = Car.Create(
            externalData.RegistrationNumber,
            externalData.Brand,
            externalData.Model,
            externalData.Year,
            externalData.Mileage);

        await _carRepository.AddAsync(car, cancellationToken);

        var searchResponse = new CarSearchResponse(
            car.Id,
            car.RegistrationNumber.Value,
            car.Brand,
            car.Model,
            car.Year,
            car.Mileage,
            externalData.FuelType,
            externalData.HorsePower,
            externalData.Color,
            externalData.MarketValueSek);

        await _cacheService.SetAsync(cacheKey, searchResponse, CacheDuration, cancellationToken);
        await RecordSearch(userId, car.Id, cancellationToken);

        return Result<CarSearchResponse>.Success(searchResponse);
    }

    public async Task<Result<CarAnalysisResponse>> AnalyzeCarAsync(
        Guid carId, CancellationToken cancellationToken = default)
    {
        // Check analysis cache
        var analysisCacheKey = $"{AnalysisCacheKeyPrefix}{carId}";
        var cached = await _cacheService.GetAsync<CarAnalysisResponse>(analysisCacheKey, cancellationToken);
        if (cached is not null)
            return Result<CarAnalysisResponse>.Success(cached);

        // Check for existing recent analysis (within last 24 hours)
        var existingAnalysis = await _analysisResultRepository.GetLatestByCarIdAsync(carId, cancellationToken);
        if (existingAnalysis is not null && (DateTime.UtcNow - existingAnalysis.CreatedAt).TotalHours < 24)
        {
            var car = await _carRepository.GetByIdAsync(carId, cancellationToken);
            if (car is not null)
            {
                var response = MapToAnalysisResponse(existingAnalysis, car, null);
                await _cacheService.SetAsync(analysisCacheKey, response, CacheDuration, cancellationToken);
                return Result<CarAnalysisResponse>.Success(response);
            }
        }

        // Fetch fresh data from provider
        var car2 = await _carRepository.GetByIdAsync(carId, cancellationToken);
        if (car2 is null)
            return Result<CarAnalysisResponse>.Failure("Car not found.");

        var externalData = await _carDataProvider.FetchByRegistrationAsync(car2.RegistrationNumber.Value, cancellationToken);
        if (externalData is null)
            return Result<CarAnalysisResponse>.Failure("Unable to fetch vehicle data for analysis.");

        // Run analysis
        var (score, recommendation, breakdown) = _analysisEngine.Analyze(externalData);

        // Build detail data for drill-down views
        var details = MapToAnalysisDetails(externalData);

        // Persist result
        var analysisResult = AnalysisResult.Create(carId, score, recommendation);
        await _analysisResultRepository.AddAsync(analysisResult, cancellationToken);

        var analysisResponse = new CarAnalysisResponse(
            analysisResult.Id,
            carId,
            car2.RegistrationNumber.Value,
            car2.Brand,
            car2.Model,
            car2.Year,
            score,
            recommendation,
            breakdown,
            analysisResult.CreatedAt,
            details);

        await _cacheService.SetAsync(analysisCacheKey, analysisResponse, CacheDuration, cancellationToken);

        return Result<CarAnalysisResponse>.Success(analysisResponse);
    }

    private async Task RecordSearch(Guid userId, Guid carId, CancellationToken cancellationToken)
    {
        var entry = SearchHistory.Create(userId, carId);
        await _searchHistoryRepository.AddAsync(entry, cancellationToken);
    }

    private static CarSearchResponse MapToResponse(Car car, CarDataResult? externalData)
    {
        return new CarSearchResponse(
            car.Id,
            car.RegistrationNumber.Value,
            car.Brand,
            car.Model,
            car.Year,
            car.Mileage,
            externalData?.FuelType,
            externalData?.HorsePower,
            externalData?.Color,
            externalData?.MarketValueSek);
    }

    private static CarAnalysisResponse MapToAnalysisResponse(
        AnalysisResult analysis, Car car, AnalysisBreakdown? breakdown)
    {
        return new CarAnalysisResponse(
            analysis.Id,
            car.Id,
            car.RegistrationNumber.Value,
            car.Brand,
            car.Model,
            car.Year,
            analysis.Score,
            analysis.Recommendation,
            breakdown ?? new AnalysisBreakdown(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
            analysis.CreatedAt);
    }

    private static AnalysisDetails MapToAnalysisDetails(CarDataResult data)
    {
        return new AnalysisDetails(
            Inspections: data.Inspections ?? [],
            Services: data.ServiceRecords ?? [],
            Owners: data.OwnerRecords ?? [],
            InsuranceIncidents: data.InsuranceIncidentRecords ?? [],
            Recalls: data.RecallRecords ?? [],
            Debts: data.DebtRecords ?? [],
            HasPurchaseBlock: data.HasPurchaseBlock ?? false,
            EuroClass: data.EuroClass,
            Co2EmissionsGPerKm: data.Co2EmissionsGPerKm,
            AnnualTaxSek: data.AnnualTaxSek,
            BonusMalusApplies: data.BonusMalusApplies,
            MarketValueSek: data.MarketValueSek,
            AverageMarketPriceSek: data.AverageMarketPriceSek,
            DepreciationRatePercent: data.DepreciationRatePercent,
            SimilarCars: data.SimilarCars ?? [],
            ReliabilityRating: data.ReliabilityRating,
            KnownIssues: data.KnownIssues ?? [],
            AverageRepairCostSek: data.AverageRepairCostSek,
            TheftRiskCategory: data.TheftRiskCategory,
            EuroNcapRating: data.EuroNcapRating,
            HasAlarmSystem: data.HasAlarmSystem,
            SecurityFeatures: data.SecurityFeatures ?? [],
            FirstRegistrationDate: data.FirstRegistrationDate,
            IsImported: data.IsImported,
            MileageHistory: data.MileageReadings ?? []);
    }
}

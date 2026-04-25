using CarCheck.Application.Auth;
using CarCheck.Application.Company.DTOs;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using CarCheck.Domain.ValueObjects;

namespace CarCheck.Application.Company;

public class FleetService
{
    private readonly IFleetVehicleRepository _fleetRepo;
    private readonly ICompanyMemberRepository _memberRepo;
    private readonly ICarRepository _carRepo;
    private readonly IAnalysisResultRepository _analysisRepo;

    public FleetService(
        IFleetVehicleRepository fleetRepo,
        ICompanyMemberRepository memberRepo,
        ICarRepository carRepo,
        IAnalysisResultRepository analysisRepo)
    {
        _fleetRepo = fleetRepo;
        _memberRepo = memberRepo;
        _carRepo = carRepo;
        _analysisRepo = analysisRepo;
    }

    public async Task<Result<IReadOnlyList<FleetVehicleResponse>>> GetFleetAsync(
        Guid userId, CancellationToken ct = default)
    {
        var member = await _memberRepo.GetByUserIdAsync(userId, ct);
        if (member is null) return Result<IReadOnlyList<FleetVehicleResponse>>.Failure("Du tillhör inget företag.");

        var vehicles = await _fleetRepo.GetByCompanyIdAsync(member.CompanyId, ct);
        var responses = new List<FleetVehicleResponse>();

        foreach (var v in vehicles)
        {
            var car = await _carRepo.GetByRegistrationNumberAsync(
                RegistrationNumber.Create(v.RegistrationNumber), ct);

            AnalysisResult? analysis = null;
            if (car is not null)
                analysis = await _analysisRepo.GetLatestByCarIdAsync(car.Id, ct);

            responses.Add(BuildResponse(v, analysis));
        }

        return Result<IReadOnlyList<FleetVehicleResponse>>.Success(responses);
    }

    public async Task<Result<FleetVehicleResponse>> AddVehicleAsync(
        Guid userId, AddFleetVehicleRequest request, CancellationToken ct = default)
    {
        var member = await _memberRepo.GetByUserIdAsync(userId, ct);
        if (member is null) return Result<FleetVehicleResponse>.Failure("Du tillhör inget företag.");

        var reg = request.RegistrationNumber.ToUpperInvariant().Trim();
        if (await _fleetRepo.ExistsAsync(member.CompanyId, reg, ct))
            return Result<FleetVehicleResponse>.Failure("Fordonet finns redan i flottan.");

        var vehicle = FleetVehicle.Create(member.CompanyId, reg, request.Nickname, userId);
        await _fleetRepo.AddAsync(vehicle, ct);

        var car = await _carRepo.GetByRegistrationNumberAsync(RegistrationNumber.Create(reg), ct);
        AnalysisResult? analysis = null;
        if (car is not null)
            analysis = await _analysisRepo.GetLatestByCarIdAsync(car.Id, ct);

        return Result<FleetVehicleResponse>.Success(BuildResponse(vehicle, analysis));
    }

    public async Task<Result<bool>> RemoveVehicleAsync(
        Guid userId, Guid vehicleId, CancellationToken ct = default)
    {
        var member = await _memberRepo.GetByUserIdAsync(userId, ct);
        if (member is null) return Result<bool>.Failure("Du tillhör inget företag.");

        var vehicle = await _fleetRepo.GetByIdAsync(vehicleId, ct);
        if (vehicle is null || vehicle.CompanyId != member.CompanyId)
            return Result<bool>.Failure("Fordonet hittades inte.");

        await _fleetRepo.DeleteAsync(vehicleId, ct);
        return Result<bool>.Success(true);
    }

    private static FleetVehicleResponse BuildResponse(FleetVehicle v, AnalysisResult? analysis)
    {
        FleetVehicleStatus status;
        if (analysis is null)
        {
            status = FleetVehicleStatus.NotAnalyzed;
        }
        else if ((DateTime.UtcNow - analysis.CreatedAt).TotalDays > 90)
        {
            status = FleetVehicleStatus.StaleData;
        }
        else if (analysis.Score < 40)
        {
            status = FleetVehicleStatus.Critical;
        }
        else if (analysis.Score < 60)
        {
            status = FleetVehicleStatus.NeedsAttention;
        }
        else
        {
            status = FleetVehicleStatus.Ok;
        }

        return new FleetVehicleResponse(
            v.Id,
            v.RegistrationNumber,
            v.Nickname,
            v.AddedAt,
            analysis is not null ? (decimal?)analysis.Score : null,
            analysis?.Recommendation,
            analysis?.CreatedAt,
            status);
    }
}

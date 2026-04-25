namespace CarCheck.Application.Company.DTOs;

public record AddFleetVehicleRequest(string RegistrationNumber, string? Nickname);

public record FleetVehicleResponse(
    Guid Id,
    string RegistrationNumber,
    string? Nickname,
    DateTime AddedAt,
    // Latest analysis snapshot (null if not yet analyzed)
    decimal? LatestScore,
    string? LatestRecommendation,
    DateTime? AnalyzedAt,
    FleetVehicleStatus Status);

public enum FleetVehicleStatus
{
    Ok,           // score >= 60, analyzed within 90 days
    NeedsAttention,  // score 40-59
    Critical,     // score < 40
    NotAnalyzed,  // no analysis found
    StaleData,    // last analysis > 90 days ago
}

using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface IAnalysisResultRepository
{
    Task<AnalysisResult?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<AnalysisResult?> GetLatestByCarIdAsync(Guid carId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AnalysisResult>> GetByCarIdAsync(Guid carId, CancellationToken cancellationToken = default);
    Task AddAsync(AnalysisResult result, CancellationToken cancellationToken = default);
}

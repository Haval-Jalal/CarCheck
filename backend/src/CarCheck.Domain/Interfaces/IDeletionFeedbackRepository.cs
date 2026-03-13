namespace CarCheck.Domain.Interfaces;

public interface IDeletionFeedbackRepository
{
    Task AddAsync(string reason, CancellationToken cancellationToken = default);
}

namespace CarCheck.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshTokenEntry?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task AddAsync(RefreshTokenEntry entry, CancellationToken cancellationToken = default);
    Task RevokeAsync(string token, CancellationToken cancellationToken = default);
    Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken = default);
}

public class RefreshTokenEntry
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Revoked { get; set; }
    public DateTime CreatedAt { get; set; }
}

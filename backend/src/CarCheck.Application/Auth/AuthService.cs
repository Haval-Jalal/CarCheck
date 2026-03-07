using CarCheck.Application.Auth.DTOs;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using CarCheck.Domain.ValueObjects;

namespace CarCheck.Application.Auth;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ISecurityEventLogger _securityEventLogger;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository,
        ISecurityEventLogger securityEventLogger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
        _securityEventLogger = securityEventLogger;
    }

    public async Task<Result<UserResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = Email.Create(request.Email);

        if (await _userRepository.ExistsByEmailAsync(email, cancellationToken))
            return Result<UserResponse>.Failure("Email is already registered.");

        if (request.Password.Length < 8)
            return Result<UserResponse>.Failure("Password must be at least 8 characters.");

        var hash = _passwordHasher.Hash(request.Password);
        var user = User.Create(request.Email, hash);

        await _userRepository.AddAsync(user, cancellationToken);
        await _securityEventLogger.LogAsync(user.Id, "Registered", null, cancellationToken);

        return Result<UserResponse>.Success(new UserResponse(user.Id, user.Email.Value, user.EmailVerified, user.TwoFactorEnabled));
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = Email.Create(request.Email);
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            if (user is not null)
                await _securityEventLogger.LogAsync(user.Id, "LoginFailed", null, cancellationToken);

            return Result<AuthResponse>.Failure("Invalid email or password.");
        }

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        await _refreshTokenRepository.AddAsync(new RefreshTokenEntry
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            Revoked = false,
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        await _securityEventLogger.LogAsync(user.Id, "Login", null, cancellationToken);

        return Result<AuthResponse>.Success(new AuthResponse(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(15)));
    }

    public async Task<Result<AuthResponse>> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken, cancellationToken);

        if (existing is null || existing.Revoked || existing.ExpiresAt < DateTime.UtcNow)
            return Result<AuthResponse>.Failure("Invalid or expired refresh token.");

        var user = await _userRepository.GetByIdAsync(existing.UserId, cancellationToken);
        if (user is null)
            return Result<AuthResponse>.Failure("User not found.");

        // Rotate: revoke old, issue new
        await _refreshTokenRepository.RevokeAsync(existing.Token, cancellationToken);

        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        await _refreshTokenRepository.AddAsync(new RefreshTokenEntry
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            Revoked = false,
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        return Result<AuthResponse>.Success(new AuthResponse(newAccessToken, newRefreshToken, DateTime.UtcNow.AddMinutes(15)));
    }

    public async Task<Result<bool>> LogoutAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default)
    {
        await _refreshTokenRepository.RevokeAsync(refreshToken, cancellationToken);
        await _securityEventLogger.LogAsync(userId, "Logout", null, cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> LogoutAllAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _refreshTokenRepository.RevokeAllForUserAsync(userId, cancellationToken);
        await _securityEventLogger.LogAsync(userId, "LogoutAll", null, cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<bool>.Failure("User not found.");

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            return Result<bool>.Failure("Current password is incorrect.");

        if (request.NewPassword.Length < 8)
            return Result<bool>.Failure("New password must be at least 8 characters.");

        user.ChangePassword(_passwordHasher.Hash(request.NewPassword));
        await _userRepository.UpdateAsync(user, cancellationToken);

        // Invalidate all refresh tokens on password change
        await _refreshTokenRepository.RevokeAllForUserAsync(userId, cancellationToken);
        await _securityEventLogger.LogAsync(userId, "PasswordChanged", null, cancellationToken);

        return Result<bool>.Success(true);
    }
}

public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(bool isSuccess, T? value, string? error)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
    }

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}

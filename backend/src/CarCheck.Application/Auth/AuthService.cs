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
    private readonly IPasswordResetRepository _passwordResetRepository;
    private readonly IEmailVerificationRepository _emailVerificationRepository;
    private readonly ICreditTransactionRepository _transactionRepository;
    private readonly IEmailService _emailService;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository,
        ISecurityEventLogger securityEventLogger,
        IPasswordResetRepository passwordResetRepository,
        IEmailVerificationRepository emailVerificationRepository,
        ICreditTransactionRepository transactionRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
        _securityEventLogger = securityEventLogger;
        _passwordResetRepository = passwordResetRepository;
        _emailVerificationRepository = emailVerificationRepository;
        _transactionRepository = transactionRepository;
        _emailService = emailService;
    }

    public async Task<Result<UserResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = Email.Create(request.Email);

        if (await _userRepository.ExistsByEmailAsync(email, cancellationToken))
            return Result<UserResponse>.Failure("E-postadressen är redan registrerad.");

        if (request.Password.Length < 8)
            return Result<UserResponse>.Failure("Lösenordet måste vara minst 8 tecken.");

        var hash = _passwordHasher.Hash(request.Password);
        var user = User.Create(request.Email, hash);

        await _userRepository.AddAsync(user, cancellationToken);
        await _securityEventLogger.LogAsync(user.Id, "Registered", null, cancellationToken);

        // Send verification email
        var verification = EmailVerification.Create(user.Id, TimeSpan.FromHours(24));
        await _emailVerificationRepository.AddAsync(verification, cancellationToken);
        await _emailService.SendEmailVerificationAsync(email.Value, verification.Token, cancellationToken);

        return Result<UserResponse>.Success(new UserResponse(user.Id, user.Email.Value, user.EmailVerified, user.TwoFactorEnabled));
    }

    public async Task<Result<bool>> VerifyEmailAsync(string token, CancellationToken cancellationToken = default)
    {
        var verification = await _emailVerificationRepository.GetByTokenAsync(token, cancellationToken);

        if (verification is null || verification.IsExpired() || verification.Used)
            return Result<bool>.Failure("Ogiltig eller utgången verifieringslänk.");

        var user = await _userRepository.GetByIdAsync(verification.UserId, cancellationToken);
        if (user is null)
            return Result<bool>.Failure("Användare hittades inte.");

        if (user.EmailVerified)
        {
            verification.MarkUsed();
            await _emailVerificationRepository.UpdateAsync(verification, cancellationToken);
            return Result<bool>.Success(true);
        }

        user.VerifyEmail();
        user.AddCredits(1);
        await _userRepository.UpdateAsync(user, cancellationToken);

        await _transactionRepository.AddAsync(
            CreditTransaction.CreateTrial(user.Id), cancellationToken);

        verification.MarkUsed();
        await _emailVerificationRepository.UpdateAsync(verification, cancellationToken);

        await _securityEventLogger.LogAsync(user.Id, "EmailVerified", null, cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = Email.Create(request.Email);
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            if (user is not null)
                await _securityEventLogger.LogAsync(user.Id, "LoginFailed", null, cancellationToken);

            return Result<AuthResponse>.Failure("Felaktig e-postadress eller lösenord.");
        }

        if (!user.EmailVerified)
            return Result<AuthResponse>.Failure("Du måste verifiera din e-postadress innan du loggar in. Kontrollera din inkorg.");


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
            return Result<AuthResponse>.Failure("Ogiltig eller utgången session. Logga in igen.");

        var user = await _userRepository.GetByIdAsync(existing.UserId, cancellationToken);
        if (user is null)
            return Result<AuthResponse>.Failure("Användare hittades inte.");

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

    public async Task<Result<bool>> ForgotPasswordAsync(PasswordResetRequest request, CancellationToken cancellationToken = default)
    {
        var email = Email.Create(request.Email);
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);

        // Always return success to avoid user enumeration
        if (user is null)
            return Result<bool>.Success(true);

        var reset = PasswordReset.Create(user.Id, TimeSpan.FromHours(1));
        await _passwordResetRepository.AddAsync(reset, cancellationToken);

        await _emailService.SendPasswordResetAsync(email.Value, reset.Token, cancellationToken);

        await _securityEventLogger.LogAsync(user.Id, "PasswordResetRequested", null, cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> ResetPasswordAsync(PasswordResetConfirmRequest request, CancellationToken cancellationToken = default)
    {
        if (request.NewPassword.Length < 8)
            return Result<bool>.Failure("Lösenordet måste vara minst 8 tecken.");

        var reset = await _passwordResetRepository.GetByTokenAsync(request.Token, cancellationToken);

        if (reset is null || reset.IsExpired() || reset.Used)
            return Result<bool>.Failure("Ogiltig eller utgången länk. Begär en ny.");

        var user = await _userRepository.GetByIdAsync(reset.UserId, cancellationToken);
        if (user is null)
            return Result<bool>.Failure("Användare hittades inte.");

        reset.MarkUsed();
        await _passwordResetRepository.UpdateAsync(reset, cancellationToken);

        user.ChangePassword(_passwordHasher.Hash(request.NewPassword));
        await _userRepository.UpdateAsync(user, cancellationToken);

        await _refreshTokenRepository.RevokeAllForUserAsync(user.Id, cancellationToken);
        await _securityEventLogger.LogAsync(user.Id, "PasswordReset", null, cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<bool>.Failure("Användare hittades inte.");

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            return Result<bool>.Failure("Nuvarande lösenord är felaktigt.");

        if (request.NewPassword.Length < 8)
            return Result<bool>.Failure("Lösenordet måste vara minst 8 tecken.");

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

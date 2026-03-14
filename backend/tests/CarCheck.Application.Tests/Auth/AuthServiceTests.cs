using CarCheck.Application.Auth;
using CarCheck.Application.Auth.DTOs;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using CarCheck.Domain.ValueObjects;
using NSubstitute;

namespace CarCheck.Application.Tests.Auth;

public class AuthServiceTests
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
    private readonly IEmailRateLimitService _emailRateLimit;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _passwordHasher = Substitute.For<IPasswordHasher>();
        _tokenService = Substitute.For<ITokenService>();
        _refreshTokenRepository = Substitute.For<IRefreshTokenRepository>();
        _securityEventLogger = Substitute.For<ISecurityEventLogger>();
        _passwordResetRepository = Substitute.For<IPasswordResetRepository>();
        _emailVerificationRepository = Substitute.For<IEmailVerificationRepository>();
        _transactionRepository = Substitute.For<ICreditTransactionRepository>();
        _emailService = Substitute.For<IEmailService>();
        _emailRateLimit = Substitute.For<IEmailRateLimitService>();

        _sut = new AuthService(
            _userRepository,
            _passwordHasher,
            _tokenService,
            _refreshTokenRepository,
            _securityEventLogger,
            _passwordResetRepository,
            _emailVerificationRepository,
            _transactionRepository,
            _emailService,
            _emailRateLimit);
    }

    // ===== Register =====

    [Fact]
    public async Task Register_WithValidData_ShouldReturnSuccess()
    {
        _userRepository.ExistsByEmailAsync(Arg.Any<Email>()).Returns(false);
        _passwordHasher.Hash("Password123!Long").Returns("hashed");

        var result = await _sut.RegisterAsync(new RegisterRequest("user@test.com", "Password123!Long"));

        Assert.True(result.IsSuccess);
        Assert.Equal("user@test.com", result.Value!.Email);
        await _userRepository.Received(1).AddAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(Arg.Any<Guid>(), "Registered", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Register_WithExistingEmail_ShouldReturnFailure()
    {
        _userRepository.ExistsByEmailAsync(Arg.Any<Email>()).Returns(true);

        var result = await _sut.RegisterAsync(new RegisterRequest("existing@test.com", "Password123!Long"));

        Assert.False(result.IsSuccess);
        Assert.Equal("E-postadressen är redan registrerad.", result.Error);
    }

    [Fact]
    public async Task Register_WithShortPassword_ShouldReturnFailure()
    {
        _userRepository.ExistsByEmailAsync(Arg.Any<Email>()).Returns(false);

        var result = await _sut.RegisterAsync(new RegisterRequest("user@test.com", "short"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Lösenordet måste vara minst 12 tecken.", result.Error);
    }

    [Fact]
    public async Task Register_WithNoUppercase_ShouldReturnFailure()
    {
        _userRepository.ExistsByEmailAsync(Arg.Any<Email>()).Returns(false);

        var result = await _sut.RegisterAsync(new RegisterRequest("user@test.com", "alllowercase123!"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Lösenordet måste innehålla minst en stor bokstav.", result.Error);
    }

    [Fact]
    public async Task Register_WithNoDigit_ShouldReturnFailure()
    {
        _userRepository.ExistsByEmailAsync(Arg.Any<Email>()).Returns(false);

        var result = await _sut.RegisterAsync(new RegisterRequest("user@test.com", "NoDigitsHereAtAll!"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Lösenordet måste innehålla minst en siffra.", result.Error);
    }

    // ===== Login =====

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnTokens()
    {
        var user = User.Create("user@test.com", "hashed");
        user.VerifyEmail();
        _userRepository.GetByEmailAsync(Arg.Any<Email>()).Returns(user);
        _passwordHasher.Verify("Password123!Long", "hashed").Returns(true);
        _tokenService.GenerateAccessToken(user).Returns("access_token");
        _tokenService.GenerateRefreshToken().Returns("refresh_token");

        var result = await _sut.LoginAsync(new LoginRequest("user@test.com", "Password123!Long"));

        Assert.True(result.IsSuccess);
        Assert.Equal("access_token", result.Value!.AccessToken);
        Assert.Equal("refresh_token", result.Value.RefreshToken);
        await _securityEventLogger.Received(1).LogAsync(user.Id, "Login", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ShouldReturnFailure()
    {
        var user = User.Create("user@test.com", "hashed");
        _userRepository.GetByEmailAsync(Arg.Any<Email>()).Returns(user);
        _passwordHasher.Verify("wrong", "hashed").Returns(false);

        var result = await _sut.LoginAsync(new LoginRequest("user@test.com", "wrong"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Felaktig e-postadress eller lösenord.", result.Error);
        await _securityEventLogger.Received(1).LogAsync(user.Id, "LoginFailed", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ShouldReturnFailure()
    {
        _userRepository.GetByEmailAsync(Arg.Any<Email>()).Returns((User?)null);
        _passwordHasher.Verify(Arg.Any<string>(), Arg.Any<string>()).Returns(false);

        var result = await _sut.LoginAsync(new LoginRequest("nonexistent@test.com", "Password123!Long"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Felaktig e-postadress eller lösenord.", result.Error);
    }

    [Fact]
    public async Task Login_WithLockedAccount_ShouldReturnFailure()
    {
        var user = User.Create("user@test.com", "hashed");
        // Record 5 failures to trigger lockout
        for (int i = 0; i < 5; i++) user.RecordFailedLogin();

        _userRepository.GetByEmailAsync(Arg.Any<Email>()).Returns(user);

        var result = await _sut.LoginAsync(new LoginRequest("user@test.com", "anypassword"));

        Assert.False(result.IsSuccess);
        Assert.Contains("låst", result.Error);
        await _securityEventLogger.Received(1).LogAsync(user.Id, "LoginBlockedLockout", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    // ===== Refresh =====

    [Fact]
    public async Task Refresh_WithValidToken_ShouldRotateTokens()
    {
        var user = User.Create("user@test.com", "hashed");
        var existingEntry = new RefreshTokenEntry
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "old_refresh",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            Revoked = false,
            CreatedAt = DateTime.UtcNow
        };

        _refreshTokenRepository.GetByTokenAsync("old_refresh").Returns(existingEntry);
        _userRepository.GetByIdAsync(user.Id).Returns(user);
        _tokenService.GenerateAccessToken(user).Returns("new_access");
        _tokenService.GenerateRefreshToken().Returns("new_refresh");

        var result = await _sut.RefreshAsync("old_refresh");

        Assert.True(result.IsSuccess);
        Assert.Equal("new_access", result.Value!.AccessToken);
        Assert.Equal("new_refresh", result.Value.RefreshToken);
        await _refreshTokenRepository.Received(1).RevokeAsync("old_refresh", Arg.Any<CancellationToken>());
        await _refreshTokenRepository.Received(1).AddAsync(Arg.Any<RefreshTokenEntry>(), Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(user.Id, "TokenRefreshed", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Refresh_WithRevokedToken_ShouldReturnFailure()
    {
        var entry = new RefreshTokenEntry
        {
            Token = "revoked_token",
            Revoked = true,
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        _refreshTokenRepository.GetByTokenAsync("revoked_token").Returns(entry);

        var result = await _sut.RefreshAsync("revoked_token");

        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task Refresh_WithExpiredToken_ShouldReturnFailure()
    {
        var entry = new RefreshTokenEntry
        {
            Token = "expired_token",
            Revoked = false,
            ExpiresAt = DateTime.UtcNow.AddDays(-1)
        };
        _refreshTokenRepository.GetByTokenAsync("expired_token").Returns(entry);

        var result = await _sut.RefreshAsync("expired_token");

        Assert.False(result.IsSuccess);
    }

    // ===== Logout =====

    [Fact]
    public async Task Logout_ShouldRevokeTokenAndLog()
    {
        var userId = Guid.NewGuid();

        var result = await _sut.LogoutAsync(userId, "some_refresh_token");

        Assert.True(result.IsSuccess);
        await _refreshTokenRepository.Received(1).RevokeAsync("some_refresh_token", Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(userId, "Logout", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LogoutAll_ShouldRevokeAllTokensAndLog()
    {
        var userId = Guid.NewGuid();

        var result = await _sut.LogoutAllAsync(userId);

        Assert.True(result.IsSuccess);
        await _refreshTokenRepository.Received(1).RevokeAllForUserAsync(userId, Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(userId, "LogoutAll", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    // ===== Change Password =====

    [Fact]
    public async Task ChangePassword_WithValidData_ShouldSucceed()
    {
        var user = User.Create("user@test.com", "old_hash");
        _userRepository.GetByIdAsync(user.Id).Returns(user);
        _passwordHasher.Verify("OldPass123!", "old_hash").Returns(true);
        _passwordHasher.Hash("NewPass123!Long").Returns("new_hash");

        var result = await _sut.ChangePasswordAsync(user.Id, new ChangePasswordRequest("OldPass123!", "NewPass123!Long"));

        Assert.True(result.IsSuccess);
        await _userRepository.Received(1).UpdateAsync(user, Arg.Any<CancellationToken>());
        await _refreshTokenRepository.Received(1).RevokeAllForUserAsync(user.Id, Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(user.Id, "PasswordChanged", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ChangePassword_WithWrongCurrentPassword_ShouldReturnFailure()
    {
        var user = User.Create("user@test.com", "old_hash");
        _userRepository.GetByIdAsync(user.Id).Returns(user);
        _passwordHasher.Verify("wrong", "old_hash").Returns(false);

        var result = await _sut.ChangePasswordAsync(user.Id, new ChangePasswordRequest("wrong", "NewPass123!Long"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Nuvarande lösenord är felaktigt.", result.Error);
    }

    [Fact]
    public async Task ChangePassword_WithShortNewPassword_ShouldReturnFailure()
    {
        var user = User.Create("user@test.com", "old_hash");
        _userRepository.GetByIdAsync(user.Id).Returns(user);
        _passwordHasher.Verify("OldPass123!", "old_hash").Returns(true);

        var result = await _sut.ChangePasswordAsync(user.Id, new ChangePasswordRequest("OldPass123!", "short"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Lösenordet måste vara minst 12 tecken.", result.Error);
    }

    [Fact]
    public async Task ChangePassword_WithNonExistentUser_ShouldReturnFailure()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId).Returns((User?)null);

        var result = await _sut.ChangePasswordAsync(userId, new ChangePasswordRequest("old", "NewPass123!Long"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Användare hittades inte.", result.Error);
    }
}

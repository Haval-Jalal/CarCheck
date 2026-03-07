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
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _passwordHasher = Substitute.For<IPasswordHasher>();
        _tokenService = Substitute.For<ITokenService>();
        _refreshTokenRepository = Substitute.For<IRefreshTokenRepository>();
        _securityEventLogger = Substitute.For<ISecurityEventLogger>();

        _sut = new AuthService(
            _userRepository,
            _passwordHasher,
            _tokenService,
            _refreshTokenRepository,
            _securityEventLogger);
    }

    // ===== Register =====

    [Fact]
    public async Task Register_WithValidData_ShouldReturnSuccess()
    {
        _userRepository.ExistsByEmailAsync(Arg.Any<Email>()).Returns(false);
        _passwordHasher.Hash("Password123!").Returns("hashed");

        var result = await _sut.RegisterAsync(new RegisterRequest("user@test.com", "Password123!"));

        Assert.True(result.IsSuccess);
        Assert.Equal("user@test.com", result.Value!.Email);
        await _userRepository.Received(1).AddAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(Arg.Any<Guid>(), "Registered", null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Register_WithExistingEmail_ShouldReturnFailure()
    {
        _userRepository.ExistsByEmailAsync(Arg.Any<Email>()).Returns(true);

        var result = await _sut.RegisterAsync(new RegisterRequest("existing@test.com", "Password123!"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Email is already registered.", result.Error);
    }

    [Fact]
    public async Task Register_WithShortPassword_ShouldReturnFailure()
    {
        _userRepository.ExistsByEmailAsync(Arg.Any<Email>()).Returns(false);

        var result = await _sut.RegisterAsync(new RegisterRequest("user@test.com", "short"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Password must be at least 8 characters.", result.Error);
    }

    // ===== Login =====

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnTokens()
    {
        var user = User.Create("user@test.com", "hashed");
        _userRepository.GetByEmailAsync(Arg.Any<Email>()).Returns(user);
        _passwordHasher.Verify("Password123!", "hashed").Returns(true);
        _tokenService.GenerateAccessToken(user).Returns("access_token");
        _tokenService.GenerateRefreshToken().Returns("refresh_token");

        var result = await _sut.LoginAsync(new LoginRequest("user@test.com", "Password123!"));

        Assert.True(result.IsSuccess);
        Assert.Equal("access_token", result.Value!.AccessToken);
        Assert.Equal("refresh_token", result.Value.RefreshToken);
        await _securityEventLogger.Received(1).LogAsync(user.Id, "Login", null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ShouldReturnFailure()
    {
        var user = User.Create("user@test.com", "hashed");
        _userRepository.GetByEmailAsync(Arg.Any<Email>()).Returns(user);
        _passwordHasher.Verify("wrong", "hashed").Returns(false);

        var result = await _sut.LoginAsync(new LoginRequest("user@test.com", "wrong"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid email or password.", result.Error);
        await _securityEventLogger.Received(1).LogAsync(user.Id, "LoginFailed", null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ShouldReturnFailure()
    {
        _userRepository.GetByEmailAsync(Arg.Any<Email>()).Returns((User?)null);

        var result = await _sut.LoginAsync(new LoginRequest("nonexistent@test.com", "Password123!"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Invalid email or password.", result.Error);
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

        var result = await _sut.RefreshAsync(new RefreshRequest("old_refresh"));

        Assert.True(result.IsSuccess);
        Assert.Equal("new_access", result.Value!.AccessToken);
        Assert.Equal("new_refresh", result.Value.RefreshToken);
        await _refreshTokenRepository.Received(1).RevokeAsync("old_refresh", Arg.Any<CancellationToken>());
        await _refreshTokenRepository.Received(1).AddAsync(Arg.Any<RefreshTokenEntry>(), Arg.Any<CancellationToken>());
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

        var result = await _sut.RefreshAsync(new RefreshRequest("revoked_token"));

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

        var result = await _sut.RefreshAsync(new RefreshRequest("expired_token"));

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
        await _securityEventLogger.Received(1).LogAsync(userId, "Logout", null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LogoutAll_ShouldRevokeAllTokensAndLog()
    {
        var userId = Guid.NewGuid();

        var result = await _sut.LogoutAllAsync(userId);

        Assert.True(result.IsSuccess);
        await _refreshTokenRepository.Received(1).RevokeAllForUserAsync(userId, Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(userId, "LogoutAll", null, Arg.Any<CancellationToken>());
    }

    // ===== Change Password =====

    [Fact]
    public async Task ChangePassword_WithValidData_ShouldSucceed()
    {
        var user = User.Create("user@test.com", "old_hash");
        _userRepository.GetByIdAsync(user.Id).Returns(user);
        _passwordHasher.Verify("OldPass123!", "old_hash").Returns(true);
        _passwordHasher.Hash("NewPass123!").Returns("new_hash");

        var result = await _sut.ChangePasswordAsync(user.Id, new ChangePasswordRequest("OldPass123!", "NewPass123!"));

        Assert.True(result.IsSuccess);
        await _userRepository.Received(1).UpdateAsync(user, Arg.Any<CancellationToken>());
        await _refreshTokenRepository.Received(1).RevokeAllForUserAsync(user.Id, Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(user.Id, "PasswordChanged", null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ChangePassword_WithWrongCurrentPassword_ShouldReturnFailure()
    {
        var user = User.Create("user@test.com", "old_hash");
        _userRepository.GetByIdAsync(user.Id).Returns(user);
        _passwordHasher.Verify("wrong", "old_hash").Returns(false);

        var result = await _sut.ChangePasswordAsync(user.Id, new ChangePasswordRequest("wrong", "NewPass123!"));

        Assert.False(result.IsSuccess);
        Assert.Equal("Current password is incorrect.", result.Error);
    }

    [Fact]
    public async Task ChangePassword_WithShortNewPassword_ShouldReturnFailure()
    {
        var user = User.Create("user@test.com", "old_hash");
        _userRepository.GetByIdAsync(user.Id).Returns(user);
        _passwordHasher.Verify("OldPass123!", "old_hash").Returns(true);

        var result = await _sut.ChangePasswordAsync(user.Id, new ChangePasswordRequest("OldPass123!", "short"));

        Assert.False(result.IsSuccess);
        Assert.Equal("New password must be at least 8 characters.", result.Error);
    }

    [Fact]
    public async Task ChangePassword_WithNonExistentUser_ShouldReturnFailure()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId).Returns((User?)null);

        var result = await _sut.ChangePasswordAsync(userId, new ChangePasswordRequest("old", "NewPass123!"));

        Assert.False(result.IsSuccess);
        Assert.Equal("User not found.", result.Error);
    }
}

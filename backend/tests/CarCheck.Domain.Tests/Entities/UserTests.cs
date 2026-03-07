using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Tests.Entities;

public class UserTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateUser()
    {
        var user = User.Create("Test@Example.com", "hashed_password_123");

        Assert.NotEqual(Guid.Empty, user.Id);
        Assert.Equal("test@example.com", user.Email.Value);
        Assert.Equal("hashed_password_123", user.PasswordHash);
        Assert.False(user.EmailVerified);
        Assert.False(user.TwoFactorEnabled);
        Assert.True(user.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_ShouldNormalizeEmail_ToLowerCase()
    {
        var user = User.Create("USER@DOMAIN.COM", "hash");

        Assert.Equal("user@domain.com", user.Email.Value);
    }

    [Fact]
    public void Create_ShouldTrimEmail()
    {
        var user = User.Create("  user@domain.com  ", "hash");

        Assert.Equal("user@domain.com", user.Email.Value);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidEmail_ShouldThrow(string? email)
    {
        Assert.Throws<ArgumentException>(() => User.Create(email!, "hash"));
    }

    [Theory]
    [InlineData("notanemail")]
    [InlineData("missing@tld")]
    [InlineData("@domain.com")]
    public void Create_WithInvalidEmailFormat_ShouldThrow(string email)
    {
        Assert.Throws<ArgumentException>(() => User.Create(email, "hash"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidPasswordHash_ShouldThrow(string? hash)
    {
        Assert.Throws<ArgumentException>(() => User.Create("user@test.com", hash!));
    }

    [Fact]
    public void VerifyEmail_ShouldSetEmailVerifiedToTrue()
    {
        var user = User.Create("user@test.com", "hash");

        user.VerifyEmail();

        Assert.True(user.EmailVerified);
    }

    [Fact]
    public void EnableTwoFactor_ShouldSetTwoFactorEnabledToTrue()
    {
        var user = User.Create("user@test.com", "hash");

        user.EnableTwoFactor();

        Assert.True(user.TwoFactorEnabled);
    }

    [Fact]
    public void DisableTwoFactor_ShouldSetTwoFactorEnabledToFalse()
    {
        var user = User.Create("user@test.com", "hash");
        user.EnableTwoFactor();

        user.DisableTwoFactor();

        Assert.False(user.TwoFactorEnabled);
    }

    [Fact]
    public void ChangePassword_WithValidHash_ShouldUpdatePasswordHash()
    {
        var user = User.Create("user@test.com", "old_hash");

        user.ChangePassword("new_hash");

        Assert.Equal("new_hash", user.PasswordHash);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void ChangePassword_WithInvalidHash_ShouldThrow(string? hash)
    {
        var user = User.Create("user@test.com", "old_hash");

        Assert.Throws<ArgumentException>(() => user.ChangePassword(hash!));
    }

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        var user1 = User.Create("user1@test.com", "hash");
        var user2 = User.Create("user2@test.com", "hash");

        Assert.NotEqual(user1.Id, user2.Id);
    }
}

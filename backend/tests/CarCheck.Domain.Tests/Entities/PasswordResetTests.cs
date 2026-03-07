using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Tests.Entities;

public class PasswordResetTests
{
    private readonly Guid _validUserId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreateReset()
    {
        var reset = PasswordReset.Create(_validUserId, TimeSpan.FromHours(1));

        Assert.NotEqual(Guid.Empty, reset.Id);
        Assert.Equal(_validUserId, reset.UserId);
        Assert.False(string.IsNullOrEmpty(reset.Token));
        Assert.False(reset.Used);
        Assert.True(reset.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            PasswordReset.Create(Guid.Empty, TimeSpan.FromHours(1)));
    }

    [Fact]
    public void Create_ShouldGenerateUniqueTokens()
    {
        var reset1 = PasswordReset.Create(_validUserId, TimeSpan.FromHours(1));
        var reset2 = PasswordReset.Create(_validUserId, TimeSpan.FromHours(1));

        Assert.NotEqual(reset1.Token, reset2.Token);
    }

    [Fact]
    public void Create_ExpiresAt_ShouldBeInFuture()
    {
        var expiration = TimeSpan.FromMinutes(30);
        var before = DateTime.UtcNow;

        var reset = PasswordReset.Create(_validUserId, expiration);

        Assert.True(reset.ExpiresAt >= before.Add(expiration).AddSeconds(-1));
        Assert.True(reset.ExpiresAt <= DateTime.UtcNow.Add(expiration).AddSeconds(1));
    }

    [Fact]
    public void IsExpired_WhenNotExpired_ShouldReturnFalse()
    {
        var reset = PasswordReset.Create(_validUserId, TimeSpan.FromHours(1));

        Assert.False(reset.IsExpired());
    }

    [Fact]
    public void IsExpired_WhenExpired_ShouldReturnTrue()
    {
        var reset = PasswordReset.Create(_validUserId, TimeSpan.FromMilliseconds(-1));

        Assert.True(reset.IsExpired());
    }

    [Fact]
    public void MarkUsed_WhenValid_ShouldSetUsedToTrue()
    {
        var reset = PasswordReset.Create(_validUserId, TimeSpan.FromHours(1));

        reset.MarkUsed();

        Assert.True(reset.Used);
    }

    [Fact]
    public void MarkUsed_WhenAlreadyUsed_ShouldThrow()
    {
        var reset = PasswordReset.Create(_validUserId, TimeSpan.FromHours(1));
        reset.MarkUsed();

        Assert.Throws<InvalidOperationException>(() => reset.MarkUsed());
    }

    [Fact]
    public void MarkUsed_WhenExpired_ShouldThrow()
    {
        var reset = PasswordReset.Create(_validUserId, TimeSpan.FromMilliseconds(-1));

        Assert.Throws<InvalidOperationException>(() => reset.MarkUsed());
    }
}

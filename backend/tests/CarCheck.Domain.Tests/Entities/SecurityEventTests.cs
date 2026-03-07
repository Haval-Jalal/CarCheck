using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Tests.Entities;

public class SecurityEventTests
{
    private readonly Guid _validUserId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreateEvent()
    {
        var secEvent = SecurityEvent.Create(_validUserId, "Login", "{\"ip\": \"127.0.0.1\"}");

        Assert.NotEqual(Guid.Empty, secEvent.Id);
        Assert.Equal(_validUserId, secEvent.UserId);
        Assert.Equal("Login", secEvent.Type);
        Assert.Equal("{\"ip\": \"127.0.0.1\"}", secEvent.Metadata);
        Assert.True(secEvent.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithoutMetadata_ShouldCreateWithNullMetadata()
    {
        var secEvent = SecurityEvent.Create(_validUserId, "Logout");

        Assert.Null(secEvent.Metadata);
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            SecurityEvent.Create(Guid.Empty, "Login"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidType_ShouldThrow(string? type)
    {
        Assert.Throws<ArgumentException>(() =>
            SecurityEvent.Create(_validUserId, type!));
    }

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        var event1 = SecurityEvent.Create(_validUserId, "Login");
        var event2 = SecurityEvent.Create(_validUserId, "Login");

        Assert.NotEqual(event1.Id, event2.Id);
    }

    [Fact]
    public void Create_ShouldSetCreatedAtCloseToNow()
    {
        var before = DateTime.UtcNow;

        var secEvent = SecurityEvent.Create(_validUserId, "Login");

        Assert.True(secEvent.CreatedAt >= before.AddSeconds(-1));
        Assert.True(secEvent.CreatedAt <= DateTime.UtcNow.AddSeconds(1));
    }
}

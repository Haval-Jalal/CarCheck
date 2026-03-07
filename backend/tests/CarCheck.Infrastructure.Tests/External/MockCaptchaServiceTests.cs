using CarCheck.Infrastructure.External;

namespace CarCheck.Infrastructure.Tests.External;

public class MockCaptchaServiceTests
{
    private readonly MockCaptchaService _sut = new();

    [Fact]
    public async Task Validate_WithValidToken_ReturnsTrue()
    {
        var result = await _sut.ValidateAsync("valid-token-123");
        Assert.True(result);
    }

    [Fact]
    public async Task Validate_WithInvalidToken_ReturnsFalse()
    {
        var result = await _sut.ValidateAsync("invalid");
        Assert.False(result);
    }

    [Fact]
    public async Task Validate_WithEmptyToken_ReturnsFalse()
    {
        var result = await _sut.ValidateAsync("");
        Assert.False(result);
    }

    [Fact]
    public async Task Validate_WithWhitespaceToken_ReturnsFalse()
    {
        var result = await _sut.ValidateAsync("   ");
        Assert.False(result);
    }
}

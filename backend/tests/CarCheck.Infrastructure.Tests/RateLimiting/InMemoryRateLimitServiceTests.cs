using CarCheck.Infrastructure.RateLimiting;

namespace CarCheck.Infrastructure.Tests.RateLimiting;

public class InMemoryRateLimitServiceTests
{
    private readonly InMemoryRateLimitService _sut = new();

    [Fact]
    public async Task Check_FirstRequest_IsAllowed()
    {
        var result = await _sut.CheckAsync("test-key", 10, TimeSpan.FromMinutes(1));

        Assert.True(result.IsAllowed);
        Assert.Equal(9, result.Remaining);
        Assert.Equal(10, result.Limit);
    }

    [Fact]
    public async Task Check_WithinLimit_IsAllowed()
    {
        for (int i = 0; i < 5; i++)
            await _sut.CheckAsync("key2", 10, TimeSpan.FromMinutes(1));

        var result = await _sut.CheckAsync("key2", 10, TimeSpan.FromMinutes(1));

        Assert.True(result.IsAllowed);
        Assert.Equal(4, result.Remaining);
    }

    [Fact]
    public async Task Check_ExceedsLimit_IsNotAllowed()
    {
        for (int i = 0; i < 10; i++)
            await _sut.CheckAsync("key3", 10, TimeSpan.FromMinutes(1));

        var result = await _sut.CheckAsync("key3", 10, TimeSpan.FromMinutes(1));

        Assert.False(result.IsAllowed);
        Assert.Equal(0, result.Remaining);
    }

    [Fact]
    public async Task Check_DifferentKeys_AreIndependent()
    {
        for (int i = 0; i < 10; i++)
            await _sut.CheckAsync("keyA", 10, TimeSpan.FromMinutes(1));

        var resultA = await _sut.CheckAsync("keyA", 10, TimeSpan.FromMinutes(1));
        var resultB = await _sut.CheckAsync("keyB", 10, TimeSpan.FromMinutes(1));

        Assert.False(resultA.IsAllowed);
        Assert.True(resultB.IsAllowed);
        Assert.Equal(9, resultB.Remaining);
    }

    [Fact]
    public async Task Check_AfterWindowExpires_Resets()
    {
        // Use a very short window
        for (int i = 0; i < 3; i++)
            await _sut.CheckAsync("key4", 3, TimeSpan.FromMilliseconds(50));

        var overLimit = await _sut.CheckAsync("key4", 3, TimeSpan.FromMilliseconds(50));
        Assert.False(overLimit.IsAllowed);

        // Wait for window to expire
        await Task.Delay(60);

        var afterReset = await _sut.CheckAsync("key4", 3, TimeSpan.FromMilliseconds(50));
        Assert.True(afterReset.IsAllowed);
        Assert.Equal(2, afterReset.Remaining);
    }

    [Fact]
    public async Task Check_ResetsAt_IsInTheFuture()
    {
        var result = await _sut.CheckAsync("key5", 10, TimeSpan.FromMinutes(5));

        Assert.True(result.ResetsAt > DateTime.UtcNow);
        Assert.True(result.ResetsAt <= DateTime.UtcNow.AddMinutes(6));
    }
}

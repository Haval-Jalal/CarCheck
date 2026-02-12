using CarCheck.Domain.ValueObjects;

namespace CarCheck.Domain.Tests.ValueObjects;

public class RegistrationNumberTests
{
    [Theory]
    [InlineData("ABC123")]
    [InlineData("AB 1234")]
    [InlineData("XY99")]
    public void Create_WithValidNumber_ShouldSucceed(string regNumber)
    {
        var result = RegistrationNumber.Create(regNumber);

        Assert.Equal(regNumber.ToUpperInvariant().Trim(), result.Value);
    }

    [Fact]
    public void Create_ShouldNormalizeToUpperCase()
    {
        var reg = RegistrationNumber.Create("abc123");

        Assert.Equal("ABC123", reg.Value);
    }

    [Fact]
    public void Create_ShouldTrimWhitespace()
    {
        var reg = RegistrationNumber.Create("  ABC123  ");

        Assert.Equal("ABC123", reg.Value);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrNull_ShouldThrow(string? regNumber)
    {
        Assert.Throws<ArgumentException>(() => RegistrationNumber.Create(regNumber!));
    }

    [Fact]
    public void Create_WithTooShort_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() => RegistrationNumber.Create("A"));
    }

    [Fact]
    public void Create_WithTooLong_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() => RegistrationNumber.Create("ABCDEFGHIJK"));
    }

    [Theory]
    [InlineData("ABC-123")]
    [InlineData("AB.123")]
    [InlineData("AB@123")]
    public void Create_WithSpecialCharacters_ShouldThrow(string regNumber)
    {
        Assert.Throws<ArgumentException>(() => RegistrationNumber.Create(regNumber));
    }

    [Fact]
    public void Equals_WithSameValue_ShouldBeTrue()
    {
        var reg1 = RegistrationNumber.Create("ABC123");
        var reg2 = RegistrationNumber.Create("ABC123");

        Assert.Equal(reg1, reg2);
        Assert.True(reg1 == reg2);
    }

    [Fact]
    public void Equals_WithDifferentCase_ShouldBeTrue()
    {
        var reg1 = RegistrationNumber.Create("abc123");
        var reg2 = RegistrationNumber.Create("ABC123");

        Assert.Equal(reg1, reg2);
    }

    [Fact]
    public void Equals_WithDifferentValue_ShouldBeFalse()
    {
        var reg1 = RegistrationNumber.Create("ABC123");
        var reg2 = RegistrationNumber.Create("XYZ789");

        Assert.NotEqual(reg1, reg2);
        Assert.True(reg1 != reg2);
    }

    [Fact]
    public void GetHashCode_WithSameValue_ShouldBeEqual()
    {
        var reg1 = RegistrationNumber.Create("ABC123");
        var reg2 = RegistrationNumber.Create("ABC123");

        Assert.Equal(reg1.GetHashCode(), reg2.GetHashCode());
    }

    [Fact]
    public void ToString_ShouldReturnValue()
    {
        var reg = RegistrationNumber.Create("ABC123");

        Assert.Equal("ABC123", reg.ToString());
    }

    [Fact]
    public void Create_WithMinLength_ShouldSucceed()
    {
        var reg = RegistrationNumber.Create("AB");

        Assert.Equal("AB", reg.Value);
    }

    [Fact]
    public void Create_WithMaxLength_ShouldSucceed()
    {
        var reg = RegistrationNumber.Create("ABCDE12345");

        Assert.Equal("ABCDE12345", reg.Value);
    }
}

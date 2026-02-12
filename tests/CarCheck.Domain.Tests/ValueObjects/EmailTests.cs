using CarCheck.Domain.ValueObjects;

namespace CarCheck.Domain.Tests.ValueObjects;

public class EmailTests
{
    [Theory]
    [InlineData("user@example.com")]
    [InlineData("test.user@domain.org")]
    [InlineData("name+tag@company.co.uk")]
    public void Create_WithValidEmail_ShouldSucceed(string email)
    {
        var result = Email.Create(email);

        Assert.Equal(email.ToLowerInvariant(), result.Value);
    }

    [Fact]
    public void Create_ShouldNormalizeToLowerCase()
    {
        var email = Email.Create("USER@DOMAIN.COM");

        Assert.Equal("user@domain.com", email.Value);
    }

    [Fact]
    public void Create_ShouldTrimWhitespace()
    {
        var email = Email.Create("  user@domain.com  ");

        Assert.Equal("user@domain.com", email.Value);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrNull_ShouldThrow(string? email)
    {
        Assert.Throws<ArgumentException>(() => Email.Create(email!));
    }

    [Theory]
    [InlineData("notanemail")]
    [InlineData("missing@tld")]
    [InlineData("@domain.com")]
    [InlineData("user@")]
    [InlineData("user @domain.com")]
    public void Create_WithInvalidFormat_ShouldThrow(string email)
    {
        Assert.Throws<ArgumentException>(() => Email.Create(email));
    }

    [Fact]
    public void Equals_WithSameValue_ShouldBeTrue()
    {
        var email1 = Email.Create("user@test.com");
        var email2 = Email.Create("user@test.com");

        Assert.Equal(email1, email2);
        Assert.True(email1 == email2);
    }

    [Fact]
    public void Equals_WithDifferentCase_ShouldBeTrue()
    {
        var email1 = Email.Create("USER@test.com");
        var email2 = Email.Create("user@TEST.com");

        Assert.Equal(email1, email2);
    }

    [Fact]
    public void Equals_WithDifferentValue_ShouldBeFalse()
    {
        var email1 = Email.Create("user1@test.com");
        var email2 = Email.Create("user2@test.com");

        Assert.NotEqual(email1, email2);
        Assert.True(email1 != email2);
    }

    [Fact]
    public void GetHashCode_WithSameValue_ShouldBeEqual()
    {
        var email1 = Email.Create("user@test.com");
        var email2 = Email.Create("user@test.com");

        Assert.Equal(email1.GetHashCode(), email2.GetHashCode());
    }

    [Fact]
    public void ToString_ShouldReturnValue()
    {
        var email = Email.Create("user@test.com");

        Assert.Equal("user@test.com", email.ToString());
    }
}

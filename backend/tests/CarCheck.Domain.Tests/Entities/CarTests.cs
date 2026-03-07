using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Tests.Entities;

public class CarTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateCar()
    {
        var car = Car.Create("ABC123", "Volvo", "XC60", 2020, 45000);

        Assert.NotEqual(Guid.Empty, car.Id);
        Assert.Equal("ABC123", car.RegistrationNumber.Value);
        Assert.Equal("Volvo", car.Brand);
        Assert.Equal("XC60", car.Model);
        Assert.Equal(2020, car.Year);
        Assert.Equal(45000, car.Mileage);
    }

    [Fact]
    public void Create_ShouldNormalizeRegistrationNumber_ToUpperCase()
    {
        var car = Car.Create("abc123", "Volvo", "V60", 2021, 30000);

        Assert.Equal("ABC123", car.RegistrationNumber.Value);
    }

    [Fact]
    public void Create_ShouldTrimRegistrationNumber()
    {
        var car = Car.Create("  ABC123  ", "Volvo", "V60", 2021, 30000);

        Assert.Equal("ABC123", car.RegistrationNumber.Value);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidRegistrationNumber_ShouldThrow(string? regNumber)
    {
        Assert.Throws<ArgumentException>(() => Car.Create(regNumber!, "Volvo", "V60", 2021, 30000));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidBrand_ShouldThrow(string? brand)
    {
        Assert.Throws<ArgumentException>(() => Car.Create("ABC123", brand!, "V60", 2021, 30000));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidModel_ShouldThrow(string? model)
    {
        Assert.Throws<ArgumentException>(() => Car.Create("ABC123", "Volvo", model!, 2021, 30000));
    }

    [Theory]
    [InlineData(1885)]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WithYearTooLow_ShouldThrow(int year)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => Car.Create("ABC123", "Volvo", "V60", year, 30000));
    }

    [Fact]
    public void Create_WithFutureYear_ShouldThrow()
    {
        var tooFarFuture = DateTime.UtcNow.Year + 2;

        Assert.Throws<ArgumentOutOfRangeException>(() => Car.Create("ABC123", "Volvo", "V60", tooFarFuture, 30000));
    }

    [Fact]
    public void Create_WithNextYear_ShouldSucceed()
    {
        var nextYear = DateTime.UtcNow.Year + 1;

        var car = Car.Create("ABC123", "Volvo", "V60", nextYear, 0);

        Assert.Equal(nextYear, car.Year);
    }

    [Fact]
    public void Create_WithNegativeMileage_ShouldThrow()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => Car.Create("ABC123", "Volvo", "V60", 2021, -1));
    }

    [Fact]
    public void Create_WithZeroMileage_ShouldSucceed()
    {
        var car = Car.Create("ABC123", "Volvo", "V60", 2021, 0);

        Assert.Equal(0, car.Mileage);
    }

    [Fact]
    public void UpdateMileage_WithValidValue_ShouldUpdate()
    {
        var car = Car.Create("ABC123", "Volvo", "V60", 2021, 30000);

        car.UpdateMileage(50000);

        Assert.Equal(50000, car.Mileage);
    }

    [Fact]
    public void UpdateMileage_WithNegativeValue_ShouldThrow()
    {
        var car = Car.Create("ABC123", "Volvo", "V60", 2021, 30000);

        Assert.Throws<ArgumentOutOfRangeException>(() => car.UpdateMileage(-1));
    }

    [Fact]
    public void UpdateMileage_WithZero_ShouldSucceed()
    {
        var car = Car.Create("ABC123", "Volvo", "V60", 2021, 30000);

        car.UpdateMileage(0);

        Assert.Equal(0, car.Mileage);
    }

    [Fact]
    public void Create_ShouldTrimBrandAndModel()
    {
        var car = Car.Create("ABC123", "  Volvo  ", "  V60  ", 2021, 30000);

        Assert.Equal("Volvo", car.Brand);
        Assert.Equal("V60", car.Model);
    }
}

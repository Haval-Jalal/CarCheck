namespace CarCheck.Application.Interfaces;

public interface ICaptchaService
{
    Task<bool> ValidateAsync(string token, CancellationToken cancellationToken = default);
}

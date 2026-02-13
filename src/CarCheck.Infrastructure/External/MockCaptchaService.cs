using CarCheck.Application.Interfaces;

namespace CarCheck.Infrastructure.External;

/// <summary>
/// Mock CAPTCHA service for development. Always validates unless token is "invalid".
/// Replace with real reCAPTCHA/hCaptcha/Turnstile integration in production.
/// </summary>
public class MockCaptchaService : ICaptchaService
{
    public Task<bool> ValidateAsync(string token, CancellationToken cancellationToken = default)
    {
        // In dev mode, accept any token except "invalid"
        var isValid = !string.IsNullOrWhiteSpace(token)
            && !token.Equals("invalid", StringComparison.OrdinalIgnoreCase);

        return Task.FromResult(isValid);
    }
}

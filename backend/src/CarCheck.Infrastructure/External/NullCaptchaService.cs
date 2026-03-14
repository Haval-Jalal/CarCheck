using CarCheck.Application.Interfaces;

namespace CarCheck.Infrastructure.External;

/// <summary>
/// CAPTCHA-validering är inaktiverad. Alla tokens godkänns.
/// Används i produktion när ingen CAPTCHA-leverantör är konfigurerad.
/// Konfigurera Captcha:SecretKey + Captcha:Provider för att aktivera riktig CAPTCHA.
/// </summary>
public class NullCaptchaService : ICaptchaService
{
    public Task<bool> ValidateAsync(string token, CancellationToken cancellationToken = default)
        => Task.FromResult(true);
}

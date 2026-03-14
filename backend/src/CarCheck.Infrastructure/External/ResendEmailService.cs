using System.Net.Http.Json;
using CarCheck.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CarCheck.Infrastructure.External;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _http;
    private readonly ILogger<ResendEmailService> _logger;
    private readonly string _frontendBaseUrl;

    // Authorization header is injected by ResendAuthHandler — no API key stored here.
    public ResendEmailService(HttpClient http, IConfiguration configuration, ILogger<ResendEmailService> logger)
    {
        _http = http;
        _logger = logger;
        _frontendBaseUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
    }

    public async Task SendPasswordResetAsync(string toEmail, string resetToken, CancellationToken cancellationToken = default)
    {
        var resetUrl = $"{_frontendBaseUrl}/reset-password?token={resetToken}";
        var payload = new
        {
            from = "CarCheck <noreply@carcheck.se>",
            to = new[] { toEmail },
            subject = "Återställ ditt lösenord",
            html = $"""
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                  <h2 style="color:#1e3a5f">Återställ ditt lösenord</h2>
                  <p>Vi fick en begäran om att återställa lösenordet för ditt CarCheck-konto.</p>
                  <p>Klicka på knappen nedan för att välja ett nytt lösenord. Länken är giltig i <strong>1 timme</strong>.</p>
                  <a href="{resetUrl}"
                     style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
                    Återställ lösenord
                  </a>
                  <p style="color:#6b7280;font-size:13px">
                    Om du inte begärde detta kan du ignorera mailet — ditt lösenord förblir oförändrat.
                  </p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                  <p style="color:#9ca3af;font-size:12px">CarCheck &mdash; Kontrollera bilen innan köpet</p>
                </div>
                """
        };

        var response = await _http.PostAsJsonAsync("emails", payload, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend API error {Status}: {Body}", response.StatusCode, body);
        }
    }

    public async Task SendEmailVerificationAsync(string toEmail, string verificationToken, CancellationToken cancellationToken = default)
    {
        var verifyUrl = $"{_frontendBaseUrl}/verify-email?token={verificationToken}";
        var payload = new
        {
            from = "CarCheck <noreply@carcheck.se>",
            to = new[] { toEmail },
            subject = "Verifiera din e-postadress — CarCheck",
            html = $"""
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111827">
                  <h2 style="color:#1e3a5f;margin-bottom:8px">Välkommen till CarCheck</h2>
                  <p style="color:#374151">Bekräfta din e-postadress för att aktivera ditt konto och börja söka på bilar.</p>
                  <p style="color:#374151">Länken är giltig i <strong>24 timmar</strong>.</p>
                  <a href="{verifyUrl}"
                     style="display:inline-block;margin:20px 0;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
                    Bekräfta e-postadress
                  </a>
                  <p style="color:#6b7280;font-size:13px">
                    Om du inte registrerade ett konto hos CarCheck kan du ignorera detta mail.
                  </p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                  <p style="color:#9ca3af;font-size:12px">CarCheck &mdash; Kontrollera bilen innan köpet</p>
                </div>
                """
        };

        var response = await _http.PostAsJsonAsync("emails", payload, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend API error {Status}: {Body}", response.StatusCode, body);
        }
    }

    public async Task SendCreditsPurchaseConfirmationAsync(string toEmail, int credits, decimal amountSek, CancellationToken cancellationToken = default)
    {
        var dashboardUrl = $"{_frontendBaseUrl}/dashboard";
        var payload = new
        {
            from = "CarCheck <noreply@carcheck.se>",
            to = new[] { toEmail },
            subject = $"Köpbekräftelse — {credits} {(credits == 1 ? "sökning" : "sökningar")}",
            html = $"""
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111827">
                  <h2 style="color:#1e3a5f;margin-bottom:8px">Tack för ditt köp!</h2>
                  <p style="color:#374151">
                    Du har köpt <strong>{credits} {(credits == 1 ? "sökning" : "sökningar")}</strong> för <strong>{amountSek:N0} kr</strong>.
                    Sökningarna är nu tillgängliga på ditt konto.
                  </p>
                  <a href="{dashboardUrl}"
                     style="display:inline-block;margin:20px 0;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
                    Sök på en bil nu
                  </a>
                  <p style="color:#6b7280;font-size:13px">
                    Har du frågor om ditt köp? Kontakta oss på <a href="mailto:support@carcheck.se" style="color:#2563eb">support@carcheck.se</a>.
                  </p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                  <p style="color:#9ca3af;font-size:12px">CarCheck &mdash; Kontrollera bilen innan köpet</p>
                </div>
                """
        };

        var response = await _http.PostAsJsonAsync("emails", payload, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend API error {Status}: {Body}", response.StatusCode, body);
        }
    }

    public async Task SendSubscriptionConfirmationAsync(string toEmail, CancellationToken cancellationToken = default)
    {
        var dashboardUrl = $"{_frontendBaseUrl}/dashboard";
        var payload = new
        {
            from = "CarCheck <noreply@carcheck.se>",
            to = new[] { toEmail },
            subject = "Välkommen till månadsplanen — CarCheck",
            html = $"""
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111827">
                  <h2 style="color:#1e3a5f;margin-bottom:8px">Din månadsplan är nu aktiv!</h2>
                  <p style="color:#374151">
                    Du har nu obegränsade bilsökningar för <strong>499 kr/månad</strong>.
                    Analysera hur många bilar du vill — utan att tänka på krediter.
                  </p>
                  <a href="{dashboardUrl}"
                     style="display:inline-block;margin:20px 0;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px">
                    Börja söka
                  </a>
                  <p style="color:#6b7280;font-size:13px">
                    Du kan avbryta din plan när som helst under Inställningar. Har du frågor? Kontakta oss på
                    <a href="mailto:support@carcheck.se" style="color:#2563eb">support@carcheck.se</a>.
                  </p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                  <p style="color:#9ca3af;font-size:12px">CarCheck &mdash; Kontrollera bilen innan köpet</p>
                </div>
                """
        };

        var response = await _http.PostAsJsonAsync("emails", payload, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend API error {Status}: {Body}", response.StatusCode, body);
        }
    }
}

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

    private const string FromAddress  = "CarCheck <noreply@carcheck.se>";
    private const string ReplyTo      = "support@carcheck.se";

    public ResendEmailService(HttpClient http, IConfiguration configuration, ILogger<ResendEmailService> logger)
    {
        _http = http;
        _logger = logger;
        _frontendBaseUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
    }

    // ── Shared template helpers ──────────────────────────────────────────────

    /// <summary>
    /// Wraps body HTML in a full, spam-filter-friendly email document.
    /// Includes hidden preheader, proper DOCTYPE and charset meta.
    /// </summary>
    private static string BuildHtml(string preheader, string bodyHtml) => $"""
        <!DOCTYPE html>
        <html lang="sv">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1.0" />
          <title>CarCheck</title>
        </head>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
          <!-- Preheader: shown in inbox preview next to subject -->
          <span style="display:none;max-height:0;overflow:hidden;mso-hide:all">{preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</span>

          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td align="center" style="padding:40px 16px">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                       style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">

                  <!-- Header bar -->
                  <tr>
                    <td style="background:#1e3a5f;padding:20px 36px">
                      <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px">CarCheck</span>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 36px 24px">
                      {bodyHtml}
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 36px 28px;border-top:1px solid #f3f4f6">
                      <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
                        CarCheck &mdash; Kontrollera bilen innan köpet<br/>
                        Du får detta mail eftersom du har ett konto hos CarCheck.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

    private static string PrimaryButton(string url, string label) =>
        $"""<a href="{url}" style="display:inline-block;margin:20px 0 8px;padding:13px 28px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;line-height:1">{label}</a>""";

    private static string Muted(string html) =>
        $"""<p style="margin:16px 0 0;color:#6b7280;font-size:13px;line-height:1.6">{html}</p>""";

    // ── Password reset ───────────────────────────────────────────────────────

    public async Task SendPasswordResetAsync(string toEmail, string resetToken, CancellationToken cancellationToken = default)
    {
        var resetUrl = $"{_frontendBaseUrl}/reset-password?token={resetToken}";

        var bodyHtml = $"""
            <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:700">Återställ ditt lösenord</h2>
            <p style="margin:0 0 4px;color:#374151;font-size:15px;line-height:1.6">
              Vi fick en begäran om att återställa lösenordet för ditt CarCheck-konto.
              Klicka på knappen nedan — länken är giltig i <strong>1 timme</strong>.
            </p>
            {PrimaryButton(resetUrl, "Återställ lösenord")}
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">
              Eller klistra in länken i din webbläsare:<br/>
              <span style="color:#6b7280;word-break:break-all">{resetUrl}</span>
            </p>
            {Muted("Om du inte begärde detta kan du ignorera mailet — ditt lösenord förblir oförändrat.")}
            """;

        var text = $"""
            Återställ ditt lösenord — CarCheck

            Vi fick en begäran om att återställa lösenordet för ditt CarCheck-konto.
            Länken är giltig i 1 timme.

            {resetUrl}

            Om du inte begärde detta kan du ignorera mailet.

            CarCheck — Kontrollera bilen innan köpet
            """;

        await SendAsync(
            to: toEmail,
            subject: "Återställ ditt lösenord — CarCheck",
            preheader: "Klicka för att välja ett nytt lösenord. Länken är giltig i 1 timme.",
            bodyHtml: bodyHtml,
            text: text,
            cancellationToken: cancellationToken);
    }

    // ── Email verification ───────────────────────────────────────────────────

    public async Task SendEmailVerificationAsync(string toEmail, string verificationToken, CancellationToken cancellationToken = default)
    {
        var verifyUrl = $"{_frontendBaseUrl}/verify-email?token={verificationToken}";

        var bodyHtml = $"""
            <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:700">Välkommen till CarCheck!</h2>
            <p style="margin:0;color:#374151;font-size:15px;line-height:1.6">
              Bekräfta din e-postadress för att aktivera ditt konto och börja analysera bilar.
              Länken är giltig i <strong>24 timmar</strong>.
            </p>
            {PrimaryButton(verifyUrl, "Bekräfta e-postadress")}
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">
              Eller klistra in länken i din webbläsare:<br/>
              <span style="color:#6b7280;word-break:break-all">{verifyUrl}</span>
            </p>
            {Muted("Om du inte registrerade ett konto hos CarCheck kan du ignorera detta mail.")}
            """;

        var text = $"""
            Välkommen till CarCheck!

            Bekräfta din e-postadress för att aktivera ditt konto.
            Länken är giltig i 24 timmar.

            {verifyUrl}

            Om du inte registrerade ett konto kan du ignorera detta mail.

            CarCheck — Kontrollera bilen innan köpet
            """;

        await SendAsync(
            to: toEmail,
            subject: "Bekräfta din e-postadress — CarCheck",
            preheader: "Ett steg kvar — bekräfta din e-postadress för att aktivera ditt konto.",
            bodyHtml: bodyHtml,
            text: text,
            cancellationToken: cancellationToken);
    }

    // ── Credits purchase confirmation ────────────────────────────────────────

    public async Task SendCreditsPurchaseConfirmationAsync(string toEmail, int credits, decimal amountSek, CancellationToken cancellationToken = default)
    {
        var dashboardUrl = $"{_frontendBaseUrl}/dashboard";
        var unit = credits == 1 ? "sökning" : "sökningar";

        var bodyHtml = $"""
            <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:700">Tack för ditt köp!</h2>
            <p style="margin:0;color:#374151;font-size:15px;line-height:1.6">
              Du har köpt <strong>{credits} {unit}</strong> för <strong>{amountSek:N0} kr</strong>.
              Sökningarna är nu tillgängliga på ditt konto.
            </p>
            {PrimaryButton(dashboardUrl, "Sök på en bil nu")}
            {Muted($"Frågor om ditt köp? Kontakta oss på <a href=\"mailto:support@carcheck.se\" style=\"color:#2563eb;text-decoration:none\">support@carcheck.se</a>.")}
            """;

        var text = $"""
            Tack för ditt köp — CarCheck

            Du har köpt {credits} {unit} för {amountSek:N0} kr.
            Sökningarna är nu tillgängliga på ditt konto.

            {dashboardUrl}

            Frågor? Kontakta oss på support@carcheck.se

            CarCheck — Kontrollera bilen innan köpet
            """;

        await SendAsync(
            to: toEmail,
            subject: $"Köpbekräftelse — {credits} {unit}",
            preheader: $"{credits} {unit} har lagts till på ditt CarCheck-konto.",
            bodyHtml: bodyHtml,
            text: text,
            cancellationToken: cancellationToken);
    }

    // ── Subscription confirmation ────────────────────────────────────────────

    public async Task SendSubscriptionConfirmationAsync(string toEmail, CancellationToken cancellationToken = default)
    {
        var dashboardUrl = $"{_frontendBaseUrl}/dashboard";

        var bodyHtml = $"""
            <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:700">Din månadsplan är aktiv!</h2>
            <p style="margin:0;color:#374151;font-size:15px;line-height:1.6">
              Du har nu <strong>obegränsade bilsökningar</strong> för 499 kr/månad.
              Analysera hur många bilar du vill — utan att tänka på krediter.
            </p>
            {PrimaryButton(dashboardUrl, "Börja söka")}
            {Muted($"Du kan avbryta din plan när som helst under Inställningar. Frågor? " +
                   $"<a href=\"mailto:support@carcheck.se\" style=\"color:#2563eb;text-decoration:none\">support@carcheck.se</a>.")}
            """;

        var text = $"""
            Din månadsplan är aktiv — CarCheck

            Du har nu obegränsade bilsökningar för 499 kr/månad.
            Analysera hur många bilar du vill utan att tänka på krediter.

            {dashboardUrl}

            Du kan avbryta din plan när som helst under Inställningar.
            Frågor? Kontakta oss på support@carcheck.se

            CarCheck — Kontrollera bilen innan köpet
            """;

        await SendAsync(
            to: toEmail,
            subject: "Din månadsplan är nu aktiv — CarCheck",
            preheader: "Obegränsade bilsökningar är nu aktiverade på ditt konto.",
            bodyHtml: bodyHtml,
            text: text,
            cancellationToken: cancellationToken);
    }

    // ── Internal send ────────────────────────────────────────────────────────

    private async Task SendAsync(
        string to,
        string subject,
        string preheader,
        string bodyHtml,
        string text,
        CancellationToken cancellationToken)
    {
        var payload = new
        {
            from     = FromAddress,
            reply_to = ReplyTo,
            to       = new[] { to },
            subject,
            html     = BuildHtml(preheader, bodyHtml),
            text,
        };

        var response = await _http.PostAsJsonAsync("emails", payload, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend API error {Status}: {Body}", response.StatusCode, body);
        }
    }
}

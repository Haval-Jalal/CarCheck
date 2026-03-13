using System.Net.Http.Headers;
using Microsoft.Extensions.Configuration;

namespace CarCheck.Infrastructure.External;

/// <summary>
/// DelegatingHandler that attaches the Resend API key to every outbound request.
/// Keeping the credential out of DefaultRequestHeaders avoids accidental mutation.
/// </summary>
public class ResendAuthHandler : DelegatingHandler
{
    private readonly string _apiKey;

    public ResendAuthHandler(IConfiguration configuration)
    {
        _apiKey = configuration["Resend:ApiKey"]
            ?? throw new InvalidOperationException("Resend:ApiKey is not configured.");
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        return base.SendAsync(request, cancellationToken);
    }
}

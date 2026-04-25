using CarCheck.Domain.Enums;

namespace CarCheck.Application.Interfaces;

public record FleetAlertItem(string RegistrationNumber, string? Nickname, decimal Score, string Status);

public interface IEmailService
{
    Task SendPasswordResetAsync(string toEmail, string resetToken, CancellationToken cancellationToken = default);
    Task SendEmailVerificationAsync(string toEmail, string verificationToken, CancellationToken cancellationToken = default);
    Task SendCreditsPurchaseConfirmationAsync(string toEmail, int credits, decimal amountSek, CancellationToken cancellationToken = default);
    Task SendSubscriptionConfirmationAsync(string toEmail, CancellationToken cancellationToken = default);
    Task SendCompanyInviteAsync(string toEmail, string companyName, string token, CompanyMemberRole role, CancellationToken cancellationToken = default);
    Task SendFleetAlertAsync(string toEmail, string companyName, IReadOnlyList<FleetAlertItem> alerts, CancellationToken cancellationToken = default);
}

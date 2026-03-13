namespace CarCheck.Application.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetAsync(string toEmail, string resetToken, CancellationToken cancellationToken = default);
    Task SendEmailVerificationAsync(string toEmail, string verificationToken, CancellationToken cancellationToken = default);
    Task SendCreditsPurchaseConfirmationAsync(string toEmail, int credits, decimal amountSek, CancellationToken cancellationToken = default);
    Task SendSubscriptionConfirmationAsync(string toEmail, CancellationToken cancellationToken = default);
}

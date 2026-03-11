namespace CarCheck.Application.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetAsync(string toEmail, string resetToken, CancellationToken cancellationToken = default);
    Task SendEmailVerificationAsync(string toEmail, string verificationToken, CancellationToken cancellationToken = default);
}

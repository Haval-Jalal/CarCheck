namespace CarCheck.Application.Auth.DTOs;

public record RegisterRequest(string Email, string Password);

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record PasswordResetRequest(string Email);

public record PasswordResetConfirmRequest(string Token, string NewPassword);

public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAt);

public record UserResponse(Guid Id, string Email, bool EmailVerified, bool TwoFactorEnabled);

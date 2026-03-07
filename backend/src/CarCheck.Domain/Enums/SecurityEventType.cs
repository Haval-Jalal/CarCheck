namespace CarCheck.Domain.Enums;

public enum SecurityEventType
{
    Login,
    LoginFailed,
    Logout,
    PasswordChanged,
    PasswordResetRequested,
    PasswordResetCompleted,
    EmailVerified,
    TwoFactorEnabled,
    TwoFactorDisabled,
    AccountLocked
}

# CarCheck — UML Domain Model

## Class Diagram

```
┌─────────────────────────────┐
│           User              │
├─────────────────────────────┤
│ - Id: Guid                  │
│ - Email: string             │
│ - PasswordHash: string      │
│ - EmailVerified: bool       │
│ - TwoFactorEnabled: bool    │
│ - CreatedAt: DateTime       │
├─────────────────────────────┤
│ + Create(email, hash): User │
│ + VerifyEmail(): void       │
│ + EnableTwoFactor(): void   │
│ + DisableTwoFactor(): void  │
│ + ChangePassword(hash): void│
└─────────────────────────────┘

┌─────────────────────────────────┐
│              Car                │
├─────────────────────────────────┤
│ - Id: Guid                      │
│ - RegistrationNumber: string    │
│ - Brand: string                 │
│ - Model: string                 │
│ - Year: int                     │
│ - Mileage: int                  │
├─────────────────────────────────┤
│ + Create(...): Car              │
│ + UpdateMileage(mileage): void  │
└─────────────────────────────────┘

┌─────────────────────────────────────┐
│         AnalysisResult              │
├─────────────────────────────────────┤
│ - Id: Guid                          │
│ - CarId: Guid                       │
│ - Score: decimal                    │
│ - Recommendation: string            │
│ - CreatedAt: DateTime               │
├─────────────────────────────────────┤
│ + Create(carId, score, rec): Result │
└─────────────────────────────────────┘

┌───────────────────────────────────────┐
│          SearchHistory                │
├───────────────────────────────────────┤
│ - Id: Guid                            │
│ - UserId: Guid                        │
│ - CarId: Guid                         │
│ - SearchedAt: DateTime                │
├───────────────────────────────────────┤
│ + Create(userId, carId): SearchHistory│
└───────────────────────────────────────┘

┌─────────────────────────────────┐
│          Favorite               │
├─────────────────────────────────┤
│ - Id: Guid                      │
│ - UserId: Guid                  │
│ - CarId: Guid                   │
│ - CreatedAt: DateTime           │
├─────────────────────────────────┤
│ + Create(userId, carId): Fav    │
└─────────────────────────────────┘

┌──────────────────────────────────────┐
│         PasswordReset                │
├──────────────────────────────────────┤
│ - Id: Guid                           │
│ - UserId: Guid                       │
│ - Token: string                      │
│ - ExpiresAt: DateTime                │
│ - Used: bool                         │
├──────────────────────────────────────┤
│ + Create(userId, expiration): Reset  │
│ + IsExpired(): bool                  │
│ + MarkUsed(): void                   │
└──────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          SecurityEvent                  │
├─────────────────────────────────────────┤
│ - Id: Guid                              │
│ - UserId: Guid                          │
│ - Type: string                          │
│ - Metadata: string?                     │
│ - CreatedAt: DateTime                   │
├─────────────────────────────────────────┤
│ + Create(userId, type, meta): Event     │
└─────────────────────────────────────────┘
```

## Relationships

- User 1──* SearchHistory
- User 1──* Favorite
- User 1──* PasswordReset
- User 1──* SecurityEvent
- Car 1──* SearchHistory
- Car 1──* Favorite
- Car 1──* AnalysisResult

# CarCheck — Agent Session Log

## Session #1 — 2026-02-12

### State: Phase 0 — Repository Initialization

**Status:** COMPLETE

### Tasks Performed

#### 1. Repository Created
- **Timestamp:** 2026-02-12T17:15:00Z
- **Action:** Created public GitHub repo `Haval-Jalal/CarCheck` with VisualStudio .gitignore
- **URL:** https://github.com/Haval-Jalal/CarCheck

#### 2. Solution Structure Created
- **Timestamp:** 2026-02-12T17:18:00Z
- **Action:** Created .NET 9 Clean Architecture solution
- **Projects created:**
  - `src/CarCheck.Domain` — Domain layer (entities, interfaces, enums)
  - `src/CarCheck.Application` — Application layer (use cases, DTOs, services)
  - `src/CarCheck.Infrastructure` — Infrastructure layer (DB, caching, external services)
  - `src/CarCheck.API` — API layer (REST endpoints, middleware)
  - `tests/CarCheck.Domain.Tests` — Domain unit tests
  - `tests/CarCheck.Application.Tests` — Application unit tests
  - `tests/CarCheck.Infrastructure.Tests` — Infrastructure integration tests
  - `tests/CarCheck.API.Tests` — API integration tests
- **References:**
  - Application → Domain
  - Infrastructure → Application
  - API → Application + Infrastructure
  - Each test project → corresponding source project

#### 3. Domain Entities Implemented
- **Timestamp:** 2026-02-12T17:20:00Z
- **Files created:**
  - `src/CarCheck.Domain/Entities/User.cs`
  - `src/CarCheck.Domain/Entities/Car.cs`
  - `src/CarCheck.Domain/Entities/AnalysisResult.cs`
  - `src/CarCheck.Domain/Entities/SearchHistory.cs`
  - `src/CarCheck.Domain/Entities/Favorite.cs`
  - `src/CarCheck.Domain/Entities/PasswordReset.cs`
  - `src/CarCheck.Domain/Entities/SecurityEvent.cs`
  - `src/CarCheck.Domain/Enums/SecurityEventType.cs`
- **Pattern:** Private constructors + static factory methods with validation

#### 4. Repository Interfaces Defined
- **Timestamp:** 2026-02-12T17:21:00Z
- **Files created:**
  - `src/CarCheck.Domain/Interfaces/IUserRepository.cs`
  - `src/CarCheck.Domain/Interfaces/ICarRepository.cs`
  - `src/CarCheck.Domain/Interfaces/IAnalysisResultRepository.cs`
  - `src/CarCheck.Domain/Interfaces/ISearchHistoryRepository.cs`
  - `src/CarCheck.Domain/Interfaces/IFavoriteRepository.cs`
- **Pattern:** Async with CancellationToken, pagination support

#### 5. Database Migration Created
- **Timestamp:** 2026-02-12T17:22:00Z
- **File:** `db/migrations/001_initial_schema.sql`
- **Tables:** users, cars, analysis_results, search_history, favorites, password_resets, security_events
- **Indexes:** email, registration_number, user_id FKs, timestamps
- **Reversible:** Yes (DOWN section included)

#### 6. Documentation Skeleton Created
- **Timestamp:** 2026-02-12T17:22:00Z
- **Files:**
  - `docs/architecture.md`
  - `docs/er-diagram.md`
  - `docs/uml-diagram.md`
  - `docs/requirements.md`
  - `docs/deployment.md`
  - `docs/runbook.md`
  - `docs/agent-session.md` (this file)

#### 7. CI/CD Pipeline Created
- **File:** `.github/workflows/ci.yml`
- **Triggers:** PR to main, push to main
- **Steps:** checkout → setup .NET 9 → restore → build → test

#### 8. Environment Configuration
- **File:** `.env.example`
- **Contains:** DB, JWT, Redis, rate limiting, CAPTCHA, SMTP, environment

### Architectural Decisions
1. **.NET 9** as runtime — latest LTS-adjacent, best performance
2. **Clean Architecture** with strict dependency inversion
3. **Private constructors + factory methods** on domain entities for invariant enforcement
4. **Supabase PostgreSQL** as primary database
5. **UUID primary keys** across all entities
6. **Versioned raw SQL migrations** (not EF Core migrations) for full control

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 4/4 passing (boilerplate tests)

### Next Steps
1. **Phase 0 completion:** Create GitHub project board (requires `gh auth refresh -s project,read:project`)
2. ~~**Phase 1:** Implement domain unit tests for all entities~~ ✅
3. ~~**Phase 1:** Add value objects (Email, RegistrationNumber)~~ ✅
4. **Phase 2:** Set up EF Core / Dapper in Infrastructure layer
5. **Phase 2:** Connect to Supabase

---

## Session #2 — 2026-02-12

### State: Phase 1 — Domain Layer + Unit Tests

**Status:** COMPLETE

### Tasks Performed

#### 1. Domain Unit Tests (76 → 117 tests)
- **Timestamp:** 2026-02-12T17:35:00Z
- **Action:** Created comprehensive unit tests for all 7 domain entities
- **Files created:**
  - `tests/CarCheck.Domain.Tests/Entities/UserTests.cs` (13 tests)
  - `tests/CarCheck.Domain.Tests/Entities/CarTests.cs` (16 tests)
  - `tests/CarCheck.Domain.Tests/Entities/AnalysisResultTests.cs` (8 tests)
  - `tests/CarCheck.Domain.Tests/Entities/SearchHistoryTests.cs` (4 tests)
  - `tests/CarCheck.Domain.Tests/Entities/FavoriteTests.cs` (4 tests)
  - `tests/CarCheck.Domain.Tests/Entities/PasswordResetTests.cs` (8 tests)
  - `tests/CarCheck.Domain.Tests/Entities/SecurityEventTests.cs` (6 tests)
- **Coverage:** Creation, validation, edge cases, domain methods, equality

#### 2. Value Objects Created
- **Timestamp:** 2026-02-12T17:38:00Z
- **Files created:**
  - `src/CarCheck.Domain/ValueObjects/Email.cs` — regex validated, normalized, IEquatable
  - `src/CarCheck.Domain/ValueObjects/RegistrationNumber.cs` — alphanumeric, 2-10 chars, IEquatable
- **Files modified:**
  - `src/CarCheck.Domain/Entities/User.cs` — Email property now `Email` value object
  - `src/CarCheck.Domain/Entities/Car.cs` — RegistrationNumber property now `RegistrationNumber` value object
  - `src/CarCheck.Domain/Interfaces/IUserRepository.cs` — uses `Email` value object
  - `src/CarCheck.Domain/Interfaces/ICarRepository.cs` — uses `RegistrationNumber` value object
- **Tests created:**
  - `tests/CarCheck.Domain.Tests/ValueObjects/EmailTests.cs` (11 tests)
  - `tests/CarCheck.Domain.Tests/ValueObjects/RegistrationNumberTests.cs` (14 tests)

### Architectural Decisions
1. **Value objects use `sealed partial class`** with source-generated regex for performance
2. **IEquatable<T>** implemented for proper equality semantics in collections/LINQ
3. **Operator overloads (==, !=)** for natural comparison syntax

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 117/117 passing

### Next Steps
1. ~~**Phase 2:** Set up EF Core in Infrastructure layer with Supabase PostgreSQL~~ ✅
2. ~~**Phase 2:** Implement repository concrete classes~~ ✅
3. **Phase 2:** Create database migration tooling
4. **Phase 3:** Authentication (JWT + refresh tokens + 2FA)

---

## Session #3 — 2026-02-12

### State: Phase 2 — Database + Infrastructure Layer

**Status:** COMPLETE

### Tasks Performed

#### 1. EF Core + Npgsql Setup
- **Timestamp:** 2026-02-12T17:45:00Z
- **Packages installed:**
  - `Npgsql.EntityFrameworkCore.PostgreSQL 9.0.4` → Infrastructure
  - `Microsoft.EntityFrameworkCore.Design 9.0.13` → API
- **Note:** v10.0 requires .NET 10; pinned to 9.x for .NET 9 compatibility

#### 2. DbContext Created
- **File:** `src/CarCheck.Infrastructure/Persistence/CarCheckDbContext.cs`
- **DbSets:** Users, Cars, AnalysisResults, SearchHistories, Favorites, PasswordResets, SecurityEvents
- **Pattern:** `ApplyConfigurationsFromAssembly` for auto-discovery

#### 3. Entity Configurations (7 files)
- **Path:** `src/CarCheck.Infrastructure/Persistence/Configurations/`
- **Files:** UserConfiguration, CarConfiguration, AnalysisResultConfiguration, SearchHistoryConfiguration, FavoriteConfiguration, PasswordResetConfiguration, SecurityEventConfiguration
- **Features:**
  - Snake_case table/column names matching SQL migration
  - Value object conversions (Email ↔ string, RegistrationNumber ↔ string)
  - Indexes, unique constraints, default values
  - JSONB type for SecurityEvent.Metadata

#### 4. Repository Implementations (5 files)
- **Path:** `src/CarCheck.Infrastructure/Persistence/Repositories/`
- **Files:** UserRepository, CarRepository, AnalysisResultRepository, SearchHistoryRepository, FavoriteRepository
- **Pattern:** Scoped lifetime, async/await, CancellationToken support, pagination

#### 5. DI Registration
- **File:** `src/CarCheck.Infrastructure/DependencyInjection.cs`
- **Method:** `AddInfrastructure(IConfiguration)` extension method
- **Registers:** DbContext + all 5 repositories

#### 6. API Configuration Updated
- **File:** `src/CarCheck.API/Program.cs` — cleaned up, added health endpoint, wired DI
- **File:** `src/CarCheck.API/appsettings.json` — added ConnectionStrings section
- **File:** `src/CarCheck.API/appsettings.Development.json` — local dev connection string

### Architectural Decisions
1. **EF Core 9.0.x** (not 10.0 which requires .NET 10)
2. **Fluent API configurations** in separate IEntityTypeConfiguration classes
3. **Value object conversions** via HasConversion in EF config
4. **Repository per aggregate** with scoped lifetime
5. **Connection string from IConfiguration** — supports env-specific overrides and secrets

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 120 passing (117 domain + 3 boilerplate)

### Next Steps
1. ~~**Phase 3:** Implement authentication~~ ✅
2. ~~**Phase 3:** Add BCrypt password hashing service~~ ✅
3. ~~**Phase 3:** Auth endpoints~~ ✅
4. ~~**Phase 3:** Security event logging~~ ✅

---

## Session #4 — 2026-02-12

### State: Phase 3 — Authentication System

**Status:** COMPLETE

### Tasks Performed

#### 1. Application Layer Auth Interfaces
- `IPasswordHasher` — hash/verify abstraction
- `ITokenService` — JWT access + refresh token generation/validation
- `IRefreshTokenRepository` — refresh token CRUD + revocation
- `ISecurityEventLogger` — audit logging abstraction
- `AuthDTOs` — Register, Login, Refresh, ChangePassword, PasswordReset request/response records
- `AuthService` — orchestrates register, login, refresh, logout, logout-all, change-password
- `Result<T>` — generic result type for error handling

#### 2. Infrastructure Auth Implementations
- `BcryptPasswordHasher` — BCrypt.Net-Next with work factor 12
- `JwtSettings` — options pattern for JWT configuration
- `JwtTokenService` — HMAC-SHA256 JWT generation with claims (sub, email, jti, email_verified, 2fa)
- `SecurityEventLogger` — persists to security_events table
- `RefreshTokenRepository` — EF Core-based refresh token storage

#### 3. Database Changes
- `RefreshTokenEntry` added to DbContext
- `RefreshTokenConfiguration` with snake_case mapping
- `002_refresh_tokens.sql` migration

#### 4. API Layer
- JWT Bearer authentication middleware configured
- Auth endpoints: POST register, login, refresh, logout, logout-all, change-password
- Minimal API with route groups under `/api/auth`

#### 5. Tests (15 new)
- Register: valid, duplicate email, short password
- Login: valid credentials, wrong password, non-existent email
- Refresh: valid rotation, revoked token, expired token
- Logout: single session, all sessions
- Change password: valid, wrong current, short new, non-existent user
- Using NSubstitute for mocking

### Architectural Decisions
1. **BCrypt work factor 12** — balances security and performance
2. **JWT HMAC-SHA256** with short-lived access tokens (15 min)
3. **Refresh token rotation** — old token revoked on each refresh
4. **Password change invalidates all sessions** — security best practice
5. **Result<T> pattern** — avoids exceptions for business logic errors
6. **NSubstitute** for test mocking — clean, readable test code

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 134 passing (117 domain + 15 auth + 2 boilerplate)

### Next Steps
1. ~~**Phase 4:** Car search + analysis + caching~~ ✅
2. **Phase 5:** Search history + favorites endpoints
3. **Phase 6:** Rate limiting + CAPTCHA

---

## Session #5 — 2026-02-12

### State: Phase 4 — Car Search & Analysis

**Status:** COMPLETE

### Tasks Performed

#### 1. Car Data Provider Abstraction
- **File:** `src/CarCheck.Application/Interfaces/ICarDataProvider.cs`
- **Record:** `CarDataResult` — 13 fields covering vehicle specs, insurance, recalls, inspection, market value
- **Pattern:** Async with CancellationToken, nullable fields for unknown data

#### 2. Cache Service Abstraction
- **File:** `src/CarCheck.Application/Interfaces/ICacheService.cs`
- **Methods:** GetAsync, SetAsync, RemoveAsync — generic, Redis-ready
- **Implementation:** `InMemoryCacheService` using `IMemoryCache` (JSON serialization)

#### 3. Car Analysis Engine
- **File:** `src/CarCheck.Application/Cars/CarAnalysisEngine.cs`
- **Scoring categories:** Age (25%), Mileage (25%), Insurance (20%), Recalls (15%), Inspection (15%)
- **Score range:** 0-100 with clamping
- **Recommendations:** 5 tiers (Excellent/Good/Fair/Below Average/Poor)
- **Mileage:** Scored against Swedish average (~12,000 km/year)
- **Null handling:** Unknown data gets neutral scores

#### 4. Car Search Service
- **File:** `src/CarCheck.Application/Cars/CarSearchService.cs`
- **Search flow:** Cache → DB → External Provider → Persist + Cache
- **Analysis flow:** Cache → Recent DB result (<24h) → Fresh provider fetch → Engine → Persist + Cache
- **Search history:** Automatically recorded on every search
- **Cache TTL:** 1 hour

#### 5. DTOs
- **File:** `src/CarCheck.Application/Cars/DTOs/CarDTOs.cs`
- **Records:** CarSearchRequest, CarSearchResponse, CarAnalysisResponse, AnalysisBreakdown

#### 6. Mock Car Data Provider
- **File:** `src/CarCheck.Infrastructure/External/MockCarDataProvider.cs`
- **5 mock vehicles:** Volvo XC60 (excellent), BMW 320d (good), Toyota Corolla (fair), Tesla Model 3 (new), VW Golf (poor)
- **Purpose:** Development/testing — swap with real API (Transportstyrelsen/Biluppgifter) for production

#### 7. In-Memory Cache Service
- **File:** `src/CarCheck.Infrastructure/Caching/InMemoryCacheService.cs`
- **Pattern:** JSON serialization to IMemoryCache — swappable with Redis later

#### 8. API Endpoints
- **File:** `src/CarCheck.API/Endpoints/CarEndpoints.cs`
- **Routes:**
  - `POST /api/cars/search` — Search by registration number (authenticated)
  - `GET /api/cars/{carId}/analysis` — Run analysis on a car (authenticated)

#### 9. DI Registration Updated
- **File:** `src/CarCheck.Infrastructure/DependencyInjection.cs`
- **Added:** ICacheService, ICarDataProvider, CarAnalysisEngine, CarSearchService, MemoryCache

#### 10. Unit Tests (45 new)
- **CarAnalysisEngineTests.cs** (21 tests): Age/mileage/insurance/recall/inspection scoring, full analysis
- **CarSearchServiceTests.cs** (10 tests): Cache hit, DB hit, provider fetch, not found, analysis flow
- **Total:** 179 tests passing (117 domain + 60 application + 2 boilerplate)

### Architectural Decisions
1. **Strategy pattern** for ICarDataProvider — swap mock for real API without code changes
2. **Multi-tier caching** — IMemoryCache now, Redis later via ICacheService swap
3. **Weighted scoring model** — 5 categories with Swedish market-calibrated benchmarks
4. **Null-safe analysis** — unknown data gets neutral scores rather than penalties
5. **InternalsVisibleTo** — exposes internal scoring methods to test project

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 179 passing (117 domain + 60 application + 2 boilerplate)

### Next Steps
1. ~~**Phase 5:** Search history + favorites endpoints~~ ✅
2. **Phase 6:** Rate limiting + CAPTCHA
3. **Phase 7:** Email verification + password reset

---

## Session #6 — 2026-02-12

### State: Phase 5 — Search History & Favorites

**Status:** COMPLETE

### Tasks Performed

#### 1. Search History Service
- **File:** `src/CarCheck.Application/History/SearchHistoryService.cs`
- **Features:** Paginated history with car details enrichment, today's search count, page/size clamping (1-100)

#### 2. Favorite Service
- **File:** `src/CarCheck.Application/Favorites/FavoriteService.cs`
- **Features:** Add/remove/list favorites with car detail enrichment, duplicate prevention, existence checks

#### 3. DTOs
- **Files:** `History/DTOs/HistoryDTOs.cs`, `Favorites/DTOs/FavoriteDTOs.cs`
- **Records:** SearchHistoryResponse, SearchHistoryPageResponse, FavoriteResponse, FavoritePageResponse, AddFavoriteRequest

#### 4. API Endpoints
- **`GET /api/history`** — Paginated search history (auth required)
- **`GET /api/favorites`** — Paginated favorites list (auth required)
- **`POST /api/favorites`** — Add car to favorites (auth required)
- **`DELETE /api/favorites/{carId}`** — Remove from favorites (auth required)

#### 5. Unit Tests (11 new)
- **SearchHistoryServiceTests** (4 tests): Paged results, deleted car handling, empty results, page clamping
- **FavoriteServiceTests** (7 tests): List, add (valid/not found/duplicate), remove (exists/not found), empty

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 190 passing (117 domain + 71 application + 2 boilerplate)

### Next Steps
1. ~~**Phase 6:** Rate limiting + CAPTCHA~~ ✅
2. **Phase 7:** Email verification + password reset
3. **Phase 8:** CI/CD & staging deploy

---

## Session #7 — 2026-02-12

### State: Phase 6 — Rate Limiting & CAPTCHA

**Status:** COMPLETE

### Tasks Performed

#### 1. Rate Limiting Service
- **Interface:** `src/CarCheck.Application/Interfaces/IRateLimitService.cs`
- **Implementation:** `src/CarCheck.Infrastructure/RateLimiting/InMemoryRateLimitService.cs`
- **Pattern:** ConcurrentDictionary with sliding window, returns remaining/limit/resetsAt

#### 2. Rate Limiting Middleware
- **File:** `src/CarCheck.API/Middleware/RateLimitingMiddleware.cs`
- **Limit:** 30 requests/minute per user (or IP for anonymous)
- **Headers:** X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- **Response:** 429 with Retry-After header when exceeded

#### 3. Daily Quota Middleware
- **File:** `src/CarCheck.API/Middleware/DailyQuotaMiddleware.cs`
- **Limit:** 5 free car searches per day
- **Scope:** Only applies to `POST /api/cars/search`
- **Headers:** X-DailyQuota-Limit, X-DailyQuota-Remaining
- **Response:** 429 with resetsAt (midnight UTC)

#### 4. CAPTCHA Service
- **Interface:** `src/CarCheck.Application/Interfaces/ICaptchaService.cs`
- **Mock:** `src/CarCheck.Infrastructure/External/MockCaptchaService.cs`
- **Integration:** Car search endpoint validates CAPTCHA token if provided

#### 5. Unit Tests (10 new)
- **InMemoryRateLimitServiceTests** (6 tests): First request, within limit, exceeds limit, independent keys, window reset, resetsAt
- **MockCaptchaServiceTests** (4 tests): Valid token, invalid, empty, whitespace

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 200 passing (117 domain + 71 application + 11 infrastructure + 1 API boilerplate)

### Next Steps
1. ~~**Phase 7:** Paid provider abstraction & billing hooks~~ ✅
2. **Phase 8:** CI/CD & staging deploy
3. **Phase 9:** Production readiness

---

## Session #8 — 2026-02-12

### State: Phase 7 — Paid Provider Abstraction & Billing

**Status:** COMPLETE

### Tasks Performed

#### 1. Subscription Entity & Enum
- **Files:** `Domain/Entities/Subscription.cs`, `Domain/Enums/SubscriptionTier.cs`
- **Tiers:** Free, Pro, Premium
- **Methods:** Create, Cancel, Upgrade, Downgrade, HasExpired

#### 2. Tier Configuration
- **File:** `Application/Billing/TierConfiguration.cs`
- **Free:** 5/day, 50/month, no analysis, 0 SEK
- **Pro:** 50/day, 500/month, analysis included, 99 SEK/month
- **Premium:** Unlimited, analysis included, 249 SEK/month

#### 3. Billing Provider Abstraction
- **Interface:** `Application/Interfaces/IBillingProvider.cs`
- **Methods:** CreateCheckoutSession, CancelSubscription, GetSubscriptionStatus
- **Mock:** `Infrastructure/External/MockBillingProvider.cs`

#### 4. Subscription Service
- **File:** `Application/Billing/SubscriptionService.cs`
- **Features:** Get current subscription, create checkout, activate, cancel
- **Security:** Event logging on all subscription actions

#### 5. API Endpoints
- `GET /api/billing/tiers` — List all tiers (public)
- `GET /api/billing/subscription` — Get current subscription (auth)
- `POST /api/billing/checkout` — Create checkout session (auth)
- `POST /api/billing/cancel` — Cancel subscription (auth)

#### 6. Daily Quota Upgraded
- DailyQuotaMiddleware now reads user's subscription tier from DB
- Quota limits are tier-aware (5/50/unlimited daily searches)
- X-Subscription-Tier header added to responses

#### 7. Database Migration
- **File:** `db/migrations/003_subscriptions.sql`

#### 8. Unit Tests (23 new)
- **SubscriptionTests** (10): Create, cancel, upgrade, downgrade, hasExpired
- **SubscriptionServiceTests** (10): Get current, checkout, activate, cancel, tiers
- **TierConfigurationTests** (3): Free, Pro, Premium limits

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 223 passing (127 domain + 84 application + 11 infrastructure + 1 API)

### Next Steps
1. ~~**Phase 8:** CI/CD & staging deploy~~ ✅
2. **Phase 9:** Production readiness

---

## Session #9 — 2026-02-12

### State: Phase 8 — CI/CD & Staging Deploy

**Status:** COMPLETE

### Tasks Performed

#### 1. Enhanced CI Pipeline (`ci.yml`)
- Added code coverage collection (XPlat Code Coverage)
- Added coverage report upload as artifact
- Added security scan job (vulnerable NuGet packages)
- Kept existing build + test flow

#### 2. Staging Deploy Pipeline (`deploy-staging.yml`)
- Triggers: push to main + manual dispatch
- Runs full test suite before deploy
- Builds Docker image and pushes to GHCR
- Tags: `staging-latest` + `staging-<sha>`
- Runs smoke tests post-deploy

#### 3. Production Deploy Pipeline (`deploy-production.yml`)
- Triggers: release publish + manual dispatch with confirmation
- Manual safety gate (must type "deploy" to confirm)
- Full test suite + Docker build + GHCR push
- Semver tags: `latest`, `x.y.z`, `x.y`
- Post-deploy smoke tests

#### 4. Dockerfile
- Multi-stage build (SDK → runtime)
- Non-root user for security
- Port 8080, HEALTHCHECK configured
- `.dockerignore` for build optimization

#### 5. Smoke Test Script
- **File:** `scripts/smoke-test.sh`
- Tests: health, auth rejection, protected endpoint 401s, public tiers
- Configurable base URL, pass/fail exit codes

#### 6. Deployment Docs Updated
- Docker instructions, pipeline descriptions, secrets table, smoke test usage

### Build Status
- **Build:** SUCCESS (0 errors, 0 warnings)
- **Tests:** 223 passing (unchanged — infrastructure phase)

### Next Steps
1. **Phase 9:** Production readiness (logging, GDPR, checklist)

# CarCheck — Architecture

## Overview

CarCheck is a SaaS platform that helps users evaluate used cars by aggregating data from multiple sources and providing algorithmic recommendations.

## Architecture Style

- **Clean Architecture** with dependency inversion
- **Domain-Driven Design (DDD)** for the core domain
- **SOLID principles** throughout
- **Vertical slice features** where appropriate

## Layer Structure

```
┌─────────────────────────────────┐
│            API Layer            │  ← HTTP endpoints, middleware, auth
├─────────────────────────────────┤
│        Application Layer        │  ← Use cases, DTOs, interfaces
├─────────────────────────────────┤
│      Infrastructure Layer       │  ← DB, external APIs, caching
├─────────────────────────────────┤
│          Domain Layer           │  ← Entities, value objects, interfaces
└─────────────────────────────────┘
```

## Dependency Flow

```
API → Application → Domain
API → Infrastructure → Application → Domain
```

Domain has ZERO external dependencies.

## Projects

| Project | Layer | Purpose |
|---|---|---|
| CarCheck.Domain | Domain | Entities, interfaces, enums, value objects |
| CarCheck.Application | Application | Use cases, DTOs, service interfaces |
| CarCheck.Infrastructure | Infrastructure | EF Core, Supabase, Redis, external APIs |
| CarCheck.API | Presentation | REST API, middleware, DI configuration |

## Technology Stack

| Component | Technology |
|---|---|
| Runtime | .NET 9 |
| Database | PostgreSQL (Supabase) |
| Caching | Redis (abstracted) |
| Auth | JWT + Refresh tokens + 2FA |
| Hashing | Argon2/BCrypt |
| CI/CD | GitHub Actions |
| Hosting | TBD (Azure/Railway/Fly.io) |

## Data Flow

1. User submits registration number via API
2. Application layer orchestrates data aggregation
3. Infrastructure layer queries external providers
4. Domain layer processes and scores the data
5. Result is cached and returned to user

## Phase Strategy

- **Phase 1 (Free):** Scraping providers, rate-limited, CAPTCHA protected
- **Phase 2 (Paid):** Official APIs, subscription billing, unlimited searches
- Architecture supports seamless transition via provider abstraction layer

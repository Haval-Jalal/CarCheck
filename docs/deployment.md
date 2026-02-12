# CarCheck — Deployment Guide

## Environments

| Environment | Database | Secrets | Deploy Trigger |
|---|---|---|---|
| Local | Local Postgres / Supabase dev | `.env` file | Manual |
| Staging | Supabase staging project | GitHub Secrets | Auto on `main` merge |
| Production | Supabase production project | GitHub Secrets | Manual approval |

## Prerequisites

- .NET 9 SDK
- PostgreSQL 15+ (or Supabase project)
- Redis (optional, for caching)
- GitHub CLI (`gh`)

## Local Development

```bash
# Clone repository
gh repo clone Haval-Jalal/CarCheck
cd CarCheck

# Copy environment variables
cp .env.example .env
# Edit .env with your local values

# Restore and build
dotnet restore
dotnet build

# Run migrations
# (migration tooling TBD — Phase 2)

# Run API
dotnet run --project src/CarCheck.API

# Run tests
dotnet test
```

## CI/CD Pipeline

### CI (Pull Requests)
1. Restore dependencies
2. Build solution
3. Run all tests
4. Lint check
5. Migration validation

### Staging Deploy (main branch)
1. CI pipeline passes
2. Auto-deploy to staging
3. Run database migrations
4. Execute smoke tests

### Production Deploy
1. Manual approval required
2. Zero-downtime migration strategy
3. Rollback support available

## Secrets Management

- All secrets stored in GitHub Actions Secrets
- Never committed to repository
- Separate JWT secrets per environment
- Secrets rotated on production deploy

## Health Check

```
GET /health → 200 OK
```

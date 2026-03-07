# CarCheck — Deployment Guide

## Environments

| Environment | Database | Secrets | Deploy Trigger |
|---|---|---|---|
| Local | Local Postgres / Supabase dev | `.env` file | Manual |
| Staging | Supabase staging project | GitHub Secrets | Auto on `main` merge |
| Production | Supabase production project | GitHub Secrets | Release publish / manual |

## Prerequisites

- .NET 9 SDK
- PostgreSQL 15+ (or Supabase project)
- Docker (for containerized deployment)
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
psql -f db/migrations/001_initial_schema.sql
psql -f db/migrations/002_refresh_tokens.sql
psql -f db/migrations/003_subscriptions.sql

# Run API
dotnet run --project src/CarCheck.API

# Run tests
dotnet test
```

## Docker

```bash
# Build image
docker build -t carcheck-api .

# Run container
docker run -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Database=carcheck;Username=postgres;Password=postgres" \
  -e Jwt__Secret="your-secret-key-min-32-characters-long!!" \
  carcheck-api
```

## CI/CD Pipelines

### CI (`ci.yml`) — Pull Requests + main pushes
1. Restore dependencies
2. Build solution (Release)
3. Run all tests with code coverage
4. Upload coverage reports as artifacts
5. Security scan — check for vulnerable NuGet packages

### Staging Deploy (`deploy-staging.yml`) — Auto on main merge
1. Run full test suite
2. Build Docker image
3. Push to GitHub Container Registry (`ghcr.io`)
4. Tag: `staging-latest` + `staging-<sha>`
5. Run smoke tests against staging

### Production Deploy (`deploy-production.yml`) — Release publish or manual
1. Manual confirmation required (type "deploy")
2. Run full test suite
3. Build Docker image
4. Push to GHCR with semver tags (`latest`, `x.y.z`, `x.y`)
5. Run production smoke tests

## Smoke Tests

```bash
# Run against local
./scripts/smoke-test.sh http://localhost:8080

# Run against staging
./scripts/smoke-test.sh https://staging.carcheck.se
```

Tests cover:
- Health endpoint (200)
- Auth endpoints reject empty body (400)
- Protected endpoints require auth (401)
- Public billing tiers endpoint (200)

## Secrets Management

Required GitHub Actions Secrets:

| Secret | Description |
|--------|-------------|
| `GITHUB_TOKEN` | Auto-provided, for GHCR access |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key (min 32 chars) |
| `CAPTCHA_SECRET` | reCAPTCHA/hCaptcha secret key |
| `BILLING_SECRET` | Stripe/Klarna API secret |

- All secrets stored in GitHub Actions Secrets
- Never committed to repository
- Separate JWT secrets per environment

## Health Check

```
GET /health → 200 OK
{ "status": "healthy", "timestamp": "2026-02-12T..." }
```

Docker HEALTHCHECK configured: every 30s, 5s timeout, 3 retries.

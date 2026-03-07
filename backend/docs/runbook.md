# CarCheck — Runbook

## Common Operations

### Start Local Development
```bash
dotnet run --project src/CarCheck.API
```

### Run All Tests
```bash
dotnet test
```

### Run Specific Test Project
```bash
dotnet test tests/CarCheck.Domain.Tests
```

### Build Solution
```bash
dotnet build
```

## Incident Response

### API Down
1. Check health endpoint: `GET /health`
2. Check application logs for exceptions
3. Verify database connectivity
4. Check external service status
5. Restart API if needed

### Database Issues
1. Check Supabase dashboard for status
2. Verify connection string in environment
3. Check for locked queries
4. Review recent migrations

### High Latency
1. Check caching layer (Redis) status
2. Review external API response times
3. Check database query performance
4. Review rate limiting configuration

### Authentication Issues
1. Verify JWT secret is correct for environment
2. Check token expiration settings
3. Review refresh token rotation logs
4. Check security_events table for anomalies

## Rollback Procedure

### Application Rollback
1. Identify last known good commit
2. Revert deployment to that commit
3. Verify health check passes
4. Review logs for errors

### Database Rollback
1. Identify the migration to reverse
2. Run down migration script
3. Verify data integrity
4. Update deployment notes

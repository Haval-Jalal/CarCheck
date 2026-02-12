# CarCheck — Requirements

## Functional Requirements

### Authentication
- [x] Register with unique email
- [ ] Email verification required
- [ ] Login with password
- [ ] Mandatory 2FA
- [ ] Password reset via email
- [ ] Password change while authenticated
- [ ] Refresh token rotation
- [ ] Logout invalidates refresh tokens

### Car Analysis
- [ ] Search by registration number
- [ ] Aggregate multi-source data
- [ ] Detect insurance damage
- [ ] Detect manufacturer issues
- [ ] Ownership statistics
- [ ] Market comparison
- [ ] Recommendation scoring engine
- [ ] Cached results with TTL

### User Features
- [ ] Private search history
- [ ] Favorites system (add/remove)
- [ ] Rate limiting during free phase
- [ ] CAPTCHA enforcement when scraping

### Business Model
**Free Phase:**
- Scraping providers
- Cooldown between searches
- Limited daily quota

**Paid Phase:**
- Official APIs
- Per-search billing
- Unlimited usage
- Subscription tiers

## Non-Functional Requirements

### Security
- JWT access tokens (short-lived)
- Refresh tokens (rotating)
- Argon2/BCrypt hashing
- Audit/security logging
- Rate limiting middleware
- CAPTCHA integration
- GDPR compliance readiness
- Secrets never stored in repo

### Performance
- Caching layer (Redis-ready abstraction)
- Async external calls
- Background enrichment workers
- Pagination everywhere

### Scalability
- Stateless API
- Horizontal scaling ready
- Queue-based workers
- Provider abstraction for data sources

### Observability
- Structured logging
- Error tracking
- Health checks
- Metrics endpoint

# Security Manifest (Supabase-first)

## Authentication Model

### Provider: Supabase Auth (PostgreSQL)
- **Mechanism**: JWT Bearer tokens in Authorization header
- **Token Format**: RS256-signed JWT (Supabase JWKS endpoint)
- **Payload Structure**:
```json
{
  "sub": "user_id_uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490,
  "aud": "authenticated",
  "org_id": "org_uuid",
  "role": "viewer|analyst|admin"
}
```
- **Token Refresh**: Automatic via Supabase session (max 1 hour lifetime)
- **Logout**: Session revocation in auth.sessions table

### Session Management
- **Type**: Stateless JWT (no server-side session store required)
- **Cookie-based**: Supabase sets `sb-access-token` in HttpOnly, Secure, SameSite=Lax cookies
- **CSRF Protection**: SameSite=Lax prevents cross-origin token submission

## Authorization Model

### Role-Based Access Control (RBAC)

**Three Roles:**

1. **Viewer** (read-only)
   - SELECT on: transactions, brands, categories, locations, KPI aggregates, insights, recommendations
   - Cannot: INSERT, UPDATE, DELETE, export (optional)

2. **Analyst** (read + limited write)
   - All Viewer permissions
   - INSERT: transactions, line items, custom filters (potential)
   - Cannot: DELETE, modify schema, manage users

3. **Admin** (full access)
   - All operations
   - User management, organization settings, audit log review

### Endpoint Authorization

| Endpoint | Viewer | Analyst | Admin |
|----------|--------|---------|-------|
| `get_dashboard_summary` | ✅ | ✅ | ✅ |
| `get_transaction_trends` | ✅ | ✅ | ✅ |
| `get_filter_options` | ✅ | ✅ | ✅ |
| `get_insights` | ✅ | ✅ | ✅ |
| `export_dashboard_data` | ✅ | ✅ | ✅ |
| INSERT transactions | ❌ | ✅ | ✅ |
| UPDATE org settings | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

## Row Level Security (RLS) Strategy

### Implementation: PostgreSQL RLS (Supabase Native)

All tables have RLS enabled. Policies use `get_current_org_id()` function to enforce org isolation.

### Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| organizations | org_id match | admin only | admin only | N/A |
| users | org_id match | admin only | self-service | N/A |
| brands | org_id match | analyst+ | admin only | N/A |
| categories | org_id match | analyst+ | admin only | N/A |
| stores | org_id match | analyst+ | admin only | N/A |
| regions | org_id match | analyst+ | admin only | N/A |
| products | org_id match | analyst+ | admin only | N/A |
| transactions | org_id match | analyst+ | N/A | N/A |
| transaction_line_items | org_id match | analyst+ | N/A | N/A |
| transaction_*_summary | org_id match | (refresh) | N/A | N/A |
| insights | org_id match | (auto) | N/A | N/A |
| recommendations | org_id match | (auto) | N/A | N/A |
| audit_logs | org_id match | (auto) | N/A | N/A |

## Data Classification & PII

### Sensitivity Levels

**Public:**
- Brand names (Coca-Cola, Pepsi, etc.)
- Category names (Beverages, Snacks, etc.)
- Region names (Metro Manila, Cebu, etc.)

**Internal:**
- Store codes and addresses (Store 001 - BGC location)
- Aggregated KPIs (daily volume, revenue)
- Time-series trends

**Sensitive:**
- Individual transaction amounts
- Customer IDs (if PII linked)
- Transaction timestamps with location (combined = behavioral tracking)
- Employee assignment data (if staff scheduling added)

### PII Handling
- **Customer ID**: Hashed/tokenized; no direct customer names stored
- **Geographic data**: Store location (Lat/Long) stored but not exposed to viewers without analyst+ role
- **Transactional data**: Never export raw transaction-level data with personal identifiers

## CORS Configuration

```
Allowed Origins: https://*.scout-dashboard.com
Allowed Methods: GET, POST, OPTIONS
Allowed Headers: Authorization, Content-Type, X-Org-ID
Expose Headers: X-Total-Count, X-Page-Info
Max Age: 86400 (24 hours)
```

## Rate Limiting

### Per-User Limits (JWT sub claim)

| Endpoint | Limit | Window |
|----------|-------|--------|
| GET /dashboard/* | 100 req | 1 min |
| POST /rpc/get_dashboard_summary | 10 req | 1 min |
| POST /rpc/export_dashboard_data | 5 req | 1 hour |
| GET /filter_options | 50 req | 1 min |

### Implementation: Supabase Functions + Redis
```typescript
// Example: Rate limit export by user_id
const key = `export:${user_id}`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, 3600); // 1 hour TTL
if (count > 5) return 429 Too Many Requests;
```

## Audit Logging

### Events Logged
- User login/logout (via Supabase auth triggers)
- Dashboard view (`action: 'view_dashboard'`)
- Filter application (`action: 'apply_filter'`)
- Data export (`action: 'export_data'`, `export_format`, `rows_exported`)
- Refresh dashboard (`action: 'refresh'`)

### Audit Table Fields
```sql
org_id, user_id, action, resource_type, filter_params (JSON),
export_format, rows_exported, status, error_message, ip_address, user_agent, timestamp
```

### Retention
- 90 days (archival to S3 after 30 days)

## Secrets & Environment Variables

### Required Env Vars
```bash
# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<public-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>

# API Server
API_PORT=3000
API_ENVIRONMENT=production|development
LOG_LEVEL=info|debug

# LLM (for insights generation, optional)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

# Export
AWS_S3_BUCKET=scout-exports
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Feature Flags
FEATURE_AI_INSIGHTS=true
FEATURE_EXPORT_PDF=true
FEATURE_REALTIME_UPDATES=false
```

### Secret Management
- **Production**: AWS Secrets Manager or HashiCorp Vault
- **Development**: `.env.local` (never committed)
- **Rotation**: Quarterly for API keys, on-demand for compromised secrets

## Threat Model & Mitigations

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Org data leakage (RLS bypass) | **Critical** | Row-level policies on all tables, org_id validation in JWT |
| Unauthorized export | **High** | Role-based endpoint access, audit logging |
| API brute force | **High** | Rate limiting per user_id, account lockout after 5 failed attempts |
| CSRF (if cookie-based) | **High** | SameSite=Lax, custom X-Org-ID header validation |
| Insight/Recommendation injection | **Medium** | Sanitize LLM outputs, content security policy |
| Timing attacks on org_id | **Low** | Constant-time comparison functions (handled by Supabase) |

## Compliance & Privacy

### Standards
- **GDPR**: Customer data deletion via GDPR request handler
- **CCPA**: Data portability endpoint (export all customer transaction data)
- **Philippines Data Privacy Act**: Org-level data residency in Asia Pacific region

### Data Retention
- Transaction records: 7 years (for audit/tax)
- Audit logs: 90 days
- Insights/recommendations: 30 days (regenerated on demand)
- Session data: Automatic cleanup after token expiry (max 1 hour)

## Security Testing Checklist

- [ ] RLS policies tested: org isolation enforced in SELECT queries
- [ ] Auth token expiry: 401 after token.exp timestamp
- [ ] Role enforcement: Analyst cannot DELETE products
- [ ] Rate limits: 6th export request within 1 hour returns 429
- [ ] Audit logging: Dashboard view logged with correct user_id, action, timestamp
- [ ] PII: No customer names in transaction exports
- [ ] HTTPS: All endpoints redirect HTTP → HTTPS
- [ ] CORS: Cross-origin requests from unauthorized domains rejected
- [ ] Input validation: SQL injection payloads in filter params rejected gracefully

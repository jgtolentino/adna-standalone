# Vercel Production Checklist - Suqi Analytics

## ✅ Completed Items

### 1. Security
- [x] Security headers configured in `vercel.json`:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
  - Strict-Transport-Security: max-age=31536000
  - Content-Security-Policy: Configured for Supabase and Google Fonts

### 2. Performance
- [x] Speed Insights installed and configured
- [x] Vite build optimization enabled
- [x] Font preconnect for Google Fonts

### 3. Configuration
- [x] Framework detection (Vite)
- [x] Build command defined
- [x] Output directory specified
- [x] SPA rewrites configured

## 🔄 Pending Items

### Security
- [ ] **Enable Vercel Deployment Protection** (via Vercel Dashboard)
  - Go to: Project Settings > Deployment Protection
  - Enable protection for preview deployments

- [ ] **Configure Vercel WAF** (Pro/Enterprise)
  - Set up custom rules
  - Enable IP blocking
  - Enable managed rulesets

- [ ] **Enable Log Drains** (Pro/Enterprise)
  - Persist deployment logs
  - Configure log destination

- [ ] **Review and implement access roles**
  - Set up team permissions
  - Configure SAML SSO (Enterprise)
  - Enable SCIM (Enterprise)

### Reliability
- [ ] **Enable Observability Plus** (Pro/Enterprise)
  - Debug performance issues
  - Error investigation

- [ ] **Configure Function regions**
  - Match Supabase region (if using Edge Functions)

- [ ] **Set up monitoring and alerting**
  - Configure usage alerts
  - Set up error tracking (Sentry)

### Performance
- [ ] **Implement caching headers**
  - Add Cache-Control headers for static assets
  - Configure ISR if using SSR

- [ ] **Image Optimization**
  - Review image sizes
  - Implement lazy loading
  - Use WebP format where possible

- [ ] **Code splitting**
  - Address large bundle warning (6.27 MB)
  - Implement dynamic imports
  - Configure manual chunks

### Operational Excellence
- [ ] **Create incident response plan**
  - Define escalation paths
  - Set up communication channels
  - Document rollback procedures

- [ ] **Configure staging environment**
  - Set up preview deployment workflow
  - Test promotion strategy

- [ ] **Zero downtime DNS migration**
  - Use Vercel DNS for production domain

- [ ] **Commit lockfiles**
  - Ensure package-lock.json is committed
  - Pin dependencies

### Cost Optimization
- [ ] **Enable Fluid Compute**
  - Reduce cold starts
  - Optimize concurrency

- [ ] **Configure Spend Management**
  - Set usage alerts
  - Review Function duration limits
  - Optimize image optimization pricing

- [ ] **Move large media to blob storage**
  - Use Vercel Blob for videos/GIFs
  - Reduce bundle size

## Environment Variables Checklist

### Required (Production)
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] VITE_DATA_MODE=supabase

### Optional
- [ ] VITE_SENTRY_DSN (error tracking)
- [ ] VITE_ANALYTICS_ID (analytics)

## Deployment Commands

```bash
# Test build locally
npm run build
npm run preview

# Deploy to production
vercel --prod

# Promote preview to production
vercel promote <deployment-url>

# Rollback deployment
vercel rollback <deployment-url>
```

## Health Check URLs

- Production: https://scout-dashboard-xi.vercel.app
- API Health: https://scout-dashboard-xi.vercel.app/api/health
- Speed Insights: Vercel Dashboard > Analytics > Speed Insights

## Post-Deployment Verification

1. [ ] Check production URL loads correctly
2. [ ] Verify environment variables are set
3. [ ] Test Supabase connection
4. [ ] Check security headers (use securityheaders.com)
5. [ ] Verify Speed Insights is collecting data
6. [ ] Monitor for JavaScript errors
7. [ ] Check Core Web Vitals
8. [ ] Test on mobile devices

## Monitoring & Alerts

- [ ] Set up Vercel usage alerts
- [ ] Configure error tracking (Sentry)
- [ ] Monitor Speed Insights dashboard
- [ ] Set up uptime monitoring (optional)

## Documentation

- [x] `.env.example` file created
- [ ] Update README with deployment instructions
- [ ] Document environment variables
- [ ] Create runbook for common issues

---

**Last Updated**: 2026-01-11
**Status**: Production-ready with recommended improvements pending
**Critical Items**: Environment variables, deployment protection, monitoring

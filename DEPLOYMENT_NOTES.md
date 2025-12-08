# Vercel Deployment Configuration - Scout Dashboard

## Canonical Vercel Project Settings

**IMPORTANT**: This repo is permanently linked to the existing Vercel project. Do NOT create new projects.

### Project Details
- **Project Name**: `scout-dashboard`
- **Team/Organization**: Jake Tolentino's projects
- **Framework Preset**: Next.js
- **Repository**: `scout-dashboard` (GitHub)

### Build Configuration
- **Root Directory**: `apps/scout-dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Runtime Configuration
- **Node.js Version**: `24.x`
- **Package Manager**: npm

### Domain Configuration
- **Production Domain**: `scout-dashboard-xi.vercel.app`
- **Production Branch**: `main`

### Environment Variables (Required)
The following environment variables must be set in Vercel dashboard:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Target: Production, Preview, Development
   - Value: `https://ublqmilcjtpnflofprkr.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Target: Production, Preview, Development
   - Value: (Supabase anon key - see secure vault)

3. **NEXT_PUBLIC_MAPBOX_TOKEN**
   - Target: Production, Preview, Development
   - Value: (Mapbox public token - see secure vault)

## One-Time Setup Checklist

### 1. Link Local Repo to Vercel Project
Run this once from the repo root:

```bash
# Link to existing Vercel project
vercel link

# When prompted:
# - Scope: Select "Jake Tolentino's projects"
# - Link to existing project: YES
# - Project: Select "scout-dashboard"
```

This will create `.vercel/project.json` with the correct `orgId` and `projectId`. **Commit this file.**

### 2. Verify Vercel Dashboard Settings
Go to [Vercel Dashboard](https://vercel.com/jake-tolentinos-projects-c0369c83/scout-dashboard/settings) and confirm:

- ✅ Framework Preset = **Next.js**
- ✅ Root Directory = `apps/scout-dashboard`
- ✅ Build Command = `npm run build`
- ✅ Output Directory = `.next`
- ✅ Node.js Version = `24.x`
- ✅ Production Branch = `main`

### 3. Verify Environment Variables
Go to [Environment Variables](https://vercel.com/jake-tolentinos-projects-c0369c83/scout-dashboard/settings/environment-variables) and confirm all three variables exist for all environments.

### 4. Verify Production Domain
Go to [Domains](https://vercel.com/jake-tolentinos-projects-c0369c83/scout-dashboard/settings/domains) and confirm:

- ✅ `scout-dashboard-xi.vercel.app` is assigned as production domain

## Deployment Workflow

### Automatic Deployments
- **Push to `main`** → Triggers production deployment to `scout-dashboard-xi.vercel.app`
- **Push to feature branches** → Triggers preview deployments

### Manual Deployments
From repo root:

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

## Critical Rules

1. **DO NOT** create a new Vercel project for this repo
2. **ALWAYS** link back to the existing `scout-dashboard` project using `.vercel/project.json`
3. **DO NOT** change the Root Directory from `apps/scout-dashboard`
4. **DO NOT** downgrade Node.js below 24.x
5. **COMMIT** `.vercel/project.json` after running `vercel link`

## Troubleshooting

### "No Next.js version detected"
- **Root Cause**: Vercel building from wrong directory
- **Fix**: Verify Root Directory = `apps/scout-dashboard` in dashboard
- **Verify**: Check `vercel.json` at repo root exists and is valid

### "Node.js Version discontinued"
- **Root Cause**: Using Node 18.x or 20.x (discontinued)
- **Fix**: Ensure `apps/scout-dashboard/package.json` has `"engines": { "node": "24.x" }`
- **Verify**: Check `.nvmrc` contains `24`

### Build fails with missing environment variables
- **Root Cause**: Environment variables not set in Vercel
- **Fix**: Add all three required env vars in Vercel dashboard
- **Verify**: Check they're set for Production, Preview, and Development

### CLI creates new project instead of linking to existing
- **Root Cause**: Missing or invalid `.vercel/project.json`
- **Fix**: Run `vercel link` and select existing `scout-dashboard` project
- **Verify**: Commit `.vercel/project.json` to git

## Canonical Deployment Reference

**Last Known Good Deployment:**
- **Deployment ID**: `scout-dashboard-axs4s4s5r-jake-tolentinos-projects-c0369c83.vercel.app`
- **Commit**: `da93c2b`
- **Commit Message**: `fix: add proper Vite env validation and error handling`
- **Status**: Production (as of 2025-12-08)

All future deployments should build on this foundation and roll the production alias forward under the same `scout-dashboard` project.

## Support

For Vercel-specific issues:
- Project Dashboard: https://vercel.com/jake-tolentinos-projects-c0369c83/scout-dashboard
- Vercel CLI Docs: https://vercel.com/docs/cli
- Monorepo Guide: https://vercel.com/docs/monorepos

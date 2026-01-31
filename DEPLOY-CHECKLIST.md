# MyAnime Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

- [ ] Code is pushed to GitHub repository
- [ ] All tests pass locally
- [ ] Production build works locally (`npm run build`)
- [ ] Database schema is finalized
- [ ] Environment variables documented

## Database Setup

- [ ] PostgreSQL database created (Neon/Supabase)
- [ ] Connection string obtained
- [ ] Database accessible from deployment platform
- [ ] Redis instance created (Upstash)
- [ ] Redis credentials obtained

## Secrets Generation

- [ ] Run `./scripts/generate-secrets.sh`
- [ ] JWT_SECRET generated (min 32 characters)
- [ ] NEXTAUTH_SECRET generated (min 32 characters)
- [ ] Secrets stored securely (password manager)

## Backend Deployment (Railway/Render)

- [ ] Project created on deployment platform
- [ ] Repository connected
- [ ] Environment variables configured:
  - [ ] DATABASE_URL
  - [ ] REDIS_HOST
  - [ ] REDIS_PORT
  - [ ] REDIS_PASSWORD (if using Upstash)
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRES_IN
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL (update after frontend deployment)
  - [ ] PORT
  - [ ] NODE_ENV=production
  - [ ] THROTTLE_TTL
  - [ ] THROTTLE_LIMIT
  - [ ] ANILIST_API_URL
  - [ ] FILLERLIST_API_URL
- [ ] Build command configured
- [ ] Start command configured
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Backend deployed successfully
- [ ] Backend URL noted for frontend configuration
- [ ] Health check passes: `curl https://your-backend.railway.app/api`

## Frontend Deployment (Vercel)

- [ ] Project created on Vercel
- [ ] Repository connected
- [ ] Root directory set to `frontend`
- [ ] Environment variables configured:
  - [ ] NEXT_PUBLIC_API_URL (backend URL)
  - [ ] NEXTAUTH_URL (will be Vercel URL)
  - [ ] NEXTAUTH_SECRET (same as backend)
- [ ] Framework preset: Next.js
- [ ] Deployed successfully
- [ ] Frontend URL obtained

## Post-Deployment Updates

- [ ] Update backend `NEXTAUTH_URL` to match frontend URL
- [ ] Redeploy backend if NEXTAUTH_URL was updated
- [ ] Test frontend loads correctly
- [ ] Test API connection from frontend

## Verification

Run the verification script:
```bash
./scripts/verify-deployment.sh https://your-backend.railway.app https://your-frontend.vercel.app
```

Manual checks:
- [ ] Frontend loads: `https://your-frontend.vercel.app`
- [ ] Backend health: `https://your-backend.railway.app/api`
- [ ] API docs: `https://your-backend.railway.app/api/docs`
- [ ] Register new user works
- [ ] Login works
- [ ] Search anime works (tests AniList API)
- [ ] Add anime to list works (tests database)
- [ ] View anime details works
- [ ] Episode information displays (tests FillerList API)

## Security Checks

- [ ] No secrets in code repository
- [ ] Environment variables set on platform (not in code)
- [ ] CORS configured for production domains
- [ ] Rate limiting active
- [ ] Authentication working properly
- [ ] Database connection uses SSL (if required)
- [ ] Redis password set (if using Upstash)

## Performance Checks

- [ ] Database connection pooling configured
- [ ] Redis caching working
- [ ] API response times acceptable
- [ ] Frontend loads quickly
- [ ] Images loading properly
- [ ] No console errors in browser

## Optional: Custom Domain

- [ ] Custom domain purchased
- [ ] DNS configured for frontend (Vercel)
- [ ] DNS configured for backend (Railway/Render)
- [ ] SSL certificates active
- [ ] Update NEXTAUTH_URL to custom domain
- [ ] Update NEXT_PUBLIC_API_URL to custom backend domain
- [ ] Redeploy both services

## Monitoring Setup (Optional)

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring set up
- [ ] Log aggregation configured
- [ ] Alerts configured for downtime
- [ ] Performance monitoring active

## Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Share credentials with team (securely)
- [ ] Create runbook for common issues

## Rollback Plan

- [ ] Know how to rollback to previous deployment
- [ ] Database backup strategy in place
- [ ] Contact info for support documented

---

## Quick Reference

### Generate Secrets
```bash
./scripts/generate-secrets.sh
```

### Verify Deployment
```bash
./scripts/verify-deployment.sh <BACKEND_URL> <FRONTEND_URL>
```

### View Logs
- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Deployments → Function Logs
- **Render**: Dashboard → Logs

### Run Migrations
```bash
# Railway
railway run npx prisma migrate deploy

# Render
# Use Render Shell or add to build command
```

---

**Deployment Complete!** 🎉

Make sure all checkboxes are checked before announcing the deployment.

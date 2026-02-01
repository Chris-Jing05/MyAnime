# Render Deployment Guide for MyAnime

## Important Note

This project uses npm workspaces (monorepo structure). The deployment configuration accounts for this by using specific build commands that navigate to each service directory.

## Prerequisites

1. A Render account (https://render.com)
2. A GitHub repository with this code pushed
3. An Upstash Redis instance (for backend caching) - Get free tier at https://upstash.com

## Deployment Steps

### 1. Connect Your Repository

1. Log into Render Dashboard
2. Click "New +" button and select "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file automatically

### 2. Update render.yaml Before Deployment

**IMPORTANT**: Before creating the blueprint, update the `NEXT_PUBLIC_API_URL` in `render.yaml`:

1. Open `render.yaml`
2. Find line ~63: `value: https://myanime-backend.onrender.com`
3. Replace `myanime-backend` with your actual backend service name (if different)

### 3. Configure Environment Variables

After the blueprint creates your services, you need to manually set these environment variables:

#### Backend Service (`myanime-backend`)

Navigate to your backend service → Environment tab and add:

- **REDIS_HOST**: Your Upstash Redis hostname (e.g., `usw1-meet-shark-12345.upstash.io`)
- **REDIS_PORT**: Usually `6379` (check your Upstash dashboard)
- **REDIS_PASSWORD**: Your Upstash Redis password
- **FRONTEND_URL**: Your frontend URL (e.g., `https://myanime-frontend.onrender.com`) - needed for CORS

#### Frontend Service (`myanime-frontend`)

Navigate to your frontend service → Environment tab and set/verify:

- **NEXT_PUBLIC_API_URL**: Should already be set from render.yaml, but verify it points to your backend
- **NEXTAUTH_URL**: Your frontend service URL (e.g., `https://myanime-frontend.onrender.com`)
- **NEXTAUTH_SECRET**: Copy the same value from your backend's `NEXTAUTH_SECRET` (check backend env vars)

### 3. Database Setup

The PostgreSQL database will be created automatically by the blueprint. The `DATABASE_URL` will be automatically linked to your backend service.

### 4. Deployment Order

1. **Database** deploys first (automatic)
2. **Backend** deploys second (automatic)
   - Wait for backend to be fully deployed and note the URL
3. **Frontend** may fail initially - this is expected
   - Set the environment variables listed above
   - Manually trigger a redeploy

### 5. Verify Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/api` - should return API info
2. **Frontend**: Visit `https://your-frontend-url.onrender.com` - should load the homepage

## Common Issues and Solutions

### Issue: Backend fails with status 127 (Command not found)

**Solution**: This was caused by rootDir configuration. The fix uses explicit `cd` commands:
```yaml
buildCommand: |
  cd backend
  npm install --legacy-peer-deps
  npx prisma generate
  npm run build
```
Ensure you've pulled the latest render.yaml from the repo.

### Issue: Backend fails with Prisma errors

**Solution**:
1. Ensure `DATABASE_URL` is properly set (should be automatic from database link)
2. Check backend logs for specific Prisma migration errors
3. Verify database is created and running

### Issue: Frontend fails with status 1 during build

**Root Cause**: Two issues:
1. Missing environment variables during build
2. npm workspaces interference from root package.json

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` is set in render.yaml or environment tab
2. The variable must be available at BUILD TIME (not just runtime)
3. Update render.yaml line ~71 with your actual backend URL
4. The build command now temporarily moves root package.json to prevent workspace conflicts
5. Redeploy after updating

**If still failing**: Check the build logs for the exact error:
- Look for "npm error workspace" - indicates workspace interference (should be fixed by the package.json move)
- Look for "NEXT_PUBLIC_API_URL is not defined" - environment variable issue

### Issue: Frontend fails with "Invalid API URL" at runtime

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` points to your backend URL (with https://)
2. Ensure backend is running and accessible
3. Check browser console for actual API URL being used
4. Redeploy frontend after fixing the variable

### Issue: Redis connection errors

**Solution**:
1. Verify Upstash Redis credentials are correct
2. Ensure your Upstash instance allows connections from any IP
3. Double-check REDIS_HOST doesn't include protocol (no `redis://`)
4. Verify REDIS_PORT is a number (usually 6379 or 6380 for TLS)

### Issue: Authentication not working

**Solution**:
1. Ensure `NEXTAUTH_SECRET` is identical in both backend and frontend services
2. Set `FRONTEND_URL` on backend for proper CORS configuration
3. Check that `NEXTAUTH_URL` matches your actual frontend URL

### Issue: Build fails with "npm ERR!" or dependency errors

**Solution**:
1. The `--legacy-peer-deps` flag should handle most peer dependency issues
2. Clear build cache in Render dashboard: Settings → Build & Deploy → Clear build cache
3. Check Node.js version matches `.nvmrc` file (20.18.1)
4. Verify all dependencies are in `dependencies` not just `devDependencies`

### Issue: CORS errors in browser console

**Solution**:
1. Set `FRONTEND_URL` environment variable on backend service
2. Ensure it matches your actual frontend URL exactly (including https://)
3. Redeploy backend after setting the variable

## Post-Deployment

### Enable Auto-Deploy

In Render Dashboard:
1. Go to each service's Settings
2. Enable "Auto-Deploy" from your main branch
3. Now pushes to GitHub will automatically deploy

### Monitor Services

- Check service logs in Render Dashboard for any runtime errors
- Set up health check notifications in Render settings

## Free Tier Limitations

- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Database limited to 90 days on free tier
- 750 hours/month per service

## Upgrading to Paid Tiers

If you need:
- No sleep on inactivity
- Better performance
- Longer database retention

Consider upgrading to Render's paid plans.

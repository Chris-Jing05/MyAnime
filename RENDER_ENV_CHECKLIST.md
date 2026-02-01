# Render Environment Variables Checklist

## Before Deployment

- [ ] Update `render.yaml` line 63: Set `NEXT_PUBLIC_API_URL` to your backend URL
  - Default: `https://myanime-backend.onrender.com`
  - Change if your service name is different

## After Services are Created

### Backend Service Environment Variables

Required variables to set manually in Render Dashboard:

- [ ] **REDIS_HOST** - From Upstash Redis dashboard
  - Example: `usw1-meet-shark-12345.upstash.io`
  - Do NOT include `redis://` protocol

- [ ] **REDIS_PORT** - From Upstash Redis dashboard
  - Usually: `6379` (or `6380` for TLS)

- [ ] **REDIS_PASSWORD** - From Upstash Redis dashboard

- [ ] **FRONTEND_URL** - Your frontend service URL
  - Format: `https://your-frontend-name.onrender.com`
  - Must match exactly for CORS to work

Auto-generated (verify these exist):
- [x] NODE_ENV (production)
- [x] PORT (4000)
- [x] DATABASE_URL (from database link)
- [x] JWT_SECRET (auto-generated)
- [x] JWT_EXPIRES_IN (7d)
- [x] NEXTAUTH_SECRET (auto-generated - **copy this for frontend**)
- [x] THROTTLE_TTL (60)
- [x] THROTTLE_LIMIT (100)
- [x] ANILIST_API_URL
- [x] FILLERLIST_API_URL

### Frontend Service Environment Variables

Required variables to set manually:

- [ ] **NEXT_PUBLIC_API_URL** - Your backend service URL
  - Should be set from render.yaml
  - Verify: `https://your-backend-name.onrender.com`
  - **CRITICAL**: Must be set for build to succeed

- [ ] **NEXTAUTH_URL** - Your frontend service URL
  - Format: `https://your-frontend-name.onrender.com`

- [ ] **NEXTAUTH_SECRET** - Must match backend
  - Copy the value from backend's NEXTAUTH_SECRET
  - Both services MUST have identical value

Auto-set:
- [x] NODE_ENV (production)

## Deployment Order

1. **Backend first**
   - Wait for it to fully deploy
   - Note the URL
   - Set REDIS environment variables
   - Set FRONTEND_URL (you can use the Render-provided URL before custom domain)

2. **Frontend second**
   - May fail initially if env vars not set
   - Set NEXTAUTH_URL and NEXTAUTH_SECRET
   - Verify NEXT_PUBLIC_API_URL points to backend
   - Trigger manual redeploy

## Quick Verification

After both are deployed, test:

```bash
# Backend health check
curl https://your-backend-url.onrender.com/api

# Should return API information
```

```bash
# Frontend health check
curl https://your-frontend-url.onrender.com

# Should return HTML
```

## Common Mistakes

- ❌ Forgetting to set REDIS variables → Backend will crash
- ❌ NEXTAUTH_SECRET mismatch → Auth won't work
- ❌ NEXT_PUBLIC_API_URL not set → Frontend build fails
- ❌ Including protocol in REDIS_HOST (redis://) → Connection fails
- ❌ Wrong FRONTEND_URL → CORS errors

## Need Help?

Check `RENDER_DEPLOYMENT.md` for detailed troubleshooting steps.

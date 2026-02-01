# Redis TLS Connection Fix for Upstash

## The Problem

Backend logs showed:
```
Redis Client Error SocketClosedUnexpectedlyError: Socket closed unexpectedly
```

### Root Cause
Upstash Redis requires **TLS (encrypted) connections**, but the backend Redis client wasn't configured to use TLS.

## The Fix

### 1. Updated Redis Service Code

Added TLS configuration to `backend/src/common/redis/redis.service.ts`:

```typescript
socket: {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  // Enable TLS for production/Upstash Redis
  tls: process.env.NODE_ENV === 'production' || process.env.REDIS_PASSWORD ? true : undefined,
}
```

This automatically enables TLS when:
- Running in production mode (`NODE_ENV=production`)
- Or when a Redis password is set (indicates cloud Redis like Upstash)

### 2. Update Environment Variables in Render

Go to your **myanime-backend** service in Render:

1. Click **"Environment"** in the left sidebar
2. Find **REDIS_PORT**
3. Change the value from `6379` to `6380`
   - Upstash uses port **6380** for TLS connections
   - Port 6379 is the non-TLS port (not supported by Upstash)
4. Click **"Save Changes"**

### 3. Verify Your Upstash Redis Settings

In your Upstash dashboard, you should see something like:

```
Endpoint: amazing-shark-12345.upstash.io
Port: 6380
Password: your-password-here
```

Make sure:
- ✅ REDIS_HOST = `amazing-shark-12345.upstash.io` (your actual endpoint)
- ✅ REDIS_PORT = `6380` (TLS port)
- ✅ REDIS_PASSWORD = your actual password

## What You Need to Do NOW

### Step 1: Commit and Push the Code Fix

```bash
git add backend/src/common/redis/redis.service.ts REDIS_TLS_FIX.md
git commit -m "Fix Redis TLS configuration for Upstash compatibility"
git push
```

### Step 2: Update REDIS_PORT in Render

1. Go to https://dashboard.render.com
2. Click on **myanime-backend**
3. Click **Environment** tab
4. Find **REDIS_PORT**
5. Change value to: `6380`
6. Click **Save Changes**

### Step 3: Redeploy

Render will automatically redeploy after you save the environment changes.

Watch the logs - you should see:
```
✅ Redis connected
```

Without any more "Socket closed unexpectedly" errors!

## How to Get Your Upstash Redis Details

If you haven't set up Upstash Redis yet:

1. Go to https://upstash.com/
2. Sign in / Sign up (free tier available)
3. Click **"Create Database"**
4. Choose **Redis**
5. Select a region close to your Render region (Oregon)
6. Click **Create**

Once created, you'll see:
- **Endpoint** → Copy to REDIS_HOST
- **Port** → Should be 6380 → Set in REDIS_PORT
- **Password** → Copy to REDIS_PASSWORD

## Verification

After redeployment, check the backend logs:

### Success:
```
✅ Redis connected
```

### Still Failing:
If you still see errors, check:
1. REDIS_HOST is correct (no `redis://` prefix, just the hostname)
2. REDIS_PORT is `6380`
3. REDIS_PASSWORD is correct
4. Your Upstash database is active

## Why TLS?

**Security**: TLS encrypts the connection between your backend and Redis
**Upstash Requirement**: Upstash only accepts TLS connections for security
**Production Best Practice**: Always use encrypted connections in production

## Local Development

For local development without Upstash:
- The code automatically uses non-TLS when `NODE_ENV` is not "production"
- Local Redis (via Docker) runs on port 6379 without TLS
- No changes needed to your docker-compose.yml

---

**This fix enables secure TLS connections to Upstash Redis!** 🔒

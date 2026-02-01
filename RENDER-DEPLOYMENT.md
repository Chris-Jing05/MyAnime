# Deploy MyAnime to Render

Complete guide for deploying MyAnime to Render.com (free tier available).

## Why Render?

- ✅ **Free tier** for side projects
- ✅ **PostgreSQL included** (free tier: 1GB storage)
- ✅ **Automatic deployments** from GitHub
- ✅ **SSL certificates** included
- ✅ **Easy setup** with render.yaml blueprint
- ✅ **No credit card** required for free tier

## Prerequisites

1. **GitHub Account** - Your code must be on GitHub
2. **Render Account** - Sign up at https://render.com (free)
3. **Upstash Account** - For Redis (https://upstash.com - free tier)

---

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/MyAnime.git
git branch -M main
git push -u origin main
```

### 1.2 Generate Secrets

```bash
# Run the secret generator
chmod +x scripts/generate-secrets.sh
./scripts/generate-secrets.sh
```

**Save these secrets** - you'll need them for environment variables!

---

## Step 2: Set Up Redis (Upstash)

Since Render's free tier doesn't include Redis, use Upstash:

1. Go to https://upstash.com and sign up
2. Click **"Create Database"**
3. Name it `myanime-redis`
4. Choose **free tier** and nearest region
5. Click **"Create"**

6. Copy these values (you'll need them later):
   - **Endpoint** (e.g., `usw1-happy-firefly-12345.upstash.io`)
   - **Port** (usually `6379`)
   - **Password** (from the connection details)

---

## Step 3: Deploy to Render

### Option A: Using Blueprint (Recommended)

1. Go to https://render.com/dashboard

2. Click **"New" → "Blueprint"**

3. Connect your GitHub repository

4. Render will detect `render.yaml` and show:
   - ✅ myanime-backend (Web Service)
   - ✅ myanime-frontend (Static Site)
   - ✅ myanime-postgres (PostgreSQL Database)

5. Click **"Apply"** to create all services

⚠️ **Important**: The initial deployment will fail because environment variables aren't set yet. That's normal!

### Option B: Manual Setup

If you prefer manual setup:

#### 3.1 Create PostgreSQL Database

1. Click **"New" → "PostgreSQL"**
2. Name: `myanime-postgres`
3. Database: `myanime`
4. User: `myanime`
5. Region: Choose closest to you
6. Plan: **Free**
7. Click **"Create Database"**

8. **Copy the "Internal Database URL"** (starts with `postgresql://`)

#### 3.2 Create Backend Service

1. Click **"New" → "Web Service"**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `myanime-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**:
     ```
     cd backend && npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```
     cd backend && npx prisma migrate deploy && npm run start:prod
     ```
   - **Plan**: Free

4. Click **"Advanced"** and add environment variables (see Step 4)

5. Click **"Create Web Service"**

#### 3.3 Create Frontend Service

1. Click **"New" → "Static Site"**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `myanime-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**:
     ```
     npm install && npm run build
     ```
   - **Publish Directory**: `.next`
   - **Plan**: Free

4. Add environment variables (see Step 4)

5. Click **"Create Static Site"**

---

## Step 4: Configure Environment Variables

### Backend Environment Variables

Go to your backend service → **Environment** tab and add:

```bash
# Database (auto-filled if using blueprint)
DATABASE_URL=postgresql://...  # From your Render PostgreSQL database

# Redis (from Upstash)
REDIS_HOST=usw1-happy-firefly-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# JWT & Auth (from your generated secrets)
JWT_SECRET=your-generated-jwt-secret-32-chars-minimum
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=your-generated-nextauth-secret-32-chars-minimum

# API Configuration
NODE_ENV=production
PORT=4000
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# External APIs
ANILIST_API_URL=https://graphql.anilist.co
FILLERLIST_API_URL=https://www.animefillerlist.com/api
```

**Important**: After frontend deploys, come back and add:
```bash
NEXTAUTH_URL=https://your-frontend.onrender.com
```

### Frontend Environment Variables

Go to your frontend service → **Environment** tab and add:

```bash
# Backend API (use your backend URL)
NEXT_PUBLIC_API_URL=https://myanime-backend.onrender.com/api

# Frontend URL (will be your frontend URL)
NEXTAUTH_URL=https://myanime-frontend.onrender.com

# NextAuth Secret (MUST match backend)
NEXTAUTH_SECRET=your-generated-nextauth-secret-32-chars-minimum
```

---

## Step 5: Deploy & Verify

### 5.1 Trigger Deployment

After adding environment variables:

1. Go to **backend service** → Click **"Manual Deploy" → "Deploy latest commit"**
2. Go to **frontend service** → Click **"Manual Deploy" → "Deploy latest commit"**

### 5.2 Monitor Build Logs

Watch the logs for:
- ✅ Dependencies installing
- ✅ Prisma generating client
- ✅ Build succeeding
- ✅ Migrations running
- ✅ Server starting

### 5.3 Update NEXTAUTH_URL

Once both services are deployed:

1. Note your frontend URL: `https://myanime-frontend.onrender.com`
2. Go to **backend environment variables**
3. Update `NEXTAUTH_URL` to your frontend URL
4. **Redeploy backend**

### 5.4 Test Your Deployment

Run the verification script:

```bash
./scripts/verify-deployment.sh \
  https://myanime-backend.onrender.com \
  https://myanime-frontend.onrender.com
```

Or test manually:
- Visit frontend URL
- Try registering an account
- Add an anime to your list
- Test episode tracking

---

## Step 6: Set Up Custom Domain (Optional)

### For Frontend

1. Go to frontend service → **Settings** → **Custom Domain**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `myanime.com`)
4. Follow DNS instructions to add:
   - `CNAME` record pointing to Render

### For Backend

1. Go to backend service → **Settings** → **Custom Domain**
2. Add subdomain (e.g., `api.myanime.com`)
3. Update DNS with `CNAME` record

### Update Environment Variables

After adding custom domains:

**Backend:**
```bash
NEXTAUTH_URL=https://myanime.com  # Your custom frontend domain
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://api.myanime.com/api  # Your custom backend domain
NEXTAUTH_URL=https://myanime.com
```

Redeploy both services.

---

## Troubleshooting

### Build Fails: "Cannot find module '@prisma/client'"

**Solution**: Make sure build command includes `npx prisma generate`

```bash
cd backend && npm install && npx prisma generate && npm run build
```

### Backend Error: "Can't reach database"

**Solution**:
1. Check `DATABASE_URL` is set correctly
2. Use the **Internal Database URL** from Render PostgreSQL
3. Ensure backend and database are in same region

### Frontend Can't Connect to Backend

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` is set to backend URL
2. Make sure URL includes `/api` at the end
3. Verify backend is deployed and running

### Authentication Errors

**Solution**:
1. Ensure `NEXTAUTH_SECRET` matches exactly on frontend and backend
2. Check `NEXTAUTH_URL` is set to your frontend URL (not backend!)
3. Verify JWT_SECRET is set on backend

### Redis Connection Failed

**Solution**:
1. Double-check Upstash credentials
2. Ensure `REDIS_PASSWORD` is set
3. Verify endpoint format (no `https://` prefix)

### "Free instance will spin down with inactivity"

**Note**: Render's free tier spins down after 15 minutes of inactivity.
- First request after spin-down takes ~1 minute to wake up
- This is normal for free tier
- Upgrade to paid plan for always-on service

---

## Cost Breakdown

### Free Tier (Perfect for Getting Started)

| Service | Free Tier Limits | Paid Alternative |
|---------|------------------|------------------|
| **Backend** | 750 hours/month, spins down after 15min | $7/month - always on |
| **Frontend** | 100GB bandwidth/month | $1/month per 100GB |
| **PostgreSQL** | 1GB storage, 90 days data retention | $7/month - 10GB |
| **Upstash Redis** | 10K commands/day, 256MB storage | $0.20 per 100K commands |

**Total Free**: $0/month (with usage limits)
**Total Paid**: ~$15/month (for production use)

---

## Automatic Deployments

Render automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Render automatically:
# 1. Detects the push
# 2. Runs build
# 3. Deploys new version
# 4. Zero-downtime deployment
```

---

## Environment Management

### Development
```bash
npm run dev  # Local development
```

### Staging (Optional)
Create a separate Render service:
- Deploy from `staging` branch
- Use separate database
- Test before production

### Production
- Deploy from `main` branch
- Monitor logs via Render dashboard
- Set up alerts for failures

---

## Monitoring & Logs

### View Logs

1. **Render Dashboard** → Your service → **Logs** tab
2. Real-time logs show:
   - Build output
   - Server logs
   - Error messages
   - Database queries (if enabled)

### Health Checks

Render automatically monitors `/api` endpoint:
- Checks every 30 seconds
- Alerts if service is down
- Shows uptime statistics

### Metrics

Free tier includes:
- CPU usage
- Memory usage
- Bandwidth usage
- Response times

---

## Scaling Considerations

When your app grows:

### Database
- Upgrade to larger plan for more storage
- Enable connection pooling (PgBouncer)
- Add read replicas for better performance

### Backend
- Upgrade plan for always-on service
- Add more instances for horizontal scaling
- Enable auto-scaling based on CPU

### Redis
- Upgrade Upstash plan for more commands
- Use Redis Cluster for high availability

### Frontend
- Render auto-scales static sites
- Consider Cloudflare CDN for better performance

---

## Backup & Recovery

### Database Backups

Render automatically backs up PostgreSQL:
- **Free tier**: Daily backups, 7 days retention
- **Paid tier**: Daily backups, 90 days retention

### Manual Backup

```bash
# Download database backup
# Go to Render Dashboard → PostgreSQL → Backups → Download
```

### Restore from Backup

```bash
# In Render Dashboard → PostgreSQL → Backups → Restore
```

---

## Quick Commands Reference

### Generate Secrets
```bash
./scripts/generate-secrets.sh
```

### Verify Deployment
```bash
./scripts/verify-deployment.sh <BACKEND_URL> <FRONTEND_URL>
```

### Manual Deploy
```bash
# Push to trigger auto-deploy
git push origin main

# Or use Render Dashboard:
# Service → Manual Deploy → Deploy latest commit
```

### View Logs
```bash
# In Render Dashboard:
# Service → Logs tab → Real-time logs
```

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Upstash Docs**: https://docs.upstash.com
- **Render Community**: https://community.render.com
- **GitHub Issues**: Report issues in your repo

---

## Next Steps

After deployment:

1. ✅ Test all features
2. ✅ Sync episode data via admin page
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring/alerts
5. ✅ Share your app with friends!

---

**Your MyAnime app is now live on Render!** 🎉

Frontend: https://myanime-frontend.onrender.com
Backend: https://myanime-backend.onrender.com/api
API Docs: https://myanime-backend.onrender.com/api/docs

# MyAnime Deployment Guide

This guide covers deploying the MyAnime full-stack application to production.

## Architecture Overview

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: NestJS API deployed on Railway (or alternative)
- **Database**: PostgreSQL on Neon/Supabase
- **Cache**: Redis on Upstash

## Prerequisites

- GitHub repository with your code
- Accounts on deployment platforms:
  - [Vercel](https://vercel.com) (Frontend)
  - [Railway](https://railway.app) or [Render](https://render.com) (Backend)
  - [Neon](https://neon.tech) or [Supabase](https://supabase.com) (PostgreSQL)
  - [Upstash](https://upstash.com) (Redis)

---

## Option 1: Vercel + Railway (Recommended)

### Step 1: Set Up Database (Neon)

1. **Create PostgreSQL Database**
   - Go to [Neon](https://neon.tech) and create a free account
   - Create a new project
   - Copy the connection string (looks like `postgresql://user:pass@host/db`)

2. **Create Redis Instance**
   - Go to [Upstash](https://upstash.com) and create an account
   - Create a new Redis database
   - Copy the Redis URL and credentials

### Step 2: Deploy Backend to Railway

1. **Create Railway Project**
   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli

   # Login to Railway
   railway login
   ```

2. **Deploy via Railway Dashboard**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your MyAnime repository
   - Choose "backend" as the root directory

3. **Configure Environment Variables**

   Add these variables in Railway dashboard:
   ```bash
   # Database
   DATABASE_URL=postgresql://user:pass@host/db  # From Neon

   # Redis
   REDIS_HOST=your-upstash-host.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password  # If using Upstash

   # JWT Configuration
   JWT_SECRET=your-production-jwt-secret-min-32-chars
   JWT_EXPIRES_IN=7d

   # NextAuth (must match frontend)
   NEXTAUTH_SECRET=your-production-nextauth-secret-min-32-chars
   NEXTAUTH_URL=https://your-domain.vercel.app

   # API Configuration
   PORT=4000
   NODE_ENV=production

   # Rate Limiting
   THROTTLE_TTL=60
   THROTTLE_LIMIT=100

   # External APIs
   ANILIST_API_URL=https://graphql.anilist.co
   FILLERLIST_API_URL=https://www.animefillerlist.com/api
   ```

4. **Configure Build Settings**
   - Build Command: `cd backend && npm install && npx prisma generate && npm run build`
   - Start Command: `cd backend && npm run start:prod`
   - Root Directory: `/`

5. **Run Database Migrations**
   ```bash
   # After deployment, run migrations via Railway CLI or dashboard
   railway run npx prisma migrate deploy
   ```

6. **Get Backend URL**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Save this URL for frontend configuration

### Step 3: Deploy Frontend to Vercel

1. **Deploy via Vercel Dashboard**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `.next`

2. **Configure Environment Variables**

   Add these in Vercel dashboard:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-nextauth-secret-min-32-chars
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - You'll get a URL like: `https://your-app.vercel.app`

4. **Update Backend Environment**
   - Go back to Railway
   - Update `NEXTAUTH_URL` to match your Vercel URL
   - Redeploy backend if necessary

### Step 4: Configure Custom Domain (Optional)

**Vercel Frontend:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Railway Backend:**
1. Go to Settings → Domains
2. Add custom domain or use Railway's provided domain
3. Update `NEXT_PUBLIC_API_URL` in Vercel if using custom domain

---

## Option 2: All-in-One with Render

### Step 1: Set Up Database

Same as Option 1 - use Neon for PostgreSQL and Upstash for Redis

### Step 2: Deploy on Render

1. **Create Web Service for Backend**
   - Go to [Render](https://render.com)
   - New → Web Service
   - Connect your GitHub repository
   - Configure:
     - Name: `myanime-backend`
     - Root Directory: `backend`
     - Environment: `Node`
     - Build Command: `npm install && npx prisma generate && npm run build`
     - Start Command: `npm run start:prod`
     - Add environment variables (same as Railway above)

2. **Create Static Site for Frontend**
   - New → Static Site
   - Connect your GitHub repository
   - Configure:
     - Name: `myanime-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `frontend/.next`
     - Add environment variables

---

## Option 3: Docker Deployment (VPS/Cloud)

If you prefer deploying to a VPS (DigitalOcean, AWS, etc.):

### 1. Create Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: myanime
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/myanime
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 2. Deploy to VPS

```bash
# SSH into your server
ssh user@your-server-ip

# Clone repository
git clone https://github.com/yourusername/MyAnime.git
cd MyAnime

# Create production .env file
nano .env.production

# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 3. Set Up Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/myanime
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] Backend health check responds: `https://your-backend/api`
- [ ] Frontend loads correctly
- [ ] Authentication works (register/login)
- [ ] API requests from frontend to backend succeed
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] Rate limiting is active
- [ ] Database connection pool is configured
- [ ] Redis caching is working
- [ ] External APIs (AniList, FillerList) are accessible

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `REDIS_HOST` | Redis host | `localhost` or Upstash host |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (if required) | `your-password` |
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `NEXTAUTH_SECRET` | NextAuth secret (min 32 chars) | `your-nextauth-secret` |
| `NEXTAUTH_URL` | Frontend URL | `https://your-app.vercel.app` |
| `PORT` | Backend port | `4000` |
| `NODE_ENV` | Environment | `production` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.railway.app/api` |
| `NEXTAUTH_URL` | Frontend URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth secret (must match backend) | `your-nextauth-secret` |

## Generating Secrets

Use these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

## Monitoring & Logs

**Railway:**
- View logs in the Railway dashboard
- Set up log drains for external monitoring

**Vercel:**
- View logs in Vercel dashboard
- Real-time function logs available

**Render:**
- View logs in Render dashboard
- Set up external logging integrations

## Troubleshooting

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if database accepts connections from your deployment platform
- Ensure Prisma migrations are applied

### CORS Errors
- Verify frontend URL is in backend CORS whitelist
- Check `NEXTAUTH_URL` matches your frontend domain

### Authentication Issues
- Ensure `NEXTAUTH_SECRET` matches between frontend and backend
- Verify `JWT_SECRET` is set in backend
- Check cookie settings for production domains

### Build Failures
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility
- Review build logs for specific errors

## Scaling Considerations

- **Database**: Use connection pooling (PgBouncer) for high traffic
- **Redis**: Upgrade Upstash plan or use Redis Cluster
- **Backend**: Enable horizontal scaling on Railway/Render
- **Frontend**: Vercel auto-scales, consider Edge Functions for better performance
- **CDN**: Use Vercel's built-in CDN or add Cloudflare

## Cost Estimates (Free Tier)

- **Vercel**: Free for personal projects
- **Railway**: $5/month credit (should be enough for small apps)
- **Neon**: Free tier with 3GB storage
- **Upstash**: Free tier with 10K commands/day
- **Total**: ~$5/month (can run on free tier initially)

---

## Quick Deploy Commands

### Generate Production Secrets
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
```

### Test Production Build Locally
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

## Support

- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs
- Upstash: https://docs.upstash.com

---

**Ready to deploy!** Choose your preferred option and follow the steps above.

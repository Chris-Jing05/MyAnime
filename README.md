# MyAnime

A full-stack anime tracking and recommendation platform built with Next.js, NestJS, PostgreSQL, Redis, and TypeScript.

## Features

- **Anime Browsing**: Search and discover anime using AniList API integration
- **Episode Tracking**: ✅ **FULLY IMPLEMENTED**
  - Click episodes to mark as watched
  - Visual progress bars and completion percentages
  - Continue Watching section on homepage
  - Filler episode indicators from FillerList API
  - Auto-status updates (WATCHING → COMPLETED)
  - Smart progress tracking with quick actions
- **User Lists**: Organize anime into watching, completed, plan-to-watch, and dropped lists
- **Personalized Recommendations**: Collaborative filtering-based recommendation system
- **Social Features**:
  - Clubs: Create and join communities
  - Reviews: Write and read anime reviews with voting
  - Activity Feed: Follow user activities and updates
- **User Profiles**: Track statistics and watch history

## Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **NextAuth.js** for authentication
- **React Query** for data fetching

### Backend
- **NestJS** framework
- **TypeScript**
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and sessions
- **JWT** authentication
- **WebSocket** for real-time updates

### Infrastructure
- **PostgreSQL** database
- **Redis** cache
- **Docker Compose** for development

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MyAnime
```

2. Install dependencies:
```bash
npm install
```

3. Start Docker services (PostgreSQL, Redis):
```bash
npm run docker:up
```

4. Setup environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
   - Configure your environment variables

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Project Structure

```
MyAnime/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── public/
├── backend/           # NestJS application
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── common/   # Shared utilities
│   │   └── prisma/   # Database schema
│   └── prisma/
└── docker-compose.yml
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services
- `npm run prisma:studio` - Open Prisma Studio

## API Documentation

API documentation is available at `http://localhost:4000/api/docs` when running the backend.

## License

MIT

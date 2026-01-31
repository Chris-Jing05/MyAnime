# Multi-stage Dockerfile for backend deployment
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Copy backend source
COPY backend ./backend

# Generate Prisma Client and build
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --production
RUN cd backend && npm install --production

# Copy built application from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod"]

# Build stage
FROM node:20-bullseye AS builder
WORKDIR /app

# Frontend dependencies and build
COPY web/package*.json ./web/
RUN cd web && npm ci
COPY web ./web
RUN cd web && npm run build

# Backend dependencies and prisma client
COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server ./server
RUN cd server && npx prisma generate

# Copy frontend build into backend public/
RUN mkdir -p ./server/public && cp -r ./web/dist/* ./server/public/

# Runtime stage
FROM node:20-bullseye
ENV NODE_ENV=production
WORKDIR /app/server

# Copy built server
COPY --from=builder /app/server ./

# Railway sets PORT; fallback
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]


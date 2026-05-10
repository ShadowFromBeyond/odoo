# Traveloop

Traveloop is a full-stack MVP for personalized multi-city travel planning. It uses React, TypeScript, TailwindCSS, Zustand, React Hook Form, Zod, Framer Motion, Express, Prisma, PostgreSQL, JWT auth, and bcrypt.

## Architecture

```txt
client React UI
  -> client/src/services API layer
server Express routes/controllers
  -> server/src/services business logic
  -> Prisma ORM
  -> PostgreSQL
```

## Setup

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

## Environment

Server:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/traveloop?schema=public"
JWT_SECRET="replace-with-a-long-secret"
CLIENT_URL="http://localhost:5173"
PORT=4000
```

Client:

```env
VITE_API_URL="http://localhost:4000/api"
```

## Deployment Targets

- Frontend: Vercel or Netlify from `client`
- Backend: Render or Railway from `server`
- Database: Supabase or Neon PostgreSQL

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`
- `POST /api/trips/:id/stops`
- `PUT /api/trips/:id/stops/reorder`
- `POST /api/trips/:id/activities`
- `PUT /api/trips/:id/budget`
- `POST /api/trips/:id/checklist`
- `PATCH /api/trips/:id/checklist/:itemId`
- `DELETE /api/trips/:id/checklist/:itemId`
- `POST /api/trips/:id/notes`
- `PUT /api/trips/:id/notes/:noteId`
- `DELETE /api/trips/:id/notes/:noteId`
- `POST /api/trips/:id/share`
- `GET /api/public/:slug`
- `GET /api/explore/cities`
- `GET /api/explore/activities`
- `GET /api/admin/analytics`

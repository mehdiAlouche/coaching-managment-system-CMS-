# Coaching Management System

A two-part application for running a multi-tenant coaching platform:
- Backend: Node.js + Express + TypeScript + MongoDB + JWT auth.
- Frontend: React + TypeScript + Vite + TanStack Router/Query, Radix UI/Shadcn.

## Repository Layout
- [Backend](Backend) — API server, MongoDB models, auth, RBAC, uploads.
- [Frontend](Frontend) — web app with dashboards, sessions, payments, goals.

## Prerequisites
- Node.js 18+ (npm included)
- MongoDB 6+ (local or hosted)

## Quick Start
1) Clone and enter the repo
```bash
git clone https://github.com/mehdiAlouche/coaching-managment-system-CMS-.git
cd coaching-managment-system-CMS-
```

2) Set up environment files
- Backend: copy [Backend/env.example](Backend/env.example) to `Backend/.env` and fill values (see Env Vars below).
- Frontend: copy [Frontend/env.example](Frontend/env.example) to `Frontend/.env` and set `VITE_API_URL` to your backend URL.

3) Install dependencies
```bash
cd Backend && npm install
cd ../Frontend && npm install
```

4) Run locally (two terminals)
- Backend (port 5000 by default):
```bash
cd Backend
npm run dev
```
- Frontend (Vite, port 5173 by default):
```bash
cd Frontend
npm run dev
```

## Backend (API)
- Entry: [Backend/src/main.ts](Backend/src/main.ts)
- Config: [Backend/src/config](Backend/src/config)
- Routes: [Backend/src/routes](Backend/src/routes)
- Models/services: [Backend/src/modules](Backend/src/modules)
- Uploads: [Backend/uploads](Backend/uploads)

**Core scripts**
- `npm run dev` — ts-node-dev with hot reload
- `npm run build` — compile to `dist/`
- `npm start` — run compiled app
- `npm run seed` — run sample seeder
- `npm run typecheck` — type-only build

**Environment variables (Backend/.env)**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cms
JWT_SECRET=change-me
```

## Frontend (Web App)
- Entry: [Frontend/src/main.tsx](Frontend/src/main.tsx)
- Routes/layouts: [Frontend/src/routes](Frontend/src/routes) and [Frontend/src/routeTree.gen.ts](Frontend/src/routeTree.gen.ts)
- UI components: [Frontend/src/components](Frontend/src/components)
- API client & endpoints: [Frontend/src/services](Frontend/src/services)
- Auth context: [Frontend/src/context/AuthContext.tsx](Frontend/src/context/AuthContext.tsx)

**Core scripts**
- `npm run dev` — start Vite dev server
- `npm run build` — type-check then build
- `npm run preview` — preview production build
- `npm run lint` — ESLint
- `npm run routes:generate` — regenerate TanStack route types

**Environment variables (Frontend/.env)**
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_ENV=development
```

## Useful Paths
- API examples: [Backend/src/test-rest/user.rest](Backend/src/test-rest/user.rest)
- PDF template: [Backend/src/templates/invoice.html](Backend/src/templates/invoice.html)
- Seed script: [Backend/src/seeds/seed.ts](Backend/src/seeds/seed.ts)
- Dashboard components: [Frontend/src/components/dashboard](Frontend/src/components/dashboard)
- Charts: [Frontend/src/components/charts](Frontend/src/components/charts)

## Deployment Notes
- Set proper env vars on both sides (no `.env` files committed).
- Build backend with `npm run build` and start `node dist/main.js`.
- Build frontend with `npm run build`; serve `Frontend/dist` via a static host or CDN, pointing `VITE_API_URL` at the deployed backend.

## Next Steps
- Implement full auth flows (registration/login, password reset) and connect to real MongoDB.
- Add validation (Zod) on request bodies and strengthen error handling/logging.
- Wire frontend API calls to backend endpoints; add loading/error states.
- Add tests (unit/integration) for critical modules.

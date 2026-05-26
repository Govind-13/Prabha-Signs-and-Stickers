# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo Layout

The actual project lives one directory below this file's parent: `Prabha-Signs-and-Stickers-master/Prabha-Signs-and-Stickers-master/`. The outer directory is just an extracted-archive wrapper — all commands below assume cwd is the inner directory.

This is a **two-package monorepo with no workspace tooling**: the frontend `package.json` is at the root and the backend has its own `package.json` in `backend/`. They are installed and run independently.

## Commands

### Frontend (root)
- `npm install` — install Vite/React deps
- `npm run dev` — start Vite on `0.0.0.0:3000`
- `npm run build` — production build to `dist/`
- `npm run lint` — typecheck only (`tsc --noEmit`); there is no ESLint config
- `npm run preview` — serve the built bundle

### Backend (`cd backend`)
- `npm install`
- `node server.js` — start API; there is **no `dev` script** in `backend/package.json` despite what the README claims. Add one or run `node server.js` directly. Port defaults to `5000` but respects `process.env.PORT` (Render assigns dynamically — do not hard-code `PORT` in `backend/.env`, see README).
- `npm test` — placeholder; no tests exist.

There is no test runner, linter, or formatter configured for the backend.

## Architecture

### Two services, one repo
- **Frontend**: React 19 + Vite 6 + TypeScript + Tailwind v4 (via `@tailwindcss/vite`), deployed to **Vercel**. SPA-only — `vercel.json` rewrites every path to `index.html`.
- **Backend**: Express 5 + Mongoose 9 + MongoDB Atlas, deployed to **Render** via `backend/Dockerfile`. Cloudinary handles image storage; `multer-storage-cloudinary` streams uploads straight to Cloudinary so no images touch the backend disk.

The two are joined only by `VITE_API_URL` (build-time env var on Vercel) consumed in [src/config.ts](src/config.ts). The fallback URL in that file is the **production Render URL** — local dev without `VITE_API_URL` set will hit prod.

### Backend request flow
`server.js` mounts three routers under `/api`:
- `/api/admin` — `POST /login` issues a 30-day JWT; `POST /register` is an unprotected bootstrap endpoint (README flags it as "remove in production" — it is still present).
- `/api/stickers` — public `GET`; `POST` and `DELETE :id` require `Bearer` token (verified by [backend/middleware/auth.js](backend/middleware/auth.js)). `POST` runs the file through `multer` → Cloudinary, then persists `{title, imageUrl, publicId, category}` in Mongo. `DELETE` also removes the Cloudinary asset by `publicId`.
- `/api/settings` — generic key/value store. Currently used only for the `headerAnimation` setting (values: `fade` | `slide` | `bounce`) that controls the landing page header animation.

### Frontend routing
[src/App.tsx](src/App.tsx) defines three routes: `/` (LandingPage), `/admin-login` (Login), `/dashboard` (Dashboard). The dashboard is gated client-side by a `localStorage.adminToken` check — there is no protected-route component, each page checks the token itself.

The landing page fetches `/api/settings` on mount to pick which Framer-Motion animation to apply to the header — this is the only "CMS-like" wiring between admin settings and the public site.

## Environment variables

### Backend (`backend/.env`)
- `MONGO_URI` — if missing the server still starts but logs a warning and all DB routes will 500.
- `JWT_SECRET` — required; `auth.js` will throw on every request without it.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — required for sticker uploads.
- `PORT` — **do not set** in production (Render injects it). The Dockerfile uses `EXPOSE 0-65535` specifically so Render's port detection works.

### Frontend
- `VITE_API_URL` — set on Vercel to the Render backend's `/api` base.
- `GEMINI_API_KEY` — wired through `vite.config.ts` into `process.env.GEMINI_API_KEY` at build time. `@google/genai` is a dependency but no source file imports it yet; this is leftover AI Studio scaffolding.

### Vite dev quirks
`vite.config.ts` disables HMR and file watching when `DISABLE_HMR=true` — this is for AI Studio agent editing and should be left alone unless you understand why.

## Conventions worth knowing

- Backend is **CommonJS** (`"type": "commonjs"`); frontend is **ESM** (`"type": "module"`). Don't paste imports across.
- Tailwind v4 is configured via the `@tailwindcss/vite` plugin — there is no `tailwind.config.js`. Custom design tokens (`bg-surface`, `text-primary`, `bg-secondary-container`, etc.) come from the Material-style theme defined in `src/index.css`.
- Path alias `@/*` resolves to the project root (see `tsconfig.json` and `vite.config.ts`).
- The admin token is stored in `localStorage` and sent as `Authorization: Bearer <token>`. There is no refresh flow — tokens last 30 days then users re-login.

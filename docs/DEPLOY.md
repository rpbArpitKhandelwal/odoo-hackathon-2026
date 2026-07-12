# Deploying TransitOps (Render.com, free tier)

One web service serves both the API and the built React app (same origin, no CORS),
plus one managed PostgreSQL. Defined in [render.yaml](../render.yaml).

## Steps (~10 minutes + ~8 min first build)

1. Go to https://render.com → **Sign in with GitHub** (use the account that owns
   this repo, or one with access) and authorize Render for the repo.
2. Dashboard → **New → Blueprint** → select `odoo-hackathon-2026` → branch `main` → **Apply**.
   Render reads `render.yaml` and provisions:
   - `transitops-db` — free PostgreSQL (DATABASE_URL wired in automatically)
   - `transitops` — Node web service (JWT_SECRET auto-generated)
3. Watch the first deploy in the service's **Logs** tab. It will:
   `npm install` both apps → `prisma generate` → build the frontend →
   `prisma migrate deploy` (creates tables) → seed demo data → start the server.
4. Open the URL Render gives you (e.g. `https://transitops.onrender.com`) and log in
   with the demo accounts (`manager@transitops.com` / `Password@123`).

## Free-tier gotchas

- **The service sleeps after ~15 min idle; the first request takes ~50 s to wake.**
  Open the URL 5 minutes before the demo to warm it up. Keep the local run as the
  primary demo; the live URL is the bonus.
- The free Postgres instance expires after 30 days — irrelevant for the hackathon.
- The seed script is idempotent (upserts), so restarts never duplicate data.

## Redeploying

Every push to `main` auto-deploys. Manual: service page → **Manual Deploy → Deploy latest commit**.

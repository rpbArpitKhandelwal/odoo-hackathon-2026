# TransitOps — Smart Transport Operations Platform

Odoo Hackathon project. **React + Express + PostgreSQL (Prisma).**
Read [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) first — it has the ERD, API spec, business-rule mapping, 8-hour plan, and demo script.

## One-time setup (each member, ~5 minutes)

Prereqs: Node 18+, PostgreSQL (installed at `C:\Program Files\PostgreSQL\18` on this machine).

```powershell
# 1. Create the database (enter your postgres password when prompted)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE transitops;"

# 2. Backend
cd backend
copy .env.example .env        # then EDIT .env: put your real postgres password in DATABASE_URL
npm install
npx prisma migrate dev --name init   # creates all tables
npm run db:seed                      # demo users, vehicles, drivers, one completed trip
npm run dev                          # API on http://localhost:5000

# 3. Frontend (second terminal)
cd frontend
npm install
npm run dev                          # app on http://localhost:5173
```

## Demo logins (password: `Password@123`)

| Role | Email |
|---|---|
| Fleet Manager | manager@transitops.com |
| Driver | driver@transitops.com |
| Safety Officer | safety@transitops.com |
| Financial Analyst | analyst@transitops.com |

## Where things live

```
backend/
  prisma/schema.prisma        ← the ERD in code (show this to judges)
  prisma/seed.js              ← demo data incl. edge cases (expired license, suspended driver)
  src/middleware/auth.js      ← JWT + RBAC (authorize('FLEET_MANAGER', ...))
  src/services/trip.service.js← ALL mandatory business rules, in DB transactions ★
  src/routes/*.routes.js      ← one file per module
frontend/
  src/pages/Vehicles.jsx      ← finished CRUD page: copy this pattern
  src/pages/{Drivers,Trips,Maintenance,Expenses,Reports}.jsx ← TODO stubs with
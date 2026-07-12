# TransitOps — System Design

> Smart Transport Operations Platform · Odoo Hackathon (8 hours)
> Stack: **React (Vite) + Node.js/Express + PostgreSQL (Prisma ORM)**

---

## 1. Architecture (3-tier)

```
┌─────────────────────┐     JSON / REST      ┌──────────────────────┐      SQL       ┌──────────────┐
│  React SPA (Vite)   │ ──────────────────►  │  Express API server  │ ─────────────► │ PostgreSQL 18│
│  - Auth context/JWT │ ◄──────────────────  │  - JWT auth + RBAC   │ ◄───────────── │  (local DB)  │
│  - Pages per module │      port 5173       │  - Service layer     │   via Prisma   │              │
└─────────────────────┘                      │  - Business rules in │                └──────────────┘
                                             │    DB TRANSACTIONS   │
                                             └──────────────────────┘
                                                    port 5000
```

**Why this wins points:**
- Local PostgreSQL, hand-built REST API — exactly what the judges asked for (no Firebase/Supabase).
- Business rules live in a **service layer inside DB transactions** — status transitions are atomic (a dispatch can never half-succeed and leave a driver On Trip with no trip).
- Uniqueness (registration number, email, license number) enforced at the **database level**, not just the UI.

## 2. Database Design (ERD)

```
Role 1──* User 1──* Trip *──1 Vehicle 1──* MaintenanceLog
                    │              │
                    *──1 Driver    ├──* FuelLog (optional FK → Trip)
                                   └──* Expense (optional FK → Trip)
```

| Table | Key columns | Notes |
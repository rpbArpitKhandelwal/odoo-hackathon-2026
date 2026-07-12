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
|---|---|---|
| roles | name (unique) | FLEET_MANAGER, DRIVER, SAFETY_OFFICER, FINANCIAL_ANALYST |
| users | email (unique), password_hash, role_id FK | bcrypt-hashed passwords |
| vehicles | reg_no (**unique**), name, type, max_load_kg, odometer_km, acquisition_cost, region, status | status: AVAILABLE / ON_TRIP / IN_SHOP / RETIRED |
| drivers | license_no (unique), license_category, license_expiry, contact, safety_score, status | status: AVAILABLE / ON_TRIP / OFF_DUTY / SUSPENDED |
| trips | vehicle_id FK, driver_id FK, source, destination, cargo_weight_kg, planned_distance_km, status, start/end_odometer_km, revenue, created_by FK | status: DRAFT / DISPATCHED / COMPLETED / CANCELLED |
| maintenance_logs | vehicle_id FK, title, cost, status (OPEN/CLOSED), opened_at, closed_at | opening one flips vehicle → IN_SHOP |
| fuel_logs | vehicle_id FK, trip_id FK?, liters, cost, filled_at | trip link enables per-trip efficiency |
| expenses | vehicle_id FK, trip_id FK?, category, amount, spent_at | tolls, parking, fines, misc |

Money/weight columns are `DECIMAL`, never `FLOAT` (mention this to judges — it's a classic DB-design point).

## 3. State Machines (the heart of the evaluation)

**Trip:** `DRAFT → DISPATCHED → COMPLETED`, and `DRAFT|DISPATCHED → CANCELLED`. No other transition is accepted by the API.

**Vehicle:** `AVAILABLE ⇄ ON_TRIP` (dispatch/complete), `AVAILABLE ⇄ IN_SHOP` (maintenance open/close), `→ RETIRED` (terminal).

**Driver:** `AVAILABLE ⇄ ON_TRIP`, plus manual `OFF_DUTY` / `SUSPENDED`.

### Mandatory business rules → where enforced

| Rule | Enforcement |
|---|---|
| Registration number unique | DB `UNIQUE` constraint + API 409 error |
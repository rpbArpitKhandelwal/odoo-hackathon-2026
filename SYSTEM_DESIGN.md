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

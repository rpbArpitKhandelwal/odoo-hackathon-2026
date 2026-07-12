<div align="center">
  <h1>🚚 TransitOps</h1>
  <p><strong>Smart Transport Operations Platform</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  </p>
</div>

---

**TransitOps** is a comprehensive, full-stack fleet management solution built for the Odoo Hackathon. It is designed to handle complex transportation workflows, including dispatching, vehicle maintenance tracking, driver management, and financial analytics. 

By utilizing strict database constraints and atomic state machine transitions, TransitOps ensures high data integrity and a seamless operational experience.

## ✨ Key Features

- **Strict State Machine Architecture**: Complex workflows (like vehicle dispatches and maintenance) are handled atomically inside database transactions. A vehicle cannot be dispatched if it is currently `IN_SHOP` or already `ON_TRIP`.
- **Role-Based Access Control (RBAC)**: Distinct personas (`FLEET_MANAGER`, `DRIVER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`) ensure users only see and interact with data relevant to their role.
- **Graceful Error Handling**: Validation rules (e.g., overweight cargo, expired licenses, duplicate registration numbers) return clear, human-readable UI alerts.
- **Live KPI Dashboard**: Instant visibility into Fleet Utilization, Fuel Efficiency, Operational Costs, and Vehicle ROI, automatically tailored for the active user's role.

---

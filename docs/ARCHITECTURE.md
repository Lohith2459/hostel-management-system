# HOSTELSPHERE Architecture Documentation

## 1. System Overview

HostelSphere is a multi-tenant, role-based Hostel Management SaaS platform engineered for colleges and universities. The system provides operational automation across hostel infrastructure, student residency, warden administration, safety compliance, mess management, and financial reconciliation.

---

## 2. Architectural Boundaries & Decoupling

The codebase strictly enforces the separation of concerns between client presentation and server-side business logic.

```
hostelsphere/
│
├── frontend/           # Pure Client-side SPA (React, TypeScript, Vite, Tailwind CSS)
├── backend/            # Express.js REST API with Prisma ORM & PostgreSQL
├── docs/               # Architecture, Database, API, and Development guides
├── docker-compose.yml  # Local services (PostgreSQL, etc.)
├── .gitignore          # Strict exclusion of secrets and build artifacts
└── README.md           # Project onboarding and phase tracking
```

### Decoupling Rules:
- The frontend **never** connects directly to PostgreSQL or Prisma.
- The frontend contains **zero** database credentials, JWT secrets, or backend API keys.
- Role information supplied by the frontend is treated as untrusted UI hints. All authorization decisions are made server-side via verified JWT tokens against the database.
- Internal database IDs and sensitive user metadata (such as password hashes) are never leaked in API payloads.

---

## 3. Backend Layered Architecture

The backend adheres to a strict 6-tier layered architecture:

```
Request
  │
  ▼
[ 1. Route Layer ]        Defines HTTP method, path, and maps to middlewares/controllers.
  │
  ▼
[ 2. Middleware Layer ]   Authentication (JWT), Authorization (RBAC), Rate limiting, Zod validation.
  │
  ▼
[ 3. Controller Layer ]   Parses HTTP request, orchestrates service call, returns standard API response.
  │
  ▼
[ 4. Service Layer ]      Implements pure business rules, transaction boundaries, domain logic.
  │
  ▼
[ 5. Repository Layer ]   Encapsulates all database queries and data mutations.
  │
  ▼
[ 6. Data Access Layer ]  Prisma ORM connected to PostgreSQL.
```

### Layer Responsibilities:
1. **Controllers**: Controllers MUST NOT contain raw SQL, direct Prisma queries, or complex business math. They extract request parameters, call services, and wrap the response in the unified response envelope.
2. **Services**: All business logic (e.g. room allocation constraints, fee status updates, meal wastage calculations) resides exclusively in services. Services throw typed domain errors that controllers or global error middlewares map to safe HTTP statuses.
3. **Repositories**: Repositories isolate Prisma queries, enabling easy testing and ensuring database query optimizations remain centralized.

---

## 4. Role-Based Access Control (RBAC)

The application supports three primary roles:

| Role | Access Scope | Key Capabilities |
|---|---|---|
| **ADMIN** | System-Wide | Manage Hostels, Blocks, Floors, Rooms, Beds, Wardens, System Settings, Audits, Fee Structures. |
| **WARDEN** | Assigned Hostel(s) | Daily attendance, Leave/Outpass approvals, Complaints resolution, Mess oversight, Visitor logs. |
| **STUDENT** | Self-Service | Profile view, Room details, Attendance records, Leave requests, Complaint filing, Fee payments, Receipts. |

### RBAC Security Enforcement:
- Public signup is restricted to Student self-registration (and Warden registration where authorized by campus policy). **Admin signup is strictly prohibited via public endpoints.**
- Every protected route enforces an `authenticateJWT` middleware followed by `requireRole(['ADMIN', ...])`.
- Data isolation (preventing Insecure Direct Object References - IDOR) is enforced by scoping queries to `req.user.id` or verifying ownership in the Service layer before mutating resources.

---

## 5. Domain Invariants & Business Rules

### Room Allocation Rules
- A student cannot hold more than one ACTIVE room allocation at any time.
- Rooms designated under `MAINTENANCE` status cannot accept allocations.
- A bed can only be occupied if `isOccupied` is false and belongs to the selected room.
- Room allocations are executed inside an atomic database transaction (`prisma.$transaction`).
- Vacating or room transfer operations create historical allocation records with timestamps rather than deleting past residency data.

### Payment Simulation & Security
- Safe payment simulation is maintained until a real payment gateway (Stripe/Razorpay) is integrated.
- Only payments reaching `SUCCESS` status can generate official numbered receipts.
- Payment records contain immutable transaction hashes, receipts, and timestamps.

### Mess & Food Wastage Prediction
- The mess tracking subsystem records meals prepared, served, and consumed per shift (Breakfast, Lunch, Dinner).
- Prediction logic is decoupled into a dedicated service interface. Initial phases use statistical moving-average algorithms, designed with an interface ready to bridge to an external Python ML service in Phase 10 without breaking backend controllers.

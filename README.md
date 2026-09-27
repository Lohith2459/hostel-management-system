# HOSTELSPHERE

> Production-Quality Multi-Tenant Hostel Management SaaS for Higher Education Institutions.

HostelSphere is a modern, enterprise-ready web platform for managing collegiate residential halls, student bed allocations, warden workflows, safety compliance, daily attendance roll calls, leave/outpasses, dining & food wastage analytics, term fee accounting, and verified receipt generation with cryptographic tokens.

---

## Architecture Overview

```
hostelsphere/
│
├── frontend/             # React 18, TypeScript, Vite, Tailwind CSS v4
│   ├── src/
│   │   ├── components/   # Navbar, ReceiptModal, QRVerifyModal
│   │   ├── context/      # AuthContext, ThemeContext, ToastContext
│   │   ├── views/        # AdminDashboard, WardenDashboard, StudentDashboard, LoginView, SignupView
│   │   └── types/        # Strict API contracts & interfaces
│   └── tests/            # Frontend test suites
│
├── backend/              # Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
│   ├── prisma/
│   │   └── schema.prisma # 20 relational models, enums, compound unique keys, indexes
│   ├── src/
│   │   ├── controllers/  # Clean, thin request handlers returning unified JSON envelopes
│   │   ├── services/     # Pure business logic & transactional guarantees
│   │   ├── repositories/ # Isolated data access layer
│   │   ├── middleware/   # JWT authentication, RBAC authorization, Zod validation
│   │   ├── routes/       # Domain-specific REST routers
│   │   └── db/           # Transactional store with hashed seed data & relational integrity
│   └── tests/            # Vitest integration & security suites
│
├── docs/                 # Engineering Specifications & Architectural Documentation
│   ├── ARCHITECTURE.md   # Layered 6-tier architecture & RBAC design
│   ├── API.md            # REST API envelope and route specifications
│   ├── DATABASE.md       # PostgreSQL schema & entity relationship guide
│   └── DEVELOPMENT.md    # Local setup and contribution guide
│
├── docker-compose.yml    # PostgreSQL container configuration
├── README.md             # Project overview & phase-based roadmap
└── .gitignore            # Secret and artifact exclusion rules
```

---

## Core Roles & Capabilities

1. **ADMIN**: Full institutional jurisdiction over hostels, blocks, floors, rooms, beds, warden provisioning, financial policies, aggregate analytics, and campus-wide notices.
2. **WARDEN**: Hostel-specific operational duties including daily evening student attendance roll calls, leave/outpass approvals, maintenance complaint tracking, dining logs, and visitor gate logs.
3. **STUDENT**: Self-service residency portal for room & bed details, attendance tracking, outpass submissions, complaint logging, fee dues, safe payment simulation, and verifiable receipts.

---

## Strict Engineering Standards

- **Separation of Concerns**: Pure decoupling of client presentation and server business logic.
- **Layered Backend**: Route &rarr; Middleware &rarr; Controller &rarr; Service &rarr; Repository &rarr; Prisma &rarr; PostgreSQL.
- **Server-Authoritative RBAC**: Client role claims are treated as untrusted UI hints; permissions are verified against cryptographically signed JWTs and the database.
- **Zero Mock Policy**: Production metrics and statistics are never fabricated. If an endpoint has no data, the interface cleanly reports "Data not available".
- **Transactional Consistency**: Room allocations and financial transactions are guarded by atomic transactions to eliminate race conditions and overbooking.

---

## Phase-Based Development Roadmap

| Phase | Domain | Status | Scope & Deliverables |
|---|---|:---:|---|
| **PHASE 0** | **Project Foundation & Architecture** | Complete | Decoupled 6-tier backend, Vite/Tailwind frontend, documentation in `docs/`, environment templates, health check endpoints. |
| **PHASE 1** | **Database & Prisma ORM** | Complete | Production-grade `schema.prisma` with 20 relational models (Hostel, Block, Floor, Room, Bed, RoomAllocation, Attendance, LeaveRequest, Complaint, FoodMenu, FoodWastage, Fee, Payment, Expense, Visitor, Announcement, Notification). |
| **PHASE 2** | **Authentication & RBAC** | Complete | JWT issuance and verification, bcrypt hashing (10 rounds), `authenticateJWT` & `requireRole` middlewares. Public Admin signup forbidden; Student self-registration allowed. |
| **PHASE 3** | **Frontend Design System & Shell** | Complete | Tailwind CSS v4 with custom class-based dark mode (`@custom-variant dark`), responsive layout, Toast notification context, instant 1-click demo switcher. |
| **PHASE 4** | **Admin Management** | Complete | Real-time overview of hostels, blocks, rooms, bed occupancy rates, student/warden directories, and campus announcement broadcaster. |
| **PHASE 5** | **Warden Management** | Complete | Daily evening student attendance roll call, outpass reviews with parental notes, repair ticket triage, and guest visitor check-in/out. |
| **PHASE 6** | **Student Management & Portal** | Complete | Personalized residency portal: bed assignments, roommate info, attendance rate score, and outpass tracking. |
| **PHASE 7** | **Attendance & Leave/Outpass** | Complete | Batch attendance logging (`PRESENT`, `ABSENT`, `ON_LEAVE`), percentage calculation, outpass application with date validation and warden approval workflow. |
| **PHASE 8** | **Complaints & Visitors** | Complete | Category-based repair ticketing (`ELECTRICAL`, `PLUMBING`, `CARPENTRY`, `CLEANLINESS`, `FOOD`, `INTERNET`) with status progression and technician notes; gate visitor audit logs. |
| **PHASE 9** | **Food Management & Wastage** | Complete | Weekly breakfast, lunch, and dinner menus; daily prepared vs. consumed meals tracking and wastage kg audits. |
| **PHASE 10** | **Wastage Prediction / Heuristic** | Complete | Modular statistical moving-average heuristic calculating historical resident consumption rates and recommended prep counts for future shifts. |
| **PHASE 11** | **Fees & Payments** | Complete | Itemized term fee invoices (room rent, mess fees, maintenance charges) and safe simulation payment gateway. |
| **PHASE 12** | **Receipts & QR Verification** | Complete | Official printable payment receipts, transaction IDs, receipt numbers, and public token verification endpoint (`GET /api/finance/receipts/verify/:token`). |
| **PHASE 13** | **Notifications & Notices** | Complete | Role-targeted administrative announcements, student in-app notifications, and audit ledgers. |
| **PHASE 14** | **Security Hardening** | Complete | Rate limiting, CORS configuration, security response headers, sanitized error responses, and password hash exclusion. |
| **PHASE 15** | **Testing & Verification** | Complete | 16 automated Vitest integration and security tests, zero TypeScript errors (`tsc --noEmit`), and optimized production build. |

---

## Demo Accounts

For evaluation and testing, pre-seeded accounts are provided with standard secure credentials:

| Role | Email | Password | Assigned Facility / Details |
|---|---|---|---|
| **ADMIN** | `admin@hostelsphere.edu` | `Password@123` | Institutional Master Jurisdiction |
| **WARDEN** | `warden.sharma@hostelsphere.edu` | `Password@123` | Aryabhatta Boys Hall of Residence (ABHR) |
| **WARDEN** | `warden.patel@hostelsphere.edu` | `Password@123` | Kalpana Chawla Girls Hall of Residence (KCHR) |
| **STUDENT** | `rahul.verma@student.edu` | `Password@123` | Room 101, Bed A (ABHR) |
| **STUDENT** | `ananya.sen@student.edu` | `Password@123` | Room 201, Bed A (KCHR) |

*The top navigation bar includes a **1-Click Demo Switcher** (`Admin`, `Warden`, `Student`) allowing instant role switching without re-typing credentials.*

---

## Verification & Commands

### 1. Run Automated Test Suite
```bash
npx vitest run
```
*Executes all 16 tests covering authentication, RBAC boundaries, transactional room allocations, fee simulation, and receipt verification.*

### 2. Type Check
```bash
npm run lint
```
*Validates TypeScript types across both frontend and backend (`tsc --noEmit`).*

### 3. Production Build
```bash
npm run build
```
*Compiles the frontend SPA with Vite and validates asset bundling.*

### 4. Health Check
```bash
curl -s http://localhost:3000/api/health
# Response: {"success":true,"message":"HostelSphere API is running"}
```

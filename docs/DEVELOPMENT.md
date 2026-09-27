# HOSTELSPHERE Development Guide

## 1. Prerequisites

- **Node.js**: v20 or v22 LTS
- **npm**: v10+ (or equivalent package manager)
- **Docker & Docker Compose**: Recommended for local PostgreSQL instance

---

## 2. Directory Layout

```
hostelsphere/
├── frontend/             # Client-side React 18 + Vite application
│   ├── src/              # Presentation components, hooks, views
│   ├── tests/            # Component & client logic test suites
│   └── package.json      # Frontend dependencies & scripts
├── backend/              # Server-side Express + TypeScript application
│   ├── src/              # Routes, controllers, services, repositories
│   ├── tests/            # API integration & unit test suites
│   ├── .env.example      # Sample backend environment template
│   └── package.json      # Backend dependencies & scripts
├── docs/                 # Engineering architecture & API documentation
├── docker-compose.yml    # PostgreSQL container orchestration
├── README.md             # Project overview
└── .gitignore            # Secret & artifact exclusion rules
```

---

## 3. Environment Variables Configuration

Copy the template in `backend/.env.example` into `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

### Configured Variables:
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://postgres:password@localhost:5432/hostelsphere`).
- `JWT_SECRET`: High-entropy secret used for HMAC SHA-256 JWT signing.
- `JWT_EXPIRES_IN`: Token validity lifespan (default: `7d`).
- `PORT`: HTTP port for Express API (default: `5000`).
- `CORS_ORIGIN`: Allowed origins for cross-origin client access (default: `http://localhost:5173`).

*Note: Never commit `.env` to Git. The file is strictly excluded via `.gitignore`.*

---

## 4. Running the Development Environment

### 4.1 Launch PostgreSQL via Docker Compose
```bash
docker compose up -d postgres
```

### 4.2 Start Backend (Standalone)
```bash
cd backend
npm install
npm run dev
```
The backend initializes on `http://localhost:5000`. Test health status:
```bash
curl http://localhost:5000/api/health
```

### 4.3 Start Frontend (Standalone)
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173` with automatic API proxying configured to `http://localhost:5000`.

---

## 5. Verification Commands

### Backend Verification
```bash
cd backend
npm run lint    # Typecheck & Linting
npm run test    # Vitest automated test suite
npm run build   # Production compilation via tsc
```

### Frontend Verification
```bash
cd frontend
npm run lint    # TypeScript typechecking
npm run test    # Vitest component test suite
npm run build   # Vite production bundle build
```

---

## 6. Phase Lifecycle & Contribution Protocol

1. **Incremental Development**: Implement only the phase currently approved.
2. **Zero Mock Invariant**: Never fabricate fake statistics or production numbers. If an API is not ready, display "Data not available" or appropriate empty states.
3. **Verification Before Turn Completion**:
   - Run type checks (`tsc --noEmit`)
   - Run linter
   - Run test suite
   - Run production build
4. **Transparent Reporting**: Detail files modified, test results, build outputs, and known limitations.

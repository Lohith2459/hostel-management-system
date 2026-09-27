# HOSTELSPHERE REST API Specification

## 1. Unified Response Envelope

All API endpoints follow a consistent JSON response schema.

### Standard Success Response (`2xx`)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Standard Error Response (`4xx`, `5xx`)
```json
{
  "success": false,
  "message": "Human-readable description of error",
  "error": {
    "code": "ERROR_CODE_IDENTIFIER",
    "details": [ ... ]
  }
}
```

Internal server exceptions, stack traces, and database driver error details are never exposed to client applications.

---

## 2. Standard HTTP Status Codes

| Code | Usage |
|---|---|
| `200 OK` | Successful query or synchronous update |
| `201 Created` | Successful resource creation (e.g. signup, allocation, payment) |
| `400 Bad Request` | Zod schema validation failure or malformed payload |
| `401 Unauthorized` | Missing, invalid, or expired JWT token |
| `403 Forbidden` | Authenticated user lacks permission (RBAC violation) |
| `404 Not Found` | Requested entity does not exist |
| `409 Conflict` | Unique constraint violation (e.g. duplicate email, bed already occupied) |
| `422 Unprocessable Entity` | Semantic business rule violation (e.g. allocating student to full room) |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Uncaught server exception |

---

## 3. Phase 0 Implemented Endpoints

### Health Check

#### `GET /api/health`
Checks whether the HostelSphere backend service is online and ready to accept requests.

- **Authentication**: None (Public)
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "HostelSphere API is running"
}
```

---

## 4. Planned Endpoint Roadmap

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Student self-registration with strong password policy.
- `POST /api/auth/login` - Secure credentials verification issuing signed JWT.
- `POST /api/auth/logout` - Invalidate client session token.
- `GET /api/auth/me` - Retrieve authenticated user context and role.

### Hostels & Infrastructure (`/api/admin/hostels`)
- `GET /api/hostels` - List hostels
- `POST /api/hostels` - Create new hostel (Admin only)
- `GET /api/hostels/:id/rooms` - Query rooms by hostel/block/floor
- `POST /api/rooms` - Register new room and capacity

### Room Allocations (`/api/allocations`)
- `POST /api/allocations` - Transactional student bed allocation
- `POST /api/allocations/vacate` - Vacate bed and log departure timestamp
- `GET /api/allocations/history/:studentId` - Residency audit trail

### Attendance & Leaves (`/api/attendance`, `/api/leaves`)
- `POST /api/attendance/mark` - Warden batch attendance recording
- `POST /api/leaves/apply` - Student leave/outpass request
- `PATCH /api/leaves/:id/status` - Warden approve/reject action

### Mess & Food Wastage (`/api/mess`)
- `GET /api/mess/menu` - Weekly meal schedule
- `POST /api/mess/logs` - Daily meals prepared vs consumed log
- `GET /api/mess/prediction` - Statistical wastage forecast

### Financials (`/api/fees`, `/api/payments`)
- `GET /api/fees/student/:id` - Fee ledger & dues
- `POST /api/payments/simulate` - Simulated payment execution
- `GET /api/payments/:id/receipt` - Official generated receipt with hash

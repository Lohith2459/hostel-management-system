# HOSTELSPHERE Database Architecture Specification

## 1. Database Engine & ORM

- **RDBMS**: PostgreSQL 16+
- **ORM**: Prisma ORM
- **Migration Strategy**: Version-controlled Prisma schema migrations (`prisma migrate dev` / `prisma migrate deploy`)
- **Production Standard**: SQLite is strictly forbidden for production deployment. PostgreSQL provides ACID transaction isolation, foreign key constraints, connection pooling, and multi-tenant scalability.

---

## 2. Core Entities & Relational Schema (Roadmap)

### User & Authentication
- **User**: Central authentication account (`id`, `email` [UNIQUE], `passwordHash`, `role` [ENUM: ADMIN, WARDEN, STUDENT], `isActive`, `createdAt`, `updatedAt`).
- **Student**: Profile extension (`id`, `userId` [FK -> User], `admissionNumber` [UNIQUE], `firstName`, `lastName`, `phone`, `gender`, `guardianName`, `guardianPhone`, `emergencyContact`, `department`, `yearOfStudy`).
- **Warden**: Profile extension (`id`, `userId` [FK -> User], `employeeId` [UNIQUE], `firstName`, `lastName`, `phone`, `assignedHostelId` [FK -> Hostel]).

### Infrastructure Hierarchy
- **Hostel**: Facility building (`id`, `name`, `code` [UNIQUE], `type` [MALE, FEMALE, COED], `address`, `totalCapacity`, `wardenId`).
- **Block**: Wing/Section within a hostel (`id`, `hostelId` [FK -> Hostel], `name`, `code`).
- **Floor**: Vertical subdivision (`id`, `blockId` [FK -> Block], `floorNumber`).
- **Room**: Accommodation unit (`id`, `floorId` [FK -> Floor], `roomNumber`, `capacity`, `type` [AC, NON_AC], `status` [ACTIVE, MAINTENANCE, FULL]).
- **Bed**: Individual bed unit (`id`, `roomId` [FK -> Room], `bedNumber`, `isOccupied`).

### Residency & Allocations
- **RoomAllocation**: Transactional ledger (`id`, `studentId` [FK -> Student], `bedId` [FK -> Bed], `startDate`, `endDate`, `status` [ACTIVE, VACATED, TRANSFERRED], `notes`).
  - *Invariant Constraint*: A student can have at most one record where `status == ACTIVE`.

### Operations & Student Life
- **Attendance**: Daily biometric/manual check (`id`, `studentId` [FK -> Student], `hostelId` [FK -> Hostel], `date`, `status` [PRESENT, ABSENT, ON_LEAVE], `markedBy`).
- **LeaveRequest**: Outpass application (`id`, `studentId` [FK -> Student], `type` [DAY_PASS, NIGHT_OUT, VACATION], `departureDate`, `expectedReturnDate`, `actualReturnDate`, `reason`, `status` [PENDING, APPROVED, REJECTED], `reviewedBy`).
- **Complaint**: Maintenance ticket (`id`, `studentId` [FK -> Student], `category` [ELECTRICAL, PLUMBING, CARPENTRY, CLEANLINESS, FOOD, OTHER], `title`, `description`, `status` [OPEN, IN_PROGRESS, RESOLVED, CLOSED], `resolvedAt`).
- **Visitor**: Guest log (`id`, `studentId` [FK -> Student], `hostelId` [FK -> Hostel], `visitorName`, `relationship`, `phone`, `checkInTime`, `checkOutTime`, `approvedBy`).

### Mess & Dining
- **FoodMenu**: Meal schedules (`id`, `hostelId` [FK -> Hostel], `dayOfWeek`, `mealType` [BREAKFAST, LUNCH, SNACKS, DINNER], `itemsDescription`).
- **FoodWastage**: Consumption analytics (`id`, `hostelId` [FK -> Hostel], `date`, `mealType`, `mealsPrepared`, `mealsServed`, `mealsConsumed`, `wastageKg`, `notes`).

### Financials & Accounts
- **Fee**: Fee schedule breakdown (`id`, `studentId` [FK -> Student], `term`, `academicYear`, `roomRent`, `messFee`, `maintenanceFee`, `totalAmount`, `dueDate`, `status` [PAID, PARTIAL, OVERDUE]).
- **Payment**: Payment execution record (`id`, `feeId` [FK -> Fee], `studentId` [FK -> Student], `transactionId` [UNIQUE], `receiptNumber` [UNIQUE], `amount`, `paymentMethod` [SIMULATION, UPI, CARD, NET_BANKING], `status` [PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED], `paidAt`).
- **Expense**: Hostel facility operational expenditure (`id`, `hostelId` [FK -> Hostel], `category`, `title`, `amount`, `date`, `incurredBy`, `receiptUrl`).

### Broadcast & Communications
- **Announcement**: Notices broadcast (`id`, `hostelId` [FK -> Hostel, Optional for Campus-wide], `title`, `content`, `priority` [LOW, MEDIUM, HIGH, URGENT], `targetRole` [ALL, WARDEN, STUDENT], `publishedBy`, `createdAt`).
- **Notification**: Personal in-app alerts (`id`, `userId` [FK -> User], `title`, `message`, `type`, `isRead`, `createdAt`).

---

## 3. Indexing Strategy

- B-tree index on `users(email)` for high-throughput login lookups.
- Unique compound index on `room_allocations(student_id)` where `status = 'ACTIVE'`.
- Compound index on `attendance(hostel_id, date)` for daily roll call reporting.
- Index on `leave_requests(student_id, status)` and `complaints(status)`.
- Unique index on `payments(transaction_id)` and `payments(receipt_number)`.

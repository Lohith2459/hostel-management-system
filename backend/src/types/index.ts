export type Role = 'ADMIN' | 'WARDEN' | 'STUDENT';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type HostelType = 'MALE' | 'FEMALE' | 'COED';
export type RoomType = 'AC' | 'NON_AC';
export type RoomStatus = 'ACTIVE' | 'MAINTENANCE' | 'FULL';
export type AllocationStatus = 'ACTIVE' | 'VACATED' | 'TRANSFERRED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
export type LeaveType = 'DAY_PASS' | 'NIGHT_OUT' | 'VACATION';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ComplaintCategory = 'ELECTRICAL' | 'PLUMBING' | 'CARPENTRY' | 'CLEANLINESS' | 'FOOD' | 'INTERNET' | 'OTHER';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
export type FeeStatus = 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';
export type PaymentMethod = 'SIMULATION' | 'UPI' | 'CARD' | 'NET_BANKING';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  userId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: Gender;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;
  department: string;
  yearOfStudy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Warden {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  assignedHostelId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Hostel {
  id: string;
  name: string;
  code: string;
  type: HostelType;
  address: string;
  totalCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  id: string;
  hostelId: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Floor {
  id: string;
  blockId: string;
  floorNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  floorId: string;
  roomNumber: string;
  capacity: number;
  type: RoomType;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAllocation {
  id: string;
  studentId: string;
  bedId: string;
  startDate: string;
  endDate: string | null;
  status: AllocationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  hostelId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
  notes?: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  type: LeaveType;
  departureDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  reason: string;
  status: LeaveStatus;
  reviewedBy: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoodMenu {
  id: string;
  hostelId: string;
  dayOfWeek: string; // Monday, Tuesday, etc.
  mealType: MealType;
  itemsDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodWastage {
  id: string;
  hostelId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  mealsPrepared: number;
  mealsServed: number;
  mealsConsumed: number;
  wastageKg: number;
  notes?: string;
  createdAt: string;
}

export interface Fee {
  id: string;
  studentId: string;
  term: string;
  academicYear: string;
  roomRent: number;
  messFee: number;
  maintenanceFee: number;
  totalAmount: number;
  dueDate: string;
  status: FeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  feeId: string;
  studentId: string;
  transactionId: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  verificationToken: string;
  paidAt: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  hostelId: string;
  category: string;
  title: string;
  amount: number;
  date: string;
  incurredBy: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  hostelId: string | null;
  title: string;
  content: string;
  priority: Priority;
  targetRole: string; // 'ALL' | 'STUDENT' | 'WARDEN'
  publishedBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Visitor {
  id: string;
  studentId: string;
  hostelId: string;
  visitorName: string;
  relationship: string;
  phone: string;
  checkInTime: string;
  checkOutTime: string | null;
  approvedBy: string;
  createdAt: string;
}

// Auth Token Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  studentId?: string;
  wardenId?: string;
}

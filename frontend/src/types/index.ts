export type Role = 'ADMIN' | 'WARDEN' | 'STUDENT';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE';

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Student {
  id: string;
  userId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  yearOfStudy: number;
}

export interface Warden {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  assignedHostelId: string | null;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  profile: Student | Warden | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface HostelSummary {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  totalCapacity: number;
  blocksCount: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  warden?: {
    name: string;
    phone: string;
    employeeId: string;
  } | null;
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  isOccupied: boolean;
}

export interface Room {
  id: string;
  floorId: string;
  roomNumber: string;
  capacity: number;
  type: 'AC' | 'NON_AC';
  status: 'ACTIVE' | 'MAINTENANCE' | 'FULL';
  beds?: Bed[];
  occupiedCount?: number;
}

export interface RoomAllocation {
  id: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  bedId: string;
  roomNumber?: string;
  bedNumber?: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'VACATED' | 'TRANSFERRED';
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  department?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
  markedBy: string;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  type: 'DAY_PASS' | 'NIGHT_OUT' | 'VACATION';
  departureDate: string;
  expectedReturnDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  category: 'ELECTRICAL' | 'PLUMBING' | 'CARPENTRY' | 'CLEANLINESS' | 'FOOD' | 'INTERNET' | 'OTHER';
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface FoodMenu {
  id: string;
  hostelId: string;
  dayOfWeek: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
  itemsDescription: string;
}

export interface FoodWastage {
  id: string;
  hostelId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
  mealsPrepared: number;
  mealsServed: number;
  mealsConsumed: number;
  wastageKg: number;
  notes?: string;
}

export interface WastagePrediction {
  modelType: string;
  status: string;
  message?: string;
  datasetSize?: number;
  averageConsumptionRate?: string | null;
  averageWastePerShiftKg?: number | null;
  recommendedPrepCount?: number | null;
  projectedWasteKg?: number | null;
  insights?: string[];
}

export interface Fee {
  id: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  term: string;
  academicYear: string;
  roomRent: number;
  messFee: number;
  maintenanceFee: number;
  totalAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';
  payments?: Payment[];
}

export interface Payment {
  id: string;
  feeId: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  transactionId: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  verificationToken: string;
  paidAt: string | null;
  createdAt: string;
  term?: string;
  academicYear?: string;
}

export interface OfficialReceipt {
  receiptNumber: string;
  transactionId: string;
  paymentDate: string;
  amount: number;
  status: string;
  paymentMethod: string;
  verificationToken: string;
  qrVerificationUrl: string;
  student: {
    id?: string;
    name: string;
    admissionNumber: string;
    department: string;
    room: string;
  };
  feeBreakdown: {
    term: string;
    academicYear: string;
    roomRent: number;
    messFee: number;
    maintenanceFee: number;
    totalAmount: number;
  } | null;
  institution: {
    name: string;
    stamp: string;
  };
}

export interface Visitor {
  id: string;
  studentId: string;
  studentName?: string;
  admissionNumber?: string;
  visitorName: string;
  relationship: string;
  phone: string;
  checkInTime: string;
  checkOutTime: string | null;
  approvedBy: string;
}

export interface Announcement {
  id: string;
  hostelId: string | null;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetRole: string;
  publishedBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

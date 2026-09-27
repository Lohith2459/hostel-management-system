import bcrypt from 'bcryptjs';
import {
  User,
  Student,
  Warden,
  Hostel,
  Block,
  Floor,
  Room,
  Bed,
  RoomAllocation,
  Attendance,
  LeaveRequest,
  Complaint,
  FoodMenu,
  FoodWastage,
  Fee,
  Payment,
  Expense,
  Announcement,
  Notification,
  Visitor,
} from '../types/index.js';

class DataStore {
  users: User[] = [];
  students: Student[] = [];
  wardens: Warden[] = [];
  hostels: Hostel[] = [];
  blocks: Block[] = [];
  floors: Floor[] = [];
  rooms: Room[] = [];
  beds: Bed[] = [];
  allocations: RoomAllocation[] = [];
  attendances: Attendance[] = [];
  leaveRequests: LeaveRequest[] = [];
  complaints: Complaint[] = [];
  foodMenus: FoodMenu[] = [];
  foodWastages: FoodWastage[] = [];
  fees: Fee[] = [];
  payments: Payment[] = [];
  expenses: Expense[] = [];
  announcements: Announcement[] = [];
  notifications: Notification[] = [];
  visitors: Visitor[] = [];

  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    const salt = await bcrypt.genSalt(10);
    // Standard secure test password across seed accounts: "Password@123"
    const standardHash = await bcrypt.hash('Password@123', salt);

    // 1. Users
    const adminUser: User = {
      id: 'usr-admin-1',
      email: 'admin@hostelsphere.edu',
      passwordHash: standardHash,
      role: 'ADMIN',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const wardenUser1: User = {
      id: 'usr-wrd-1',
      email: 'warden.sharma@hostelsphere.edu',
      passwordHash: standardHash,
      role: 'WARDEN',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const wardenUser2: User = {
      id: 'usr-wrd-2',
      email: 'warden.patel@hostelsphere.edu',
      passwordHash: standardHash,
      role: 'WARDEN',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const studentUser1: User = {
      id: 'usr-std-1',
      email: 'rahul.verma@student.edu',
      passwordHash: standardHash,
      role: 'STUDENT',
      isActive: true,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    };

    const studentUser2: User = {
      id: 'usr-std-2',
      email: 'ananya.sen@student.edu',
      passwordHash: standardHash,
      role: 'STUDENT',
      isActive: true,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    };

    const studentUser3: User = {
      id: 'usr-std-3',
      email: 'arjun.nair@student.edu',
      passwordHash: standardHash,
      role: 'STUDENT',
      isActive: true,
      createdAt: '2026-01-16T00:00:00.000Z',
      updatedAt: '2026-01-16T00:00:00.000Z',
    };

    const studentUser4: User = {
      id: 'usr-std-4',
      email: 'priya.iyer@student.edu',
      passwordHash: standardHash,
      role: 'STUDENT',
      isActive: true,
      createdAt: '2026-01-16T00:00:00.000Z',
      updatedAt: '2026-01-16T00:00:00.000Z',
    };

    this.users = [adminUser, wardenUser1, wardenUser2, studentUser1, studentUser2, studentUser3, studentUser4];

    // 2. Hostels
    const hostel1: Hostel = {
      id: 'hst-1',
      name: 'Aryabhatta Boys Hall of Residence',
      code: 'ABHR',
      type: 'MALE',
      address: 'North Campus, Engineering Block, Tech Avenue',
      totalCapacity: 120,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const hostel2: Hostel = {
      id: 'hst-2',
      name: 'Kalpana Chawla Girls Hall of Residence',
      code: 'KCHR',
      type: 'FEMALE',
      address: 'South Campus, Science Enclave, Innovation Way',
      totalCapacity: 100,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    this.hostels = [hostel1, hostel2];

    // 3. Wardens
    const warden1: Warden = {
      id: 'wrd-1',
      userId: 'usr-wrd-1',
      employeeId: 'EMP-WRD-101',
      firstName: 'Dr. Ramesh',
      lastName: 'Sharma',
      phone: '+91 98765 43210',
      assignedHostelId: 'hst-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const warden2: Warden = {
      id: 'wrd-2',
      userId: 'usr-wrd-2',
      employeeId: 'EMP-WRD-102',
      firstName: 'Prof. Sunita',
      lastName: 'Patel',
      phone: '+91 98765 43211',
      assignedHostelId: 'hst-2',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    this.wardens = [warden1, warden2];

    // 4. Students
    const student1: Student = {
      id: 'std-1',
      userId: 'usr-std-1',
      admissionNumber: '2024-CSE-042',
      firstName: 'Rahul',
      lastName: 'Verma',
      phone: '+91 91234 56780',
      gender: 'MALE',
      guardianName: 'Vikas Verma',
      guardianPhone: '+91 94567 89012',
      emergencyContact: '+91 94567 89012',
      department: 'Computer Science & Engineering',
      yearOfStudy: 3,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    };

    const student2: Student = {
      id: 'std-2',
      userId: 'usr-std-2',
      admissionNumber: '2024-ECE-019',
      firstName: 'Ananya',
      lastName: 'Sen',
      phone: '+91 91234 56781',
      gender: 'FEMALE',
      guardianName: 'Debashis Sen',
      guardianPhone: '+91 94567 89013',
      emergencyContact: '+91 94567 89013',
      department: 'Electronics & Communication',
      yearOfStudy: 2,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    };

    const student3: Student = {
      id: 'std-3',
      userId: 'usr-std-3',
      admissionNumber: '2025-MECH-088',
      firstName: 'Arjun',
      lastName: 'Nair',
      phone: '+91 91234 56782',
      gender: 'MALE',
      guardianName: 'Suresh Nair',
      guardianPhone: '+91 94567 89014',
      emergencyContact: '+91 94567 89014',
      department: 'Mechanical Engineering',
      yearOfStudy: 1,
      createdAt: '2026-01-16T00:00:00.000Z',
      updatedAt: '2026-01-16T00:00:00.000Z',
    };

    const student4: Student = {
      id: 'std-4',
      userId: 'usr-std-4',
      admissionNumber: '2023-IT-007',
      firstName: 'Priya',
      lastName: 'Iyer',
      phone: '+91 91234 56783',
      gender: 'FEMALE',
      guardianName: 'K. Iyer',
      guardianPhone: '+91 94567 89015',
      emergencyContact: '+91 94567 89015',
      department: 'Information Technology',
      yearOfStudy: 4,
      createdAt: '2026-01-16T00:00:00.000Z',
      updatedAt: '2026-01-16T00:00:00.000Z',
    };

    this.students = [student1, student2, student3, student4];

    // 5. Blocks, Floors, Rooms, Beds
    // Hostel 1 (ABHR)
    const blockA: Block = {
      id: 'blk-1',
      hostelId: 'hst-1',
      name: 'Block A (Arya)',
      code: 'A',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const blockB: Block = {
      id: 'blk-2',
      hostelId: 'hst-2',
      name: 'Block C (Chawla)',
      code: 'C',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    this.blocks = [blockA, blockB];

    const floorA1: Floor = {
      id: 'flr-1',
      blockId: 'blk-1',
      floorNumber: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const floorB1: Floor = {
      id: 'flr-2',
      blockId: 'blk-2',
      floorNumber: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    this.floors = [floorA1, floorB1];

    const room101: Room = {
      id: 'rm-101',
      floorId: 'flr-1',
      roomNumber: '101',
      capacity: 2,
      type: 'NON_AC',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const room102: Room = {
      id: 'rm-102',
      floorId: 'flr-1',
      roomNumber: '102',
      capacity: 2,
      type: 'AC',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const room201: Room = {
      id: 'rm-201',
      floorId: 'flr-2',
      roomNumber: '201',
      capacity: 2,
      type: 'NON_AC',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    this.rooms = [room101, room102, room201];

    const bed101A: Bed = {
      id: 'bed-101a',
      roomId: 'rm-101',
      bedNumber: 'A',
      isOccupied: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const bed101B: Bed = {
      id: 'bed-101b',
      roomId: 'rm-101',
      bedNumber: 'B',
      isOccupied: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const bed102A: Bed = {
      id: 'bed-102a',
      roomId: 'rm-102',
      bedNumber: 'A',
      isOccupied: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const bed102B: Bed = {
      id: 'bed-102b',
      roomId: 'rm-102',
      bedNumber: 'B',
      isOccupied: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const bed201A: Bed = {
      id: 'bed-201a',
      roomId: 'rm-201',
      bedNumber: 'A',
      isOccupied: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const bed201B: Bed = {
      id: 'bed-201b',
      roomId: 'rm-201',
      bedNumber: 'B',
      isOccupied: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    this.beds = [bed101A, bed101B, bed102A, bed102B, bed201A, bed201B];

    // 6. Allocations (Transactional residency)
    this.allocations = [
      {
        id: 'alc-1',
        studentId: 'std-1',
        bedId: 'bed-101a',
        startDate: '2026-01-15T00:00:00.000Z',
        endDate: null,
        status: 'ACTIVE',
        notes: 'Spring Semester Allocation',
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'alc-2',
        studentId: 'std-2',
        bedId: 'bed-201a',
        startDate: '2026-01-15T00:00:00.000Z',
        endDate: null,
        status: 'ACTIVE',
        notes: 'Annual Academic Allocation',
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'alc-3',
        studentId: 'std-3',
        bedId: 'bed-102a',
        startDate: '2026-01-16T00:00:00.000Z',
        endDate: null,
        status: 'ACTIVE',
        notes: 'First Year Freshers Allocation',
        createdAt: '2026-01-16T00:00:00.000Z',
        updatedAt: '2026-01-16T00:00:00.000Z',
      },
    ];

    // 7. Attendance Logs
    const today = new Date().toISOString().split('T')[0];
    this.attendances = [
      {
        id: 'att-1',
        studentId: 'std-1',
        hostelId: 'hst-1',
        date: today,
        status: 'PRESENT',
        markedBy: 'Dr. Ramesh Sharma',
        notes: 'Regular evening biometric rollcall',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'att-2',
        studentId: 'std-2',
        hostelId: 'hst-2',
        date: today,
        status: 'PRESENT',
        markedBy: 'Prof. Sunita Patel',
        notes: 'In-hostel check',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'att-3',
        studentId: 'std-3',
        hostelId: 'hst-1',
        date: today,
        status: 'PRESENT',
        markedBy: 'Dr. Ramesh Sharma',
        notes: 'Rollcall recorded',
        createdAt: new Date().toISOString(),
      },
    ];

    // 8. Leave / Outpass Requests
    this.leaveRequests = [
      {
        id: 'lv-1',
        studentId: 'std-1',
        type: 'NIGHT_OUT',
        departureDate: '2026-09-28T18:00:00.000Z',
        expectedReturnDate: '2026-09-29T21:00:00.000Z',
        actualReturnDate: null,
        reason: 'Attending IEEE Hackathon at IIT Bombay',
        status: 'APPROVED',
        reviewedBy: 'Dr. Ramesh Sharma',
        reviewNotes: 'Parental confirmation received via registered contact',
        createdAt: '2026-09-25T10:00:00.000Z',
        updatedAt: '2026-09-25T14:30:00.000Z',
      },
      {
        id: 'lv-2',
        studentId: 'std-2',
        type: 'DAY_PASS',
        departureDate: '2026-09-27T14:00:00.000Z',
        expectedReturnDate: '2026-09-27T20:00:00.000Z',
        actualReturnDate: null,
        reason: 'Book purchase & dental checkup in city centre',
        status: 'PENDING',
        reviewedBy: null,
        reviewNotes: null,
        createdAt: '2026-09-26T08:00:00.000Z',
        updatedAt: '2026-09-26T08:00:00.000Z',
      },
    ];

    // 9. Maintenance Complaints
    this.complaints = [
      {
        id: 'cmp-1',
        studentId: 'std-1',
        category: 'ELECTRICAL',
        title: 'Ceiling fan regulator not functioning in Room 101',
        description: 'The ceiling fan speed stays fixed on high speed; needs new step switch.',
        status: 'IN_PROGRESS',
        resolvedAt: null,
        resolutionNotes: 'Electrician ticket #E-204 scheduled for 2:00 PM today.',
        createdAt: '2026-09-24T11:20:00.000Z',
        updatedAt: '2026-09-25T09:00:00.000Z',
      },
      {
        id: 'cmp-2',
        studentId: 'std-2',
        category: 'INTERNET',
        title: 'Ethernet port loose in Room 201',
        description: 'LAN port connection drops intermittently when laptop moves.',
        status: 'OPEN',
        resolvedAt: null,
        resolutionNotes: null,
        createdAt: '2026-09-25T16:00:00.000Z',
        updatedAt: '2026-09-25T16:00:00.000Z',
      },
    ];

    // 10. Food Menu
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    this.foodMenus = days.flatMap((day) => [
      {
        id: `menu-${day}-bf`,
        hostelId: 'hst-1',
        dayOfWeek: day,
        mealType: 'BREAKFAST',
        itemsDescription: 'Idli Sambar, Medu Vada, Fresh Cut Fruits, Milk, Tea & Coffee',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: `menu-${day}-ln`,
        hostelId: 'hst-1',
        dayOfWeek: day,
        mealType: 'LUNCH',
        itemsDescription: 'Steamed Basmati Rice, Dal Makhani, Paneer Butter Masala, Roti, Salad & Curd',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: `menu-${day}-dn`,
        hostelId: 'hst-1',
        dayOfWeek: day,
        mealType: 'DINNER',
        itemsDescription: 'Jeera Rice, Chana Masala, Mixed Veg Curry, Butter Phulka, Sweet Kheer',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    // 11. Food Wastage Log & Prediction Baseline Data
    this.foodWastages = [
      {
        id: 'fw-1',
        hostelId: 'hst-1',
        date: '2026-09-23',
        mealType: 'LUNCH',
        mealsPrepared: 120,
        mealsServed: 112,
        mealsConsumed: 104,
        wastageKg: 7.5,
        notes: 'Excess rice preparation',
        createdAt: '2026-09-23T15:00:00.000Z',
      },
      {
        id: 'fw-2',
        hostelId: 'hst-1',
        date: '2026-09-24',
        mealType: 'DINNER',
        mealsPrepared: 115,
        mealsServed: 110,
        mealsConsumed: 105,
        wastageKg: 4.8,
        notes: 'Optimal portion control observed',
        createdAt: '2026-09-24T22:00:00.000Z',
      },
      {
        id: 'fw-3',
        hostelId: 'hst-1',
        date: '2026-09-25',
        mealType: 'LUNCH',
        mealsPrepared: 120,
        mealsServed: 108,
        mealsConsumed: 101,
        wastageKg: 6.2,
        notes: 'Moderate bread waste',
        createdAt: '2026-09-25T15:00:00.000Z',
      },
    ];

    // 12. Fees & Payments
    this.fees = [
      {
        id: 'fee-1',
        studentId: 'std-1',
        term: 'Fall Semester',
        academicYear: '2026-2027',
        roomRent: 24000,
        messFee: 18000,
        maintenanceFee: 3000,
        totalAmount: 45000,
        dueDate: '2026-10-15T00:00:00.000Z',
        status: 'PAID',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-05T00:00:00.000Z',
      },
      {
        id: 'fee-2',
        studentId: 'std-2',
        term: 'Fall Semester',
        academicYear: '2026-2027',
        roomRent: 24000,
        messFee: 18000,
        maintenanceFee: 3000,
        totalAmount: 45000,
        dueDate: '2026-10-15T00:00:00.000Z',
        status: 'PENDING',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'fee-3',
        studentId: 'std-3',
        term: 'Fall Semester',
        academicYear: '2026-2027',
        roomRent: 30000, // AC room
        messFee: 18000,
        maintenanceFee: 4000,
        totalAmount: 52000,
        dueDate: '2026-10-15T00:00:00.000Z',
        status: 'PENDING',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    ];

    this.payments = [
      {
        id: 'pay-1',
        feeId: 'fee-1',
        studentId: 'std-1',
        transactionId: 'TXN-HSP-2026-881923',
        receiptNumber: 'RCP-2026-00412',
        amount: 45000,
        paymentMethod: 'SIMULATION',
        status: 'SUCCESS',
        verificationToken: 'vtok_881923_a9b1c3d4',
        paidAt: '2026-08-05T14:22:10.000Z',
        createdAt: '2026-08-05T14:22:10.000Z',
      },
    ];

    // 13. Announcements & Notifications
    this.announcements = [
      {
        id: 'anc-1',
        hostelId: null, // campus-wide
        title: 'Hostel Maintenance & Electrical Inspection Schedule',
        content: 'Routine electrical safety audits and capacitor testing will take place between 10:00 AM and 2:00 PM on Saturday. Back-up power is fully functional.',
        priority: 'MEDIUM',
        targetRole: 'ALL',
        publishedBy: 'Chief Administrator Office',
        createdAt: '2026-09-24T09:00:00.000Z',
      },
      {
        id: 'anc-2',
        hostelId: 'hst-1',
        title: 'Special Diwali Dinner & Cultural Evening',
        content: 'Aryabhatta Hall dinner committee invites suggestions for festive sweets and feast additions by this Thursday.',
        priority: 'LOW',
        targetRole: 'STUDENT',
        publishedBy: 'Dr. Ramesh Sharma (Warden)',
        createdAt: '2026-09-25T11:00:00.000Z',
      },
    ];

    this.notifications = [
      {
        id: 'notif-1',
        userId: 'usr-std-1',
        title: 'Leave Request Approved',
        message: 'Your night out leave request for Sep 28 has been approved by Warden Dr. Ramesh Sharma.',
        type: 'LEAVE',
        isRead: false,
        createdAt: '2026-09-25T14:30:00.000Z',
      },
    ];

    // 14. Visitors
    this.visitors = [
      {
        id: 'vis-1',
        studentId: 'std-1',
        hostelId: 'hst-1',
        visitorName: 'Vikas Verma',
        relationship: 'Father',
        phone: '+91 94567 89012',
        checkInTime: '2026-09-20T10:30:00.000Z',
        checkOutTime: '2026-09-20T13:00:00.000Z',
        approvedBy: 'Dr. Ramesh Sharma',
        createdAt: '2026-09-20T10:30:00.000Z',
      },
    ];

    this.isInitialized = true;
    console.log('[DataStore] Initialized successfully with relational data and hashed credentials.');
  }
}

export const db = new DataStore();

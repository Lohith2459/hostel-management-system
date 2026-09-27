import { db } from '../db/datastore.js';
import { LeaveRequest } from '../types/index.js';

export class LeaveRepository {
  async getByStudent(studentId: string): Promise<LeaveRequest[]> {
    await db.init();
    return db.leaveRequests
      .filter((l) => l.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAll(): Promise<LeaveRequest[]> {
    await db.init();
    return [...db.leaveRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: string): Promise<LeaveRequest | null> {
    await db.init();
    return db.leaveRequests.find((l) => l.id === id) || null;
  }

  async create(data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'actualReturnDate'>): Promise<LeaveRequest> {
    await db.init();
    const id = `lv-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newRequest: LeaveRequest = {
      ...data,
      id,
      actualReturnDate: null,
      createdAt: now,
      updatedAt: now,
    };
    db.leaveRequests.push(newRequest);
    return newRequest;
  }

  async updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<LeaveRequest | null> {
    await db.init();
    const req = db.leaveRequests.find((l) => l.id === id);
    if (!req) return null;
    req.status = status;
    req.reviewedBy = reviewedBy;
    if (reviewNotes !== undefined) req.reviewNotes = reviewNotes;
    req.updatedAt = new Date().toISOString();
    return req;
  }
}

export const leaveRepository = new LeaveRepository();

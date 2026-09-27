import { db } from '../db/datastore.js';
import { Complaint } from '../types/index.js';

export class ComplaintRepository {
  async getByStudent(studentId: string): Promise<Complaint[]> {
    await db.init();
    return db.complaints
      .filter((c) => c.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAll(): Promise<Complaint[]> {
    await db.init();
    return [...db.complaints].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: string): Promise<Complaint | null> {
    await db.init();
    return db.complaints.find((c) => c.id === id) || null;
  }

  async create(data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'resolutionNotes'>): Promise<Complaint> {
    await db.init();
    const id = `cmp-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      ...data,
      id,
      resolvedAt: null,
      resolutionNotes: null,
      createdAt: now,
      updatedAt: now,
    };
    db.complaints.push(newComplaint);
    return newComplaint;
  }

  async updateStatus(
    id: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
    resolutionNotes?: string
  ): Promise<Complaint | null> {
    await db.init();
    const complaint = db.complaints.find((c) => c.id === id);
    if (!complaint) return null;
    complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      complaint.resolvedAt = new Date().toISOString();
    }
    complaint.updatedAt = new Date().toISOString();
    return complaint;
  }
}

export const complaintRepository = new ComplaintRepository();

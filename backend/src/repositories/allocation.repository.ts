import { db } from '../db/datastore.js';
import { RoomAllocation } from '../types/index.js';

export class AllocationRepository {
  async getActiveAllocationByStudentId(studentId: string): Promise<RoomAllocation | null> {
    await db.init();
    return db.allocations.find((a) => a.studentId === studentId && a.status === 'ACTIVE') || null;
  }

  async getAllocationsByStudentId(studentId: string): Promise<RoomAllocation[]> {
    await db.init();
    return db.allocations
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllAllocations(): Promise<RoomAllocation[]> {
    await db.init();
    return [...db.allocations];
  }

  async findById(id: string): Promise<RoomAllocation | null> {
    await db.init();
    return db.allocations.find((a) => a.id === id) || null;
  }

  async create(data: Omit<RoomAllocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoomAllocation> {
    await db.init();
    const id = `alc-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const allocation: RoomAllocation = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    db.allocations.push(allocation);
    return allocation;
  }

  async updateStatus(
    id: string,
    status: 'ACTIVE' | 'VACATED' | 'TRANSFERRED',
    endDate?: string
  ): Promise<RoomAllocation | null> {
    await db.init();
    const allocation = db.allocations.find((a) => a.id === id);
    if (!allocation) return null;
    allocation.status = status;
    if (endDate) allocation.endDate = endDate;
    allocation.updatedAt = new Date().toISOString();
    return allocation;
  }
}

export const allocationRepository = new AllocationRepository();

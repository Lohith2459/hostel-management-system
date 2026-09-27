import { db } from '../db/datastore.js';
import { Visitor } from '../types/index.js';

export class VisitorRepository {
  async getAll(): Promise<Visitor[]> {
    await db.init();
    return [...db.visitors].sort(
      (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );
  }

  async getByStudent(studentId: string): Promise<Visitor[]> {
    await db.init();
    return db.visitors
      .filter((v) => v.studentId === studentId)
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  }

  async create(data: Omit<Visitor, 'id' | 'createdAt' | 'checkOutTime' | 'checkInTime'> & { checkInTime?: string }): Promise<Visitor> {
    await db.init();
    const id = `vis-${Date.now().toString(36)}`;
    const newVisitor: Visitor = {
      ...data,
      id,
      checkInTime: data.checkInTime || new Date().toISOString(),
      checkOutTime: null,
      createdAt: new Date().toISOString(),
    };
    db.visitors.push(newVisitor);
    return newVisitor;
  }

  async checkOut(id: string): Promise<Visitor | null> {
    await db.init();
    const visitor = db.visitors.find((v) => v.id === id);
    if (!visitor) return null;
    visitor.checkOutTime = new Date().toISOString();
    return visitor;
  }
}

export const visitorRepository = new VisitorRepository();

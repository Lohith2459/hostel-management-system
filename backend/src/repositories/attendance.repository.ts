import { db } from '../db/datastore.js';
import { Attendance } from '../types/index.js';

export class AttendanceRepository {
  async getByStudentAndDate(studentId: string, date: string): Promise<Attendance | null> {
    await db.init();
    return db.attendances.find((a) => a.studentId === studentId && a.date === date) || null;
  }

  async getByStudent(studentId: string): Promise<Attendance[]> {
    await db.init();
    return db.attendances
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getByHostelAndDate(hostelId: string, date: string): Promise<Attendance[]> {
    await db.init();
    return db.attendances.filter((a) => a.hostelId === hostelId && a.date === date);
  }

  async markAttendance(data: Omit<Attendance, 'id' | 'createdAt'>): Promise<Attendance> {
    await db.init();
    const existing = db.attendances.find(
      (a) => a.studentId === data.studentId && a.date === data.date
    );

    if (existing) {
      existing.status = data.status;
      existing.markedBy = data.markedBy;
      existing.notes = data.notes;
      return existing;
    }

    const id = `att-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: Attendance = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    db.attendances.push(newRecord);
    return newRecord;
  }
}

export const attendanceRepository = new AttendanceRepository();

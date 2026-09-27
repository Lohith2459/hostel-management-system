import { attendanceRepository } from '../repositories/attendance.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { hostelRepository } from '../repositories/hostel.repository.js';
import { AttendanceStatus } from '../types/index.js';

export interface MarkAttendanceBatchItem {
  studentId: string;
  hostelId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export class AttendanceService {
  async markBatch(items: MarkAttendanceBatchItem[], markedBy: string) {
    const results = [];
    for (const item of items) {
      const recorded = await attendanceRepository.markAttendance({
        studentId: item.studentId,
        hostelId: item.hostelId,
        date: item.date,
        status: item.status,
        markedBy,
        notes: item.notes,
      });
      results.push(recorded);
    }
    return results;
  }

  async getStudentAttendance(studentId: string) {
    const records = await attendanceRepository.getByStudent(studentId);
    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const onLeave = records.filter((r) => r.status === 'ON_LEAVE').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : null;

    return {
      records,
      stats: {
        total,
        present,
        absent,
        onLeave,
        percentage,
      },
    };
  }

  async getHostelDailyAttendance(hostelId: string, date: string) {
    const records = await attendanceRepository.getByHostelAndDate(hostelId, date);
    const students = await userRepository.getAllStudents();
    
    const enriched = records.map((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      return {
        ...rec,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        admissionNumber: student?.admissionNumber || 'N/A',
        department: student?.department || 'N/A',
      };
    });

    return {
      date,
      hostelId,
      totalMarked: records.length,
      presentCount: records.filter((r) => r.status === 'PRESENT').length,
      absentCount: records.filter((r) => r.status === 'ABSENT').length,
      records: enriched,
    };
  }
}

export const attendanceService = new AttendanceService();

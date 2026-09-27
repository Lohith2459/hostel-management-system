import { leaveRepository } from '../repositories/leave.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { LeaveType, LeaveStatus } from '../types/index.js';

export interface CreateLeaveInput {
  studentId: string;
  type: LeaveType;
  departureDate: string;
  expectedReturnDate: string;
  reason: string;
}

export class LeaveService {
  async apply(input: CreateLeaveInput) {
    if (new Date(input.departureDate) >= new Date(input.expectedReturnDate)) {
      throw {
        statusCode: 400,
        code: 'INVALID_LEAVE_DATES',
        message: 'Expected return date must be strictly after the departure date.',
      };
    }

    return leaveRepository.create({
      studentId: input.studentId,
      type: input.type,
      departureDate: input.departureDate,
      expectedReturnDate: input.expectedReturnDate,
      reason: input.reason,
      status: 'PENDING',
      reviewedBy: null,
      reviewNotes: null,
    });
  }

  async review(leaveId: string, status: 'APPROVED' | 'REJECTED', reviewedBy: string, reviewNotes?: string) {
    const existing = await leaveRepository.findById(leaveId);
    if (!existing) {
      throw {
        statusCode: 404,
        code: 'LEAVE_NOT_FOUND',
        message: 'Leave request not found',
      };
    }

    return leaveRepository.updateStatus(leaveId, status, reviewedBy, reviewNotes);
  }

  async getStudentLeaves(studentId: string) {
    return leaveRepository.getByStudent(studentId);
  }

  async getAllLeaves() {
    const leaves = await leaveRepository.getAll();
    const students = await userRepository.getAllStudents();
    return leaves.map((lv) => {
      const student = students.find((s) => s.id === lv.studentId);
      return {
        ...lv,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        admissionNumber: student?.admissionNumber || 'N/A',
        department: student?.department || 'N/A',
      };
    });
  }
}

export const leaveService = new LeaveService();

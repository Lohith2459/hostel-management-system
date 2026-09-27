import { visitorRepository } from '../repositories/visitor.repository.js';
import { userRepository } from '../repositories/user.repository.js';

export class VisitorService {
  async getAll() {
    const visitors = await visitorRepository.getAll();
    const students = await userRepository.getAllStudents();
    return visitors.map((v) => {
      const student = students.find((s) => s.id === v.studentId);
      return {
        ...v,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        admissionNumber: student?.admissionNumber || 'N/A',
      };
    });
  }

  async getByStudent(studentId: string) {
    return visitorRepository.getByStudent(studentId);
  }

  async checkIn(data: {
    studentId: string;
    hostelId: string;
    visitorName: string;
    relationship: string;
    phone: string;
    approvedBy: string;
  }) {
    return visitorRepository.create(data);
  }

  async checkOut(id: string) {
    return visitorRepository.checkOut(id);
  }
}

export const visitorService = new VisitorService();

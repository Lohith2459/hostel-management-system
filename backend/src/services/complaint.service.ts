import { complaintRepository } from '../repositories/complaint.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { ComplaintCategory, ComplaintStatus } from '../types/index.js';

export class ComplaintService {
  async createComplaint(data: {
    studentId: string;
    category: ComplaintCategory;
    title: string;
    description: string;
  }) {
    return complaintRepository.create({
      studentId: data.studentId,
      category: data.category,
      title: data.title,
      description: data.description,
      status: 'OPEN',
    });
  }

  async updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    resolutionNotes?: string
  ) {
    const complaint = await complaintRepository.findById(complaintId);
    if (!complaint) {
      throw {
        statusCode: 404,
        code: 'COMPLAINT_NOT_FOUND',
        message: 'Complaint ticket not found',
      };
    }

    return complaintRepository.updateStatus(complaintId, status, resolutionNotes);
  }

  async getStudentComplaints(studentId: string) {
    return complaintRepository.getByStudent(studentId);
  }

  async getAllComplaints() {
    const complaints = await complaintRepository.getAll();
    const students = await userRepository.getAllStudents();
    return complaints.map((c) => {
      const student = students.find((s) => s.id === c.studentId);
      return {
        ...c,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        admissionNumber: student?.admissionNumber || 'N/A',
      };
    });
  }
}

export const complaintService = new ComplaintService();

import { financeRepository } from '../repositories/finance.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { hostelRepository } from '../repositories/hostel.repository.js';
import { allocationRepository } from '../repositories/allocation.repository.js';

export interface ProcessPaymentInput {
  feeId: string;
  studentId: string;
  paymentMethod: 'SIMULATION' | 'UPI' | 'CARD' | 'NET_BANKING';
}

export class FinanceService {
  async getStudentFees(studentId: string) {
    const fees = await financeRepository.getFeesByStudent(studentId);
    const payments = await financeRepository.getPaymentsByStudent(studentId);
    
    return fees.map((fee) => {
      const feePayments = payments.filter((p) => p.feeId === fee.id);
      return {
        ...fee,
        payments: feePayments,
      };
    });
  }

  async getAllFees() {
    const fees = await financeRepository.getAllFees();
    const students = await userRepository.getAllStudents();
    return fees.map((f) => {
      const student = students.find((s) => s.id === f.studentId);
      return {
        ...f,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        admissionNumber: student?.admissionNumber || 'N/A',
      };
    });
  }

  async getAllPayments() {
    const payments = await financeRepository.getAllPayments();
    const students = await userRepository.getAllStudents();
    const fees = await financeRepository.getAllFees();

    return payments.map((p) => {
      const student = students.find((s) => s.id === p.studentId);
      const fee = fees.find((f) => f.id === p.feeId);
      return {
        ...p,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        admissionNumber: student?.admissionNumber || 'N/A',
        term: fee?.term || 'N/A',
        academicYear: fee?.academicYear || 'N/A',
      };
    });
  }

  /**
   * Process payment in safe simulation mode
   */
  async processSimulatedPayment(input: ProcessPaymentInput) {
    const fee = await financeRepository.findFeeById(input.feeId);
    if (!fee) {
      throw {
        statusCode: 404,
        code: 'FEE_NOT_FOUND',
        message: 'Fee bill not found',
      };
    }

    if (fee.status === 'PAID') {
      throw {
        statusCode: 400,
        code: 'FEE_ALREADY_PAID',
        message: 'This fee invoice has already been fully paid.',
      };
    }

    if (fee.studentId !== input.studentId) {
      throw {
        statusCode: 403,
        code: 'FORBIDDEN_PAYMENT',
        message: 'You are not authorized to pay a fee belonging to another student.',
      };
    }

    const now = new Date().toISOString();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const randomReceiptHex = Math.floor(10000 + Math.random() * 90000);
    const transactionId = `TXN-HSP-${new Date().getFullYear()}-${randomHex}`;
    const receiptNumber = `RCP-${new Date().getFullYear()}-${randomReceiptHex}`;
    const verificationToken = `vtok_${transactionId.toLowerCase()}_${Math.random().toString(36).substring(2, 10)}`;

    // Create payment record marked as SUCCESS in simulation mode
    const payment = await financeRepository.createPayment({
      feeId: fee.id,
      studentId: fee.studentId,
      transactionId,
      receiptNumber,
      amount: fee.totalAmount,
      paymentMethod: input.paymentMethod || 'SIMULATION',
      status: 'SUCCESS',
      verificationToken,
      paidAt: now,
    });

    // Update fee status to PAID
    await financeRepository.updateFeeStatus(fee.id, 'PAID');

    return {
      success: true,
      message: 'Simulated payment completed successfully. Official receipt generated.',
      payment,
    };
  }

  /**
   * Official Receipt Generator & Verifier
   */
  async getOfficialReceipt(receiptNumberOrId: string) {
    let payment = await financeRepository.findPaymentByReceipt(receiptNumberOrId);
    if (!payment) {
      payment = await financeRepository.findPaymentById(receiptNumberOrId);
    }

    if (!payment) {
      throw {
        statusCode: 404,
        code: 'RECEIPT_NOT_FOUND',
        message: 'No official payment receipt matches the provided identifier.',
      };
    }

    if (payment.status !== 'SUCCESS') {
      throw {
        statusCode: 400,
        code: 'UNVERIFIED_PAYMENT',
        message: 'Receipts can only be issued for payments with status SUCCESS.',
      };
    }

    const student = await userRepository.findStudentById(payment.studentId);
    const fee = await financeRepository.findFeeById(payment.feeId);
    const allocation = student ? await allocationRepository.getActiveAllocationByStudentId(student.id) : null;
    const bed = allocation ? await hostelRepository.findBedById(allocation.bedId) : null;
    const room = bed ? await hostelRepository.findRoomById(bed.roomId) : null;

    return {
      receiptNumber: payment.receiptNumber,
      transactionId: payment.transactionId,
      paymentDate: payment.paidAt || payment.createdAt,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      verificationToken: payment.verificationToken,
      qrVerificationUrl: `/api/finance/receipts/verify/${payment.verificationToken}`,
      student: {
        id: student?.id,
        name: student ? `${student.firstName} ${student.lastName}` : 'N/A',
        admissionNumber: student?.admissionNumber || 'N/A',
        department: student?.department || 'N/A',
        room: room ? `${room.roomNumber} (Bed ${bed?.bedNumber})` : 'Unassigned',
      },
      feeBreakdown: fee
        ? {
            term: fee.term,
            academicYear: fee.academicYear,
            roomRent: fee.roomRent,
            messFee: fee.messFee,
            maintenanceFee: fee.maintenanceFee,
            totalAmount: fee.totalAmount,
          }
        : null,
      institution: {
        name: 'HostelSphere Collegiate Residence Authority',
        stamp: 'AUTHENTICATED DIGITAL RECEIPT',
      },
    };
  }

  async verifyToken(token: string) {
    const payment = await financeRepository.findPaymentByVerificationToken(token);
    if (!payment) {
      return {
        isValid: false,
        message: 'Invalid verification token. Receipt could not be validated.',
      };
    }

    return {
      isValid: true,
      receiptNumber: payment.receiptNumber,
      transactionId: payment.transactionId,
      amount: payment.amount,
      paidAt: payment.paidAt,
      status: payment.status,
    };
  }

  async getAllExpenses() {
    return financeRepository.getAllExpenses();
  }
}

export const financeService = new FinanceService();

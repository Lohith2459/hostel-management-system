import { db } from '../db/datastore.js';
import { Fee, Payment, Expense } from '../types/index.js';

export class FinanceRepository {
  async getFeesByStudent(studentId: string): Promise<Fee[]> {
    await db.init();
    return db.fees
      .filter((f) => f.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllFees(): Promise<Fee[]> {
    await db.init();
    return [...db.fees];
  }

  async findFeeById(id: string): Promise<Fee | null> {
    await db.init();
    return db.fees.find((f) => f.id === id) || null;
  }

  async getPaymentsByStudent(studentId: string): Promise<Payment[]> {
    await db.init();
    return db.payments
      .filter((p) => p.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllPayments(): Promise<Payment[]> {
    await db.init();
    return [...db.payments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findPaymentById(id: string): Promise<Payment | null> {
    await db.init();
    return db.payments.find((p) => p.id === id) || null;
  }

  async findPaymentByReceipt(receiptNumber: string): Promise<Payment | null> {
    await db.init();
    return db.payments.find((p) => p.receiptNumber.toLowerCase() === receiptNumber.toLowerCase().trim()) || null;
  }

  async findPaymentByVerificationToken(token: string): Promise<Payment | null> {
    await db.init();
    return db.payments.find((p) => p.verificationToken === token) || null;
  }

  async createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    await db.init();
    const id = `pay-${Date.now().toString(36)}`;
    const newPayment: Payment = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    db.payments.push(newPayment);
    return newPayment;
  }

  async updateFeeStatus(feeId: string, status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING'): Promise<Fee | null> {
    await db.init();
    const fee = db.fees.find((f) => f.id === feeId);
    if (!fee) return null;
    fee.status = status;
    fee.updatedAt = new Date().toISOString();
    return fee;
  }

  async getAllExpenses(): Promise<Expense[]> {
    await db.init();
    return [...db.expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createExpense(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    await db.init();
    const id = `exp-${Date.now().toString(36)}`;
    const newExpense: Expense = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    db.expenses.push(newExpense);
    return newExpense;
  }
}

export const financeRepository = new FinanceRepository();

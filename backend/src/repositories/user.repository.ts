import { db } from '../db/datastore.js';
import { User, Student, Warden } from '../types/index.js';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    await db.init();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  async findById(id: string): Promise<User | null> {
    await db.init();
    return db.users.find((u) => u.id === id) || null;
  }

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    await db.init();
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(newUser);
    return newUser;
  }

  async findStudentByUserId(userId: string): Promise<Student | null> {
    await db.init();
    return db.students.find((s) => s.userId === userId) || null;
  }

  async findStudentById(id: string): Promise<Student | null> {
    await db.init();
    return db.students.find((s) => s.id === id) || null;
  }

  async findWardenByUserId(userId: string): Promise<Warden | null> {
    await db.init();
    return db.wardens.find((w) => w.userId === userId) || null;
  }

  async findWardenById(id: string): Promise<Warden | null> {
    await db.init();
    return db.wardens.find((w) => w.id === id) || null;
  }

  async getAllStudents(): Promise<Student[]> {
    await db.init();
    return [...db.students];
  }

  async getAllWardens(): Promise<Warden[]> {
    await db.init();
    return [...db.wardens];
  }

  async createStudentProfile(student: Omit<Student, 'createdAt' | 'updatedAt'>): Promise<Student> {
    await db.init();
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...student,
      createdAt: now,
      updatedAt: now,
    };
    db.students.push(newStudent);
    return newStudent;
  }

  async createWardenProfile(warden: Omit<Warden, 'createdAt' | 'updatedAt'>): Promise<Warden> {
    await db.init();
    const now = new Date().toISOString();
    const newWarden: Warden = {
      ...warden,
      createdAt: now,
      updatedAt: now,
    };
    db.wardens.push(newWarden);
    return newWarden;
  }
}

export const userRepository = new UserRepository();

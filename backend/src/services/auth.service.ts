import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { JwtPayload, Role, Gender } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hostelsphere-super-secure-production-jwt-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface SignupInput {
  email: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string;
  gender?: Gender;
  department?: string;
  yearOfStudy?: number;
  admissionNumber?: string;
  guardianName?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  employeeId?: string;
}

export class AuthService {
  async signup(input: SignupInput) {
    // Public ADMIN signup is strictly forbidden
    if (input.role === 'ADMIN') {
      throw {
        statusCode: 403,
        code: 'ADMIN_SIGNUP_FORBIDDEN',
        message: 'Public administrator signup is prohibited. Administrator accounts must be provisioned internally.',
      };
    }

    const normalizedEmail = input.email.toLowerCase().trim();
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw {
        statusCode: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists.',
      };
    }

    // Password strength check
    if (input.password.length < 8) {
      throw {
        statusCode: 400,
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long.',
      };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const userId = `usr-${Date.now().toString(36)}`;
    const user = await userRepository.create({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      role: input.role,
      isActive: true,
    });

    let profile: any = null;

    if (input.role === 'STUDENT') {
      const studentId = `std-${Date.now().toString(36)}`;
      profile = await userRepository.createStudentProfile({
        id: studentId,
        userId: user.id,
        admissionNumber: input.admissionNumber || `ADM-${Date.now().toString(36).toUpperCase()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        gender: input.gender || 'OTHER',
        guardianName: input.guardianName || 'Guardian',
        guardianPhone: input.guardianPhone || input.phone,
        emergencyContact: input.emergencyContact || input.phone,
        department: input.department || 'General Studies',
        yearOfStudy: input.yearOfStudy || 1,
      });
    } else if (input.role === 'WARDEN') {
      const wardenId = `wrd-${Date.now().toString(36)}`;
      profile = await userRepository.createWardenProfile({
        id: wardenId,
        userId: user.id,
        employeeId: input.employeeId || `EMP-${Date.now().toString(36).toUpperCase()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        assignedHostelId: null,
      });
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId: input.role === 'STUDENT' ? profile?.id : undefined,
      wardenId: input.role === 'WARDEN' ? profile?.id : undefined,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      };
    }

    if (!user.isActive) {
      throw {
        statusCode: 403,
        code: 'ACCOUNT_SUSPENDED',
        message: 'This account has been deactivated or suspended',
      };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      };
    }

    let studentProfile = null;
    let wardenProfile = null;

    if (user.role === 'STUDENT') {
      studentProfile = await userRepository.findStudentByUserId(user.id);
    } else if (user.role === 'WARDEN') {
      wardenProfile = await userRepository.findWardenByUserId(user.id);
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId: studentProfile?.id,
      wardenId: wardenProfile?.id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile: studentProfile || wardenProfile,
    };
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      };
    }

    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await userRepository.findStudentByUserId(user.id);
    } else if (user.role === 'WARDEN') {
      profile = await userRepository.findWardenByUserId(user.id);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile,
    };
  }
}

export const authService = new AuthService();

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { db } from '../src/db/datastore.js';

describe('HostelSphere Core Integration Test Suite', () => {
  let adminToken: string;
  let wardenToken: string;
  let studentToken: string;

  beforeAll(async () => {
    await db.init();
  });

  describe('Authentication & Security', () => {
    it('POST /api/auth/login with valid admin credentials should return JWT and role ADMIN', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@hostelsphere.edu',
        password: 'Password@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      adminToken = res.body.data.token;
    });

    it('POST /api/auth/login with valid warden credentials should return role WARDEN', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'warden.sharma@hostelsphere.edu',
        password: 'Password@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('WARDEN');
      wardenToken = res.body.data.token;
    });

    it('POST /api/auth/login with valid student credentials should return role STUDENT', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'rahul.verma@student.edu',
        password: 'Password@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('STUDENT');
      studentToken = res.body.data.token;
    });

    it('POST /api/auth/login with invalid password should return 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@hostelsphere.edu',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('POST /api/auth/signup with role ADMIN should be strictly forbidden (403)', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        email: 'hacker.admin@hostelsphere.edu',
        password: 'Password@123',
        role: 'ADMIN',
        firstName: 'Unauthorized',
        lastName: 'Admin',
        phone: '1234567890',
      });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('ADMIN_SIGNUP_FORBIDDEN');
    });

    it('GET /api/auth/me with valid Bearer token returns authenticated context', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('admin@hostelsphere.edu');
    });
  });

  describe('RBAC Authorization Boundaries', () => {
    it('STUDENT cannot access admin-only hostel creation (403)', async () => {
      const res = await request(app)
        .post('/api/hostels')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Unauthorized Hostel',
          code: 'UH',
          type: 'MALE',
          address: 'Camp',
          totalCapacity: 50,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('ADMIN can access hostel overview', async () => {
      const res = await request(app)
        .get('/api/hostels/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.hostels.length).toBeGreaterThan(0);
    });
  });

  describe('Room Allocation Business Rules', () => {
    it('Prevents allocating a student who already has an ACTIVE allocation (422)', async () => {
      // std-1 already has an active allocation in seed data
      const res = await request(app)
        .post('/api/allocations/allocate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'std-1',
          hostelId: 'hst-1',
          blockId: 'blk-1',
          roomId: 'rm-101',
          bedId: 'bed-101b',
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('ACTIVE_ALLOCATION_EXISTS');
    });

    it('Prevents allocating to an already occupied bed (409)', async () => {
      // std-4 has no active allocation, but bed-101a is already occupied by std-1
      const res = await request(app)
        .post('/api/allocations/allocate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'std-4',
          hostelId: 'hst-1',
          blockId: 'blk-1',
          roomId: 'rm-101',
          bedId: 'bed-101a',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('BED_ALREADY_OCCUPIED');
    });

    it('Successfully allocates an unallocated student to an available bed', async () => {
      // std-4 is unallocated; bed-101b is available
      const res = await request(app)
        .post('/api/allocations/allocate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'std-4',
          hostelId: 'hst-1',
          blockId: 'blk-1',
          roomId: 'rm-101',
          bedId: 'bed-101b',
          notes: 'Standard first allocation test',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.allocation.status).toBe('ACTIVE');

      // Now vacating std-4
      const vacateRes = await request(app)
        .post('/api/allocations/vacate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'std-4',
          notes: 'Test vacate',
        });

      expect(vacateRes.status).toBe(200);
      expect(vacateRes.body.data.status).toBe('VACATED');
    });
  });

  describe('Finance & Receipts Verification', () => {
    it('Simulated payment completes, marks fee PAID, and generates verifiable receipt', async () => {
      // Log in as ananya.sen (std-2 has pending fee-2)
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'ananya.sen@student.edu',
        password: 'Password@123',
      });
      const ananyaToken = loginRes.body.data.token;

      const payRes = await request(app)
        .post('/api/finance/pay/simulate')
        .set('Authorization', `Bearer ${ananyaToken}`)
        .send({
          feeId: 'fee-2',
          paymentMethod: 'SIMULATION',
        });

      expect(payRes.status).toBe(200);
      expect(payRes.body.data.status).toBe('SUCCESS');
      expect(payRes.body.data).toHaveProperty('receiptNumber');
      expect(payRes.body.data).toHaveProperty('verificationToken');

      const receiptNum = payRes.body.data.receiptNumber;
      const vToken = payRes.body.data.verificationToken;

      // Verify receipt by receiptNumber
      const receiptRes = await request(app)
        .get(`/api/finance/receipts/${receiptNum}`)
        .set('Authorization', `Bearer ${ananyaToken}`);

      expect(receiptRes.status).toBe(200);
      expect(receiptRes.body.data.receiptNumber).toBe(receiptNum);
      expect(receiptRes.body.data.student.name).toBe('Ananya Sen');

      // Verify QR public token
      const qrRes = await request(app).get(`/api/finance/receipts/verify/${vToken}`);
      expect(qrRes.status).toBe(200);
      expect(qrRes.body.data.isValid).toBe(true);
      expect(qrRes.body.data.receiptNumber).toBe(receiptNum);
    });
  });
});

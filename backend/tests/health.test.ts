import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('HostelSphere Backend Health Endpoint', () => {
  it('GET /api/health should return 200 with success status and running message', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'HostelSphere API is running',
    });
  });

  it('GET /api/invalid-route should return 404 with structured error envelope', async () => {
    const res = await request(app).get('/api/invalid-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});

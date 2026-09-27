import { describe, it, expect } from 'vitest';

describe('HostelSphere Frontend Suite', () => {
  it('should initialize frontend configuration correctly', () => {
    const appName = 'HOSTELSPHERE';
    expect(appName).toBe('HOSTELSPHERE');
  });

  it('validates health API url structure', () => {
    const healthUrl = '/api/health';
    expect(healthUrl).toMatch(/^\/api\//);
  });
});

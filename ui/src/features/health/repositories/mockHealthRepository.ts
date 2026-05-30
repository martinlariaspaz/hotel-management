import type { HealthRepository } from './HealthRepository';
import type { HealthCheck } from '../types';

export function createMockHealthRepository(): HealthRepository {
  return {
    async check(): Promise<HealthCheck> {
      return {
        checkedAt: new Date().toISOString(),
        status: 'online',
      };
    },
  };
}

export default createMockHealthRepository;

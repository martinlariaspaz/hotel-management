import type { HealthRepository } from './HealthRepository';
import type { HealthCheck } from '../types';

type HealthResponse = {
  status: string;
  timestamp: string;
};

function mapHealthResponse(response: HealthResponse): HealthCheck {
  return {
    checkedAt: response.timestamp,
    status: response.status === 'ok' ? 'online' : 'offline',
  };
}

export function createHttpHealthRepository(apiUrl: string): HealthRepository {
  return {
    async check(): Promise<HealthCheck> {
      const response = await fetch(`${apiUrl}/api/health`);

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return mapHealthResponse((await response.json()) as HealthResponse);
    },
  };
}

export default createHttpHealthRepository;

import type { HealthCheck } from '../types';

export type HealthRepository = {
  check(): Promise<HealthCheck>;
};

export type { HealthRepository as default };

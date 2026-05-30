export type HealthState = 'checking' | 'offline' | 'online';

export type HealthCheck = {
  checkedAt: string;
  status: Exclude<HealthState, 'checking'>;
};

export type { HealthCheck as default };

import type { MaintenanceBlockListFilters } from '../repositories';

const maintenanceBlockQueryKeys = {
  all: ['maintenance-blocks'] as const,
  list: (filters: MaintenanceBlockListFilters = {}) =>
    [...maintenanceBlockQueryKeys.lists(), filters] as const,
  lists: () => [...maintenanceBlockQueryKeys.all, 'list'] as const,
};

export default maintenanceBlockQueryKeys;

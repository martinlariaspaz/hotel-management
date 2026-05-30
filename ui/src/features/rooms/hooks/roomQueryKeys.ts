import type { RoomListFilters } from '../repositories';

const roomQueryKeys = {
  all: ['rooms'] as const,
  detail: (roomId: string) => [...roomQueryKeys.details(), roomId] as const,
  details: () => [...roomQueryKeys.all, 'detail'] as const,
  list: (filters: RoomListFilters = {}) =>
    [...roomQueryKeys.lists(), filters] as const,
  lists: () => [...roomQueryKeys.all, 'list'] as const,
};

export default roomQueryKeys;


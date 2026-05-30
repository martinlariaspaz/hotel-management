const roomTypeQueryKeys = {
  all: ['room-types'] as const,
  detail: (roomTypeId: string) =>
    [...roomTypeQueryKeys.details(), roomTypeId] as const,
  details: () => [...roomTypeQueryKeys.all, 'detail'] as const,
  lists: ['room-types', 'list'] as const,
};

export default roomTypeQueryKeys;


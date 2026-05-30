export type RealtimeMutationAction = 'created' | 'deactivated' | 'updated';

export type RealtimeMutationEntity = 'room' | 'room-type' | 'staff-user';

type RealtimeMutationPayload = {
  action: RealtimeMutationAction;
  entity: RealtimeMutationEntity;
  id: string;
  timestamp: string;
};

export type { RealtimeMutationPayload as default };

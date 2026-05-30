export type RealtimeMutationAction =
  | 'cancelled'
  | 'created'
  | 'deactivated'
  | 'updated';

export type RealtimeMutationEntity =
  | 'maintenance-block'
  | 'room'
  | 'room-type'
  | 'staff-user';

type RealtimeMutationPayload = {
  action: RealtimeMutationAction;
  entity: RealtimeMutationEntity;
  id: string;
  timestamp: string;
};

export type { RealtimeMutationPayload as default };

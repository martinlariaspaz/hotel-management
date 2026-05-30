import { useEffect, type PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { REALTIME_URL } from '../../../../config';
import { useAppStore } from '../../../../store';
import { roomTypeQueryKeys } from '../../../room-types';
import { roomQueryKeys } from '../../../rooms';
import { staffQueryKeys } from '../../../staff';
import { realtimeEvents } from '../../constants';
import type { RealtimeMutationPayload } from '../../types';

function isRealtimeMutationPayload(
  value: unknown,
): value is RealtimeMutationPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'action' in value &&
    'entity' in value &&
    'id' in value &&
    'timestamp' in value &&
    typeof value.action === 'string' &&
    typeof value.entity === 'string' &&
    typeof value.id === 'string' &&
    typeof value.timestamp === 'string'
  );
}

function RealtimeProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const auth = useAppStore((state) => state.auth);
  const clearAuthSession = useAppStore((state) => state.clearAuthSession);

  const currentUserId = auth.user?.id ?? null;
  const token = auth.token;
  const shouldConnect = auth.status === 'authenticated' && Boolean(token);

  useEffect(() => {
    if (!shouldConnect || !token) {
      return;
    }

    const socket = io(REALTIME_URL, {
      auth: {
        token,
      },
      withCredentials: true,
    });

    function handleStaffUsersChanged(payload: unknown): void {
      if (!isRealtimeMutationPayload(payload)) {
        return;
      }

      if (payload.entity !== 'staff-user') {
        return;
      }

      if (payload.id === currentUserId) {
        queryClient.clear();
        clearAuthSession();
        return;
      }

      void queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists });
    }

    function handleRoomTypesChanged(payload: unknown): void {
      if (!isRealtimeMutationPayload(payload)) {
        return;
      }

      if (payload.entity !== 'room-type') {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: roomTypeQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    }

    function handleRoomsChanged(payload: unknown): void {
      if (!isRealtimeMutationPayload(payload)) {
        return;
      }

      if (payload.entity !== 'room') {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    }

    socket.on(realtimeEvents.staffUsersChanged, handleStaffUsersChanged);
    socket.on(realtimeEvents.roomTypesChanged, handleRoomTypesChanged);
    socket.on(realtimeEvents.roomsChanged, handleRoomsChanged);

    return () => {
      socket.off(realtimeEvents.staffUsersChanged, handleStaffUsersChanged);
      socket.off(realtimeEvents.roomTypesChanged, handleRoomTypesChanged);
      socket.off(realtimeEvents.roomsChanged, handleRoomsChanged);
      socket.disconnect();
    };
  }, [clearAuthSession, currentUserId, queryClient, shouldConnect, token]);

  return children;
}

export default RealtimeProvider;

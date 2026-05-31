import { useMutation } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import type {
  PendingPublicReservation,
  PublicReservationRequest,
} from '../types';

export type UseCreatePublicReservationResult = {
  createError: unknown;
  createPublicReservation(
    input: PublicReservationRequest,
  ): Promise<PendingPublicReservation>;
  createdReservation: PendingPublicReservation | null;
  isCreating: boolean;
  resetCreatePublicReservation(): void;
};

function useCreatePublicReservation(): UseCreatePublicReservationResult {
  const { reservationRepository } = useRepositories();
  const createPublicReservationMutation = useMutation({
    mutationFn: (input: PublicReservationRequest) =>
      reservationRepository.createPublicReservation(input),
  });

  return {
    createError: createPublicReservationMutation.error,
    createPublicReservation: createPublicReservationMutation.mutateAsync,
    createdReservation: createPublicReservationMutation.data ?? null,
    isCreating: createPublicReservationMutation.isPending,
    resetCreatePublicReservation: createPublicReservationMutation.reset,
  };
}

export default useCreatePublicReservation;

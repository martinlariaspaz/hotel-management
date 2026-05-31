import { Box, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { ClipboardCheck } from 'lucide-react';
import type {
  AvailabilitySearchCriteria,
  PublicRoomTypeAvailability,
} from '../../../../features/availability';
import {
  PublicBookingForm,
  type PublicReservationRequest,
} from '../../../../features/reservations';
import { useI18n } from '../../../../i18n';

type PublicBookingRequestSectionProps = {
  criteria: AvailabilitySearchCriteria | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancelSelection(): void;
  onSubmit(input: PublicReservationRequest): Promise<void>;
  selectedRoomType: PublicRoomTypeAvailability | null;
};

function PublicBookingRequestSection({
  criteria,
  errorMessage,
  isSubmitting,
  onCancelSelection,
  onSubmit,
  selectedRoomType,
}: PublicBookingRequestSectionProps) {
  const { t } = useI18n();

  return (
    <Box
      aria-labelledby="public-booking-request-title"
      className="public-booking-request-section"
      component="section"
    >
      <Paper className="public-booking-request-panel" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Stack gap={2}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('publicBookingPage.request.eyebrow')}
            </Text>
            <Title id="public-booking-request-title" order={2}>
              {t('publicBookingPage.request.title')}
            </Title>
          </Stack>

          {criteria && selectedRoomType ? (
            <PublicBookingForm
              criteria={criteria}
              errorMessage={errorMessage}
              isSubmitting={isSubmitting}
              key={`${selectedRoomType.id}-${criteria.checkIn}-${criteria.checkOut}-${criteria.guests}`}
              onCancelSelection={onCancelSelection}
              onSubmit={onSubmit}
              roomTypeAvailability={selectedRoomType}
            />
          ) : (
            <Stack align="center" gap="sm" py="xl">
              <ThemeIcon radius="xl" size={52} variant="light">
                <ClipboardCheck size={26} />
              </ThemeIcon>
              <Text c="dimmed" fw={600} ta="center">
                {t('publicBookingPage.request.empty')}
              </Text>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default PublicBookingRequestSection;

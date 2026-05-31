import { Alert, Box, Loader, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { BedDouble, SearchX } from 'lucide-react';
import {
  PublicRoomTypeResultCard,
  type AvailabilitySearchCriteria,
  type PublicRoomTypeAvailability,
} from '../../../../features/availability';
import { useI18n } from '../../../../i18n';

type PublicBookingResultsSectionProps = {
  criteria: AvailabilitySearchCriteria | null;
  errorMessage: string | null;
  isLoading: boolean;
  onSelectRoomType(roomTypeAvailability: PublicRoomTypeAvailability): void;
  roomTypeAvailability: PublicRoomTypeAvailability[];
  selectedRoomTypeId: string | null;
};

function PublicBookingResultsSection({
  criteria,
  errorMessage,
  isLoading,
  onSelectRoomType,
  roomTypeAvailability,
  selectedRoomTypeId,
}: PublicBookingResultsSectionProps) {
  const { t } = useI18n();
  const hasSearch = Boolean(criteria);
  const hasResults = roomTypeAvailability.length > 0;
  const searchSummary = criteria
    ? t('publicBookingPage.results.summary')
        .replace('{checkIn}', criteria.checkIn)
        .replace('{checkOut}', criteria.checkOut)
        .replace('{guests}', criteria.guests.toString())
    : t('publicBookingPage.results.idleDescription');

  return (
    <Box
      aria-labelledby="public-booking-results-title"
      className="public-booking-results-section"
      component="section"
    >
      <Stack gap="md">
        <Stack gap={2}>
          <Text c="dimmed" fw={700} size="xs" tt="uppercase">
            {t('publicBookingPage.results.eyebrow')}
          </Text>
          <Title id="public-booking-results-title" order={2}>
            {t('publicBookingPage.results.title')}
          </Title>
          <Text c="dimmed" size="sm">
            {searchSummary}
          </Text>
        </Stack>

        {errorMessage ? (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        ) : null}

        {isLoading ? (
          <Paper className="public-booking-state-panel" p="xl" radius="md" withBorder>
            <Stack align="center" gap="sm">
              <Loader size="sm" />
              <Text c="dimmed" fw={600}>
                {t('publicBookingPage.results.loading')}
              </Text>
            </Stack>
          </Paper>
        ) : null}

        {!isLoading && !hasSearch ? (
          <Paper className="public-booking-state-panel" p="xl" radius="md" withBorder>
            <Stack align="center" gap="sm">
              <ThemeIcon radius="xl" size={52} variant="light">
                <BedDouble size={26} />
              </ThemeIcon>
              <Text c="dimmed" fw={600} ta="center">
                {t('publicBookingPage.results.idle')}
              </Text>
            </Stack>
          </Paper>
        ) : null}

        {!isLoading && hasSearch && !hasResults && !errorMessage ? (
          <Paper className="public-booking-state-panel" p="xl" radius="md" withBorder>
            <Stack align="center" gap="sm">
              <ThemeIcon color="gray" radius="xl" size={52} variant="light">
                <SearchX size={26} />
              </ThemeIcon>
              <Text c="dimmed" fw={600} ta="center">
                {t('publicBookingPage.results.empty')}
              </Text>
            </Stack>
          </Paper>
        ) : null}

        {!isLoading && hasResults ? (
          <Stack gap="md">
            {roomTypeAvailability.map((roomType) => (
              <PublicRoomTypeResultCard
                isSelected={selectedRoomTypeId === roomType.id}
                key={roomType.id}
                onSelect={onSelectRoomType}
                roomTypeAvailability={roomType}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

export default PublicBookingResultsSection;

import { useMemo, useState } from 'react';
import {
  Button,
  Container,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { DoorOpen, Hotel } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  usePublicAvailability,
  type AvailabilitySearchCriteria,
  type PublicRoomTypeAvailability,
} from '../../features/availability';
import {
  useCreatePublicReservation,
  type PendingPublicReservation,
  type PublicReservationRequest,
} from '../../features/reservations';
import { useI18n } from '../../i18n';
import { getRepositoryApiErrorTranslationKey } from '../../repositories';
import {
  PublicBookingRequestSection,
  PublicBookingResultsSection,
  PublicBookingSearchSection,
} from './sections';

const EMPTY_SEARCH_CRITERIA: AvailabilitySearchCriteria = {
  checkIn: '',
  checkOut: '',
  guests: 0,
};

export type PublicBookingRequestRouteState = {
  reservation: PendingPublicReservation;
};

function PublicBookingPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState<AvailabilitySearchCriteria | null>(
    null,
  );
  const [selectedRoomType, setSelectedRoomType] =
    useState<PublicRoomTypeAvailability | null>(null);
  const availabilityCriteria = criteria ?? EMPTY_SEARCH_CRITERIA;
  const {
    isLoading,
    listError,
    roomTypeAvailability,
  } = usePublicAvailability(availabilityCriteria, {
    enabled: Boolean(criteria),
  });
  const {
    createError,
    createPublicReservation,
    isCreating,
    resetCreatePublicReservation,
  } = useCreatePublicReservation();
  const listErrorMessage = listError
    ? t(getRepositoryApiErrorTranslationKey(listError))
    : null;
  const createErrorMessage = createError
    ? t(getRepositoryApiErrorTranslationKey(createError))
    : null;
  const selectedRoomTypeId = selectedRoomType?.id ?? null;
  const availableRoomTypes = useMemo(
    () => roomTypeAvailability.filter((roomType) => roomType.availableCount > 0),
    [roomTypeAvailability],
  );

  function handleSearch(nextCriteria: AvailabilitySearchCriteria): void {
    setCriteria(nextCriteria);
    setSelectedRoomType(null);
    resetCreatePublicReservation();
  }

  async function handleCreatePublicReservation(
    input: PublicReservationRequest,
  ): Promise<void> {
    const reservation = await createPublicReservation(input);

    navigate(`/book/request/${reservation.reference}`, {
      state: {
        reservation,
      } satisfies PublicBookingRequestRouteState,
    });
  }

  return (
    <div className="public-booking-page">
      <Container className="public-booking-container" size="xl">
        <Stack gap="xl">
          <section
            aria-label={t('publicBookingPage.header.ariaLabel')}
            className="public-booking-header"
          >
            <Group align="flex-end" justify="space-between">
              <Group align="center" gap="md" wrap="nowrap">
                <ThemeIcon radius="md" size={56} variant="gradient">
                  <Hotel size={28} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    {t('publicBookingPage.header.eyebrow')}
                  </Text>
                  <Title className="public-booking-title" order={1}>
                    {t('publicBookingPage.header.title')}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {t('publicBookingPage.header.description')}
                  </Text>
                </Stack>
              </Group>

              <Button
                component={RouterLink}
                leftSection={<DoorOpen size={18} />}
                to="/login"
                variant="default"
              >
                {t('publicBookingPage.header.staffAccess')}
              </Button>
            </Group>
          </section>

          <PublicBookingSearchSection
            isLoading={isLoading}
            onSearch={handleSearch}
          />

          <div className="public-booking-content-grid">
            <PublicBookingResultsSection
              criteria={criteria}
              errorMessage={listErrorMessage}
              isLoading={isLoading}
              onSelectRoomType={setSelectedRoomType}
              roomTypeAvailability={availableRoomTypes}
              selectedRoomTypeId={selectedRoomTypeId}
            />
            <PublicBookingRequestSection
              criteria={criteria}
              errorMessage={createErrorMessage}
              isSubmitting={isCreating}
              onCancelSelection={() => setSelectedRoomType(null)}
              onSubmit={handleCreatePublicReservation}
              selectedRoomType={selectedRoomType}
            />
          </div>
        </Stack>
      </Container>
    </div>
  );
}

export default PublicBookingPage;

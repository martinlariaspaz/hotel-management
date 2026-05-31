import {
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { CalendarCheck2, Clock, Hotel, Search } from 'lucide-react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { formatAvailabilityMoney } from '../../features/availability';
import type {
  AvailabilityCancellationPolicy,
  AvailabilityDepositRule,
} from '../../features/availability';
import type { PendingPublicReservation } from '../../features/reservations';
import { useI18n, type TranslationKey } from '../../i18n';
import type { PublicBookingRequestRouteState } from '../PublicBookingPage';

type SummaryItemProps = {
  labelKey: TranslationKey;
  value: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isPublicBookingRequestRouteState(
  value: unknown,
): value is PublicBookingRequestRouteState {
  return (
    isRecord(value) &&
    isRecord(value.reservation) &&
    typeof value.reservation.reference === 'string'
  );
}

function formatDateTime(value: string | null | undefined, locale: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getCancellationPolicyDescription(
  policy: AvailabilityCancellationPolicy | null | undefined,
  translate: (key: TranslationKey) => string,
): string {
  if (!policy) {
    return translate('publicBookingRequestPage.summary.notAvailable');
  }

  if (policy.code === 'FREE_CANCELLATION_UNTIL_48H_BEFORE_CHECK_IN') {
    return translate('publicBookingPage.policies.freeCancellation48');
  }

  return policy.description;
}

function getDepositLabel(
  depositRule: AvailabilityDepositRule | null | undefined,
  locale: string,
  translate: (key: TranslationKey) => string,
): string {
  if (!depositRule) {
    return translate('publicBookingRequestPage.summary.notAvailable');
  }

  const amount = formatAvailabilityMoney(depositRule.amount, depositRule.currency, {
    locale,
  });

  return translate('publicBookingPage.policies.firstNightDeposit').replace(
    '{amount}',
    amount,
  );
}

function getTotalLabel(
  reservation: PendingPublicReservation,
  locale: string,
  translate: (key: TranslationKey) => string,
): string {
  const totalAmount =
    reservation.priceSummary?.total ?? reservation.totalAmount ?? null;
  const currency = reservation.priceSummary?.currency ?? reservation.currency;

  return typeof totalAmount === 'number'
    ? formatAvailabilityMoney(totalAmount, currency, { locale })
    : translate('publicBookingRequestPage.summary.notAvailable');
}

function SummaryItem({ labelKey, value }: SummaryItemProps) {
  const { t } = useI18n();

  return (
    <Stack gap={2}>
      <Text c="dimmed" size="xs">
        {t(labelKey)}
      </Text>
      <Text fw={700}>{value}</Text>
    </Stack>
  );
}

function PublicBookingRequestPage() {
  const { locale, t } = useI18n();
  const { reference = '' } = useParams();
  const location = useLocation();
  const routeState = isPublicBookingRequestRouteState(location.state)
    ? location.state
    : null;
  const reservation = routeState?.reservation ?? null;
  const resolvedReference = reservation?.reference ?? reference;
  const expiresAt = formatDateTime(reservation?.expiresAt, locale);
  const nextStepCopy = expiresAt
    ? t('publicBookingRequestPage.nextSteps.expiresAt').replace(
        '{expiresAt}',
        expiresAt,
      )
    : t('publicBookingRequestPage.nextSteps.noExpiration');

  return (
    <div className="public-booking-request-page">
      <Container className="public-booking-request-container" size="lg">
        <Stack gap="xl">
          <section
            aria-label={t('publicBookingRequestPage.header.ariaLabel')}
            className="public-booking-request-header"
          >
            <Paper className="public-booking-request-hero" p="xl" radius="md" withBorder>
              <Stack gap="lg">
                <Group align="flex-start" justify="space-between">
                  <Group align="center" gap="md" wrap="nowrap">
                    <ThemeIcon color="yellow" radius="md" size={56} variant="light">
                      <Clock size={28} />
                    </ThemeIcon>
                    <Stack gap={4}>
                      <Badge color="yellow" variant="light">
                        {t('publicBookingRequestPage.header.status')}
                      </Badge>
                      <Title order={1}>
                        {t('publicBookingRequestPage.header.title')}
                      </Title>
                      <Text c="dimmed">
                        {t('publicBookingRequestPage.header.description')}
                      </Text>
                    </Stack>
                  </Group>
                </Group>

                <Divider />

                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <SummaryItem
                    labelKey="publicBookingRequestPage.summary.reference"
                    value={resolvedReference}
                  />
                  <SummaryItem
                    labelKey="publicBookingRequestPage.summary.nextStep"
                    value={nextStepCopy}
                  />
                </SimpleGrid>
              </Stack>
            </Paper>
          </section>

          {reservation ? (
            <Paper className="public-booking-request-summary" p="lg" radius="md" withBorder>
              <Stack gap="lg">
                <Group gap="sm">
                  <ThemeIcon radius="md" variant="light">
                    <CalendarCheck2 size={20} />
                  </ThemeIcon>
                  <Title order={2}>
                    {t('publicBookingRequestPage.summary.title')}
                  </Title>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <SummaryItem
                    labelKey="publicBookingRequestPage.summary.roomType"
                    value={reservation.roomType.name}
                  />
                  <SummaryItem
                    labelKey="publicBookingRequestPage.summary.dates"
                    value={t('publicBookingRequestPage.summary.dateRange')
                      .replace('{checkIn}', reservation.checkInDate)
                      .replace('{checkOut}', reservation.checkOutDate)}
                  />
                  <SummaryItem
                    labelKey="publicBookingRequestPage.summary.guests"
                    value={t('publicBookingRequestPage.summary.guestCount').replace(
                      '{count}',
                      reservation.guestCount.toString(),
                    )}
                  />
                  <SummaryItem
                    labelKey="publicBookingRequestPage.summary.guest"
                    value={reservation.guest.name}
                  />
                  <SummaryItem
                    labelKey="publicBookingRequestPage.summary.total"
                    value={getTotalLabel(reservation, locale, t)}
                  />
                  <SummaryItem
                    labelKey="publicBookingRequestPage.summary.deposit"
                    value={getDepositLabel(reservation.depositRule, locale, t)}
                  />
                </SimpleGrid>

                <Stack gap={4}>
                  <Text c="dimmed" size="xs">
                    {t('publicBookingRequestPage.summary.cancellation')}
                  </Text>
                  <Text>
                    {getCancellationPolicyDescription(
                      reservation.cancellationPolicy,
                      t,
                    )}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Paper className="public-booking-request-summary" p="lg" radius="md" withBorder>
              <Stack align="center" gap="md" py="xl">
                <ThemeIcon radius="xl" size={56} variant="light">
                  <Hotel size={28} />
                </ThemeIcon>
                <Stack gap={4}>
                  <Title order={2} ta="center">
                    {t('publicBookingRequestPage.missingState.title')}
                  </Title>
                  <Text c="dimmed" ta="center">
                    {t('publicBookingRequestPage.missingState.description')}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          )}

          <Group justify="flex-end">
            <Button
              component={RouterLink}
              leftSection={<Search size={18} />}
              to="/book"
              variant="default"
            >
              {t('publicBookingRequestPage.actions.newSearch')}
            </Button>
          </Group>
        </Stack>
      </Container>
    </div>
  );
}

export default PublicBookingRequestPage;

import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  Banknote,
  CalendarX,
  CheckCircle2,
  Image as ImageIcon,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useI18n } from '../../../../i18n';
import type { TranslationKey } from '../../../../i18n';
import { formatAvailabilityMoney } from '../../business';
import type { AvailabilityCancellationPolicy } from '../../types';
import type { PublicRoomTypeAvailability } from '../../types';

type PublicRoomTypeResultCardProps = {
  isSelected: boolean;
  onSelect(roomTypeAvailability: PublicRoomTypeAvailability): void;
  roomTypeAvailability: PublicRoomTypeAvailability;
};

function getCancellationPolicyDescription(
  policy: AvailabilityCancellationPolicy,
  translate: (key: TranslationKey) => string,
): string {
  if (policy.code === 'FREE_CANCELLATION_UNTIL_48H_BEFORE_CHECK_IN') {
    return translate('publicBookingPage.policies.freeCancellation48');
  }

  return policy.description;
}

function PublicRoomTypeResultCard({
  isSelected,
  onSelect,
  roomTypeAvailability,
}: PublicRoomTypeResultCardProps) {
  const { locale, t } = useI18n();
  const photoUrl = roomTypeAvailability.photoUrls[0];
  const currency = roomTypeAvailability.priceSummary.currency;
  const nightlyPrice = formatAvailabilityMoney(
    roomTypeAvailability.priceSummary.nightlyRate,
    currency,
    { locale },
  );
  const totalPrice = formatAvailabilityMoney(
    roomTypeAvailability.priceSummary.total,
    currency,
    { locale },
  );
  const depositAmount = formatAvailabilityMoney(
    roomTypeAvailability.depositRule.amount,
    roomTypeAvailability.depositRule.currency,
    { locale },
  );
  const photoAlt = t('publicBookingPage.results.card.photoAlt').replace(
    '{name}',
    roomTypeAvailability.name,
  );
  const capacityLabel = t('publicBookingPage.results.card.capacity').replace(
    '{count}',
    roomTypeAvailability.capacity.toString(),
  );
  const availabilityLabel = t(
    'publicBookingPage.results.card.availableCount',
  ).replace('{count}', roomTypeAvailability.availableCount.toString());
  const totalLabel = t('publicBookingPage.results.card.totalPrice').replace(
    '{nights}',
    roomTypeAvailability.priceSummary.nights.toString(),
  );
  const cancellationPolicyDescription = getCancellationPolicyDescription(
    roomTypeAvailability.cancellationPolicy,
    t,
  );

  return (
    <Card
      className="public-room-type-card"
      data-selected={isSelected ? 'true' : undefined}
      padding="md"
      radius="md"
      shadow="sm"
      withBorder
    >
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <AspectRatio ratio={16 / 10}>
          {photoUrl ? (
            <Image alt={photoAlt} fit="cover" radius="sm" src={photoUrl} />
          ) : (
            <Box className="public-room-type-card-placeholder">
              <ThemeIcon radius="xl" size={52} variant="light">
                <ImageIcon size={26} />
              </ThemeIcon>
              <Text c="dimmed" fw={600} size="sm">
                {t('publicBookingPage.results.card.noPhoto')}
              </Text>
            </Box>
          )}
        </AspectRatio>

        <Stack gap="md">
          <Group align="flex-start" justify="space-between" wrap="nowrap">
            <Stack gap={4}>
              <Title order={3}>{roomTypeAvailability.name}</Title>
              <Group gap="xs">
                <Badge leftSection={<Users size={14} />} variant="light">
                  {capacityLabel}
                </Badge>
                <Badge color="teal" variant="light">
                  {availabilityLabel}
                </Badge>
              </Group>
            </Stack>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <Stack gap={2}>
              <Text c="dimmed" size="xs">
                {t('publicBookingPage.results.card.nightlyPrice')}
              </Text>
              <Text fw={700}>{nightlyPrice}</Text>
            </Stack>
            <Stack gap={2}>
              <Text c="dimmed" size="xs">
                {totalLabel}
              </Text>
              <Text fw={700}>{totalPrice}</Text>
            </Stack>
          </SimpleGrid>

          <Stack gap="xs">
            <Group align="flex-start" gap="xs" wrap="nowrap">
              <ThemeIcon color="teal" radius="xl" size="sm" variant="light">
                <Banknote size={14} />
              </ThemeIcon>
              <Text size="sm">
                {t('publicBookingPage.results.card.deposit').replace(
                  '{amount}',
                  depositAmount,
                )}
              </Text>
            </Group>
            <Group align="flex-start" gap="xs" wrap="nowrap">
              <ThemeIcon color="blue" radius="xl" size="sm" variant="light">
                <CalendarX size={14} />
              </ThemeIcon>
              <Text size="sm">{cancellationPolicyDescription}</Text>
            </Group>
          </Stack>

          <Group gap="xs">
            {roomTypeAvailability.amenities.length > 0 ? (
              roomTypeAvailability.amenities.map((amenity) => (
                <Badge
                  key={amenity}
                  leftSection={<CheckCircle2 size={12} />}
                  variant="default"
                >
                  {amenity}
                </Badge>
              ))
            ) : (
              <Text c="dimmed" size="sm">
                {t('publicBookingPage.results.card.noAmenities')}
              </Text>
            )}
          </Group>

          <Button
            leftSection={<ShieldCheck size={18} />}
            onClick={() => onSelect(roomTypeAvailability)}
            type="button"
            variant={isSelected ? 'filled' : 'light'}
          >
            {isSelected
              ? t('publicBookingPage.results.card.selectedAction')
              : t('publicBookingPage.results.card.selectAction')}
          </Button>
        </Stack>
      </SimpleGrid>
    </Card>
  );
}

export default PublicRoomTypeResultCard;

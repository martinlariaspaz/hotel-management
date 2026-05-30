import {
  ActionIcon,
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { CircleOff, Pencil } from 'lucide-react';
import { useI18n } from '../../../../i18n';
import type { RoomType } from '../../types';

type RoomTypesTableProps = {
  isLoading: boolean;
  onDeactivate(roomType: RoomType): void;
  onEdit(roomType: RoomType): void;
  roomTypes: RoomType[];
};

function formatNightlyRate(rate: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    currency: 'ARS',
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(rate);
}

function RoomTypesTable({
  isLoading,
  onDeactivate,
  onEdit,
  roomTypes,
}: RoomTypesTableProps) {
  const { locale, t } = useI18n();

  if (isLoading) {
    return (
      <Paper p="xl" withBorder>
        <Center mih={160}>
          <Stack align="center" gap="sm">
            <Loader size="sm" />
            <Text c="dimmed">{t('roomTypesPage.list.loading')}</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (roomTypes.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center mih={160}>
          <Text c="dimmed" ta="center">
            {t('roomTypesPage.list.empty')}
          </Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper className="room-types-table-panel" withBorder>
      <Table.ScrollContainer minWidth={760}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('roomTypesPage.list.columns.name')}</Table.Th>
              <Table.Th>{t('roomTypesPage.list.columns.capacity')}</Table.Th>
              <Table.Th>{t('roomTypesPage.list.columns.baseRate')}</Table.Th>
              <Table.Th>{t('roomTypesPage.list.columns.status')}</Table.Th>
              <Table.Th ta="right">
                {t('roomTypesPage.list.columns.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {roomTypes.map((roomType) => (
              <Table.Tr key={roomType.id}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text fw={700}>{roomType.name}</Text>
                    <Text c="dimmed" size="sm">
                      {roomType.amenities.length > 0
                        ? roomType.amenities.join(', ')
                        : t('roomTypesPage.list.noAmenities')}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  {t('roomTypesPage.list.capacityValue').replace(
                    '{count}',
                    String(roomType.capacity),
                  )}
                </Table.Td>
                <Table.Td>
                  {formatNightlyRate(roomType.baseNightlyRate, locale)}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={roomType.isActive ? 'teal' : 'gray'}
                    variant="light"
                  >
                    {roomType.isActive
                      ? t('roomTypesPage.list.status.active')
                      : t('roomTypesPage.list.status.inactive')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Tooltip label={t('common.actions.edit')}>
                      <ActionIcon
                        aria-label={t('common.actions.edit')}
                        onClick={() => onEdit(roomType)}
                        radius="md"
                        variant="subtle"
                      >
                        <Pencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('common.actions.deactivate')}>
                      <ActionIcon
                        aria-label={t('common.actions.deactivate')}
                        color="red"
                        disabled={!roomType.isActive}
                        onClick={() => onDeactivate(roomType)}
                        radius="md"
                        variant="subtle"
                      >
                        <CircleOff size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

export default RoomTypesTable;


import {
  ActionIcon,
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { Pencil } from 'lucide-react';
import { useI18n } from '../../../../i18n';
import {
  getRoomStatusColor,
  getRoomStatusLabel,
  type RoomStatus,
} from '../../../statuses';
import { isRoomStatus } from '../../business';
import type { Room } from '../../types';

type RoomInventoryTableProps = {
  allowedStatusOptions: readonly RoomStatus[];
  canManageInventory: boolean;
  canUpdateStatus: boolean;
  isLoading: boolean;
  isStatusUpdating: boolean;
  onEdit(room: Room): void;
  onStatusChange(room: Room, status: RoomStatus): void;
  rooms: Room[];
};

function getStatusOptionsForRoom(
  room: Room,
  allowedStatusOptions: readonly RoomStatus[],
): RoomStatus[] {
  if (allowedStatusOptions.includes(room.status)) {
    return [...allowedStatusOptions];
  }

  return [room.status, ...allowedStatusOptions];
}

function RoomInventoryTable({
  allowedStatusOptions,
  canManageInventory,
  canUpdateStatus,
  isLoading,
  isStatusUpdating,
  onEdit,
  onStatusChange,
  rooms,
}: RoomInventoryTableProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <Paper p="xl" withBorder>
        <Center mih={160}>
          <Stack align="center" gap="sm">
            <Loader size="sm" />
            <Text c="dimmed">{t('roomsPage.list.loading')}</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (rooms.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center mih={160}>
          <Text c="dimmed" ta="center">
            {t('roomsPage.list.empty')}
          </Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper className="rooms-table-panel" withBorder>
      <Table.ScrollContainer minWidth={840}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('roomsPage.list.columns.roomNumber')}</Table.Th>
              <Table.Th>{t('roomsPage.list.columns.roomType')}</Table.Th>
              <Table.Th>{t('roomsPage.list.columns.floor')}</Table.Th>
              <Table.Th>{t('roomsPage.list.columns.status')}</Table.Th>
              <Table.Th ta="right">
                {t('roomsPage.list.columns.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rooms.map((room) => {
              const statusOptions = getStatusOptionsForRoom(
                room,
                allowedStatusOptions,
              );
              const canChangeThisStatus =
                canUpdateStatus && allowedStatusOptions.includes(room.status);

              return (
                <Table.Tr key={room.id}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text fw={700}>{room.roomNumber}</Text>
                      {room.notes ? (
                        <Text c="dimmed" size="sm">
                          {room.notes}
                        </Text>
                      ) : null}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text>{room.roomType.name}</Text>
                      <Text c="dimmed" size="sm">
                        {t('roomsPage.list.capacityValue').replace(
                          '{count}',
                          String(room.roomType.capacity),
                        )}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {room.floor ?? t('roomsPage.list.noFloor')}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Badge
                        color={getRoomStatusColor(room.status)}
                        variant="light"
                      >
                        {getRoomStatusLabel(room.status, t)}
                      </Badge>
                      <Select
                        aria-label={t(
                          'roomsPage.list.statusControlAriaLabel',
                        ).replace('{roomNumber}', room.roomNumber)}
                        data={statusOptions.map((status) => ({
                          label: getRoomStatusLabel(status, t),
                          value: status,
                        }))}
                        disabled={!canChangeThisStatus || isStatusUpdating}
                        onChange={(value) => {
                          if (isRoomStatus(value) && value !== room.status) {
                            onStatusChange(room, value);
                          }
                        }}
                        size="xs"
                        value={room.status}
                        w={180}
                        comboboxProps={{ width: 220 }}
                      />
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end">
                      {canManageInventory ? (
                        <Tooltip label={t('common.actions.edit')}>
                          <ActionIcon
                            aria-label={t('common.actions.edit')}
                            disabled={isStatusUpdating}
                            onClick={() => onEdit(room)}
                            radius="md"
                            variant="subtle"
                          >
                            <Pencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                      ) : null}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

export default RoomInventoryTable;

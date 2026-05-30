import { useMemo } from 'react';
import {
  Badge,
  Box,
  Center,
  Group,
  ActionIcon,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { Wrench } from 'lucide-react';
import { useI18n } from '../../../../i18n';
import {
  getRoomStatusColor,
  getRoomStatusLabel,
  type RoomStatus,
} from '../../../statuses';
import { ROOM_STATUS_VALUES } from '../../business';
import type { Room } from '../../types';

type RoomStatusBoardProps = {
  canCreateMaintenanceBlock?: boolean;
  isLoading: boolean;
  onCreateMaintenanceBlock?(room: Room): void;
  rooms: Room[];
};

type RoomTypeGroup = {
  roomTypeName: string;
  rooms: Room[];
};

function groupRoomsByType(rooms: Room[]): RoomTypeGroup[] {
  const groupedRooms = new Map<string, RoomTypeGroup>();

  rooms.forEach((room) => {
    const group = groupedRooms.get(room.roomType.id) ?? {
      roomTypeName: room.roomType.name,
      rooms: [],
    };

    groupedRooms.set(room.roomType.id, {
      ...group,
      rooms: [...group.rooms, room],
    });
  });

  return [...groupedRooms.values()].sort((first, second) =>
    first.roomTypeName.localeCompare(second.roomTypeName),
  );
}

function RoomStatusBoard({
  canCreateMaintenanceBlock = false,
  isLoading,
  onCreateMaintenanceBlock,
  rooms,
}: RoomStatusBoardProps) {
  const { t } = useI18n();
  const roomsByStatus = useMemo(() => {
    return ROOM_STATUS_VALUES.reduce<Record<RoomStatus, RoomTypeGroup[]>>(
      (groups, status) => ({
        ...groups,
        [status]: groupRoomsByType(
          rooms.filter((room) => room.status === status),
        ),
      }),
      {} as Record<RoomStatus, RoomTypeGroup[]>,
    );
  }, [rooms]);

  if (isLoading) {
    return (
      <Paper p="xl" withBorder>
        <Center mih={160}>
          <Stack align="center" gap="sm">
            <Loader size="sm" />
            <Text c="dimmed">{t('roomsPage.board.loading')}</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {ROOM_STATUS_VALUES.map((status) => {
        const typeGroups = roomsByStatus[status];
        const roomCount = typeGroups.reduce(
          (total, group) => total + group.rooms.length,
          0,
        );

        return (
          <Paper className="room-status-board-column" key={status} p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between" wrap="nowrap">
                <Badge color={getRoomStatusColor(status)} variant="light">
                  {getRoomStatusLabel(status, t)}
                </Badge>
                <Text c="dimmed" fw={700} size="sm">
                  {t('roomsPage.board.roomCount').replace(
                    '{count}',
                    String(roomCount),
                  )}
                </Text>
              </Group>

              {typeGroups.length > 0 ? (
                <Stack gap="sm">
                  {typeGroups.map((group) => (
                    <Box key={group.roomTypeName}>
                      <Text fw={700} size="sm">
                        {group.roomTypeName}
                      </Text>
                      <Group gap={6} mt={6}>
                        {group.rooms.map((room) => (
                          <Group gap={4} key={room.id} wrap="nowrap">
                            <Badge radius="sm" variant="default">
                              {room.roomNumber}
                            </Badge>
                            {canCreateMaintenanceBlock &&
                            onCreateMaintenanceBlock ? (
                              <Tooltip
                                label={t(
                                  'roomsPage.maintenance.createFromBoard',
                                ).replace('{roomNumber}', room.roomNumber)}
                              >
                                <ActionIcon
                                  aria-label={t(
                                    'roomsPage.maintenance.createFromBoard',
                                  ).replace('{roomNumber}', room.roomNumber)}
                                  onClick={() => onCreateMaintenanceBlock(room)}
                                  radius="md"
                                  size="sm"
                                  variant="subtle"
                                >
                                  <Wrench size={14} />
                                </ActionIcon>
                              </Tooltip>
                            ) : null}
                          </Group>
                        ))}
                      </Group>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed" size="sm">
                  {t('roomsPage.board.noRoomsForStatus')}
                </Text>
              )}
            </Stack>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}

export default RoomStatusBoard;

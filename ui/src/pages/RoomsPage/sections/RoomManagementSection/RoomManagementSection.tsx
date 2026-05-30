import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { BedDouble, X, XCircle } from 'lucide-react';
import {
  MaintenanceBlockForm,
  MaintenanceBlocksPanel,
  isMaintenanceBlockDateRangeValid,
  useMaintenanceBlocks,
  type CreateMaintenanceBlockInput,
  type MaintenanceBlock,
  type MaintenanceBlockListFilters,
  type MaintenanceBlockRoomOption,
} from '../../../../features/maintenance-blocks';
import {
  useActiveRoomTypes,
  type RoomType,
} from '../../../../features/room-types';
import {
  ROOM_STATUS_VALUES,
  RoomForm,
  RoomInventoryTable,
  RoomStatusBoard,
  canManageRoomInventory,
  canUpdateRoomStatus,
  getAllowedRoomStatusUpdates,
  isRoomStatus,
  useRooms,
  type CreateRoomInput,
  type Room,
  type RoomListFilters,
  type UpdateRoomInput,
} from '../../../../features/rooms';
import {
  getRoomStatusLabel,
  type RoomStatus,
} from '../../../../features/statuses';
import { useI18n } from '../../../../i18n';
import { getRepositoryApiErrorTranslationKey } from '../../../../repositories';
import { useAppStore } from '../../../../store';

type RoomTypeOption = {
  id: string;
  name: string;
};

function toDateInputValue(date: Date): string {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function getFilterRoomTypeOptions(
  activeRoomTypes: RoomType[],
  rooms: Room[],
): RoomTypeOption[] {
  const roomTypesById = new Map<string, RoomTypeOption>();

  activeRoomTypes.forEach((roomType) => {
    roomTypesById.set(roomType.id, {
      id: roomType.id,
      name: roomType.name,
    });
  });

  rooms.forEach((room) => {
    if (!roomTypesById.has(room.roomType.id)) {
      roomTypesById.set(room.roomType.id, {
        id: room.roomType.id,
        name: room.roomType.name,
      });
    }
  });

  return [...roomTypesById.values()].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function RoomManagementSection() {
  const { t } = useI18n();
  const user = useAppStore((state) => state.auth.user);
  const role = user?.role ?? 'housekeeping';
  const [statusFilter, setStatusFilter] = useState<RoomStatus | null>(null);
  const [roomTypeFilter, setRoomTypeFilter] = useState<string | null>(null);
  const [floorFilter, setFloorFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [maintenanceRoom, setMaintenanceRoom] = useState<Room | null>(null);
  const [maintenanceBlockToCancel, setMaintenanceBlockToCancel] =
    useState<MaintenanceBlock | null>(null);
  const [maintenanceStartDate, setMaintenanceStartDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [maintenanceEndDate, setMaintenanceEndDate] = useState(() =>
    toDateInputValue(addDays(new Date(), 30)),
  );
  const canManageInventory = canManageRoomInventory(role);
  const filters = useMemo<RoomListFilters>(
    () => ({
      status: statusFilter ?? undefined,
      roomTypeId: roomTypeFilter ?? undefined,
      floor: floorFilter.trim() || undefined,
    }),
    [floorFilter, roomTypeFilter, statusFilter],
  );
  const maintenanceFilters = useMemo<MaintenanceBlockListFilters>(
    () => ({
      startDate: maintenanceStartDate,
      endDate: maintenanceEndDate,
      status: 'active',
    }),
    [maintenanceEndDate, maintenanceStartDate],
  );
  const canLoadMaintenanceBlocks = isMaintenanceBlockDateRangeValid(
    maintenanceStartDate,
    maintenanceEndDate,
  );
  const {
    createError,
    createRoom,
    isCreating,
    isLoading,
    isStatusUpdating,
    isUpdating,
    listError,
    rooms,
    statusUpdateError,
    updateError,
    updateRoom,
    updateRoomStatus,
  } = useRooms(filters);
  const {
    cancelError: maintenanceCancelError,
    cancelMaintenanceBlock,
    createError: maintenanceCreateError,
    createMaintenanceBlock,
    isCancelling: isCancellingMaintenanceBlock,
    isCreating: isCreatingMaintenanceBlock,
    isLoading: isLoadingMaintenanceBlocks,
    listError: maintenanceListError,
    maintenanceBlocks,
  } = useMaintenanceBlocks(maintenanceFilters, {
    enabled: canLoadMaintenanceBlocks,
  });
  const {
    activeRoomTypes,
    isLoading: isLoadingRoomTypes,
    listError: roomTypeListError,
  } = useActiveRoomTypes(canManageInventory);
  const roomTypeOptions = useMemo(
    () => getFilterRoomTypeOptions(activeRoomTypes, rooms),
    [activeRoomTypes, rooms],
  );
  const allowedStatusOptions = getAllowedRoomStatusUpdates(role);
  const canControlStatus = canUpdateRoomStatus(role);
  const statusSelectData = ROOM_STATUS_VALUES.map((status) => ({
    label: getRoomStatusLabel(status, t),
    value: status,
  }));
  const roomTypeSelectData = roomTypeOptions.map((roomType) => ({
    label: roomType.name,
    value: roomType.id,
  }));
  const maintenanceRoomOptions = useMemo<MaintenanceBlockRoomOption[]>(
    () =>
      rooms.map((room) => ({
        id: room.id,
        label: `${room.roomNumber} - ${room.roomType.name}`,
      })),
    [rooms],
  );
  const hasActiveFilters =
    Boolean(statusFilter) ||
    Boolean(roomTypeFilter) ||
    floorFilter.trim().length > 0;
  const listErrorMessage = listError
    ? t(getRepositoryApiErrorTranslationKey(listError))
    : null;
  const createErrorMessage = createError
    ? t(getRepositoryApiErrorTranslationKey(createError))
    : null;
  const updateErrorMessage = updateError
    ? t(getRepositoryApiErrorTranslationKey(updateError))
    : null;
  const statusUpdateErrorMessage = statusUpdateError
    ? t(getRepositoryApiErrorTranslationKey(statusUpdateError))
    : null;
  const roomTypeListErrorMessage = roomTypeListError
    ? t(getRepositoryApiErrorTranslationKey(roomTypeListError))
    : null;
  const maintenanceCreateErrorMessage = maintenanceCreateError
    ? t(getRepositoryApiErrorTranslationKey(maintenanceCreateError))
    : null;
  const maintenanceListErrorMessage = maintenanceListError
    ? t(getRepositoryApiErrorTranslationKey(maintenanceListError))
    : null;
  const maintenanceCancelErrorMessage = maintenanceCancelError
    ? t(getRepositoryApiErrorTranslationKey(maintenanceCancelError))
    : null;

  async function handleCreate(input: CreateRoomInput): Promise<void> {
    await createRoom(input);
    setIsCreateOpen(false);
  }

  async function handleUpdate(input: UpdateRoomInput): Promise<void> {
    if (!editingRoom) {
      return;
    }

    await updateRoom(editingRoom.id, input);
    setEditingRoom(null);
  }

  async function handleStatusChange(
    room: Room,
    status: RoomStatus,
  ): Promise<void> {
    await updateRoomStatus(room.id, status).catch(() => undefined);
  }

  async function handleCreateMaintenanceBlock(
    input: CreateMaintenanceBlockInput,
  ): Promise<void> {
    await createMaintenanceBlock(input);
    setMaintenanceRoom(null);
  }

  async function handleCancelMaintenanceBlock(): Promise<void> {
    if (!maintenanceBlockToCancel) {
      return;
    }

    await cancelMaintenanceBlock(maintenanceBlockToCancel.id);
    setMaintenanceBlockToCancel(null);
  }

  function clearFilters(): void {
    setStatusFilter(null);
    setRoomTypeFilter(null);
    setFloorFilter('');
  }

  return (
    <Box
      aria-labelledby="room-management-title"
      className="room-management-section"
      component="section"
    >
      <Stack gap="xl">
        <Stack gap="lg">
          <Group align="flex-end" justify="space-between">
            <Stack gap={2}>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                {t('roomsPage.management.eyebrow')}
              </Text>
              <Title id="room-management-title" order={2}>
                {t('roomsPage.management.title')}
              </Title>
            </Stack>
            {canManageInventory ? (
              <Button
                disabled={isLoadingRoomTypes || roomTypeOptions.length === 0}
                leftSection={<BedDouble size={18} />}
                onClick={() => setIsCreateOpen(true)}
                type="button"
              >
                {t('roomsPage.management.createAction')}
              </Button>
            ) : null}
          </Group>

          <Paper className="room-filter-panel" p="md" withBorder>
            <SimpleGrid cols={{ base: 1, md: 4 }}>
              <Select
                clearable
                data={statusSelectData}
                label={t('roomsPage.filters.status.label')}
                onChange={(value) => {
                  setStatusFilter(isRoomStatus(value) ? value : null);
                }}
                placeholder={t('roomsPage.filters.status.placeholder')}
                value={statusFilter}
              />
              <Select
                clearable
                data={roomTypeSelectData}
                label={t('roomsPage.filters.roomType.label')}
                onChange={setRoomTypeFilter}
                placeholder={t('roomsPage.filters.roomType.placeholder')}
                value={roomTypeFilter}
              />
              <TextInput
                label={t('roomsPage.filters.floor.label')}
                onChange={(event) => setFloorFilter(event.currentTarget.value)}
                placeholder={t('roomsPage.filters.floor.placeholder')}
                value={floorFilter}
              />
              <Group align="flex-end">
                <Tooltip label={t('common.actions.clear')}>
                  <Button
                    disabled={!hasActiveFilters}
                    leftSection={<X size={18} />}
                    onClick={clearFilters}
                    type="button"
                    variant="default"
                  >
                    {t('common.actions.clear')}
                  </Button>
                </Tooltip>
              </Group>
            </SimpleGrid>
          </Paper>

          {listErrorMessage ? (
            <Alert color="red" variant="light">
              {listErrorMessage}
            </Alert>
          ) : null}

          {roomTypeListErrorMessage ? (
            <Alert color="red" variant="light">
              {roomTypeListErrorMessage}
            </Alert>
          ) : null}

          {statusUpdateErrorMessage ? (
            <Alert color="red" variant="light">
              {statusUpdateErrorMessage}
            </Alert>
          ) : null}

          <RoomInventoryTable
            allowedStatusOptions={allowedStatusOptions}
            canManageInventory={canManageInventory}
            canUpdateStatus={canControlStatus}
            isLoading={isLoading}
            isStatusUpdating={isStatusUpdating}
            onEdit={setEditingRoom}
            onStatusChange={(room, status) =>
              void handleStatusChange(room, status)
            }
            rooms={rooms}
          />
        </Stack>

        <Stack gap="lg">
          <Stack gap={2}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('roomsPage.board.eyebrow')}
            </Text>
            <Title order={2}>{t('roomsPage.board.title')}</Title>
          </Stack>
          <RoomStatusBoard
            canCreateMaintenanceBlock={canManageInventory}
            isLoading={isLoading}
            onCreateMaintenanceBlock={setMaintenanceRoom}
            rooms={rooms}
          />
        </Stack>

        <Stack gap="lg">
          <Stack gap={2}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('roomsPage.maintenance.eyebrow')}
            </Text>
            <Title order={2}>{t('roomsPage.maintenance.title')}</Title>
          </Stack>
          <MaintenanceBlocksPanel
            blocks={maintenanceBlocks}
            canCancel={canManageInventory}
            endDate={maintenanceEndDate}
            errorMessage={
              !canLoadMaintenanceBlocks
                ? t('roomsPage.maintenance.filters.invalidRange')
                : maintenanceListErrorMessage
            }
            isCancelling={isCancellingMaintenanceBlock}
            isLoading={isLoadingMaintenanceBlocks}
            onCancel={setMaintenanceBlockToCancel}
            onEndDateChange={setMaintenanceEndDate}
            onStartDateChange={setMaintenanceStartDate}
            startDate={maintenanceStartDate}
          />
        </Stack>
      </Stack>

      <Modal
        onClose={() => setIsCreateOpen(false)}
        opened={isCreateOpen}
        title={t('roomsPage.form.createTitle')}
      >
        <RoomForm
          errorMessage={createErrorMessage}
          isSubmitting={isCreating}
          key={isCreateOpen ? 'create-open' : 'create-closed'}
          mode="create"
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={(values) => handleCreate(values as CreateRoomInput)}
          roomTypes={roomTypeOptions}
        />
      </Modal>

      <Modal
        onClose={() => setEditingRoom(null)}
        opened={Boolean(editingRoom)}
        title={t('roomsPage.form.updateTitle')}
      >
        {editingRoom ? (
          <RoomForm
            errorMessage={updateErrorMessage}
            isSubmitting={isUpdating}
            key={editingRoom.id}
            mode="update"
            onCancel={() => setEditingRoom(null)}
            onSubmit={(values) => handleUpdate(values as UpdateRoomInput)}
            room={editingRoom}
            roomTypes={roomTypeOptions}
          />
        ) : null}
      </Modal>

      <Modal
        onClose={() => setMaintenanceRoom(null)}
        opened={Boolean(maintenanceRoom)}
        title={t('roomsPage.maintenance.form.createTitle')}
      >
        {maintenanceRoom ? (
          <MaintenanceBlockForm
            defaultRoomId={maintenanceRoom.id}
            errorMessage={maintenanceCreateErrorMessage}
            isSubmitting={isCreatingMaintenanceBlock}
            key={maintenanceRoom.id}
            lockRoom
            onCancel={() => setMaintenanceRoom(null)}
            onSubmit={handleCreateMaintenanceBlock}
            roomOptions={maintenanceRoomOptions}
          />
        ) : null}
      </Modal>

      <Modal
        onClose={() => setMaintenanceBlockToCancel(null)}
        opened={Boolean(maintenanceBlockToCancel)}
        title={t('roomsPage.maintenance.cancel.title')}
      >
        {maintenanceBlockToCancel ? (
          <Stack gap="md">
            <Text>
              {t('roomsPage.maintenance.cancel.description')
                .replace(
                  '{roomNumber}',
                  maintenanceBlockToCancel.room.roomNumber,
                )
                .replace('{startDate}', maintenanceBlockToCancel.startDate)
                .replace('{endDate}', maintenanceBlockToCancel.endDate)}
            </Text>

            {maintenanceCancelErrorMessage ? (
              <Alert color="red" variant="light">
                {maintenanceCancelErrorMessage}
              </Alert>
            ) : null}

            <Group justify="flex-end">
              <Button
                disabled={isCancellingMaintenanceBlock}
                onClick={() => setMaintenanceBlockToCancel(null)}
                type="button"
                variant="default"
              >
                {t('common.actions.cancel')}
              </Button>
              <Button
                color="red"
                leftSection={<XCircle size={18} />}
                loading={isCancellingMaintenanceBlock}
                onClick={() =>
                  void handleCancelMaintenanceBlock().catch(() => undefined)
                }
                type="button"
              >
                {t('roomsPage.maintenance.cancel.confirm')}
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </Box>
  );
}

export default RoomManagementSection;

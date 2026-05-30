import type { UserRole } from '../../auth';
import type { RoomStatus } from '../../statuses';
import type { MaintenanceBlock } from '../types';
import type {
  CreateMaintenanceBlockInput,
  MaintenanceBlockListFilters,
  MaintenanceBlockRepository,
} from './MaintenanceBlockRepository';

type MockRoomSummary = {
  id: string;
  roomNumber: string;
  status: RoomStatus;
};

const mockRooms: MockRoomSummary[] = [
  {
    id: 'mock-room-101',
    roomNumber: '101',
    status: 'available',
  },
  {
    id: 'mock-room-102',
    roomNumber: '102',
    status: 'cleaning',
  },
  {
    id: 'mock-room-201',
    roomNumber: '201',
    status: 'reserved',
  },
];

const mockStaffUser = {
  id: 'mock-staff-reception',
  username: 'front-desk',
  role: 'reception' as UserRole,
};

function getRoom(roomId: string): MockRoomSummary {
  const room = mockRooms.find((currentRoom) => currentRoom.id === roomId);

  if (!room) {
    throw new Error('Room not found');
  }

  return room;
}

function overlaps(
  block: MaintenanceBlock,
  filters: MaintenanceBlockListFilters,
): boolean {
  if (!filters.startDate || !filters.endDate) {
    return true;
  }

  return block.startDate < filters.endDate && block.endDate > filters.startDate;
}

function sortMaintenanceBlocks(
  maintenanceBlocks: MaintenanceBlock[],
): MaintenanceBlock[] {
  return [...maintenanceBlocks].sort((first, second) => {
    const startDateCompare = first.startDate.localeCompare(second.startDate);

    return startDateCompare === 0
      ? first.room.roomNumber.localeCompare(second.room.roomNumber)
      : startDateCompare;
  });
}

export function createMockMaintenanceBlockRepository(): MaintenanceBlockRepository {
  let nextId = 1;
  let maintenanceBlocks: MaintenanceBlock[] = [
    {
      id: 'mock-maintenance-block-1',
      room: getRoom('mock-room-102'),
      startDate: '2026-06-01',
      endDate: '2026-06-03',
      reason: 'Air conditioner service',
      status: 'active',
      createdBy: mockStaffUser,
      createdAt: '2026-05-30T12:00:00.000Z',
      updatedAt: '2026-05-30T12:00:00.000Z',
    },
  ];

  return {
    async cancelMaintenanceBlock(
      _token: string,
      maintenanceBlockId: string,
    ): Promise<MaintenanceBlock> {
      const maintenanceBlock = maintenanceBlocks.find(
        (currentBlock) => currentBlock.id === maintenanceBlockId,
      );

      if (!maintenanceBlock) {
        throw new Error('Maintenance block not found');
      }

      if (maintenanceBlock.status === 'cancelled') {
        throw new Error('Maintenance block is already cancelled');
      }

      const now = new Date().toISOString();
      const cancelledBlock: MaintenanceBlock = {
        ...maintenanceBlock,
        status: 'cancelled',
        cancelledAt: now,
        cancelledBy: mockStaffUser,
        updatedAt: now,
      };

      maintenanceBlocks = maintenanceBlocks.map((currentBlock) =>
        currentBlock.id === maintenanceBlockId
          ? cancelledBlock
          : currentBlock,
      );

      return cancelledBlock;
    },

    async createMaintenanceBlock(
      _token: string,
      input: CreateMaintenanceBlockInput,
    ): Promise<MaintenanceBlock> {
      const hasOverlap = maintenanceBlocks.some(
        (maintenanceBlock) =>
          maintenanceBlock.room.id === input.roomId &&
          maintenanceBlock.status === 'active' &&
          maintenanceBlock.startDate < input.endDate &&
          maintenanceBlock.endDate > input.startDate,
      );

      if (hasOverlap) {
        throw new Error('Room already has an active maintenance block');
      }

      const now = new Date().toISOString();
      const maintenanceBlock: MaintenanceBlock = {
        id: `mock-maintenance-block-${nextId + 1}`,
        room: getRoom(input.roomId),
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
        status: 'active',
        createdBy: mockStaffUser,
        createdAt: now,
        updatedAt: now,
      };

      nextId += 1;
      maintenanceBlocks = [...maintenanceBlocks, maintenanceBlock];

      return maintenanceBlock;
    },

    async listMaintenanceBlocks(
      _token: string,
      filters: MaintenanceBlockListFilters = {},
    ): Promise<MaintenanceBlock[]> {
      return sortMaintenanceBlocks(
        maintenanceBlocks.filter((maintenanceBlock) => {
          const matchesRoom =
            !filters.roomId || maintenanceBlock.room.id === filters.roomId;
          const matchesStatus =
            !filters.status || maintenanceBlock.status === filters.status;

          return matchesRoom && matchesStatus && overlaps(maintenanceBlock, filters);
        }),
      );
    },
  };
}

export default createMockMaintenanceBlockRepository;

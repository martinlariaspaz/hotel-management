import type { MaintenanceBlock, MaintenanceBlockStatus } from '../types';

export type MaintenanceBlockListFilters = {
  endDate?: string;
  roomId?: string;
  startDate?: string;
  status?: MaintenanceBlockStatus;
};

export type CreateMaintenanceBlockInput = {
  endDate: string;
  reason: string;
  roomId: string;
  startDate: string;
};

export type MaintenanceBlockRepository = {
  cancelMaintenanceBlock(
    token: string,
    maintenanceBlockId: string,
  ): Promise<MaintenanceBlock>;
  createMaintenanceBlock(
    token: string,
    input: CreateMaintenanceBlockInput,
  ): Promise<MaintenanceBlock>;
  listMaintenanceBlocks(
    token: string,
    filters?: MaintenanceBlockListFilters,
  ): Promise<MaintenanceBlock[]>;
};

export type { MaintenanceBlockRepository as default };

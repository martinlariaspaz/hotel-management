import type { StaffUser } from '../types';
import type {
  CreateStaffUserInput,
  StaffRepository,
  UpdateStaffUserInput,
} from './StaffRepository';

const initialStaffUsers: StaffUser[] = [
  {
    id: 'mock-admin',
    username: 'mock.admin',
    role: 'admin',
    isActive: true,
  },
  {
    id: 'mock-reception',
    username: 'mock.reception',
    role: 'reception',
    isActive: true,
  },
  {
    id: 'mock-housekeeping',
    username: 'mock.housekeeping',
    role: 'housekeeping',
    isActive: true,
  },
  {
    id: 'mock-management',
    username: 'mock.management',
    role: 'management',
    isActive: true,
  },
];

export function createMockStaffRepository(): StaffRepository {
  let nextId = 1;
  let staffUsers = [...initialStaffUsers];

  return {
    async createStaffUser(
      _token: string,
      input: CreateStaffUserInput,
    ): Promise<StaffUser> {
      if (staffUsers.some((user) => user.username === input.username)) {
        throw new Error('Username already exists');
      }

      const user: StaffUser = {
        id: `mock-staff-${nextId}`,
        username: input.username,
        role: input.role,
        isActive: input.isActive,
      };

      nextId += 1;
      staffUsers = [...staffUsers, user];

      return user;
    },

    async listStaffUsers(): Promise<StaffUser[]> {
      return [...staffUsers].sort((first, second) =>
        first.username.localeCompare(second.username),
      );
    },

    async updateStaffUser(
      _token: string,
      staffUserId: string,
      input: UpdateStaffUserInput,
    ): Promise<StaffUser> {
      const existingUser = staffUsers.find((user) => user.id === staffUserId);

      if (!existingUser) {
        throw new Error('Staff user not found');
      }

      const updatedUser: StaffUser = {
        ...existingUser,
        ...input,
      };

      staffUsers = staffUsers.map((user) =>
        user.id === staffUserId ? updatedUser : user,
      );

      return updatedUser;
    },
  };
}

export default createMockStaffRepository;

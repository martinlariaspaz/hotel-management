import {
  createContext,
  type PropsWithChildren,
  useContext,
} from 'react';
import { API_URL } from '../config';
import {
  createHttpAuthRepository,
  createMockAuthRepository,
  type AuthRepository,
} from '../features/auth/repositories';
import {
  createHttpHealthRepository,
  createMockHealthRepository,
  type HealthRepository,
} from '../features/health/repositories';
import {
  createHttpRoomTypeRepository,
  createMockRoomTypeRepository,
  type RoomTypeRepository,
} from '../features/room-types/repositories';
import {
  createHttpRoomRepository,
  createMockRoomRepository,
  type RoomRepository,
} from '../features/rooms/repositories';
import {
  createHttpStaffRepository,
  createMockStaffRepository,
  type StaffRepository,
} from '../features/staff/repositories';

export type Repositories = {
  authRepository: AuthRepository;
  healthRepository: HealthRepository;
  roomRepository: RoomRepository;
  roomTypeRepository: RoomTypeRepository;
  staffRepository: StaffRepository;
};

export type RepositoryEnvironment = 'development' | 'mock' | 'production' | 'test';

export type CreateRepositoriesOptions = {
  environment?: RepositoryEnvironment;
  overrides?: Partial<Repositories>;
};

const RepositoryContext = createContext<Repositories | null>(null);

function isRepositoryEnvironment(
  value: string | null | undefined,
): value is RepositoryEnvironment {
  return (
    value === 'development' ||
    value === 'mock' ||
    value === 'production' ||
    value === 'test'
  );
}

function getRepositoryEnvironment(): RepositoryEnvironment {
  const configuredEnvironment = import.meta.env.VITE_REPOSITORY_ENV;

  if (isRepositoryEnvironment(configuredEnvironment)) {
    return configuredEnvironment;
  }

  if (import.meta.env.MODE === 'test') {
    return 'test';
  }

  return import.meta.env.PROD ? 'production' : 'development';
}

function createBaseRepositories(
  environment: RepositoryEnvironment,
): Repositories {
  if (environment === 'mock' || environment === 'test') {
    return {
      authRepository: createMockAuthRepository(),
      healthRepository: createMockHealthRepository(),
      roomRepository: createMockRoomRepository(),
      roomTypeRepository: createMockRoomTypeRepository(),
      staffRepository: createMockStaffRepository(),
    };
  }

  return {
    authRepository: createHttpAuthRepository(API_URL),
    healthRepository: createHttpHealthRepository(API_URL),
    roomRepository: createHttpRoomRepository(API_URL),
    roomTypeRepository: createHttpRoomTypeRepository(API_URL),
    staffRepository: createHttpStaffRepository(API_URL),
  };
}

export function createRepositories(
  options: CreateRepositoriesOptions = {},
): Repositories {
  return {
    ...createBaseRepositories(options.environment ?? getRepositoryEnvironment()),
    ...options.overrides,
  };
}

export function RepositoryProvider({
  children,
  repositories,
}: PropsWithChildren<{ repositories: Repositories }>) {
  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories(): Repositories {
  const repositories = useContext(RepositoryContext);

  if (!repositories) {
    throw new Error('useRepositories must be used within RepositoryProvider');
  }

  return repositories;
}

export default RepositoryProvider;

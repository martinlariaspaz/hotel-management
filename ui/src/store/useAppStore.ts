import { create } from 'zustand';
import {
  createAuthSlice,
  type AuthSlice,
} from './slices';

export type AppStore = AuthSlice;

export const useAppStore = create<AppStore>()((...args) => ({
  ...createAuthSlice(...args),
}));

export default useAppStore;

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface UserState {
  user: User | null;
  isOnboarded: boolean;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  setOnboarded: (value: boolean) => void;
  incrementStreak: () => void;
  addPoints: (points: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isOnboarded: false,

      setUser: (user) => set({ user }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      setOnboarded: (value) => set({ isOnboarded: value }),

      incrementStreak: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, streak: state.user.streak + 1 }
            : null,
        })),

      addPoints: (points) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, totalPoints: state.user.totalPoints + points }
            : null,
        })),

      logout: () => set({ user: null, isOnboarded: false }),
    }),
    {
      name: 'lotus-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

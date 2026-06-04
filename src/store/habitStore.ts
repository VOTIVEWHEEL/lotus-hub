import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCompletion } from '../types';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

interface HabitState {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completions' | 'streak' | 'bestStreak' | 'createdAt'>) => void;
  updateHabit: (id: string, partial: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  logCompletion: (habitId: string, note?: string) => void;
  undoCompletion: (habitId: string, date: string) => void;
  isCompletedToday: (habitId: string) => boolean;
  getTodaysHabits: () => Habit[];
  getCompletionRate: (habitId: string, days: number) => number;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: uuid(),
              completions: [],
              streak: 0,
              bestStreak: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateHabit: (id, partial) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...partial } : h
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      logCompletion: (habitId, note) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const alreadyDone = h.completions.some((c) => c.date === today);
            if (alreadyDone) return h;
            const newCompletions = [
              ...h.completions,
              { id: uuid(), habitId, date: today, count: 1, note },
            ];
            const newStreak = h.streak + 1;
            return {
              ...h,
              completions: newCompletions,
              streak: newStreak,
              bestStreak: Math.max(h.bestStreak, newStreak),
            };
          }),
        }));
      },

      undoCompletion: (habitId, date) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completions: h.completions.filter((c) => c.date !== date),
                  streak: Math.max(0, h.streak - 1),
                }
              : h
          ),
        })),

      isCompletedToday: (habitId) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const habit = get().habits.find((h) => h.id === habitId);
        return habit?.completions.some((c) => c.date === today) ?? false;
      },

      getTodaysHabits: () => {
        const dayOfWeek = new Date().getDay();
        return get().habits.filter((h) => {
          if (h.isArchived) return false;
          if (h.frequency === 'daily') return true;
          if (h.frequency === 'weekly') return true;
          if (h.frequency === 'custom') {
            return h.targetDays?.includes(dayOfWeek) ?? false;
          }
          return false;
        });
      },

      getCompletionRate: (habitId, days) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return 0;
        const now = new Date();
        let completed = 0;
        for (let i = 0; i < days; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = format(d, 'yyyy-MM-dd');
          if (habit.completions.some((c) => c.date === dateStr)) completed++;
        }
        return (completed / days) * 100;
      },
    }),
    {
      name: 'lotus-habits',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

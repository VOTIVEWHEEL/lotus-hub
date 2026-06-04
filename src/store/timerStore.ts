import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerMode, TimerSession, TimerSettings } from '../types';
import { v4 as uuid } from 'uuid';

interface TimerState {
  settings: TimerSettings;
  sessions: TimerSession[];
  currentMode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;       // seconds
  sessionsCompleted: number;   // in current cycle
  activeTaskId?: string;
  activeCourseId?: string;

  updateSettings: (partial: Partial<TimerSettings>) => void;
  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  completeSession: () => void;
  setActiveTask: (taskId?: string) => void;
  setActiveCourse: (courseId?: string) => void;
  getTodayStudyMinutes: () => number;
  getTotalSessions: () => number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      sessions: [],
      currentMode: 'focus',
      isRunning: false,
      isPaused: false,
      timeRemaining: DEFAULT_SETTINGS.focusDuration * 60,
      sessionsCompleted: 0,

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      setMode: (mode) =>
        set((state) => {
          const { settings } = state;
          const durations: Record<TimerMode, number> = {
            focus: settings.focusDuration * 60,
            short_break: settings.shortBreakDuration * 60,
            long_break: settings.longBreakDuration * 60,
          };
          return {
            currentMode: mode,
            timeRemaining: durations[mode],
            isRunning: false,
            isPaused: false,
          };
        }),

      start: () => set({ isRunning: true, isPaused: false }),

      pause: () => set({ isRunning: false, isPaused: true }),

      resume: () => set({ isRunning: true, isPaused: false }),

      reset: () =>
        set((state) => {
          const { settings, currentMode } = state;
          const durations: Record<TimerMode, number> = {
            focus: settings.focusDuration * 60,
            short_break: settings.shortBreakDuration * 60,
            long_break: settings.longBreakDuration * 60,
          };
          return {
            timeRemaining: durations[currentMode],
            isRunning: false,
            isPaused: false,
          };
        }),

      tick: () =>
        set((state) => {
          if (!state.isRunning || state.timeRemaining <= 0) return state;
          return { timeRemaining: state.timeRemaining - 1 };
        }),

      completeSession: () =>
        set((state) => {
          const { settings, sessionsCompleted, currentMode, activeTaskId, activeCourseId } = state;
          const session: TimerSession = {
            id: uuid(),
            mode: currentMode,
            duration:
              currentMode === 'focus'
                ? settings.focusDuration * 60
                : currentMode === 'short_break'
                ? settings.shortBreakDuration * 60
                : settings.longBreakDuration * 60,
            taskId: activeTaskId,
            courseId: activeCourseId,
            completedAt: new Date().toISOString(),
            wasCompleted: true,
          };

          let newSessionsCompleted = sessionsCompleted;
          let nextMode: TimerMode = currentMode;

          if (currentMode === 'focus') {
            newSessionsCompleted = sessionsCompleted + 1;
            if (newSessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
              nextMode = 'long_break';
            } else {
              nextMode = 'short_break';
            }
          } else {
            nextMode = 'focus';
          }

          const durations: Record<TimerMode, number> = {
            focus: settings.focusDuration * 60,
            short_break: settings.shortBreakDuration * 60,
            long_break: settings.longBreakDuration * 60,
          };

          return {
            sessions: [...state.sessions, session],
            sessionsCompleted: newSessionsCompleted,
            currentMode: nextMode,
            timeRemaining: durations[nextMode],
            isRunning: false,
            isPaused: false,
          };
        }),

      setActiveTask: (taskId) => set({ activeTaskId: taskId }),
      setActiveCourse: (courseId) => set({ activeCourseId: courseId }),

      getTodayStudyMinutes: () => {
        const today = new Date().toDateString();
        return get()
          .sessions.filter(
            (s) =>
              s.mode === 'focus' &&
              s.wasCompleted &&
              new Date(s.completedAt).toDateString() === today
          )
          .reduce((sum, s) => sum + s.duration / 60, 0);
      },

      getTotalSessions: () =>
        get().sessions.filter((s) => s.mode === 'focus' && s.wasCompleted).length,
    }),
    {
      name: 'lotus-timer',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        sessions: state.sessions,
        sessionsCompleted: state.sessionsCompleted,
      }),
    }
  )
);

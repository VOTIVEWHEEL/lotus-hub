import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskStatus, TaskPriority, Subtask } from '../types';
import { v4 as uuid } from 'uuid';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  getByStatus: (status: TaskStatus) => Task[];
  getOverdue: () => Task[];
  getDueToday: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: uuid(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, partial) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      setStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  updatedAt: new Date().toISOString(),
                  completedAt: status === 'done' ? new Date().toISOString() : undefined,
                }
              : t
          ),
        })),

      toggleSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      addSubtask: (taskId, title) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: [
                    ...t.subtasks,
                    { id: uuid(), title, completed: false },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      getByStatus: (status) => get().tasks.filter((t) => t.status === status),

      getOverdue: () => {
        const now = new Date();
        return get().tasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
        );
      },

      getDueToday: () => {
        const today = new Date().toDateString();
        return get().tasks.filter(
          (t) =>
            t.dueDate &&
            new Date(t.dueDate).toDateString() === today &&
            t.status !== 'done'
        );
      },
    }),
    {
      name: 'lotus-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

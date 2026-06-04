import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, Assessment } from '../types';
import { v4 as uuid } from 'uuid';

interface CourseState {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, partial: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addAssessment: (courseId: string, assessment: Omit<Assessment, 'id'>) => void;
  updateAssessment: (courseId: string, assessmentId: string, partial: Partial<Assessment>) => void;
  deleteAssessment: (courseId: string, assessmentId: string) => void;
  getGPA: () => number;
  getCourseGrade: (courseId: string) => number | null;
}

const calculateGrade = (assessments: Assessment[]): number | null => {
  const completed = assessments.filter((a) => a.isCompleted && a.score !== undefined);
  if (completed.length === 0) return null;

  const totalWeight = completed.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight === 0) return null;

  const weightedScore = completed.reduce(
    (sum, a) => sum + ((a.score! / a.maxScore) * 100 * a.weight),
    0
  );
  return weightedScore / totalWeight;
};

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: [],

      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, { ...course, id: uuid() }],
        })),

      updateCourse: (id, partial) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...partial } : c
          ),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        })),

      addAssessment: (courseId, assessment) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  assessments: [
                    ...c.assessments,
                    { ...assessment, id: uuid() },
                  ],
                  currentGrade: calculateGrade([
                    ...c.assessments,
                    { ...assessment, id: uuid() },
                  ]) ?? c.currentGrade,
                }
              : c
          ),
        })),

      updateAssessment: (courseId, assessmentId, partial) =>
        set((state) => ({
          courses: state.courses.map((c) => {
            if (c.id !== courseId) return c;
            const updated = c.assessments.map((a) =>
              a.id === assessmentId ? { ...a, ...partial } : a
            );
            return {
              ...c,
              assessments: updated,
              currentGrade: calculateGrade(updated) ?? c.currentGrade,
            };
          }),
        })),

      deleteAssessment: (courseId, assessmentId) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  assessments: c.assessments.filter((a) => a.id !== assessmentId),
                }
              : c
          ),
        })),

      getCourseGrade: (courseId) => {
        const course = get().courses.find((c) => c.id === courseId);
        if (!course) return null;
        return calculateGrade(course.assessments);
      },

      getGPA: () => {
        const active = get().courses.filter((c) => c.isActive);
        if (active.length === 0) return 0;
        const grades = active
          .map((c) => calculateGrade(c.assessments))
          .filter((g): g is number => g !== null);
        if (grades.length === 0) return 0;
        return grades.reduce((a, b) => a + b, 0) / grades.length;
      },
    }),
    {
      name: 'lotus-courses',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

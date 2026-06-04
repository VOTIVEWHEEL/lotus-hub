// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  institution?: string;
  program?: string;
  yearOfStudy?: number;
  joinedAt: string;
  streak: number;
  totalPoints: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export type GradeScale = 'percentage' | 'gpa' | 'letter';

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  color: string;
  credits: number;
  gradeScale: GradeScale;
  assessments: Assessment[];
  schedule: ClassSchedule[];
  notes?: string;
  targetGrade?: number;
  currentGrade?: number;
  semester: string;
  isActive: boolean;
}

export interface Assessment {
  id: string;
  name: string;
  type: 'exam' | 'quiz' | 'assignment' | 'project' | 'lab' | 'other';
  weight: number;       // percentage weight in final grade
  score?: number;       // actual score
  maxScore: number;
  dueDate?: string;
  isCompleted: boolean;
}

export interface ClassSchedule {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  startTime: string;    // "HH:MM"
  endTime: string;
  location?: string;
  type: 'lecture' | 'tutorial' | 'lab' | 'online';
}

// ─── Notes ────────────────────────────────────────────────────────────────────
export type NoteType = 'text' | 'markdown' | 'checklist';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  courseId?: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: 0 | 1 | 2 | 3;  // 0=new, 1=easy, 2=medium, 3=hard
  nextReview?: string;
  reviewCount: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description?: string;
  courseId?: string;
  color: string;
  cards: Flashcard[];
  createdAt: string;
  lastStudied?: string;
}

// ─── Habits ───────────────────────────────────────────────────────────────────
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type HabitCategory = 'study' | 'health' | 'wellness' | 'social' | 'other';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays?: number[];   // 0=Sun, 1=Mon, ... for custom
  targetCount: number;     // how many times per period
  completions: HabitCompletion[];
  streak: number;
  bestStreak: number;
  createdAt: string;
  isArchived: boolean;
  reminder?: string;       // "HH:MM"
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;            // "YYYY-MM-DD"
  count: number;
  note?: string;
}

// ─── Timer ────────────────────────────────────────────────────────────────────
export type TimerMode = 'focus' | 'short_break' | 'long_break';

export interface TimerSession {
  id: string;
  mode: TimerMode;
  duration: number;        // seconds
  taskId?: string;
  courseId?: string;
  completedAt: string;
  wasCompleted: boolean;
}

export interface TimerSettings {
  focusDuration: number;       // minutes, default 25
  shortBreakDuration: number;  // minutes, default 5
  longBreakDuration: number;   // minutes, default 15
  sessionsBeforeLongBreak: number;  // default 4
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// ─── Community ────────────────────────────────────────────────────────────────
export type PostCategory = 'general' | 'study_help' | 'resources' | 'motivation' | 'events';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  icon: string;
  color: string;
  members: GroupMember[];
  posts: Post[];
  isPublic: boolean;
  createdAt: string;
  createdBy: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface Post {
  id: string;
  groupId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  category: PostCategory;
  attachments?: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: string[];
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface DailyStats {
  date: string;
  studyMinutes: number;
  tasksCompleted: number;
  habitsCompleted: number;
  pomodoroSessions: number;
}

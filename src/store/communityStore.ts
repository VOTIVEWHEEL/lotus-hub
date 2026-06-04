import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyGroup, Post, Comment } from '../types';
import { v4 as uuid } from 'uuid';

interface CommunityState {
  groups: StudyGroup[];
  posts: Post[];   // global feed
  joinedGroupIds: string[];

  addGroup: (group: Omit<StudyGroup, 'id' | 'createdAt' | 'members' | 'posts'>, userId: string, userName: string) => void;
  joinGroup: (groupId: string, userId: string, userName: string) => void;
  leaveGroup: (groupId: string, userId: string) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>) => void;
  likePost: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => void;
  likeComment: (postId: string, commentId: string, userId: string) => void;
  deletePost: (postId: string) => void;
  getGroupPosts: (groupId: string) => Post[];
  getFeedPosts: () => Post[];
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      groups: [],
      posts: [],
      joinedGroupIds: [],

      addGroup: (group, userId, userName) =>
        set((state) => ({
          groups: [
            ...state.groups,
            {
              ...group,
              id: uuid(),
              createdAt: new Date().toISOString(),
              members: [
                {
                  userId,
                  name: userName,
                  role: 'admin',
                  joinedAt: new Date().toISOString(),
                },
              ],
              posts: [],
            },
          ],
        })),

      joinGroup: (groupId, userId, userName) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  members: [
                    ...g.members,
                    {
                      userId,
                      name: userName,
                      role: 'member' as const,
                      joinedAt: new Date().toISOString(),
                    },
                  ],
                }
              : g
          ),
          joinedGroupIds: [...state.joinedGroupIds, groupId],
        })),

      leaveGroup: (groupId, userId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, members: g.members.filter((m) => m.userId !== userId) }
              : g
          ),
          joinedGroupIds: state.joinedGroupIds.filter((id) => id !== groupId),
        })),

      addPost: (post) =>
        set((state) => ({
          posts: [
            {
              ...post,
              id: uuid(),
              likes: [],
              comments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.posts,
          ],
        })),

      likePost: (postId, userId) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes: p.likes.includes(userId)
                    ? p.likes.filter((id) => id !== userId)
                    : [...p.likes, userId],
                }
              : p
          ),
        })),

      addComment: (postId, comment) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    {
                      ...comment,
                      id: uuid(),
                      likes: [],
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : p
          ),
        })),

      likeComment: (postId, commentId, userId) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.map((c) =>
                    c.id === commentId
                      ? {
                          ...c,
                          likes: c.likes.includes(userId)
                            ? c.likes.filter((id) => id !== userId)
                            : [...c.likes, userId],
                        }
                      : c
                  ),
                }
              : p
          ),
        })),

      deletePost: (postId) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
        })),

      getGroupPosts: (groupId) =>
        get().posts.filter((p) => p.groupId === groupId),

      getFeedPosts: () =>
        get()
          .posts.filter((p) => !p.groupId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
    }),
    {
      name: 'lotus-community',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

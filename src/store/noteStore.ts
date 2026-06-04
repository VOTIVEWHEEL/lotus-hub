import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, FlashcardDeck, Flashcard } from '../types';
import { v4 as uuid } from 'uuid';

interface NoteState {
  notes: Note[];
  decks: FlashcardDeck[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, partial: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt'>) => void;
  updateDeck: (id: string, partial: Partial<FlashcardDeck>) => void;
  deleteDeck: (id: string) => void;
  addCard: (deckId: string, card: Omit<Flashcard, 'id' | 'reviewCount'>) => void;
  updateCard: (deckId: string, cardId: string, partial: Partial<Flashcard>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  searchNotes: (query: string) => Note[];
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      decks: [],

      addNote: (note) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: uuid(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateNote: (id, partial) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...partial, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      togglePin: (id) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isPinned: !n.isPinned } : n
          ),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
          ),
        })),

      addDeck: (deck) =>
        set((state) => ({
          decks: [
            ...state.decks,
            { ...deck, id: uuid(), createdAt: new Date().toISOString() },
          ],
        })),

      updateDeck: (id, partial) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === id ? { ...d, ...partial } : d
          ),
        })),

      deleteDeck: (id) =>
        set((state) => ({ decks: state.decks.filter((d) => d.id !== id) })),

      addCard: (deckId, card) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  cards: [...d.cards, { ...card, id: uuid(), reviewCount: 0 }],
                }
              : d
          ),
        })),

      updateCard: (deckId, cardId, partial) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map((c) =>
                    c.id === cardId ? { ...c, ...partial } : c
                  ),
                }
              : d
          ),
        })),

      deleteCard: (deckId, cardId) =>
        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
              : d
          ),
        })),

      searchNotes: (query) => {
        const q = query.toLowerCase();
        return get().notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q))
        );
      },
    }),
    {
      name: 'lotus-notes',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

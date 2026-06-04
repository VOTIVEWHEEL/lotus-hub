import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useNoteStore } from '../../store';
import { Note, FlashcardDeck } from '../../types';

type Tab = 'notes' | 'flashcards';

const NOTE_COLORS = ['#5B8A6F', '#6B8FBF', '#9B7FBF', '#E8A87C', '#E07070', '#7FBF9B'];

export const NotesScreen: React.FC = () => {
  const { notes, decks, addNote, updateNote, deleteNote, togglePin, toggleFavorite, addDeck, deleteDeck, addCard } = useNoteStore();

  const [tab, setTab] = useState<Tab>('notes');
  const [search, setSearch] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddDeck, setShowAddDeck] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);

  // Deck form
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');
  const [deckColor, setDeckColor] = useState(NOTE_COLORS[1]);

  const filteredNotes = useMemo(() => {
    const q = search.toLowerCase();
    const list = q
      ? notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      : notes;
    return [...list.filter((n) => n.isPinned), ...list.filter((n) => !n.isPinned)];
  }, [notes, search]);

  const handleAddNote = () => {
    if (!noteTitle.trim()) return;
    addNote({ title: noteTitle.trim(), content: noteContent, type: 'text', tags: [], isPinned: false, isFavorite: false, color: noteColor });
    setNoteTitle(''); setNoteContent(''); setNoteColor(NOTE_COLORS[0]);
    setShowAddNote(false);
  };

  const handleAddDeck = () => {
    if (!deckName.trim()) return;
    addDeck({ name: deckName.trim(), description: deckDesc, color: deckColor, cards: [] });
    setDeckName(''); setDeckDesc(''); setDeckColor(NOTE_COLORS[1]);
    setShowAddDeck(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => tab === 'notes' ? setShowAddNote(true) : setShowAddDeck(true)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder="Search notes..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['notes', 'flashcards'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'notes' ? `Notes (${notes.length})` : `Flashcard Decks (${decks.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {tab === 'notes' ? (
          filteredNotes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptySub}>Tap + to create your first note</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredNotes.map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.noteCard, { borderLeftColor: note.color ?? Colors.primary }]}
                  onPress={() => setSelectedNote(note)}
                  onLongPress={() => Alert.alert('Note', 'What would you like to do?', [
                    { text: note.isPinned ? 'Unpin' : 'Pin', onPress: () => togglePin(note.id) },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteNote(note.id) },
                    { text: 'Cancel', style: 'cancel' },
                  ])}
                >
                  <View style={styles.noteCardHeader}>
                    <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                    {note.isPinned && <Ionicons name="pin" size={12} color={Colors.accent} />}
                  </View>
                  <Text style={styles.notePreview} numberOfLines={3}>{note.content}</Text>
                  <Text style={styles.noteDate}>{format(new Date(note.updatedAt), 'MMM d')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : (
          decks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🃏</Text>
              <Text style={styles.emptyTitle}>No decks yet</Text>
              <Text style={styles.emptySub}>Create a flashcard deck to start studying</Text>
            </View>
          ) : (
            decks.map((deck) => (
              <TouchableOpacity
                key={deck.id}
                style={[styles.deckCard, { borderLeftColor: deck.color }]}
                onPress={() => setSelectedDeck(deck)}
                onLongPress={() => Alert.alert('Delete deck?', undefined, [
                  { text: 'Delete', style: 'destructive', onPress: () => deleteDeck(deck.id) },
                  { text: 'Cancel', style: 'cancel' },
                ])}
              >
                <View style={[styles.deckIcon, { backgroundColor: deck.color + '20' }]}>
                  <Text style={styles.deckIconText}>🃏</Text>
                </View>
                <View style={styles.deckInfo}>
                  <Text style={styles.deckName}>{deck.name}</Text>
                  <Text style={styles.deckMeta}>{deck.cards.length} cards</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))
          )
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Note Modal */}
      <Modal visible={showAddNote} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddNote(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddNote(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Note</Text>
            <TouchableOpacity onPress={handleAddNote}>
              <Text style={[styles.modalSave, !noteTitle.trim() && { opacity: 0.4 }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput style={styles.input} placeholder="Note title" placeholderTextColor={Colors.textMuted} value={noteTitle} onChangeText={setNoteTitle} autoFocus />
            <Text style={styles.fieldLabel}>Content</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Write your note..." placeholderTextColor={Colors.textMuted} value={noteContent} onChangeText={setNoteContent} multiline />
            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {NOTE_COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, noteColor === c && styles.colorDotActive]} onPress={() => setNoteColor(c)} />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Deck Modal */}
      <Modal visible={showAddDeck} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddDeck(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddDeck(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Deck</Text>
            <TouchableOpacity onPress={handleAddDeck}>
              <Text style={[styles.modalSave, !deckName.trim() && { opacity: 0.4 }]}>Create</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Deck Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Biology Chapter 3" placeholderTextColor={Colors.textMuted} value={deckName} onChangeText={setDeckName} autoFocus />
            <Text style={styles.fieldLabel}>Description (optional)</Text>
            <TextInput style={styles.input} placeholder="What's this deck about?" placeholderTextColor={Colors.textMuted} value={deckDesc} onChangeText={setDeckDesc} />
            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {NOTE_COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, deckColor === c && styles.colorDotActive]} onPress={() => setDeckColor(c)} />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Note View Modal */}
      {selectedNote && (
        <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedNote(null)}>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedNote(null)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedNote.title}</Text>
              <TouchableOpacity onPress={() => { toggleFavorite(selectedNote.id); setSelectedNote({ ...selectedNote, isFavorite: !selectedNote.isFavorite }); }}>
                <Ionicons name={selectedNote.isFavorite ? 'heart' : 'heart-outline'} size={22} color={selectedNote.isFavorite ? Colors.error : Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.noteViewDate}>Last updated {format(new Date(selectedNote.updatedAt), 'MMM d, yyyy')}</Text>
              <Text style={styles.noteViewContent}>{selectedNote.content}</Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, color: Colors.textPrimary, ...Typography.display },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.notes, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.md, backgroundColor: Colors.bgCard, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchIcon: { marginRight: 8 },
  search: { flex: 1, paddingVertical: 10, color: Colors.textPrimary, fontSize: 14, ...Typography.body },
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  tab: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.notes + '20', borderColor: Colors.notes },
  tabText: { fontSize: 12, color: Colors.textSecondary, ...Typography.bodyMedium },
  tabTextActive: { color: Colors.notes },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 18, color: Colors.textSecondary, ...Typography.heading, marginBottom: 6 },
  emptySub: { fontSize: 14, color: Colors.textMuted, ...Typography.body },
  grid: { gap: Spacing.sm },
  noteCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3, borderWidth: 1, borderColor: Colors.border },
  noteCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  noteTitle: { fontSize: 15, color: Colors.textPrimary, ...Typography.bodySemiBold, flex: 1, marginRight: 8 },
  notePreview: { fontSize: 13, color: Colors.textSecondary, ...Typography.body, lineHeight: 18, marginBottom: 8 },
  noteDate: { fontSize: 11, color: Colors.textMuted, ...Typography.body },
  deckCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3, borderWidth: 1, borderColor: Colors.border },
  deckIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  deckIconText: { fontSize: 20 },
  deckInfo: { flex: 1 },
  deckName: { fontSize: 16, color: Colors.textPrimary, ...Typography.bodySemiBold },
  deckMeta: { fontSize: 12, color: Colors.textMuted, ...Typography.body, marginTop: 2 },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border },
  modalCancel: { fontSize: 16, color: Colors.textSecondary, ...Typography.body },
  modalTitle: { fontSize: 17, color: Colors.textPrimary, ...Typography.bodySemiBold, flex: 1, textAlign: 'center', marginHorizontal: Spacing.sm },
  modalSave: { fontSize: 16, color: Colors.notes, ...Typography.bodySemiBold },
  modalBody: { flex: 1, padding: Spacing.md },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, ...Typography.bodyMedium, marginTop: Spacing.md, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 15, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  textArea: { height: 200, textAlignVertical: 'top' },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff' },
  noteViewDate: { fontSize: 12, color: Colors.textMuted, ...Typography.body, marginBottom: Spacing.md },
  noteViewContent: { fontSize: 16, color: Colors.textPrimary, ...Typography.body, lineHeight: 26 },
});

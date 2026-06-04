import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useHabitStore } from '../../store';
import { Habit, HabitCategory, HabitFrequency } from '../../types';

const HABIT_ICONS = ['📚', '🏃', '💧', '🧘', '✍️', '🍎', '😴', '💪', '🎯', '🌿', '🧹', '📖', '🎵', '🤸', '💊'];
const HABIT_COLORS = ['#5B8A6F', '#6B8FBF', '#9B7FBF', '#E8A87C', '#E07070', '#7FBF9B'];
const CATEGORIES: HabitCategory[] = ['study', 'health', 'wellness', 'social', 'other'];

export const HabitsScreen: React.FC = () => {
  const { habits, addHabit, deleteHabit, logCompletion, undoCompletion, isCompletedToday, getTodaysHabits, getCompletionRate } = useHabitStore();

  const [showAdd, setShowAdd] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [category, setCategory] = useState<HabitCategory>('study');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');

  const todaysHabits = useMemo(() => getTodaysHabits(), [habits]);
  const doneCount = todaysHabits.filter((h) => isCompletedToday(h.id)).length;

  // Last 7 days for mini calendar
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), isToday: i === 6 };
  });

  const handleAdd = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), description: desc, icon, color, category, frequency, targetCount: 1, isArchived: false });
    setName(''); setDesc(''); setIcon(HABIT_ICONS[0]); setColor(HABIT_COLORS[0]); setCategory('study'); setFrequency('daily');
    setShowAdd(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Habits</Text>
          <Text style={styles.subtitle}>{doneCount}/{todaysHabits.length} done today</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {/* Today's progress */}
        {todaysHabits.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressFraction}>{doneCount}/{todaysHabits.length}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: (todaysHabits.length > 0 ? doneCount / todaysHabits.length : 0) * 100 + '%' as any }]} />
            </View>
          </View>
        )}

        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySub}>Build consistent routines for success</Text>
          </View>
        ) : (
          habits.filter((h) => !h.isArchived).map((habit) => {
            const done = isCompletedToday(habit.id);
            const rate7 = getCompletionRate(habit.id, 7);
            return (
              <TouchableOpacity
                key={habit.id}
                style={styles.habitCard}
                onPress={() => setSelectedHabit(habit)}
                onLongPress={() => Alert.alert('Habit', habit.name, [
                  { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) },
                  { text: 'Cancel', style: 'cancel' },
                ])}
              >
                <TouchableOpacity
                  style={[styles.habitCheck, { borderColor: habit.color }, done && { backgroundColor: habit.color }]}
                  onPress={() => done ? undoCompletion(habit.id, format(new Date(), 'yyyy-MM-dd')) : logCompletion(habit.id)}
                >
                  {done && <Ionicons name="checkmark" size={18} color="#fff" />}
                </TouchableOpacity>

                <View style={[styles.habitIconBox, { backgroundColor: habit.color + '20' }]}>
                  <Text style={styles.habitIcon}>{habit.icon}</Text>
                </View>

                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, done && styles.habitNameDone]}>{habit.name}</Text>
                  <View style={styles.habitMeta}>
                    <Text style={styles.habitMetaText}>{habit.frequency} · {habit.category}</Text>
                    {habit.streak > 0 && (
                      <Text style={styles.streakText}>🔥 {habit.streak}</Text>
                    )}
                  </View>
                  {/* 7-day mini dots */}
                  <View style={styles.miniDots}>
                    {last7.map((day) => {
                      const completed = habit.completions.some((c) => c.date === day.date);
                      return (
                        <View key={day.date} style={[styles.miniDot, { backgroundColor: completed ? habit.color : Colors.bgSurface }, day.isToday && styles.miniDotToday]} />
                      );
                    })}
                  </View>
                </View>

                <Text style={[styles.rateText, { color: habit.color }]}>{Math.round(rate7)}%</Text>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>New Habit</Text>
            <TouchableOpacity onPress={handleAdd}><Text style={[styles.modalSave, !name.trim() && { opacity: 0.4 }]}>Add</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Read 20 pages" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} autoFocus />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput style={styles.input} placeholder="Why does this matter?" placeholderTextColor={Colors.textMuted} value={desc} onChangeText={setDesc} />

            <Text style={styles.fieldLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((ic) => (
                <TouchableOpacity key={ic} style={[styles.iconBtn, icon === ic && styles.iconBtnActive]} onPress={() => setIcon(ic)}>
                  <Text style={styles.iconText}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {HABIT_COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]} onPress={() => setColor(c)} />
              ))}
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat} style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.freqRow}>
              {(['daily', 'weekly'] as HabitFrequency[]).map((f) => (
                <TouchableOpacity key={f} style={[styles.freqBtn, frequency === f && styles.freqBtnActive]} onPress={() => setFrequency(f)}>
                  <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Habit Detail Modal */}
      {selectedHabit && (
        <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedHabit(null)}>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedHabit(null)}><Ionicons name="close" size={22} color={Colors.textSecondary} /></TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedHabit.icon} {selectedHabit.name}</Text>
              <View style={{ width: 22 }} />
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailStats}>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatNum, { color: selectedHabit.color }]}>🔥 {selectedHabit.streak}</Text>
                  <Text style={styles.detailStatLabel}>Current Streak</Text>
                </View>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatNum, { color: selectedHabit.color }]}>⭐ {selectedHabit.bestStreak}</Text>
                  <Text style={styles.detailStatLabel}>Best Streak</Text>
                </View>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatNum, { color: selectedHabit.color }]}>{selectedHabit.completions.length}</Text>
                  <Text style={styles.detailStatLabel}>Total Done</Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Last 7 Days</Text>
              <View style={styles.weekRow}>
                {last7.map((day) => {
                  const done = selectedHabit.completions.some((c) => c.date === day.date);
                  return (
                    <View key={day.date} style={styles.weekDay}>
                      <Text style={styles.weekDayLabel}>{day.label}</Text>
                      <View style={[styles.weekDot, { backgroundColor: done ? selectedHabit.color : Colors.bgSurface }, day.isToday && { borderWidth: 1, borderColor: selectedHabit.color }]}>
                        {done && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </View>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>7-Day Rate</Text>
              <View style={styles.rateBar}>
                <View style={[styles.rateFill, { width: getCompletionRate(selectedHabit.id, 7) + '%' as any, backgroundColor: selectedHabit.color }]} />
              </View>
              <Text style={[styles.rateLabel, { color: selectedHabit.color }]}>{Math.round(getCompletionRate(selectedHabit.id, 7))}%</Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  title: { fontSize: 28, color: Colors.textPrimary, ...Typography.display },
  subtitle: { fontSize: 13, color: Colors.textSecondary, ...Typography.body, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.habits, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.md },
  progressCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressTitle: { fontSize: 14, color: Colors.textSecondary, ...Typography.bodyMedium },
  progressFraction: { fontSize: 14, color: Colors.habits, ...Typography.bodySemiBold },
  progressTrack: { height: 6, backgroundColor: Colors.bgSurface, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.habits, borderRadius: 3 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 18, color: Colors.textSecondary, ...Typography.heading, marginBottom: 6 },
  emptySub: { fontSize: 14, color: Colors.textMuted, ...Typography.body },
  habitCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  habitCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  habitIconBox: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  habitIcon: { fontSize: 20 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 15, color: Colors.textPrimary, ...Typography.bodyMedium },
  habitNameDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  habitMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2, marginBottom: 6 },
  habitMetaText: { fontSize: 11, color: Colors.textMuted, ...Typography.body },
  streakText: { fontSize: 11, color: Colors.warning, ...Typography.bodyMedium },
  miniDots: { flexDirection: 'row', gap: 4 },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  miniDotToday: { borderWidth: 1, borderColor: Colors.textMuted },
  rateText: { fontSize: 13, ...Typography.bodySemiBold, minWidth: 36, textAlign: 'right' },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border },
  modalCancel: { fontSize: 16, color: Colors.textSecondary, ...Typography.body },
  modalTitle: { fontSize: 17, color: Colors.textPrimary, ...Typography.bodySemiBold },
  modalSave: { fontSize: 16, color: Colors.habits, ...Typography.bodySemiBold },
  modalBody: { flex: 1, padding: Spacing.md },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, ...Typography.bodyMedium, marginTop: Spacing.md, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 15, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  iconBtn: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  iconBtnActive: { backgroundColor: Colors.habits + '20', borderColor: Colors.habits },
  iconText: { fontSize: 22 },
  colorRow: { flexDirection: 'row', gap: Spacing.sm },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff' },
  categoryRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  categoryBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  categoryBtnActive: { backgroundColor: Colors.habits + '20', borderColor: Colors.habits },
  categoryText: { fontSize: 13, color: Colors.textSecondary, ...Typography.bodyMedium },
  categoryTextActive: { color: Colors.habits },
  freqRow: { flexDirection: 'row', gap: Spacing.sm },
  freqBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  freqBtnActive: { backgroundColor: Colors.habits + '20', borderColor: Colors.habits },
  freqText: { fontSize: 14, color: Colors.textSecondary, ...Typography.bodyMedium },
  freqTextActive: { color: Colors.habits },
  detailStats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  detailStat: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  detailStatNum: { fontSize: 20, ...Typography.heading, marginBottom: 4 },
  detailStatLabel: { fontSize: 11, color: Colors.textMuted, ...Typography.body, textAlign: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  weekDay: { alignItems: 'center', gap: 8 },
  weekDayLabel: { fontSize: 11, color: Colors.textMuted, ...Typography.body },
  weekDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rateBar: { height: 8, backgroundColor: Colors.bgSurface, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  rateFill: { height: '100%', borderRadius: 4 },
  rateLabel: { fontSize: 14, ...Typography.bodySemiBold },
});

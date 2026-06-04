import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useUserStore, useTaskStore, useHabitStore, useTimerStore, useCourseStore } from '../../store';
import { StatCard } from '../../components/common/StatCard';
import { TaskCard } from '../../components/tasks/TaskCard';
import { HabitRow } from '../../components/habits/HabitRow';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { getDueToday, getOverdue, tasks } = useTaskStore();
  const { getTodaysHabits, isCompletedToday } = useHabitStore();
  const { getTodayStudyMinutes, getTotalSessions } = useTimerStore();
  const { getGPA } = useCourseStore();

  const dueToday = useMemo(() => getDueToday(), [tasks]);
  const overdue = useMemo(() => getOverdue(), [tasks]);
  const todaysHabits = useMemo(() => getTodaysHabits(), []);
  const studyMinutes = Math.round(getTodayStudyMinutes());
  const habitsDoneCount = todaysHabits.filter((h) => isCompletedToday(h.id)).length;
  const gpa = getGPA();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>{user?.name?.split(' ')[0] ?? 'Scholar'} 🌸</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'L'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Date + points */}
        <View style={styles.datebar}>
          <Text style={styles.dateText}>{format(new Date(), 'EEEE, MMMM d')}</Text>
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={12} color={Colors.accent} />
            <Text style={styles.pointsText}>{user?.totalPoints ?? 0} pts</Text>
          </View>
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          <StatCard label="Study Time" value={studyMinutes + 'm'} icon="timer-outline" color={Colors.timer} onPress={() => navigation.navigate('Timer')} />
          <StatCard label="Habits" value={habitsDoneCount + '/' + todaysHabits.length} icon="checkmark-circle-outline" color={Colors.habits} onPress={() => navigation.navigate('Habits')} />
          <StatCard label="Due Today" value={String(dueToday.length)} icon="list-outline" color={Colors.tasks} onPress={() => navigation.navigate('Tasks')} />
          <StatCard label="GPA" value={gpa > 0 ? gpa.toFixed(1) : '—'} icon="school-outline" color={Colors.courses} onPress={() => navigation.navigate('Courses')} />
        </ScrollView>

        {/* Focus CTA */}
        <TouchableOpacity onPress={() => navigation.navigate('Timer')}>
          <LinearGradient colors={[Colors.primaryDark, Colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.focusBanner}>
            <View>
              <Text style={styles.focusLabel}>FOCUS SESSION</Text>
              <Text style={styles.focusTitle}>Ready to study?</Text>
              <Text style={styles.focusSub}>{getTotalSessions()} sessions total</Text>
            </View>
            <Ionicons name="play-circle" size={52} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Overdue warning */}
        {overdue.length > 0 && (
          <TouchableOpacity style={styles.overdueBar} onPress={() => navigation.navigate('Tasks')}>
            <Ionicons name="warning" size={16} color={Colors.error} />
            <Text style={styles.overdueText}>{overdue.length} overdue task{overdue.length !== 1 ? 's' : ''}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.error} />
          </TouchableOpacity>
        )}

        {/* Due today */}
        {dueToday.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Due Today</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {dueToday.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} onPress={() => navigation.navigate('Tasks')} />
            ))}
          </View>
        )}

        {/* Habits */}
        {todaysHabits.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Habits</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Habits')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.habitsCard}>
              {todaysHabits.slice(0, 5).map((habit, i) => (
                <HabitRow key={habit.id} habit={habit} isDone={isCompletedToday(habit.id)} showDivider={i < Math.min(todaysHabits.length, 5) - 1} />
              ))}
            </View>
          </View>
        )}

        {/* Quick add */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickGrid}>
            {[
              { label: 'Task', icon: 'add-circle-outline', screen: 'Tasks', color: Colors.tasks },
              { label: 'Note', icon: 'document-text-outline', screen: 'Notes', color: Colors.notes },
              { label: 'Post', icon: 'chatbubble-outline', screen: 'Community', color: Colors.community },
              { label: 'Course', icon: 'library-outline', screen: 'Courses', color: Colors.courses },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={[styles.quickBtn, { borderColor: item.color + '40' }]} onPress={() => navigation.navigate(item.screen)}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
                <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: Spacing.md, marginBottom: Spacing.sm },
  greeting: { fontSize: 14, color: Colors.textSecondary, ...Typography.body },
  name: { fontSize: 26, color: Colors.textPrimary, ...Typography.display },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, color: '#fff', ...Typography.bodySemiBold },
  datebar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  dateText: { fontSize: 13, color: Colors.textMuted, ...Typography.body },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.bgCard, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  pointsText: { fontSize: 12, color: Colors.accent, ...Typography.bodyMedium },
  statsRow: { paddingBottom: Spacing.md, gap: Spacing.sm },
  focusBanner: { borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  focusLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, ...Typography.bodyMedium, marginBottom: 4 },
  focusTitle: { fontSize: 20, color: '#fff', ...Typography.heading, marginBottom: 2 },
  focusSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', ...Typography.body },
  overdueBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.error + '15', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.error + '30' },
  overdueText: { flex: 1, fontSize: 13, color: Colors.error, ...Typography.bodyMedium },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 17, color: Colors.textPrimary, ...Typography.heading },
  seeAll: { fontSize: 13, color: Colors.primary, ...Typography.bodyMedium },
  habitsCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  quickGrid: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', gap: 6, borderWidth: 1 },
  quickLabel: { fontSize: 11, ...Typography.bodyMedium },
});

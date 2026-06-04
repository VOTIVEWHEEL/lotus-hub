import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useTaskStore, useCourseStore } from '../../store';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskCard } from '../../components/tasks/TaskCard';
import { v4 as uuid } from 'uuid';

type FilterTab = 'all' | 'todo' | 'in_progress' | 'done';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: Colors.textMuted,
  medium: Colors.info,
  high: Colors.warning,
  urgent: Colors.error,
};

export const TasksScreen: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, setStatus } = useTaskStore();
  const { courses } = useCourseStore();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [courseId, setCourseId] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState('');

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }), [tasks]);

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'todo',
      courseId,
      dueDate: dueDate || undefined,
      tags: [],
      subtasks: [],
    });
    setTitle(''); setDescription(''); setPriority('medium'); setCourseId(undefined); setDueDate('');
    setShowAdd(false);
  };

  const confirmDelete = (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(taskId) },
    ]);
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, filter === tab.key && styles.tabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            <View style={[styles.tabBadge, filter === tab.key && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, filter === tab.key && styles.tabBadgeTextActive]}>
                {counts[tab.key]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No tasks here</Text>
            <Text style={styles.emptySub}>Tap + to add your first task</Text>
          </View>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => setSelectedTask(task)}
              onLongPress={() => confirmDelete(task.id)}
              onStatusChange={(s) => setStatus(task.id, s)}
            />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={[styles.modalSave, !title.trim() && styles.modalSaveDisabled]}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, priority === p && { backgroundColor: PRIORITY_COLORS[p] + '30', borderColor: PRIORITY_COLORS[p] }]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.priorityText, { color: PRIORITY_COLORS[p] }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Course (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courseRow}>
              <TouchableOpacity
                style={[styles.courseChip, !courseId && styles.courseChipActive]}
                onPress={() => setCourseId(undefined)}
              >
                <Text style={[styles.courseChipText, !courseId && styles.courseChipTextActive]}>None</Text>
              </TouchableOpacity>
              {courses.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.courseChip, courseId === c.id && { backgroundColor: c.color + '30', borderColor: c.color }]}
                  onPress={() => setCourseId(c.id)}
                >
                  <Text style={[styles.courseChipText, courseId === c.id && { color: c.color }]}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Due Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2024-12-31"
              placeholderTextColor={Colors.textMuted}
              value={dueDate}
              onChangeText={setDueDate}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Task detail modal */}
      {selectedTask && (
        <Modal visible={!!selectedTask} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedTask(null)}>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedTask(null)}>
                <Text style={styles.modalCancel}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Task Detail</Text>
              <TouchableOpacity onPress={() => { confirmDelete(selectedTask.id); setSelectedTask(null); }}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.detailTitle}>{selectedTask.title}</Text>
              {selectedTask.description && <Text style={styles.detailDesc}>{selectedTask.description}</Text>}
              <View style={styles.detailRow}>
                <View style={[styles.priorityChip, { backgroundColor: PRIORITY_COLORS[selectedTask.priority] + '20' }]}>
                  <Text style={[styles.priorityChipText, { color: PRIORITY_COLORS[selectedTask.priority] }]}>
                    {selectedTask.priority.toUpperCase()}
                  </Text>
                </View>
                {selectedTask.dueDate && (
                  <Text style={styles.dueDateText}>Due {format(new Date(selectedTask.dueDate), 'MMM d, yyyy')}</Text>
                )}
              </View>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.statusRow}>
                {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, selectedTask.status === s && styles.statusBtnActive]}
                    onPress={() => { setStatus(selectedTask.id, s); setSelectedTask({ ...selectedTask, status: s }); }}
                  >
                    <Text style={[styles.statusText, selectedTask.status === s && styles.statusTextActive]}>
                      {s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Done'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedTask.subtasks.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>Subtasks</Text>
                  {selectedTask.subtasks.map((sub) => (
                    <View key={sub.id} style={styles.subtaskRow}>
                      <Ionicons name={sub.completed ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={sub.completed ? Colors.success : Colors.textMuted} />
                      <Text style={[styles.subtaskText, sub.completed && styles.subtaskDone]}>{sub.title}</Text>
                    </View>
                  ))}
                </>
              )}
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
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.tasks, alignItems: 'center', justifyContent: 'center' },
  tabs: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.tasks + '20', borderColor: Colors.tasks },
  tabText: { fontSize: 13, color: Colors.textSecondary, ...Typography.bodyMedium },
  tabTextActive: { color: Colors.tasks },
  tabBadge: { backgroundColor: Colors.bgSurface, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeActive: { backgroundColor: Colors.tasks + '30' },
  tabBadgeText: { fontSize: 11, color: Colors.textMuted, ...Typography.bodyMedium },
  tabBadgeTextActive: { color: Colors.tasks },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 18, color: Colors.textSecondary, ...Typography.heading, marginBottom: 6 },
  emptySub: { fontSize: 14, color: Colors.textMuted, ...Typography.body },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border },
  modalCancel: { fontSize: 16, color: Colors.textSecondary, ...Typography.body },
  modalTitle: { fontSize: 17, color: Colors.textPrimary, ...Typography.bodySemiBold },
  modalSave: { fontSize: 16, color: Colors.tasks, ...Typography.bodySemiBold },
  modalSaveDisabled: { opacity: 0.4 },
  modalBody: { flex: 1, padding: Spacing.md },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, ...Typography.bodyMedium, marginTop: Spacing.md, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 15, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  textArea: { height: 80, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm },
  priorityBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  priorityText: { fontSize: 12, ...Typography.bodyMedium },
  courseRow: { gap: Spacing.sm, paddingVertical: 2 },
  courseChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  courseChipActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  courseChipText: { fontSize: 13, color: Colors.textSecondary, ...Typography.bodyMedium },
  courseChipTextActive: { color: Colors.primary },
  detailTitle: { fontSize: 22, color: Colors.textPrimary, ...Typography.heading, marginBottom: Spacing.sm },
  detailDesc: { fontSize: 15, color: Colors.textSecondary, ...Typography.body, marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  priorityChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  priorityChipText: { fontSize: 11, ...Typography.bodySemiBold, letterSpacing: 0.5 },
  dueDateText: { fontSize: 13, color: Colors.textSecondary, ...Typography.body },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  statusBtnActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  statusText: { fontSize: 12, color: Colors.textSecondary, ...Typography.bodyMedium },
  statusTextActive: { color: Colors.primary },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 8 },
  subtaskText: { fontSize: 14, color: Colors.textSecondary, ...Typography.body },
  subtaskDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
});

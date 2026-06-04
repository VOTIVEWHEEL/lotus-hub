import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useUserStore, useTaskStore, useHabitStore, useTimerStore } from '../../store';

export const ProfileScreen: React.FC = () => {
  const { user, updateUser, logout } = useUserStore();
  const { tasks } = useTaskStore();
  const { habits } = useHabitStore();
  const { sessions } = useTimerStore();

  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [institution, setInstitution] = useState(user?.institution ?? '');
  const [program, setProgram] = useState(user?.program ?? '');

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const totalStudyHours = Math.round(sessions.filter((s) => s.mode === 'focus' && s.wasCompleted).reduce((sum, s) => sum + s.duration, 0) / 3600);
  const totalHabitCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);

  const handleSave = () => {
    updateUser({ name, bio, institution, program });
    setShowEdit(false);
  };

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const STATS = [
    { label: 'Tasks Done', value: String(doneTasks), icon: '✅' },
    { label: 'Study Hours', value: String(totalStudyHours), icon: '⏱️' },
    { label: 'Habit Completions', value: String(totalHabitCompletions), icon: '🎯' },
    { label: 'Best Streak', value: String(bestStreak) + 'd', icon: '🔥' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setName(user?.name ?? ''); setBio(user?.bio ?? ''); setInstitution(user?.institution ?? ''); setProgram(user?.program ?? ''); setShowEdit(true); }}>
            <Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <LinearGradient colors={[Colors.bgCard, Colors.bgElevated]} style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{user?.name?.charAt(0).toUpperCase() ?? 'L'}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name ?? 'Scholar'}</Text>
          {user?.institution && <Text style={styles.profileInstitution}>🏫 {user.institution}</Text>}
          {user?.program && <Text style={styles.profileProgram}>{user.program}</Text>}
          {user?.bio && <Text style={styles.profileBio}>{user.bio}</Text>}

          <View style={styles.streakRow}>
            <View style={styles.streakBox}>
              <Text style={styles.streakNum}>🔥 {user?.streak ?? 0}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakBox}>
              <Text style={styles.streakNum}>⭐ {user?.totalPoints ?? 0}</Text>
              <Text style={styles.streakLabel}>Points</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats grid */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        {user?.badges && user.badges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badges}>
              {user.badges.map((badge) => (
                <View key={badge.id} style={styles.badge}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Settings section */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.settingsList}>
          {[
            { icon: 'notifications-outline', label: 'Notifications', color: Colors.info },
            { icon: 'moon-outline', label: 'Dark Mode', color: Colors.notes },
            { icon: 'shield-checkmark-outline', label: 'Privacy', color: Colors.success },
            { icon: 'information-circle-outline', label: 'About Lotus Hub', color: Colors.textSecondary },
          ].map((item, i) => (
            <TouchableOpacity key={item.label} style={[styles.settingRow, i < 3 && styles.settingBorder]}>
              <View style={[styles.settingIconBox, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEdit} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEdit(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEdit(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave}><Text style={styles.modalSave}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Colors.textMuted} />
            <Text style={styles.fieldLabel}>Institution</Text>
            <TextInput style={styles.input} value={institution} onChangeText={setInstitution} placeholder="Your school or university" placeholderTextColor={Colors.textMuted} />
            <Text style={styles.fieldLabel}>Program / Major</Text>
            <TextInput style={styles.input} value={program} onChangeText={setProgram} placeholder="e.g. Computer Science" placeholderTextColor={Colors.textMuted} />
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput style={[styles.input, styles.bioInput]} value={bio} onChangeText={setBio} placeholder="Tell us about yourself..." placeholderTextColor={Colors.textMuted} multiline />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.md, paddingBottom: Spacing.md },
  title: { fontSize: 28, color: Colors.textPrimary, ...Typography.display },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  profileCard: { borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarLargeText: { fontSize: 32, color: '#fff', ...Typography.display },
  profileName: { fontSize: 22, color: Colors.textPrimary, ...Typography.heading, marginBottom: 4 },
  profileInstitution: { fontSize: 14, color: Colors.textSecondary, ...Typography.body, marginBottom: 2 },
  profileProgram: { fontSize: 13, color: Colors.primary, ...Typography.bodyMedium, marginBottom: 6 },
  profileBio: { fontSize: 13, color: Colors.textSecondary, ...Typography.body, textAlign: 'center', marginBottom: Spacing.md },
  streakRow: { flexDirection: 'row', backgroundColor: Colors.bg, borderRadius: Radius.lg, padding: Spacing.md, width: '100%', marginTop: Spacing.sm },
  streakBox: { flex: 1, alignItems: 'center' },
  streakNum: { fontSize: 18, color: Colors.textPrimary, ...Typography.heading },
  streakLabel: { fontSize: 11, color: Colors.textMuted, ...Typography.body, marginTop: 2 },
  streakDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  sectionTitle: { fontSize: 17, color: Colors.textPrimary, ...Typography.heading, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: '48%', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 22, color: Colors.textPrimary, ...Typography.heading, marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.textMuted, ...Typography.body, textAlign: 'center' },
  badges: { gap: Spacing.sm, paddingBottom: Spacing.md },
  badge: { alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, minWidth: 80, borderWidth: 1, borderColor: Colors.border },
  badgeIcon: { fontSize: 28, marginBottom: 6 },
  badgeName: { fontSize: 11, color: Colors.textSecondary, ...Typography.bodyMedium, textAlign: 'center' },
  settingsList: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  settingBorder: { borderBottomWidth: 1, borderColor: Colors.border },
  settingIconBox: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, ...Typography.body },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.error + '15', borderWidth: 1, borderColor: Colors.error + '30' },
  logoutText: { fontSize: 15, color: Colors.error, ...Typography.bodySemiBold },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border },
  modalCancel: { fontSize: 16, color: Colors.textSecondary, ...Typography.body },
  modalTitle: { fontSize: 17, color: Colors.textPrimary, ...Typography.bodySemiBold },
  modalSave: { fontSize: 16, color: Colors.primary, ...Typography.bodySemiBold },
  modalBody: { flex: 1, padding: Spacing.md },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, ...Typography.bodyMedium, marginTop: Spacing.md, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 15, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  bioInput: { height: 100, textAlignVertical: 'top' },
});

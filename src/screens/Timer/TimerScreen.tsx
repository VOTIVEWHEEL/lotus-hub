import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useTimerStore } from '../../store';
import { TimerMode } from '../../types';

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
};

const MODE_COLORS: Record<TimerMode, string> = {
  focus: Colors.timer,
  short_break: Colors.success,
  long_break: Colors.info,
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const TimerScreen: React.FC = () => {
  const {
    currentMode, isRunning, isPaused, timeRemaining, sessionsCompleted,
    settings, sessions,
    start, pause, resume, reset, tick, completeSession, setMode,
    getTodayStudyMinutes,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (settings.vibrationEnabled) Vibration.vibrate([0, 400, 200, 400]);
      completeSession();
    }
  }, [timeRemaining, isRunning]);

  const totalDuration = (() => {
    const { focusDuration, shortBreakDuration, longBreakDuration } = settings;
    if (currentMode === 'focus') return focusDuration * 60;
    if (currentMode === 'short_break') return shortBreakDuration * 60;
    return longBreakDuration * 60;
  })();

  const progress = (totalDuration - timeRemaining) / totalDuration;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference * (1 - progress);
  const modeColor = MODE_COLORS[currentMode];

  const todayMinutes = Math.round(getTodayStudyMinutes());
  const todaySessions = sessions.filter(
    (s) => s.mode === 'focus' && s.wasCompleted && new Date(s.completedAt).toDateString() === new Date().toDateString()
  ).length;

  const MODES: TimerMode[] = ['focus', 'short_break', 'long_break'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Focus Timer</Text>

        {/* Mode selector */}
        <View style={styles.modeRow}>
          {MODES.map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeBtn, currentMode === mode && { backgroundColor: MODE_COLORS[mode] + '25', borderColor: MODE_COLORS[mode] }]}
              onPress={() => !isRunning && setMode(mode)}
            >
              <Text style={[styles.modeBtnText, currentMode === mode && { color: MODE_COLORS[mode] }]}>
                {MODE_LABELS[mode]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timer ring */}
        <View style={styles.ringContainer}>
          <View style={styles.ringOuter}>
            {/* SVG-like ring using border */}
            <View style={[styles.ringTrack, { borderColor: modeColor + '20' }]} />
            <View style={styles.ringInner}>
              <Text style={[styles.modeLabel, { color: modeColor }]}>
                {MODE_LABELS[currentMode].toUpperCase()}
              </Text>
              <Text style={[styles.timeText, { color: Colors.textPrimary }]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.sessionCount}>
                Session {sessionsCompleted + 1}
              </Text>
            </View>
          </View>

          {/* Progress indicator dots */}
          <View style={styles.dots}>
            {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i < (sessionsCompleted % settings.sessionsBeforeLongBreak) ? modeColor : Colors.bgSurface },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Ionicons name="refresh" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: modeColor }]}
            onPress={isRunning ? pause : isPaused ? resume : start}
          >
            <Ionicons
              name={isRunning ? 'pause' : 'play'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={completeSession}>
            <Ionicons name="skip-forward" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Today stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{todayMinutes}m</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{todaySessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{sessionsCompleted}</Text>
            <Text style={styles.statLabel}>This run</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Timer Settings</Text>
          {[
            { label: 'Focus duration', value: settings.focusDuration + ' min' },
            { label: 'Short break', value: settings.shortBreakDuration + ' min' },
            { label: 'Long break', value: settings.longBreakDuration + ' min' },
            { label: 'Sessions before long break', value: String(settings.sessionsBeforeLongBreak) },
          ].map((s, i) => (
            <View key={i} style={[styles.settingRow, i < 3 && styles.settingBorder]}>
              <Text style={styles.settingLabel}>{s.label}</Text>
              <Text style={styles.settingValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.md, alignItems: 'center' },
  screenTitle: { fontSize: 28, color: Colors.textPrimary, ...Typography.display, alignSelf: 'flex-start', marginTop: Spacing.md, marginBottom: Spacing.lg },
  modeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl, width: '100%' },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.full, alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  modeBtnText: { fontSize: 12, color: Colors.textSecondary, ...Typography.bodyMedium },
  ringContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  ringOuter: { width: 220, height: 220, borderRadius: 110, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringTrack: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 8 },
  ringInner: { alignItems: 'center' },
  modeLabel: { fontSize: 11, letterSpacing: 1.5, ...Typography.bodyMedium, marginBottom: 8 },
  timeText: { fontSize: 56, ...Typography.display, letterSpacing: -2 },
  sessionCount: { fontSize: 13, color: Colors.textMuted, ...Typography.body, marginTop: 4 },
  dots: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, marginBottom: Spacing.xl },
  resetBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  playBtn: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, width: '100%', marginBottom: Spacing.lg },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statValue: { fontSize: 22, color: Colors.textPrimary, ...Typography.heading },
  statLabel: { fontSize: 12, color: Colors.textMuted, ...Typography.body, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  settingsCard: { width: '100%', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  settingsTitle: { fontSize: 14, color: Colors.textSecondary, ...Typography.bodySemiBold, padding: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 12 },
  settingBorder: { borderBottomWidth: 1, borderColor: Colors.border },
  settingLabel: { fontSize: 14, color: Colors.textSecondary, ...Typography.body },
  settingValue: { fontSize: 14, color: Colors.textPrimary, ...Typography.bodyMedium },
});

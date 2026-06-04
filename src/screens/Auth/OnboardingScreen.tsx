import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useUserStore } from '../../store';
import { v4 as uuid } from 'uuid';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to\nLotus Hub 🌸',
    subtitle: 'Your all-in-one student companion for studying smarter, building habits, and thriving.',
    icon: null,
  },
  {
    id: 'features',
    title: 'Everything\nyou need',
    subtitle: 'Track tasks, grades, habits, study sessions, notes, and connect with peers — all in one place.',
    icon: null,
  },
  {
    id: 'profile',
    title: "Let's set up\nyour profile",
    subtitle: 'Just a few details to personalize your experience.',
    icon: null,
  },
];

const FEATURES = [
  { icon: '📋', label: 'Task Tracker', color: Colors.tasks },
  { icon: '📚', label: 'Grade Manager', color: Colors.courses },
  { icon: '✍️', label: 'Smart Notes', color: Colors.notes },
  { icon: '🎯', label: 'Habit Builder', color: Colors.habits },
  { icon: '⏱️', label: 'Focus Timer', color: Colors.timer },
  { icon: '👥', label: 'Study Groups', color: Colors.community },
];

export const OnboardingScreen: React.FC = () => {
  const { setUser, setOnboarded } = useUserStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [program, setProgram] = useState('');

  const isLastStep = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (!name.trim()) return;
      setUser({
        id: uuid(),
        name: name.trim(),
        email: '',
        institution: institution.trim() || undefined,
        program: program.trim() || undefined,
        joinedAt: new Date().toISOString(),
        streak: 0,
        totalPoints: 0,
        badges: [],
      });
      setOnboarded(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <LinearGradient colors={[Colors.bg, Colors.bgCard]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Step dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.lotusEmoji}>🌸</Text>
              <Text style={styles.stepTitle}>{STEPS[0].title}</Text>
              <Text style={styles.stepSubtitle}>{STEPS[0].subtitle}</Text>

              <View style={styles.quoteBox}>
                <Text style={styles.quote}>"The secret of getting ahead is getting started."</Text>
                <Text style={styles.quoteAuthor}>— Mark Twain</Text>
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{STEPS[1].title}</Text>
              <Text style={styles.stepSubtitle}>{STEPS[1].subtitle}</Text>
              <View style={styles.featuresGrid}>
                {FEATURES.map((f) => (
                  <View key={f.label} style={[styles.featureCard, { borderColor: f.color + '30' }]}>
                    <View style={[styles.featureIconBox, { backgroundColor: f.color + '20' }]}>
                      <Text style={styles.featureIcon}>{f.icon}</Text>
                    </View>
                    <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{STEPS[2].title}</Text>
              <Text style={styles.stepSubtitle}>{STEPS[2].subtitle}</Text>

              <View style={styles.form}>
                <Text style={styles.fieldLabel}>Your Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex Johnson"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
                <Text style={styles.fieldLabel}>Institution (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your university or school"
                  placeholderTextColor={Colors.textMuted}
                  value={institution}
                  onChangeText={setInstitution}
                />
                <Text style={styles.fieldLabel}>Program / Major (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  placeholderTextColor={Colors.textMuted}
                  value={program}
                  onChangeText={setProgram}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* CTA button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, isLastStep && !name.trim() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={isLastStep && !name.trim()}
          >
            <LinearGradient
              colors={[Colors.primaryDark, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>{isLastStep ? 'Start Learning 🚀' : 'Continue'}</Text>
              {!isLastStep && <Ionicons name="arrow-forward" size={18} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>

          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => s - 1)}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.bgSurface },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  content: { flexGrow: 1, paddingHorizontal: Spacing.lg },
  stepContent: { paddingTop: Spacing.xl },
  lotusEmoji: { fontSize: 72, textAlign: 'center', marginBottom: Spacing.lg },
  stepTitle: { fontSize: 36, color: Colors.textPrimary, ...Typography.display, lineHeight: 44, marginBottom: Spacing.md },
  stepSubtitle: { fontSize: 16, color: Colors.textSecondary, ...Typography.body, lineHeight: 24, marginBottom: Spacing.xl },
  quoteBox: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.primary, borderWidth: 1, borderColor: Colors.border },
  quote: { fontSize: 16, color: Colors.textSecondary, ...Typography.body, lineHeight: 24, fontStyle: 'italic', marginBottom: 8 },
  quoteAuthor: { fontSize: 13, color: Colors.primary, ...Typography.bodyMedium },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  featureCard: { width: (width - Spacing.lg * 2 - Spacing.sm * 2) / 3, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1 },
  featureIconBox: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  featureIcon: { fontSize: 24 },
  featureLabel: { fontSize: 11, ...Typography.bodyMedium, textAlign: 'center' },
  form: { gap: 4 },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, ...Typography.bodyMedium, marginTop: Spacing.md, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 16, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.sm },
  nextBtn: { borderRadius: Radius.lg, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.4 },
  nextGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 16 },
  nextText: { fontSize: 17, color: '#fff', ...Typography.bodySemiBold },
  backBtn: { alignItems: 'center', paddingVertical: 10 },
  backText: { fontSize: 15, color: Colors.textSecondary, ...Typography.body },
});

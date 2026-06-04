import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { useCourseStore } from '../../store';
import { Course, Assessment } from '../../types';

const COURSE_COLORS = ['#5B8A6F', '#6B8FBF', '#9B7FBF', '#E8A87C', '#E07070', '#7FBF9B', '#BF8F6B', '#6BBFBF'];

const gradeToLetter = (g: number): string => {
  if (g >= 90) return 'A';
  if (g >= 80) return 'B';
  if (g >= 70) return 'C';
  if (g >= 60) return 'D';
  return 'F';
};

export const CoursesScreen: React.FC = () => {
  const { courses, addCourse, deleteCourse, updateCourse, addAssessment, updateAssessment, getCourseGrade, getGPA } = useCourseStore();

  const [showAdd, setShowAdd] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAddAssessment, setShowAddAssessment] = useState(false);

  // Course form
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [courseCredits, setCourseCredits] = useState('3');
  const [courseSemester, setCourseSemester] = useState('');
  const [courseColor, setCourseColor] = useState(COURSE_COLORS[0]);

  // Assessment form
  const [assName, setAssName] = useState('');
  const [assWeight, setAssWeight] = useState('');
  const [assMaxScore, setAssMaxScore] = useState('100');
  const [assScore, setAssScore] = useState('');
  const [assType, setAssType] = useState<Assessment['type']>('assignment');

  const handleAddCourse = () => {
    if (!courseName.trim() || !courseCode.trim()) return;
    addCourse({
      name: courseName.trim(),
      code: courseCode.trim().toUpperCase(),
      instructor: courseInstructor,
      color: courseColor,
      credits: parseInt(courseCredits) || 3,
      gradeScale: 'percentage',
      assessments: [],
      schedule: [],
      semester: courseSemester || 'Current',
      isActive: true,
    });
    setCourseName(''); setCourseCode(''); setCourseInstructor(''); setCourseCredits('3'); setCourseSemester('');
    setShowAdd(false);
  };

  const handleAddAssessment = () => {
    if (!selectedCourse || !assName.trim()) return;
    addAssessment(selectedCourse.id, {
      name: assName.trim(),
      type: assType,
      weight: parseFloat(assWeight) || 10,
      score: assScore ? parseFloat(assScore) : undefined,
      maxScore: parseFloat(assMaxScore) || 100,
      isCompleted: !!assScore,
    });
    setAssName(''); setAssWeight(''); setAssMaxScore('100'); setAssScore(''); setAssType('assignment');
    setShowAddAssessment(false);
  };

  const gpa = getGPA();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Courses</Text>
          {gpa > 0 && <Text style={styles.gpaText}>Overall GPA: {gpa.toFixed(1)}%</Text>}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {courses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No courses yet</Text>
            <Text style={styles.emptySub}>Add your courses to track grades</Text>
          </View>
        ) : (
          courses.map((course) => {
            const grade = getCourseGrade(course.id);
            const completedAss = course.assessments.filter((a) => a.isCompleted).length;
            return (
              <TouchableOpacity
                key={course.id}
                style={[styles.courseCard, { borderLeftColor: course.color }]}
                onPress={() => setSelectedCourse(course)}
                onLongPress={() => Alert.alert('Delete course?', course.name, [
                  { text: 'Delete', style: 'destructive', onPress: () => deleteCourse(course.id) },
                  { text: 'Cancel', style: 'cancel' },
                ])}
              >
                <View style={styles.courseTop}>
                  <View style={[styles.courseCodeBadge, { backgroundColor: course.color + '20' }]}>
                    <Text style={[styles.courseCode, { color: course.color }]}>{course.code}</Text>
                  </View>
                  {grade !== null && (
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeNum}>{grade.toFixed(1)}%</Text>
                      <Text style={styles.gradeLetter}>{gradeToLetter(grade)}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.courseName}>{course.name}</Text>
                {course.instructor && <Text style={styles.courseInstructor}>{course.instructor}</Text>}
                <View style={styles.courseBottom}>
                  <Text style={styles.courseMeta}>{course.credits} credits · {course.semester}</Text>
                  <Text style={styles.courseMeta}>{completedAss}/{course.assessments.length} assessments</Text>
                </View>
                {course.assessments.length > 0 && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: (completedAss / course.assessments.length * 100) + '%' as any, backgroundColor: course.color }]} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Course Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>New Course</Text>
            <TouchableOpacity onPress={handleAddCourse}><Text style={[styles.modalSave, (!courseName.trim() || !courseCode.trim()) && { opacity: 0.4 }]}>Add</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Course Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Introduction to Psychology" placeholderTextColor={Colors.textMuted} value={courseName} onChangeText={setCourseName} autoFocus />
            <Text style={styles.fieldLabel}>Course Code *</Text>
            <TextInput style={styles.input} placeholder="e.g. PSY101" placeholderTextColor={Colors.textMuted} value={courseCode} onChangeText={setCourseCode} autoCapitalize="characters" />
            <Text style={styles.fieldLabel}>Instructor</Text>
            <TextInput style={styles.input} placeholder="Instructor name" placeholderTextColor={Colors.textMuted} value={courseInstructor} onChangeText={setCourseInstructor} />
            <Text style={styles.fieldLabel}>Credits</Text>
            <TextInput style={styles.input} placeholder="3" placeholderTextColor={Colors.textMuted} value={courseCredits} onChangeText={setCourseCredits} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Semester</Text>
            <TextInput style={styles.input} placeholder="e.g. Fall 2024" placeholderTextColor={Colors.textMuted} value={courseSemester} onChangeText={setCourseSemester} />
            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COURSE_COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, courseColor === c && styles.colorDotActive]} onPress={() => setCourseColor(c)} />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedCourse(null)}>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedCourse(null)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedCourse.code}</Text>
              <TouchableOpacity onPress={() => setShowAddAssessment(true)}>
                <Ionicons name="add" size={22} color={Colors.courses} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.detailCourseName}>{selectedCourse.name}</Text>
              {selectedCourse.instructor && <Text style={styles.detailInstructor}>👤 {selectedCourse.instructor}</Text>}
              <Text style={styles.detailMeta}>{selectedCourse.credits} credits · {selectedCourse.semester}</Text>

              {getCourseGrade(selectedCourse.id) !== null && (
                <View style={[styles.gradeBox, { backgroundColor: selectedCourse.color + '15', borderColor: selectedCourse.color + '40' }]}>
                  <Text style={[styles.gradeBoxNum, { color: selectedCourse.color }]}>{getCourseGrade(selectedCourse.id)!.toFixed(1)}%</Text>
                  <Text style={styles.gradeBoxLabel}>Current Grade — {gradeToLetter(getCourseGrade(selectedCourse.id)!)}</Text>
                </View>
              )}

              <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>Assessments</Text>
              {selectedCourse.assessments.length === 0 ? (
                <Text style={styles.noAssessments}>No assessments added yet. Tap + to add one.</Text>
              ) : (
                selectedCourse.assessments.map((a) => (
                  <View key={a.id} style={styles.assessmentRow}>
                    <View style={styles.assessmentInfo}>
                      <Text style={styles.assessmentName}>{a.name}</Text>
                      <Text style={styles.assessmentMeta}>{a.type} · {a.weight}% weight</Text>
                    </View>
                    <View style={styles.assessmentScore}>
                      {a.isCompleted && a.score !== undefined ? (
                        <>
                          <Text style={styles.scoreText}>{a.score}/{a.maxScore}</Text>
                          <Text style={styles.scorePercent}>{((a.score / a.maxScore) * 100).toFixed(0)}%</Text>
                        </>
                      ) : (
                        <Text style={styles.scorePending}>Pending</Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Add Assessment Modal */}
      <Modal visible={showAddAssessment} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddAssessment(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddAssessment(false)}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Add Assessment</Text>
            <TouchableOpacity onPress={handleAddAssessment}><Text style={[styles.modalSave, !assName.trim() && { opacity: 0.4 }]}>Add</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Midterm Exam" placeholderTextColor={Colors.textMuted} value={assName} onChangeText={setAssName} autoFocus />
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              {(['exam', 'quiz', 'assignment', 'project', 'lab'] as Assessment['type'][]).map((t) => (
                <TouchableOpacity key={t} style={[styles.typeBtn, assType === t && styles.typeBtnActive]} onPress={() => setAssType(t)}>
                  <Text style={[styles.typeText, assType === t && styles.typeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Weight (% of final grade)</Text>
            <TextInput style={styles.input} placeholder="e.g. 30" placeholderTextColor={Colors.textMuted} value={assWeight} onChangeText={setAssWeight} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Max Score</Text>
            <TextInput style={styles.input} placeholder="100" placeholderTextColor={Colors.textMuted} value={assMaxScore} onChangeText={setAssMaxScore} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Your Score (leave blank if not graded)</Text>
            <TextInput style={styles.input} placeholder="e.g. 85" placeholderTextColor={Colors.textMuted} value={assScore} onChangeText={setAssScore} keyboardType="numeric" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  title: { fontSize: 28, color: Colors.textPrimary, ...Typography.display },
  gpaText: { fontSize: 13, color: Colors.textSecondary, ...Typography.body, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.courses, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: 18, color: Colors.textSecondary, ...Typography.heading, marginBottom: 6 },
  emptySub: { fontSize: 14, color: Colors.textMuted, ...Typography.body },
  courseCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 4, borderWidth: 1, borderColor: Colors.border },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  courseCodeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  courseCode: { fontSize: 12, ...Typography.bodySemiBold, letterSpacing: 0.5 },
  gradeBadge: { alignItems: 'flex-end' },
  gradeNum: { fontSize: 16, color: Colors.textPrimary, ...Typography.heading },
  gradeLetter: { fontSize: 11, color: Colors.textMuted, ...Typography.bodyMedium },
  courseName: { fontSize: 17, color: Colors.textPrimary, ...Typography.bodySemiBold, marginBottom: 2 },
  courseInstructor: { fontSize: 13, color: Colors.textSecondary, ...Typography.body, marginBottom: 8 },
  courseBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  courseMeta: { fontSize: 12, color: Colors.textMuted, ...Typography.body },
  progressBar: { height: 3, backgroundColor: Colors.bgSurface, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border },
  modalCancel: { fontSize: 16, color: Colors.textSecondary, ...Typography.body },
  modalTitle: { fontSize: 17, color: Colors.textPrimary, ...Typography.bodySemiBold },
  modalSave: { fontSize: 16, color: Colors.courses, ...Typography.bodySemiBold },
  modalBody: { flex: 1, padding: Spacing.md },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, ...Typography.bodyMedium, marginTop: Spacing.md, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: 15, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff' },
  detailCourseName: { fontSize: 22, color: Colors.textPrimary, ...Typography.heading, marginBottom: 4 },
  detailInstructor: { fontSize: 14, color: Colors.textSecondary, ...Typography.body, marginBottom: 2 },
  detailMeta: { fontSize: 13, color: Colors.textMuted, ...Typography.body, marginBottom: Spacing.md },
  gradeBox: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  gradeBoxNum: { fontSize: 36, ...Typography.display },
  gradeBoxLabel: { fontSize: 13, color: Colors.textSecondary, ...Typography.body, marginTop: 4 },
  noAssessments: { fontSize: 14, color: Colors.textMuted, ...Typography.body },
  assessmentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.border },
  assessmentInfo: { flex: 1 },
  assessmentName: { fontSize: 14, color: Colors.textPrimary, ...Typography.bodyMedium },
  assessmentMeta: { fontSize: 12, color: Colors.textMuted, ...Typography.body, marginTop: 2 },
  assessmentScore: { alignItems: 'flex-end' },
  scoreText: { fontSize: 14, color: Colors.textPrimary, ...Typography.bodyMedium },
  scorePercent: { fontSize: 12, color: Colors.success, ...Typography.body },
  scorePending: { fontSize: 13, color: Colors.textMuted, ...Typography.body },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  typeBtnActive: { backgroundColor: Colors.courses + '20', borderColor: Colors.courses },
  typeText: { fontSize: 13, color: Colors.textSecondary, ...Typography.bodyMedium },
  typeTextActive: { color: Colors.courses },
});

import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import {
  getCourseGradebook,
  saveStudentGrades,
  sendGradesToDepartment,
} from '../../src/api/grades'
import { useNetworkStore } from '../../src/store/networkStore'
import { useAppTheme } from '../../src/store/themeStore'
import type {
  GradebookAssessment,
  GradebookStudent,
  SaveGradebookPayload,
} from '../../src/types/grades'
import ThemedText from '../ThemedText'
import EditAssessmentsModal from './EditAssessmentsModal'

type Props = { courseId: number; teacherRole?: string }
type GradeState = Record<number, Record<number, number | null>>

const STUDENT_WIDTH = 170
const ASSESSMENT_WIDTH = 126
const TOTAL_WIDTH = 130

const numeric = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return 0
  const result = Number(value)
  return Number.isFinite(result) ? result : 0
}

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10)

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()

export default function LecturerGradesSection({ courseId, teacherRole }: Props) {
  const theme = useAppTheme()
  const isOnline = useNetworkStore((state) => state.isOnline)
  const isPrimaryLecturer = teacherRole === 'primary_lecturer'
  const queryClient = useQueryClient()
  const [activitiesVisible, setActivitiesVisible] = useState(false)
  const [grades, setGrades] = useState<GradeState>({})
  const [baseline, setBaseline] = useState<GradeState>({})

  const gradebookQuery = useQuery({
    queryKey: ['gradebook', courseId],
    queryFn: () => getCourseGradebook(courseId),
  })

  useEffect(() => {
    if (!gradebookQuery.data) return
    const next: GradeState = {}

    gradebookQuery.data.students.forEach((student) => {
      next[student.id] = {}
      gradebookQuery.data.assessments.forEach((assessment) => {
        const mark = student.marks.find(
          (entry) => entry.assessment_id === assessment.id,
        )?.mark
        next[student.id][assessment.id] =
          mark === null || mark === undefined ? null : numeric(mark)
      })
    })

    setGrades(next)
    setBaseline(next)
  }, [gradebookQuery.data])

  const hasUnsavedMarks = useMemo(
    () => JSON.stringify(grades) !== JSON.stringify(baseline),
    [baseline, grades],
  )

  const saveMutation = useMutation({
    mutationFn: saveStudentGrades,
    onSuccess: async (result) => {
      setBaseline(grades)
      await queryClient.invalidateQueries({ queryKey: ['gradebook', courseId] })
      Alert.alert(
        'Marks saved',
        `${result.saved_marks_count} marks were saved successfully.`,
      )
    },
    onError: (error) => {
      Alert.alert(
        'Could not save marks',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })


  const sendMutation = useMutation({
    mutationKey: ['send-grade-to-department', courseId],
    mutationFn: () => sendGradesToDepartment(courseId),
    onSuccess: (message) => {
      Alert.alert('Marks sent', message || 'Marks were sent to the department successfully.')
    },
    onError: (error) => {
      Alert.alert(
        'Could not send marks',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })

  const assessments = gradebookQuery.data?.assessments ?? []
  const students = gradebookQuery.data?.students ?? []
  const totalWeight = assessments.reduce(
    (sum, assessment) => sum + numeric(assessment.weight),
    0,
  )

  const setMark = (
    studentId: number,
    assessment: GradebookAssessment,
    rawValue: string,
  ) => {
    const cleaned = rawValue.replace(/[^0-9.]/g, '')
    let value: number | null = cleaned === '' ? null : Number(cleaned)
    if (value !== null && !Number.isFinite(value)) value = null
    if (value !== null) value = Math.min(value, numeric(assessment.max_mark))

    setGrades((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        [assessment.id]: value,
      },
    }))
  }

  const studentTotals = (student: GradebookStudent) => {
    let marksTotal = 0
    let weightedTotal = 0

    assessments.forEach((assessment) => {
      const mark = grades[student.id]?.[assessment.id]
      if (mark === null || mark === undefined) return
      const maxMark = numeric(assessment.max_mark)
      const weight = numeric(assessment.weight)
      marksTotal += mark
      if (maxMark > 0) weightedTotal += (mark / maxMark) * weight
    })

    return { marksTotal, weightedTotal }
  }

  const saveMarks = () => {
    const payload: SaveGradebookPayload = {
      academic_year_id: 1,
      marks: students.flatMap((student) =>
        assessments.map((assessment) => ({
          assessment_id: assessment.id,
          student_id: student.id,
          mark: grades[student.id]?.[assessment.id] ?? null,
          feedback: null,
          status: 'valid' as const,
        })),
      ),
    }

    saveMutation.mutate({ courseId, payload })
  }

  const discardMarks = () => {
    if (!hasUnsavedMarks) return
    Alert.alert(
      'Discard mark changes?',
      'This will restore all marks to the last loaded or saved values.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => setGrades(baseline) },
      ],
    )
  }

  if (gradebookQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={theme.primary} />
        <ThemedText style={styles.centerText}>Loading gradebook…</ThemedText>
      </View>
    )
  }

  if (gradebookQuery.isError || !gradebookQuery.data) {
    return (
      <View style={styles.center}>
        <Ionicons name='alert-circle-outline' size={44} color={theme.danger} />
        <ThemedText title style={styles.centerTitle}>Could not load gradebook</ThemedText>
        <Pressable
          onPress={() => gradebookQuery.refetch()}
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
        >
          <ThemedText title style={styles.whiteText}>Try again</ThemedText>
        </Pressable>
      </View>
    )
  }

  if (assessments.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name='clipboard-outline' size={48} color={theme.primary} />
        <ThemedText title style={styles.centerTitle}>No assessments yet</ThemedText>
        <ThemedText style={styles.emptyDescription}>
          Add quizzes, assignments, exams, or activities before recording marks.
        </ThemedText>
        <Pressable
          onPress={() => setActivitiesVisible(true)}
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name='add' size={19} color='#FFFFFF' />
          <ThemedText title style={styles.whiteText}>Add assessment</ThemedText>
        </Pressable>
        <EditAssessmentsModal
          visible={activitiesVisible}
          courseId={courseId}
          assessments={assessments}
          onClose={() => setActivitiesVisible(false)}
        />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={gradebookQuery.isRefetching}
          onRefresh={() => gradebookQuery.refetch()}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      <View style={styles.toolbar}>
        <View>
          <ThemedText style={styles.helperText}>Tap any cell to enter a mark</ThemedText>
          <ThemedText title style={[styles.weightText, { color: theme.primary }]}>
            Total weight: {formatNumber(totalWeight)}%
          </ThemedText>
        </View>

        <Pressable
          onPress={() => {
            if (!hasUnsavedMarks) {
              setActivitiesVisible(true)
              return
            }
            Alert.alert(
              'Unsaved marks',
              'Save or discard your mark changes before editing activities.',
              [
                { text: 'Keep editing', style: 'cancel' },
                { text: 'Discard marks', style: 'destructive', onPress: () => {
                  setGrades(baseline)
                  setActivitiesVisible(true)
                } },
              ],
            )
          }}
          style={[styles.editButton, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}
        >
          <Ionicons name='create-outline' size={18} color={theme.primary} />
          <ThemedText title style={{ color: theme.primary }}>Edit activities</ThemedText>
        </Pressable>
      </View>

      <View style={[styles.tableFrame, { borderColor: theme.border, backgroundColor: theme.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={[styles.tableRow, styles.headerRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.studentCell, { width: STUDENT_WIDTH }]}> 
                <ThemedText title style={styles.headerLabel}>STUDENT</ThemedText>
              </View>

              {assessments.map((assessment) => (
                <View key={assessment.id} style={[styles.assessmentHeader, { width: ASSESSMENT_WIDTH }]}> 
                  <ThemedText title numberOfLines={2} style={styles.assessmentTitle}>
                    {assessment.title}
                  </ThemedText>
                  <ThemedText title style={{ color: theme.primary, fontSize: 12 }}>
                    {formatNumber(numeric(assessment.weight))}% · /{formatNumber(numeric(assessment.max_mark))}
                  </ThemedText>
                </View>
              ))}

              <View style={[styles.totalHeader, { width: TOTAL_WIDTH }]}> 
                <ThemedText title style={styles.headerLabel}>TOTAL SCORE</ThemedText>
                <ThemedText style={styles.headerSubLabel}>(MARKS)</ThemedText>
              </View>
              <View style={[styles.totalHeader, { width: TOTAL_WIDTH }]}> 
                <ThemedText title style={styles.headerLabel}>TOTAL SCORE</ThemedText>
                <ThemedText style={styles.headerSubLabel}>(WEIGHT)</ThemedText>
              </View>
            </View>

            {students.map((student) => {
              const totals = studentTotals(student)
              return (
                <View key={student.id} style={[styles.tableRow, { borderBottomColor: theme.border }]}> 
                  <View style={[styles.studentCell, { width: STUDENT_WIDTH }]}> 
                    <View style={[styles.avatar, { backgroundColor: theme.uiBackground }]}> 
                      <ThemedText title style={{ color: theme.primary }}>{initials(student.name)}</ThemedText>
                    </View>
                    <ThemedText title numberOfLines={2} style={styles.studentName}>
                      {student.name}
                    </ThemedText>
                  </View>

                  {assessments.map((assessment) => {
                    const mark = grades[student.id]?.[assessment.id]
                    return (
                      <View key={assessment.id} style={[styles.markCell, { width: ASSESSMENT_WIDTH }]}> 
                        <TextInput
                          value={mark === null || mark === undefined ? '' : String(mark)}
                          onChangeText={(value) => setMark(student.id, assessment, value)}
                          keyboardType='decimal-pad'
                          placeholder='—'
                          placeholderTextColor={theme.text}
                          editable={!saveMutation.isPending}
                          style={[
                            styles.markInput,
                            {
                              color: theme.title,
                              backgroundColor: theme.uiBackground,
                              borderColor: theme.border,
                            },
                          ]}
                        />
                      </View>
                    )
                  })}

                  <View style={[styles.totalCell, { width: TOTAL_WIDTH }]}> 
                    <ThemedText title style={{ color: theme.primary, fontSize: 17 }}>
                      {formatNumber(totals.marksTotal)}
                    </ThemedText>
                  </View>
                  <View style={[styles.totalCell, { width: TOTAL_WIDTH }]}> 
                    <ThemedText title style={{ color: theme.primary, fontSize: 17 }}>
                      {formatNumber(totals.weightedTotal)}%
                    </ThemedText>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.footerActions}>
        <Pressable
          disabled={!hasUnsavedMarks || saveMutation.isPending}
          onPress={saveMarks}
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.primary,
              opacity: !hasUnsavedMarks || saveMutation.isPending ? 0.45 : 1,
            },
          ]}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color='#FFFFFF' />
          ) : (
            <>
              <Ionicons name='save-outline' size={20} color='#FFFFFF' />
              <ThemedText title style={styles.whiteText}>Save marks</ThemedText>
            </>
          )}
        </Pressable>

        {hasUnsavedMarks && (
          <Pressable
            disabled={saveMutation.isPending}
            onPress={discardMarks}
            style={[styles.discardButton, { borderColor: theme.danger }]}
          >
            <ThemedText title style={{ color: theme.danger }}>Discard changes</ThemedText>
          </Pressable>
        )}
      </View>

      {isPrimaryLecturer && (
        <View
          style={[
            styles.departmentCard,
            { backgroundColor: theme.uiBackground, borderColor: theme.border },
          ]}
        >
          <View style={styles.departmentTextBlock}>
            <ThemedText title style={styles.departmentTitle}>
              Send marks to department
            </ThemedText>
            <ThemedText style={styles.departmentDescription}>
              Publishes the course assessments and sends the marks to your department in e-Zanko.
            </ThemedText>
          </View>

          <Pressable
            disabled={!isOnline || sendMutation.isPending || hasUnsavedMarks}
            onPress={() => sendMutation.mutate()}
            style={[
              styles.sendButton,
              {
                borderColor: theme.primary,
                opacity: !isOnline || sendMutation.isPending || hasUnsavedMarks ? 0.45 : 1,
              },
            ]}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <>
                <Ionicons name='send-outline' size={20} color={theme.primary} />
                <ThemedText title style={{ color: theme.primary }}>
                  Send marks to department
                </ThemedText>
              </>
            )}
          </Pressable>

          {!isOnline ? (
            <ThemedText style={[styles.departmentHint, { color: theme.danger }]}>Online connection required.</ThemedText>
          ) : hasUnsavedMarks ? (
            <ThemedText style={styles.departmentHint}>Save your mark changes before sending.</ThemedText>
          ) : null}
        </View>
      )}

      <EditAssessmentsModal
        visible={activitiesVisible}
        courseId={courseId}
        assessments={assessments}
        onClose={() => setActivitiesVisible(false)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 14, paddingBottom: 34 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  centerText: { marginTop: 10 },
  centerTitle: { marginTop: 10, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  emptyDescription: { marginTop: 7, marginBottom: 18, textAlign: 'center', lineHeight: 20 },
  retryButton: { minHeight: 46, borderRadius: 13, paddingHorizontal: 20, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  whiteText: { color: '#FFFFFF', fontWeight: '800' },
  toolbar: { gap: 12, marginBottom: 14 },
  helperText: { fontSize: 12 },
  weightText: { marginTop: 3, fontSize: 14, fontWeight: '800' },
  editButton: { alignSelf: 'flex-start', minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 7 },
  tableFrame: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', minHeight: 74, borderBottomWidth: StyleSheet.hairlineWidth },
  headerRow: { minHeight: 82, borderBottomWidth: 1 },
  studentCell: { paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  headerLabel: { fontSize: 11, fontWeight: '900', textAlign: 'center' },
  headerSubLabel: { marginTop: 2, fontSize: 10, textAlign: 'center' },
  assessmentHeader: { paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  assessmentTitle: { fontSize: 11, fontWeight: '900', textAlign: 'center', marginBottom: 5 },
  totalHeader: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  studentName: { flex: 1, fontSize: 13, fontWeight: '800' },
  markCell: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  markInput: { width: 78, minHeight: 42, borderWidth: 1, borderRadius: 10, textAlign: 'center', fontSize: 14, fontWeight: '800', paddingHorizontal: 7 },
  totalCell: { alignItems: 'center', justifyContent: 'center' },
  footerActions: { marginTop: 16, gap: 10 },
  saveButton: { minHeight: 50, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  discardButton: { minHeight: 46, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  departmentCard: { marginTop: 18, borderWidth: 1, borderRadius: 16, padding: 14, gap: 12 },
  departmentTextBlock: { gap: 4 },
  departmentTitle: { fontSize: 16, fontWeight: '900' },
  departmentDescription: { fontSize: 13, lineHeight: 19 },
  sendButton: { minHeight: 50, borderRadius: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  departmentHint: { fontSize: 12, lineHeight: 17 },
})

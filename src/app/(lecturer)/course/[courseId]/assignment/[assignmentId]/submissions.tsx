import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState, useRef } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import ThemedText from '../../../../../../../components/ThemedText'
import ThemedTextInput from '../../../../../../../components/ThemedTextInput'
import ThemedView from '../../../../../../../components/ThemedView'
import { getCourseGradebook, saveStudentGrades } from '@/api/grades'
import { getAllStudentSubmissions, getSectionSubmission } from '@/api/submissions'
import { useAppTheme } from '@/store/themeStore'
import type { StudentSubmissionFile } from '@/types/course'

const readableSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const isPastDeadline = (value: string) => {
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? false : Date.now() > date.getTime()
}

export default function LecturerAssignmentSubmissionsPage() {
  const theme = useAppTheme()
  const isGoingBack = useRef(false)
  const queryClient = useQueryClient()
  const params = useLocalSearchParams<{
    courseId: string
    assignmentId: string
    assignmentTitle?: string
  }>()
  const courseId = Number(params.courseId)
  const assignmentId = Number(params.assignmentId)
  const [grades, setGrades] = useState<Record<number, string>>({})

  const assignmentQuery = useQuery({
    queryKey: ['section-submission', assignmentId],
    queryFn: () => getSectionSubmission(assignmentId),
    enabled: Number.isFinite(assignmentId) && assignmentId > 0,
  })

  const canView = assignmentQuery.data
    ? isPastDeadline(assignmentQuery.data.course_assessment.due_at)
    : false

  const submissionsQuery = useQuery({
    queryKey: ['student-submissions', assignmentId],
    queryFn: () => getAllStudentSubmissions(assignmentId),
    enabled: canView,
  })

  const gradebookQuery = useQuery({
    queryKey: ['course-gradebook', courseId],
    queryFn: () => getCourseGradebook(courseId),
    enabled: canView && Number.isFinite(courseId) && courseId > 0,
  })

  const assessmentId = assignmentQuery.data?.course_assessment.id
  const gradebookAssessment = gradebookQuery.data?.assessments.find(
    (assessment) => assessment.id === assessmentId,
  )

  useEffect(() => {
    if (!gradebookQuery.data || !assessmentId) return

    const initial: Record<number, string> = {}
    gradebookQuery.data.students.forEach((student) => {
      const mark = student.marks.find((item) => item.assessment_id === assessmentId)?.mark
      initial[student.id] = mark == null ? '' : String(mark)
    })
    setGrades(initial)
  }, [assessmentId, gradebookQuery.data])

  const filesByStudent = useMemo(() => {
    const grouped = new Map<number, StudentSubmissionFile[]>()
    for (const file of submissionsQuery.data ?? []) {
      grouped.set(file.student.id, [...(grouped.get(file.student.id) ?? []), file])
    }
    return grouped
  }, [submissionsQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!assessmentId || !gradebookAssessment) {
        throw new Error('This assignment could not be matched to the course gradebook.')
      }

      const maxMark = Number(gradebookAssessment.max_mark)
      const marks = (gradebookQuery.data?.students ?? []).map((student) => {
        const raw = grades[student.id]?.trim() ?? ''
        const mark = raw === '' ? null : Number(raw)
        if (mark != null && (!Number.isFinite(mark) || mark < 0 || mark > maxMark)) {
          throw new Error(`Grade for ${student.name} must be between 0 and ${maxMark}.`)
        }
        return {
          assessment_id: assessmentId,
          student_id: student.id,
          mark,
          feedback: null,
          status: 'valid' as const,
        }
      })

      return saveStudentGrades({
        courseId,
        payload: {
          academic_year_id: assignmentQuery.data?.course_assessment.academic_year_id ?? 1,
          marks,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['course-gradebook', courseId] })
      Alert.alert('Grades saved', 'Student grades were updated successfully.')
    },
    onError: (error) => Alert.alert('Unable to save grades', error.message),
  })

  const loading = assignmentQuery.isLoading || (canView && (submissionsQuery.isLoading || gradebookQuery.isLoading))
  const error = assignmentQuery.error ?? submissionsQuery.error ?? gradebookQuery.error
  const students = gradebookQuery.data?.students ?? []
  const maxFiles = Math.max(1, ...students.map((student) => filesByStudent.get(student.id)?.length ?? 0))

  const handleBack = () => {
    if (isGoingBack.current || !router.canGoBack()) return

    isGoingBack.current = true
    router.back()

    setTimeout(() => {
      isGoingBack.current = false
    }, 500)
  }

  return (
    <ThemedView safe style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: theme.border }]}> 
        <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: theme.uiBackground }]}> 
          <Ionicons name='arrow-back' size={23} color={theme.title} />
        </Pressable>
        <View style={styles.headerText}>
          <ThemedText title style={styles.headerTitle}>Student submissions</ThemedText>
          <ThemedText numberOfLines={1} style={styles.headerSubtitle}>
            {assignmentQuery.data?.course_assessment.title ?? params.assignmentTitle ?? 'Assignment'}
          </ThemedText>
        </View>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size='large' color={theme.primary} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name='alert-circle-outline' size={44} color={theme.danger} />
          <ThemedText title>Could not load submissions</ThemedText>
          <ThemedText style={styles.centerText}>{(error as Error).message}</ThemedText>
        </View>
      ) : !canView ? (
        <View style={styles.center}>
          <Ionicons name='lock-closed-outline' size={46} color={theme.text} />
          <ThemedText title style={styles.lockTitle}>Available after the deadline</ThemedText>
          <ThemedText style={styles.centerText}>Student submissions cannot be reviewed before the due time.</ThemedText>
        </View>
      ) : !gradebookAssessment ? (
        <View style={styles.center}>
          <Ionicons name='alert-circle-outline' size={44} color={theme.danger} />
          <ThemedText title>Assessment not found</ThemedText>
          <ThemedText style={styles.centerText}>This assignment does not match an assessment in the course gradebook.</ThemedText>
        </View>
      ) : (
        <View style={styles.body}>
          <ScrollView horizontal contentContainerStyle={styles.tableWrap}>
            <View>
              <View style={[styles.tableRow, styles.headerRow, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}> 
                <ThemedText title style={[styles.studentCell, styles.headerCell]}>Student</ThemedText>
                <ThemedText title style={[styles.gradeCell, styles.headerCell]}>Grade / {gradebookAssessment.max_mark}</ThemedText>
                {Array.from({ length: maxFiles }, (_, index) => (
                  <ThemedText key={index} title style={[styles.fileCell, styles.headerCell]}>File {index + 1}</ThemedText>
                ))}
              </View>

              <ScrollView contentContainerStyle={styles.rows}>
                {students.map((student) => {
                  const files = filesByStudent.get(student.id) ?? []
                  return (
                    <View key={student.id} style={[styles.tableRow, { borderColor: theme.border }]}> 
                      <ThemedText title style={styles.studentCell}>{student.name}</ThemedText>
                      <View style={styles.gradeCell}>
                        <ThemedTextInput
                          value={grades[student.id] ?? ''}
                          onChangeText={(value) => setGrades((current) => ({ ...current, [student.id]: value }))}
                          keyboardType='decimal-pad'
                          placeholder='—'
                          style={styles.gradeInput}
                        />
                      </View>
                      {Array.from({ length: maxFiles }, (_, index) => {
                        const file = files[index]
                        return (
                          <View key={index} style={styles.fileCell}>
                            {file ? (
                              <Pressable onPress={() => Linking.openURL(file.file_url)} style={[styles.fileButton, { backgroundColor: theme.uiBackground }]}> 
                                <Ionicons name='document-outline' size={17} color={theme.primary} />
                                <View style={styles.fileText}>
                                  <ThemedText numberOfLines={1} style={styles.fileName}>{file.file_name}</ThemedText>
                                  <ThemedText style={styles.fileSize}>{readableSize(file.file_size)}</ThemedText>
                                </View>
                              </Pressable>
                            ) : (
                              <ThemedText style={styles.noFile}>No file</ThemedText>
                            )}
                          </View>
                        )
                      })}
                    </View>
                  )
                })}
              </ScrollView>
            </View>
          </ScrollView>

          <Pressable
            disabled={saveMutation.isPending || students.length === 0}
            onPress={() => saveMutation.mutate()}
            style={[styles.saveButton, { backgroundColor: theme.primary, opacity: saveMutation.isPending || students.length === 0 ? 0.5 : 1 }]}
          >
            <Ionicons name='save-outline' size={19} color='#FFFFFF' />
            <ThemedText style={styles.saveText}>{saveMutation.isPending ? 'Saving…' : 'Save grades'}</ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderBottomWidth: 1 },
  backButton: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  headerSubtitle: { marginTop: 2, fontSize: 11 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  centerText: { textAlign: 'center', lineHeight: 20 },
  lockTitle: { fontSize: 19 },
  body: { flex: 1, padding: 12, gap: 12 },
  tableWrap: { paddingBottom: 4 },
  tableRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderTopWidth: 0 },
  headerRow: { minHeight: 48, borderTopWidth: 1, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  headerCell: { fontSize: 12, fontWeight: '900' },
  rows: { paddingBottom: 4 },
  studentCell: { width: 170, paddingHorizontal: 10, fontSize: 13 },
  gradeCell: { width: 130, paddingHorizontal: 8 },
  gradeInput: { minHeight: 42, textAlign: 'center' },
  fileCell: { width: 190, paddingHorizontal: 8 },
  fileButton: { minHeight: 48, borderRadius: 10, padding: 7, flexDirection: 'row', alignItems: 'center', gap: 7 },
  fileText: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 11, fontWeight: '700' },
  fileSize: { fontSize: 9, marginTop: 2 },
  noFile: { textAlign: 'center', fontSize: 11 },
  saveButton: { minHeight: 48, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: '#FFFFFF', fontWeight: '900' },
})

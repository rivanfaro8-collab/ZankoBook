import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'

import {
  getAttendanceRecords,
  getAttendanceWeeks,
  getCourseStudents,
  deleteAttendanceWeek,
  submitAttendanceRecords,
} from '../../src/api/attendance'
import { enqueueAttendanceOperation } from '../../src/lib/offlineAttendanceQueue'
import { useNetworkStore } from '../../src/store/networkStore'
import { useAppTheme } from '../../src/store/themeStore'
import type {
  AttendanceStatus,
  AttendanceWeek,
} from '../../src/types/attendance'
import ThemedText from '../ThemedText'
import AddAttendanceSessionModal from './AddAttendanceSessionModal'
import StudentAttendanceRow from './StudentAttendanceRow'

type Props = { courseId: number }

type AttendanceMap = Record<number, AttendanceStatus>

export default function LecturerAttendanceSection({ courseId }: Props) {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const isOnline = useNetworkStore((state) => state.isOnline)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null)
  const [attendance, setAttendance] = useState<AttendanceMap>({})
  const weeksListRef = useRef<FlatList<AttendanceWeek>>(null)
  const shouldScrollToEnd = useRef(false)
  const didChooseInitialWeek = useRef(false)

  const weeksQuery = useQuery({
    queryKey: ['attendance-weeks', courseId],
    queryFn: () => getAttendanceWeeks(courseId),
  })

  useEffect(() => {
    setModalVisible(false)
    setSelectedWeekId(null)
    setAttendance({})
    didChooseInitialWeek.current = false
    shouldScrollToEnd.current = false
  }, [courseId])

  useEffect(() => {
    if (didChooseInitialWeek.current || selectedWeekId !== null) return
    const firstWeek = weeksQuery.data?.[0]
    if (!firstWeek) return

    didChooseInitialWeek.current = true
    setSelectedWeekId(firstWeek.id)
  }, [selectedWeekId, weeksQuery.data])

  const studentsQuery = useQuery({
    queryKey: ['course-students', courseId],
    queryFn: () => getCourseStudents(courseId),
  })

  const recordsQuery = useQuery({
    queryKey: ['attendance-records', courseId, selectedWeekId],
    queryFn: () => getAttendanceRecords(selectedWeekId as number),
    enabled: selectedWeekId !== null,
  })

  useEffect(() => {
    if (!selectedWeekId || !recordsQuery.data) return
    const next: AttendanceMap = {}
    recordsQuery.data.forEach((record) => {
      const studentId = record.student?.id ?? record.student_id
      if (studentId !== undefined) {
        next[studentId] = record.status
      }
    })
    setAttendance(next)
  }, [recordsQuery.data, selectedWeekId])

  const orderedWeeks = useMemo(
    () =>
      [...(weeksQuery.data ?? [])].sort((first, second) => {
        const firstTime = `${first.session_date} ${first.start_at}`
        const secondTime = `${second.session_date} ${second.start_at}`
        const dateComparison = firstTime.localeCompare(secondTime)
        return dateComparison !== 0 ? dateComparison : first.id - second.id
      }),
    [weeksQuery.data],
  )

  const selectedWeek = useMemo(
    () => weeksQuery.data?.find((week) => week.id === selectedWeekId),
    [selectedWeekId, weeksQuery.data],
  )

  const deleteMutation = useMutation({
    mutationFn: (weekId: number) => deleteAttendanceWeek(weekId),
    onSuccess: (_, deletedWeekId) => {
      queryClient.setQueryData<AttendanceWeek[]>(
        ['attendance-weeks', courseId],
        (current) => (current ?? []).filter((week) => week.id !== deletedWeekId),
      )
      queryClient.removeQueries({
        queryKey: ['attendance-records', courseId, deletedWeekId],
      })
      setSelectedWeekId(null)
      setAttendance({})
      Alert.alert('Session deleted', 'The attendance session was deleted successfully.')
    },
    onError: (error) => {
      Alert.alert(
        'Could not delete session',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        attendance: Object.entries(attendance).map(([studentId, status]) => ({
          student_id: Number(studentId),
          status,
        })),
      }

      if (!isOnline) {
        await enqueueAttendanceOperation({
          id: `records-${courseId}-${selectedWeekId}`,
          type: 'save-records',
          weekId: selectedWeekId as number,
          courseId,
          payload,
          createdAt: new Date().toISOString(),
        })
        return 'queued' as const
      }

      await submitAttendanceRecords(payload, selectedWeekId as number)
      return 'saved' as const
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        ['attendance-records', courseId, selectedWeekId],
        Object.entries(attendance).map(([studentId, status]) => ({
          student_id: Number(studentId),
          status,
        })),
      )
      if (result === 'saved') {
        queryClient.invalidateQueries({ queryKey: ['attendance-records', courseId, selectedWeekId] })
      }
      Alert.alert(
        result === 'queued' ? 'Saved offline' : 'Saved',
        result === 'queued'
          ? 'Attendance is stored on this device and will sync when internet returns.'
          : 'Attendance records were saved successfully.',
      )
    },
  })

  const selectWeek = (week: AttendanceWeek) => {
    setSelectedWeekId(week.id)
    setAttendance({})
  }

  const setStatus = (studentId: number, status: AttendanceStatus) => {
    setAttendance((current) => ({ ...current, [studentId]: status }))
  }

  const markAllPresent = () => {
    const next: AttendanceMap = {}
    ;(studentsQuery.data ?? []).forEach((student) => {
      next[student.id] = 'Present'
    })
    setAttendance(next)
  }

  const confirmDeleteSelectedWeek = () => {
    if (selectedWeekId === null || deleteMutation.isPending) return

    Alert.alert(
      'Delete attendance session?',
      `This will permanently delete “${selectedWeek?.title ?? 'the selected session'}”.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(selectedWeekId),
        },
      ],
    )
  }

  const saveDisabled =
    selectedWeekId === null ||
    Object.keys(attendance).length === 0 ||
    saveMutation.isPending

  if (weeksQuery.isLoading || studentsQuery.isLoading) {
    return <ActivityIndicator style={styles.loader} size='large' color={theme.primary} />
  }

  if (weeksQuery.error || studentsQuery.error) {
    return (
      <View style={styles.center}>
        <Ionicons name='alert-circle-outline' size={42} color={theme.danger} />
        <ThemedText title style={styles.centerTitle}>Could not load attendance</ThemedText>
        <Pressable
          onPress={() => {
            weeksQuery.refetch()
            studentsQuery.refetch()
          }}
          style={[styles.retry, { backgroundColor: theme.primary }]}
        >
          <ThemedText title style={styles.whiteText}>Try again</ThemedText>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          disabled={deleteMutation.isPending}
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.76 : 1 },
          ]}
        >
          <Ionicons name='add' size={20} color='#FFFFFF' />
          <ThemedText title style={styles.whiteText}>New</ThemedText>
        </Pressable>

        <Pressable
          disabled={!isOnline || selectedWeekId === null || deleteMutation.isPending}
          onPress={confirmDeleteSelectedWeek}
          style={({ pressed }) => {
            const disabled = !isOnline || selectedWeekId === null || deleteMutation.isPending
            return [
              styles.actionButton,
              {
                backgroundColor: theme.danger,
                opacity: disabled ? 0.4 : pressed ? 0.76 : 1,
              },
            ]
          }}
        >
          {deleteMutation.isPending ? (
            <ActivityIndicator size='small' color='#FFFFFF' />
          ) : (
            <Ionicons name='trash-outline' size={18} color='#FFFFFF' />
          )}
          <ThemedText title numberOfLines={1} style={[styles.whiteText, styles.deleteText]}>
            {!isOnline ? 'Online required' : deleteMutation.isPending ? 'Deleting…' : 'Delete selected session'}
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        ref={weeksListRef}
        horizontal
        style={styles.weekScroller}
        data={orderedWeeks}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekList}
        onContentSizeChange={() => {
          if (!shouldScrollToEnd.current) return
          weeksListRef.current?.scrollToEnd({ animated: true })
          shouldScrollToEnd.current = false
        }}
        ListEmptyComponent={
          <View style={[styles.emptyWeek, { borderColor: theme.border }]}> 
            <ThemedText>No sessions yet. Create the first one.</ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const active = item.id === selectedWeekId
          return (
            <Pressable
              onPress={() => selectWeek(item)}
              style={({ pressed }) => [
                styles.weekCard,
                {
                  backgroundColor: active ? theme.primary : theme.uiBackground,
                  borderColor: active ? theme.primary : theme.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <ThemedText
                title
                numberOfLines={1}
                style={{ color: active ? '#FFFFFF' : theme.title, fontSize: 13 }}
              >
                {item.title}{item.local_status === 'pending' ? ' • Pending' : ''}
              </ThemedText>
            </Pressable>
          )
        }}
      />

      {selectedWeek ? (
        <View style={[styles.rosterCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={[styles.rosterHeader, { borderBottomColor: theme.border }]}> 
            <View style={{ flex: 1 }}>
              <ThemedText title style={styles.rosterTitle}>{selectedWeek.title}</ThemedText>
              <ThemedText style={styles.rosterMeta}>{studentsQuery.data?.length ?? 0} students</ThemedText>
            </View>
            <Pressable
              disabled={saveMutation.isPending || (studentsQuery.data?.length ?? 0) === 0}
              onPress={markAllPresent}
              style={({ pressed }) => [
                styles.allPresentButton,
                {
                  backgroundColor: theme.uiBackground,
                  borderColor: theme.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name='checkmark-done-outline' size={17} color={theme.primary} />
              <ThemedText title style={[styles.allPresentText, { color: theme.primary }]}>
                All present
              </ThemedText>
            </Pressable>
            <View style={styles.legend}>
              <ThemedText style={styles.legendText}>P</ThemedText>
              <ThemedText style={styles.legendText}>A</ThemedText>
              <ThemedText style={styles.legendText}>L</ThemedText>
              <ThemedText style={styles.legendText}>E</ThemedText>
            </View>
          </View>

          {recordsQuery.isLoading ? (
            <ActivityIndicator style={styles.recordsLoader} color={theme.primary} />
          ) : (
            <FlatList
              data={studentsQuery.data ?? []}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <StudentAttendanceRow
                  student={item}
                  status={attendance[item.id]}
                  disabled={saveMutation.isPending}
                  onStatusChange={setStatus}
                />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={recordsQuery.isRefetching}
                  onRefresh={() => recordsQuery.refetch()}
                  tintColor={theme.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.center}><ThemedText>No students found.</ThemedText></View>
              }
            />
          )}

          <Pressable
            disabled={saveDisabled}
            onPress={() => saveMutation.mutate()}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: theme.primary,
                opacity: saveDisabled ? 0.42 : pressed ? 0.76 : 1,
              },
            ]}
          >
            <Ionicons name='save-outline' size={20} color='#FFFFFF' />
            <ThemedText title style={styles.whiteText}>
              {saveMutation.isPending ? 'Saving…' : 'Save attendance'}
            </ThemedText>
          </Pressable>
          {saveMutation.error ? (
            <ThemedText style={[styles.mutationError, { color: theme.danger }]}>
              {(saveMutation.error as Error).message}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      <AddAttendanceSessionModal
        visible={modalVisible}
        courseId={courseId}
        onClose={() => setModalVisible(false)}
        onCreated={(week) => {
          shouldScrollToEnd.current = true
          setSelectedWeekId(week.id)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  loader: { flex: 1 },
  center: { minHeight: 150, alignItems: 'center', justifyContent: 'center', padding: 20 },
  centerTitle: { marginTop: 10, fontSize: 17 },
  retry: { marginTop: 14, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12 },
  topRow: { paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionButton: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 8, height: 44, borderRadius: 13 },
  deleteText: { flexShrink: 1, fontSize: 12, textAlign: 'center' },
  whiteText: { color: '#FFFFFF', fontWeight: '800' },
  weekScroller: { flexGrow: 0, flexShrink: 0 },
  weekList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6, gap: 8 },
  weekCard: {
    minWidth: 88,
    maxWidth: 145,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWeek: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, padding: 18 },
  rosterCard: { flex: 1, marginHorizontal: 16, marginTop: 4, marginBottom: 14, borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  rosterHeader: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rosterTitle: { fontSize: 16, fontWeight: '800' },
  rosterMeta: { marginTop: 2, fontSize: 12 },
  allPresentButton: { height: 34, paddingHorizontal: 9, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  allPresentText: { fontSize: 11, fontWeight: '800' },
  legend: { flexDirection: 'row', gap: 20, paddingRight: 5 },
  legendText: { width: 16, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  recordsLoader: { flex: 1 },
  saveButton: { minHeight: 50, margin: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mutationError: { textAlign: 'center', marginHorizontal: 12, marginBottom: 10, fontSize: 12 },
})

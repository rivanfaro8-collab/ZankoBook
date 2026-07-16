import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { getMyAttendance } from '../../src/api/attendance'
import { useAppTheme } from '../../src/store/themeStore'
import type {
  AttendanceStatus,
  StudentPersonalAttendanceRecord,
} from '../../src/types/attendance'
import ThemedText from '../ThemedText'

type Props = {
  courseId: number
  courseName: string
}

type FilterKey = 'all' | AttendanceStatus

type StatusConfig = {
  icon: keyof typeof Ionicons.glyphMap
  color: string
  softBackground: string
  shortLabel: string
}

const STATUS_CONFIG: Record<AttendanceStatus, StatusConfig> = {
  Present: {
    icon: 'checkmark-circle-outline',
    color: '#159B75',
    softBackground: 'rgba(21,155,117,0.12)',
    shortLabel: 'Present',
  },
  Late: {
    icon: 'time-outline',
    color: '#D58A10',
    softBackground: 'rgba(213,138,16,0.13)',
    shortLabel: 'Late',
  },
  Absent: {
    icon: 'close-circle-outline',
    color: '#D94A4A',
    softBackground: 'rgba(217,74,74,0.12)',
    shortLabel: 'Absent',
  },
  'Excused Absence': {
    icon: 'calendar-clear-outline',
    color: '#778292',
    softBackground: 'rgba(119,130,146,0.14)',
    shortLabel: 'Excused',
  },
}

const ALL_STATUSES: AttendanceStatus[] = [
  'Present',
  'Late',
  'Absent',
  'Excused Absence',
]

const parseSessionDate = (record: StudentPersonalAttendanceRecord) => {
  const raw = record.attendance_session?.session_date
  if (!raw) return 0
  const timestamp = new Date(raw.replace(' ', 'T')).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const formatSessionDate = (value: string) => {
  const parsed = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export default function StudentAttendanceSection({ courseId, courseName }: Props) {
  const theme = useAppTheme()
  const [filter, setFilter] = useState<FilterKey>('all')

  const attendanceQuery = useQuery({
    queryKey: ['my-attendance', courseId],
    queryFn: () => getMyAttendance({ course_id: courseId }),
    enabled: courseId > 0,
  })

  const sessions = useMemo(
    () =>
      [...(attendanceQuery.data ?? [])].sort((first, second) => {
        const dateDifference = parseSessionDate(first) - parseSessionDate(second)
        return dateDifference !== 0 ? dateDifference : first.id - second.id
      }),
    [attendanceQuery.data],
  )

  const counts = useMemo(() => {
    const next: Record<AttendanceStatus, number> = {
      Present: 0,
      Late: 0,
      Absent: 0,
      'Excused Absence': 0,
    }

    sessions.forEach((session) => {
      if (session.status in next) next[session.status] += 1
    })

    return next
  }, [sessions])

  const totalSessions = sessions.length
  const attendanceRate =
    totalSessions === 0
      ? 0
      : Math.round(((counts.Present + counts.Late) / totalSessions) * 100)

  const filteredSessions =
    filter === 'all'
      ? sessions
      : sessions.filter((session) => session.status === filter)

  if (attendanceQuery.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size='large' color={theme.primary} />
        <ThemedText style={styles.stateText}>Loading your attendance…</ThemedText>
      </View>
    )
  }

  if (attendanceQuery.isError) {
    return (
      <View style={styles.centerState}>
        <View style={[styles.stateIcon, { backgroundColor: theme.uiBackground }]}>
          <Ionicons name='alert-circle-outline' size={36} color={theme.danger} />
        </View>
        <ThemedText title style={styles.stateTitle}>Could not load attendance</ThemedText>
        <ThemedText style={styles.stateText}>
          {attendanceQuery.error instanceof Error
            ? attendanceQuery.error.message
            : 'Please check your connection and try again.'}
        </ThemedText>
        <Pressable
          onPress={() => attendanceQuery.refetch()}
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name='refresh' size={18} color='#FFFFFF' />
          <ThemedText title style={styles.whiteText}>Try again</ThemedText>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={attendanceQuery.isRefetching}
          onRefresh={() => attendanceQuery.refetch()}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.rateRing,
            { borderColor: theme.primary, backgroundColor: theme.uiBackground },
          ]}
        >
          <ThemedText title style={[styles.rateValue, { color: theme.primary }]}>
            {attendanceRate}%
          </ThemedText>
          <ThemedText style={styles.rateLabel}>Attendance</ThemedText>
        </View>

        <View style={styles.summaryText}>
          <ThemedText style={styles.eyebrow}>ATTENDANCE RATE</ThemedText>
          <ThemedText title style={styles.courseName} numberOfLines={3}>
            {courseName}
          </ThemedText>
          <ThemedText style={styles.sessionCount}>
            {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'} held
          </ThemedText>
        </View>
      </View>

      <View style={styles.countGrid}>
        {ALL_STATUSES.map((status) => {
          const config = STATUS_CONFIG[status]
          return (
            <View
              key={status}
              style={[
                styles.countCard,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
            >
              <View style={[styles.countIcon, { backgroundColor: config.softBackground }]}>
                <Ionicons name={config.icon} size={20} color={config.color} />
              </View>
              <View style={styles.countTextArea}>
                <ThemedText title style={styles.countValue}>{counts[status]}</ThemedText>
                <ThemedText style={styles.countLabel} numberOfLines={1}>
                  {config.shortLabel}
                </ThemedText>
              </View>
            </View>
          )
        })}
      </View>

      <View style={styles.recordHeader}>
        <View style={styles.recordTitleRow}>
          <Ionicons name='clipboard-outline' size={18} color={theme.primary} />
          <ThemedText title style={styles.recordTitle}>Session record</ThemedText>
        </View>
        <ThemedText style={styles.recordSubtitle}>Oldest session first</ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {(['all', ...ALL_STATUSES] as FilterKey[]).map((key) => {
          const active = filter === key
          const count = key === 'all' ? totalSessions : counts[key]
          const label = key === 'all' ? 'All' : STATUS_CONFIG[key].shortLabel

          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={({ pressed }) => [
                styles.filterButton,
                {
                  backgroundColor: active ? theme.primary : theme.uiBackground,
                  borderColor: active ? theme.primary : theme.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <ThemedText
                title={active}
                style={[styles.filterText, { color: active ? '#FFFFFF' : theme.text }]}
              >
                {label} · {count}
              </ThemedText>
            </Pressable>
          )
        })}
      </ScrollView>

      {filteredSessions.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <View style={[styles.stateIcon, { backgroundColor: theme.uiBackground }]}>
            <Ionicons name='calendar-clear-outline' size={32} color={theme.primary} />
          </View>
          <ThemedText title style={styles.emptyTitle}>No sessions found</ThemedText>
          <ThemedText style={styles.emptyText}>
            {totalSessions === 0
              ? 'Your attendance records will appear here after attendance is taken.'
              : 'No sessions match the selected filter.'}
          </ThemedText>
        </View>
      ) : (
        <View
          style={[
            styles.recordsCard,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          {filteredSessions.map((session, index) => {
            const config = STATUS_CONFIG[session.status]
            return (
              <View
                key={session.id}
                style={[
                  styles.recordRow,
                  index < filteredSessions.length - 1 && {
                    borderBottomColor: theme.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={[styles.recordIcon, { backgroundColor: config.softBackground }]}>
                  <Ionicons name={config.icon} size={21} color={config.color} />
                </View>

                <View style={styles.recordMain}>
                  <ThemedText title style={styles.recordDate}>
                    {formatSessionDate(session.attendance_session.session_date)}
                  </ThemedText>
                  {session.attendance_session.title ? (
                    <ThemedText style={styles.recordSessionTitle} numberOfLines={2}>
                      {session.attendance_session.title}
                    </ThemedText>
                  ) : null}
                </View>

                <View style={[styles.statusBadge, { backgroundColor: config.softBackground }]}>
                  <ThemedText title style={[styles.statusText, { color: config.color }]}>
                    {config.shortLabel}
                  </ThemedText>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 34, gap: 16 },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: { marginTop: 14, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  stateText: { marginTop: 8, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retryButton: {
    minHeight: 46,
    marginTop: 18,
    paddingHorizontal: 20,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whiteText: { color: '#FFFFFF', fontWeight: '800' },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
  },
  rateRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateValue: { fontSize: 25, fontWeight: '900' },
  rateLabel: { marginTop: 1, fontSize: 11, fontWeight: '700' },
  summaryText: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  courseName: { marginTop: 5, fontSize: 19, lineHeight: 24, fontWeight: '900' },
  sessionCount: { marginTop: 7, fontSize: 13 },
  countGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  countCard: {
    width: '48.5%',
    minHeight: 74,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countTextArea: { flex: 1 },
  countValue: { fontSize: 20, fontWeight: '900' },
  countLabel: { marginTop: 1, fontSize: 12, fontWeight: '700' },
  recordHeader: { marginTop: 4 },
  recordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  recordTitle: { fontSize: 16, fontWeight: '900' },
  recordSubtitle: { marginTop: 3, fontSize: 11 },
  filters: { gap: 8, paddingRight: 4 },
  filterButton: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: { fontSize: 12, fontWeight: '800' },
  emptyCard: {
    minHeight: 210,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: { marginTop: 12, fontSize: 17, fontWeight: '900' },
  emptyText: { marginTop: 7, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  recordsCard: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  recordRow: {
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  recordIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordMain: { flex: 1 },
  recordDate: { fontSize: 14, fontWeight: '800' },
  recordSessionTitle: { marginTop: 3, fontSize: 12, lineHeight: 17 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { fontSize: 11, fontWeight: '900' },
})

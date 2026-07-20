import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'

import { getCalendarEvents } from '../../src/api/calendar'
import { useAppTheme } from '../../src/store/themeStore'
import type { AssignmentEvent } from '../../src/types/calendar'
import { getCourseColor } from '../../src/utils/courseColors'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import DayEventsModal from './DayEventsModal'
import { WEEKDAY_LABELS, dateKeyFromEvent, formatApiDate, formatLongDate, formatTime, monthGrid, visibleMonthRange } from './calendarUtils'

type ViewMode = 'calendar' | 'list'

export default function StudentCalendarScreen() {
  const theme = useAppTheme()
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedEvents, setSelectedEvents] = useState<AssignmentEvent[]>([])
  const range = useMemo(() => visibleMonthRange(month), [month])

  const query = useQuery({
    queryKey: ['calendar-events', range.startDate, range.endDate],
    queryFn: () => getCalendarEvents(range),
  })

  const events = query.data ?? []
  const eventsByDate = useMemo(() => {
    const map = new Map<string, AssignmentEvent[]>()
    events.forEach((event) => {
      const key = dateKeyFromEvent(event)
      map.set(key, [...(map.get(key) ?? []), event])
    })
    return map
  }, [events])

  const openEvent = (event: AssignmentEvent) => {
    setSelectedEvents([])
    router.push({ pathname: '/(student)/calendar/[eventId]', params: { eventId: String(event.id) } })
  }

  const shiftMonth = (amount: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  const monthTitle = month.toLocaleDateString([], { month: 'long', year: 'numeric' })
  const sortedEvents = [...events].sort((a, b) => a.due_at.localeCompare(b.due_at))

  return (
    <ThemedView style={styles.container}>
      <View style={styles.pageHeader}>
        <View>
          <ThemedText title style={styles.pageTitle}>Calendar</ThemedText>
          <ThemedText style={styles.subtitle}>Assignments and important due dates</ThemedText>
        </View>
      </View>

      <View style={[styles.segment, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
        {(['calendar', 'list'] as ViewMode[]).map((mode) => {
          const active = viewMode === mode
          return (
            <Pressable key={mode} onPress={() => setViewMode(mode)} style={[styles.segmentButton, active && { backgroundColor: theme.primary }]}>
              <Ionicons name={mode === 'calendar' ? 'calendar-outline' : 'list-outline'} size={18} color={active ? '#FFFFFF' : theme.text} />
              <ThemedText style={[styles.segmentText, active && styles.segmentTextActive]}>{mode === 'calendar' ? 'Calendar' : 'List'}</ThemedText>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.monthHeader}>
        <Pressable onPress={() => shiftMonth(-1)} style={[styles.monthButton, { backgroundColor: theme.uiBackground }]}>
          <Ionicons name='chevron-back' size={23} color={theme.title} />
        </Pressable>
        <Pressable onPress={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
          <ThemedText title style={styles.monthTitle}>{monthTitle}</ThemedText>
        </Pressable>
        <Pressable onPress={() => shiftMonth(1)} style={[styles.monthButton, { backgroundColor: theme.uiBackground }]}>
          <Ionicons name='chevron-forward' size={23} color={theme.title} />
        </Pressable>
      </View>

      {query.isLoading ? (
        <View style={styles.center}><ActivityIndicator size='large' color={theme.primary} /></View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Ionicons name='cloud-offline-outline' size={42} color={theme.danger} />
          <ThemedText title style={styles.errorTitle}>Could not load calendar</ThemedText>
          <ThemedText style={styles.errorText}>{(query.error as Error).message}</ThemedText>
          <Pressable onPress={() => query.refetch()} style={[styles.retryButton, { backgroundColor: theme.primary }]}><ThemedText style={styles.retryText}>Try again</ThemedText></Pressable>
        </View>
      ) : viewMode === 'calendar' ? (
        <ScrollView refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.primary} />} contentContainerStyle={styles.calendarScroll}>
          <View style={[styles.calendarCard, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}>
            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map((day) => <ThemedText key={day} style={styles.weekLabel}>{day}</ThemedText>)}
            </View>
            <View style={styles.grid}>
              {monthGrid(month).map((day) => {
                const key = formatApiDate(day)
                const dayEvents = eventsByDate.get(key) ?? []
                const inMonth = day.getMonth() === month.getMonth()
                const today = key === formatApiDate(new Date())
                const colors = [...new Set(dayEvents.map((event) => getCourseColor(event.course)))]
                return (
                  <Pressable
                    key={key}
                    disabled={dayEvents.length === 0}
                    onPress={() => setSelectedEvents(dayEvents)}
                    style={({ pressed }) => [styles.dayCell, { borderColor: theme.border, opacity: pressed ? 0.65 : 1 }]}
                  >
                    <View style={[styles.dayNumberWrap, today && { backgroundColor: theme.primary }]}>
                      <ThemedText style={[styles.dayNumber, !inMonth && styles.outsideMonth, today && styles.todayText]}>{day.getDate()}</ThemedText>
                    </View>
                    <View style={styles.indicators}>
                      {colors.slice(0, 3).map((color) => <View key={color} style={[styles.indicator, { backgroundColor: color }]} />)}
                      {dayEvents.length > 3 && <ThemedText style={styles.moreText}>+{dayEvents.length - 3}</ThemedText>}
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>
          {events.length === 0 && <View style={styles.empty}><Ionicons name='calendar-clear-outline' size={44} color={theme.text} /><ThemedText title style={styles.emptyTitle}>No events this month</ThemedText></View>}
        </ScrollView>
      ) : (
        <FlatList
          data={sortedEvents}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, sortedEvents.length === 0 && styles.listEmpty]}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.primary} />}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name='list-outline' size={44} color={theme.text} /><ThemedText title style={styles.emptyTitle}>No events this month</ThemedText></View>}
          renderItem={({ item }) => {
            const color = getCourseColor(item.course)
            return (
              <Pressable onPress={() => openEvent(item)} style={({ pressed }) => [styles.listCard, { backgroundColor: theme.uiBackground, borderColor: theme.border, opacity: pressed ? 0.72 : 1 }]}>
                <View style={[styles.listRail, { backgroundColor: color }]} />
                <View style={styles.listContent}>
                  <View style={styles.listTop}><ThemedText title style={styles.listTitle} numberOfLines={2}>{item.title}</ThemedText><Ionicons name='chevron-forward' size={20} color={theme.text} /></View>
                  <View style={[styles.coursePill, { backgroundColor: color }]}><ThemedText style={styles.coursePillText}>{item.course.code}</ThemedText></View>
                  <ThemedText style={styles.courseName}>{item.course.name}</ThemedText>
                  <View style={styles.dateRow}><Ionicons name='calendar-outline' size={16} color={theme.text} /><ThemedText style={styles.dateText}>{formatLongDate(item.due_at)} · {formatTime(item.due_at)}</ThemedText></View>
                </View>
              </Pressable>
            )
          }}
        />
      )}

      <DayEventsModal visible={selectedEvents.length > 0} events={selectedEvents} onClose={() => setSelectedEvents([])} onSelect={openEvent} />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  pageHeader: { marginBottom: 14 },
  pageTitle: { fontSize: 27, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 3 },
  segment: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 4, marginBottom: 14 },
  segmentButton: { flex: 1, height: 42, flexDirection: 'row', gap: 7, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 14, fontWeight: '800' },
  segmentTextActive: { color: '#FFFFFF' },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 19, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 10 },
  errorTitle: { fontSize: 19, marginTop: 8 },
  errorText: { textAlign: 'center' },
  retryButton: { marginTop: 8, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: '#FFFFFF', fontWeight: '800' },
  calendarScroll: { paddingBottom: 26 },
  calendarCard: { borderWidth: 1, borderRadius: 22, overflow: 'hidden' },
  weekRow: { flexDirection: 'row', paddingVertical: 10 },
  weekLabel: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, height: 62, alignItems: 'center', paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderRightWidth: StyleSheet.hairlineWidth },
  dayNumberWrap: { minWidth: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayNumber: { fontSize: 13, fontWeight: '800' },
  outsideMonth: { opacity: 0.32 },
  todayText: { color: '#FFFFFF' },
  indicators: { minHeight: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 6, paddingHorizontal: 2 },
  indicator: { width: 8, height: 8, borderRadius: 4 },
  moreText: { fontSize: 8, fontWeight: '900' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 45, gap: 8 },
  emptyTitle: { fontSize: 17 },
  list: { gap: 12, paddingBottom: 26 },
  listEmpty: { flexGrow: 1 },
  listCard: { minHeight: 132, flexDirection: 'row', borderWidth: 1, borderRadius: 22, overflow: 'hidden' },
  listRail: { width: 10 },
  listContent: { flex: 1, padding: 15 },
  listTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  listTitle: { flex: 1, fontSize: 17, fontWeight: '900' },
  coursePill: { alignSelf: 'flex-start', marginTop: 9, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  coursePillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  courseName: { fontSize: 13, marginTop: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  dateText: { fontSize: 12 },
})

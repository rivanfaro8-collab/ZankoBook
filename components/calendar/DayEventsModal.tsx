import { Ionicons } from '@expo/vector-icons'
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { useAppTheme } from '../../src/store/themeStore'
import type { AssignmentEvent } from '../../src/types/calendar'
import { getCourseColor } from '../../src/utils/courseColors'
import ThemedText from '../ThemedText'
import { formatLongDate, formatTime } from './calendarUtils'

type Props = {
  visible: boolean
  events: AssignmentEvent[]
  onClose: () => void
  onSelect: (event: AssignmentEvent) => void
}

export default function DayEventsModal({ visible, events, onClose, onSelect }: Props) {
  const theme = useAppTheme()
  const dateLabel = events[0] ? formatLongDate(events[0].due_at) : 'Events'

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText title style={styles.title}>{dateLabel}</ThemedText>
              <ThemedText>{events.length} {events.length === 1 ? 'event' : 'events'}</ThemedText>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={[styles.close, { backgroundColor: theme.uiBackground }]}>
              <Ionicons name='close' size={22} color={theme.title} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {events.map((event) => {
              const color = getCourseColor(event.course)
              return (
                <Pressable
                  key={event.id}
                  onPress={() => onSelect(event)}
                  style={({ pressed }) => [
                    styles.eventCard,
                    { backgroundColor: theme.uiBackground, borderColor: theme.border, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <View style={[styles.rail, { backgroundColor: color }]} />
                  <View style={styles.eventContent}>
                    <View style={styles.eventTopRow}>
                      <ThemedText title style={styles.eventTitle} numberOfLines={2}>{event.title}</ThemedText>
                      <Ionicons name='chevron-forward' size={19} color={theme.text} />
                    </View>
                    <ThemedText style={styles.course}>{event.course.name} · {event.course.code}</ThemedText>
                    <View style={styles.metaRow}>
                      <Ionicons name='time-outline' size={16} color={theme.text} />
                      <ThemedText style={styles.meta}>{formatTime(event.due_at)}</ThemedText>
                      <View style={[styles.status, { backgroundColor: event.is_submitted ? '#DCFCE7' : event.is_overdue ? '#FEE2E2' : '#FEF3C7' }]}>
                        <ThemedText style={[styles.statusText, { color: event.is_submitted ? '#166534' : event.is_overdue ? '#991B1B' : '#92400E' }]}>
                          {event.is_submitted ? 'Submitted' : event.is_overdue ? 'Overdue' : 'Pending'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '78%', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: 20, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 21, fontWeight: '800' },
  close: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 12 },
  eventCard: { minHeight: 106, borderRadius: 20, borderWidth: 1, overflow: 'hidden', flexDirection: 'row' },
  rail: { width: 8 },
  eventContent: { flex: 1, padding: 14 },
  eventTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eventTitle: { flex: 1, fontSize: 16, fontWeight: '800' },
  course: { fontSize: 13, marginTop: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  meta: { fontSize: 13 },
  status: { marginLeft: 'auto', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '800' },
})

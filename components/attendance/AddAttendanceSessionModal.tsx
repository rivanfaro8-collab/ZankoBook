import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { createAttendanceWeek } from '../../src/api/attendance'
import { useAppTheme } from '../../src/store/themeStore'
import type { AttendanceWeek } from '../../src/types/attendance'
import ThemedText from '../ThemedText'

const toDateValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = () => toDateValue(new Date())
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value)

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type TimeTarget = 'start' | 'end'

type Props = {
  visible: boolean
  courseId: number
  onClose: () => void
  onCreated: (week: AttendanceWeek) => void
}

export default function AddAttendanceSessionModal({
  visible,
  courseId,
  onClose,
  onCreated,
}: Props) {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [sessionDate, setSessionDate] = useState(today())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [timePickerTarget, setTimePickerTarget] = useState<TimeTarget | null>(null)
  const [pickerHour, setPickerHour] = useState('09')
  const [pickerMinute, setPickerMinute] = useState('00')

  useEffect(() => {
    if (!visible) return
    const now = new Date()
    setTitle('')
    setSessionDate(toDateValue(now))
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setStartTime('09:00')
    setEndTime('10:00')
    setCalendarVisible(false)
    setTimePickerTarget(null)
  }, [visible])

  const timeOrderValid = validTime(startTime) && validTime(endTime) && endTime > startTime
  const formValid = useMemo(
    () => title.trim().length > 0 && validDate(sessionDate) && timeOrderValid,
    [sessionDate, timeOrderValid, title],
  )

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ]
  }, [calendarMonth])

  const mutation = useMutation({
    mutationFn: createAttendanceWeek,
    onSuccess: (week) => {
      queryClient.setQueryData<AttendanceWeek[]>(
        ['attendance-weeks', courseId],
        (current = []) => {
          if (current.some((item) => item.id === week.id)) return current
          return [...current, week]
        },
      )
      onCreated(week)
      onClose()
    },
  })

  const openTimePicker = (target: TimeTarget) => {
    const value = target === 'start' ? startTime : endTime
    const [hour = '09', minute = '00'] = value.split(':')
    setPickerHour(hour)
    setPickerMinute(MINUTES.includes(minute) ? minute : '00')
    setTimePickerTarget(target)
  }

  const confirmTime = () => {
    const value = `${pickerHour}:${pickerMinute}`
    if (timePickerTarget === 'start') setStartTime(value)
    if (timePickerTarget === 'end') setEndTime(value)
    setTimePickerTarget(null)
  }

  const selectDate = (day: number) => {
    const selected = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
    setSessionDate(toDateValue(selected))
    setCalendarVisible(false)
  }

  const openCalendar = () => {
    const [year, month] = sessionDate.split('-').map(Number)
    if (year && month) setCalendarMonth(new Date(year, month - 1, 1))
    setCalendarVisible(true)
  }

  const submit = () => {
    if (!formValid || mutation.isPending) return
    mutation.mutate({
      course_id: courseId,
      title: title.trim(),
      session_date: sessionDate,
      start_at: `${sessionDate} ${startTime}:00`,
      end_at: `${sessionDate} ${endTime}:00`,
    })
  }

  const inputStyle = [
    styles.input,
    {
      color: theme.title,
      backgroundColor: theme.uiBackground,
      borderColor: theme.border,
    },
  ]

  return (
    <>
      <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={styles.header}>
              <ThemedText title style={styles.heading}>Add attendance session</ThemedText>
              <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.uiBackground }]}>
                <Ionicons name='close' size={21} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
              <ThemedText title style={styles.label}>Session title</ThemedText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder='e.g. Week 4 — Trees'
                placeholderTextColor={theme.text}
                style={inputStyle}
              />

              <ThemedText title style={[styles.label, styles.dateLabel]}>Session date</ThemedText>
              <Pressable
                onPress={openCalendar}
                style={[styles.selectionButton, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}
              >
                <Ionicons name='calendar-outline' size={20} color={theme.primary} />
                <ThemedText title style={styles.selectionValue}>{sessionDate}</ThemedText>
                <Ionicons name='chevron-down' size={17} color={theme.text} />
              </Pressable>

              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <ThemedText title style={styles.label}>Start time</ThemedText>
                  <Pressable
                    onPress={() => openTimePicker('start')}
                    style={[styles.selectionButton, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}
                  >
                    <Ionicons name='time-outline' size={20} color={theme.primary} />
                    <ThemedText title style={styles.selectionValue}>{startTime}</ThemedText>
                    <Ionicons name='chevron-down' size={17} color={theme.text} />
                  </Pressable>
                </View>
                <View style={styles.timeField}>
                  <ThemedText title style={styles.label}>End time</ThemedText>
                  <Pressable
                    onPress={() => openTimePicker('end')}
                    style={[styles.selectionButton, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}
                  >
                    <Ionicons name='time-outline' size={20} color={theme.primary} />
                    <ThemedText title style={styles.selectionValue}>{endTime}</ThemedText>
                    <Ionicons name='chevron-down' size={17} color={theme.text} />
                  </Pressable>
                </View>
              </View>

              {!timeOrderValid ? (
                <ThemedText style={[styles.error, { color: theme.danger }]}>End time must be after start time.</ThemedText>
              ) : null}
              {mutation.error ? (
                <ThemedText style={[styles.error, { color: theme.danger }]}>
                  {(mutation.error as Error).message}
                </ThemedText>
              ) : null}

              <Pressable
                disabled={!formValid || mutation.isPending}
                onPress={submit}
                style={({ pressed }) => [
                  styles.submit,
                  {
                    backgroundColor: theme.primary,
                    opacity: !formValid || mutation.isPending ? 0.45 : pressed ? 0.78 : 1,
                  },
                ]}
              >
                <ThemedText title style={styles.submitText}>
                  {mutation.isPending ? 'Adding…' : 'Add'}
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={calendarVisible} transparent animationType='fade' onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.pickerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCalendarVisible(false)} />
          <View style={[styles.calendarCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={styles.calendarHeader}>
              <Pressable
                onPress={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                style={[styles.calendarArrow, { backgroundColor: theme.uiBackground }]}
              >
                <Ionicons name='chevron-back' size={20} color={theme.title} />
              </Pressable>
              <ThemedText title style={styles.calendarTitle}>
                {calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </ThemedText>
              <Pressable
                onPress={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                style={[styles.calendarArrow, { backgroundColor: theme.uiBackground }]}
              >
                <Ionicons name='chevron-forward' size={20} color={theme.title} />
              </Pressable>
            </View>

            <View style={styles.calendarGrid}>
              {WEEK_DAYS.map((day) => (
                <ThemedText key={day} style={styles.weekDay}>{day}</ThemedText>
              ))}
              {calendarDays.map((day, index) => {
                if (day === null) return <View key={`empty-${index}`} style={styles.dayCell} />
                const value = toDateValue(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))
                const selected = value === sessionDate
                const isToday = value === today()
                return (
                  <Pressable
                    key={value}
                    onPress={() => selectDate(day)}
                    style={[
                      styles.dayCell,
                      selected && { backgroundColor: theme.primary },
                      !selected && isToday && { borderColor: theme.primary, borderWidth: 1 },
                    ]}
                  >
                    <ThemedText title style={{ color: selected ? '#FFFFFF' : theme.title }}>{day}</ThemedText>
                  </Pressable>
                )
              })}
            </View>

            <Pressable
              onPress={() => {
                const now = new Date()
                setSessionDate(toDateValue(now))
                setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1))
                setCalendarVisible(false)
              }}
              style={[styles.todayButton, { borderColor: theme.primary }]}
            >
              <ThemedText title style={{ color: theme.primary }}>Select today</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={timePickerTarget !== null} transparent animationType='fade' onRequestClose={() => setTimePickerTarget(null)}>
        <View style={styles.pickerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setTimePickerTarget(null)} />
          <View style={[styles.timePickerCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <ThemedText title style={styles.timePickerTitle}>
              Select {timePickerTarget === 'start' ? 'start' : 'end'} time
            </ThemedText>
            <View style={styles.pickerColumns}>
              <View style={styles.pickerColumn}>
                <ThemedText style={styles.pickerLabel}>Hour</ThemedText>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map((hour) => {
                    const selected = hour === pickerHour
                    return (
                      <Pressable key={hour} onPress={() => setPickerHour(hour)} style={[styles.pickerOption, selected && { backgroundColor: theme.primary }]}>
                        <ThemedText title style={{ color: selected ? '#FFFFFF' : theme.title }}>{hour}</ThemedText>
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>
              <ThemedText title style={styles.timeSeparator}>:</ThemedText>
              <View style={styles.pickerColumn}>
                <ThemedText style={styles.pickerLabel}>Minute</ThemedText>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map((minute) => {
                    const selected = minute === pickerMinute
                    return (
                      <Pressable key={minute} onPress={() => setPickerMinute(minute)} style={[styles.pickerOption, selected && { backgroundColor: theme.primary }]}>
                        <ThemedText title style={{ color: selected ? '#FFFFFF' : theme.title }}>{minute}</ThemedText>
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>
            </View>
            <Pressable onPress={confirmTime} style={[styles.confirmTime, { backgroundColor: theme.primary }]}>
              <ThemedText title style={styles.submitText}>Confirm</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, paddingHorizontal: 18, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.52)' },
  card: { maxHeight: '88%', borderWidth: 1, borderRadius: 22, padding: 20, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  heading: { fontSize: 20, fontWeight: '800' },
  closeButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 7 },
  dateLabel: { marginTop: 16 },
  input: { height: 50, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontSize: 15 },
  timeRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  timeField: { flex: 1 },
  selectionButton: { height: 50, borderWidth: 1, borderRadius: 13, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 7 },
  selectionValue: { flex: 1, fontSize: 15 },
  error: { marginTop: 10, fontSize: 12, textAlign: 'center' },
  submit: { height: 50, borderRadius: 14, marginTop: 22, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  pickerOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, backgroundColor: 'rgba(0,0,0,0.58)' },
  calendarCard: { borderWidth: 1, borderRadius: 20, padding: 16 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  calendarArrow: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  calendarTitle: { fontSize: 17, fontWeight: '800' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekDay: { width: '14.2857%', textAlign: 'center', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  dayCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  todayButton: { height: 44, marginTop: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  timePickerCard: { borderWidth: 1, borderRadius: 20, padding: 18, maxHeight: 430 },
  timePickerTitle: { fontSize: 18, textAlign: 'center', marginBottom: 16 },
  pickerColumns: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  pickerColumn: { flex: 1 },
  pickerLabel: { textAlign: 'center', fontSize: 12, marginBottom: 7 },
  pickerScroll: { height: 245 },
  pickerOption: { height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  timeSeparator: { fontSize: 24, marginTop: 22 },
  confirmTime: { height: 48, marginTop: 16, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
})

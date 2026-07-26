import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import type { PickedSectionFile } from '@/api/sectionItems'
import { useAppTheme } from '@/store/themeStore'
import type {
  CourseSectionItem,
  SectionItemCategory,
  SectionItemFormValues,
  SectionSubmission,
  SectionSubmissionFormValues,
} from '@/types/course'
import ThemedText from '../ThemedText'
import ThemedTextInput from '../ThemedTextInput'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const WHEEL_ITEM_HEIGHT = 44
const HOURS = Array.from({ length: 24 }, (_, index) => index)
const MINUTES = Array.from({ length: 60 }, (_, index) => index)
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (value: number) => String(value).padStart(2, '0')

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseDate = (value?: string) => {
  if (!value) return new Date()
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return new Date()
  return new Date(year, month - 1, day)
}

const sameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

const monthLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const tabs: {
  key: SectionItemCategory
  label: string
  icon: keyof typeof Ionicons.glyphMap
}[] = [
  { key: 'file', label: 'File', icon: 'document-attach-outline' },
  { key: 'link', label: 'Link', icon: 'link-outline' },
  { key: 'note', label: 'Note', icon: 'reader-outline' },
  { key: 'submission', label: 'Submission', icon: 'cloud-upload-outline' },
]

export const getItemCategory = (item: CourseSectionItem): SectionItemCategory => {
  const type = item.type?.toLowerCase()
  if (type === 'note') return 'note'
  if (type === 'link') return 'link'
  return 'file'
}

type Props = {
  visible: boolean
  item?: CourseSectionItem | null
  assignment?: SectionSubmission | null
  initialCategory?: SectionItemCategory
  isSaving: boolean
  isDeletingAttachment?: boolean
  onDeleteAssignmentAttachment?: (attachmentId: number, fileName: string) => void
  onClose: () => void
  onSubmit: (
    category: SectionItemCategory,
    values: SectionItemFormValues,
    file: PickedSectionFile | null,
    submissionValues?: SectionSubmissionFormValues,
    submissionFiles?: PickedSectionFile[],
  ) => void
}

const splitDueAt = (dueAt?: string) => {
  if (!dueAt) return { date: '', time: '' }
  const [date = '', fullTime = ''] = dueAt.split(' ')
  return { date, time: fullTime.slice(0, 5) }
}

export default function SectionItemModal({
  visible,
  item,
  assignment,
  initialCategory = 'file',
  isSaving,
  isDeletingAttachment = false,
  onDeleteAssignmentAttachment,
  onClose,
  onSubmit,
}: Props) {
  const theme = useAppTheme()
  const isEdit = Boolean(item || assignment)

  const [category, setCategory] = useState<SectionItemCategory>(initialCategory)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<PickedSectionFile | null>(null)
  const [submissionFiles, setSubmissionFiles] = useState<PickedSectionFile[]>([])
  const [weight, setWeight] = useState('')
  const [maxMark, setMaxMark] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueHour, setDueHour] = useState(0)
  const [dueMinute, setDueMinute] = useState(0)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const hourWheelRef = useRef<ScrollView>(null)
  const minuteWheelRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (!visible) return

    const nextCategory = assignment
      ? 'submission'
      : item
        ? getItemCategory(item)
        : initialCategory

    const due = splitDueAt(assignment?.course_assessment.due_at)

    setCategory(nextCategory)
    setTitle(assignment?.course_assessment.title ?? item?.title ?? '')
    setDescription(assignment?.description ?? item?.description ?? '')
    setUrl(nextCategory === 'link' ? (item?.material_file_url ?? '') : '')
    setWeight(assignment?.course_assessment.weight ?? '')
    setMaxMark(assignment?.course_assessment.max_mark ?? '')
    const initialDate = parseDate(due.date)
    const [initialHour = 0, initialMinute = 0] = due.time.split(':').map(Number)
    setDueDate(due.date || formatDate(initialDate))
    setDueHour(Number.isFinite(initialHour) ? initialHour : 0)
    setDueMinute(Number.isFinite(initialMinute) ? initialMinute : 0)
    setCalendarMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))
    setShowCalendar(false)
    setShowTimePicker(false)
    setFile(null)
    setSubmissionFiles([])
  }, [assignment?.id, initialCategory, item?.id, visible])

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstWeekDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return [
      ...Array.from({ length: firstWeekDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
    ]
  }, [calendarMonth])

  useEffect(() => {
    if (!showTimePicker) return
    const timeout = setTimeout(() => {
      hourWheelRef.current?.scrollTo({ y: dueHour * WHEEL_ITEM_HEIGHT, animated: false })
      minuteWheelRef.current?.scrollTo({ y: dueMinute * WHEEL_ITEM_HEIGHT, animated: false })
    }, 0)
    return () => clearTimeout(timeout)
  }, [dueHour, dueMinute, showTimePicker])

  const changeMonth = (offset: number) => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    )
  }

  const selectDate = (date: Date) => {
    setDueDate(formatDate(date))
    setShowCalendar(false)
  }

  const selectWheelValue = (
    event: { nativeEvent: { contentOffset: { y: number } } },
    max: number,
    setter: (value: number) => void,
  ) => {
    const value = Math.max(0, Math.min(max, Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT)))
    setter(value)
  }

  const pickFile = async (multiple = false) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple,
      copyToCacheDirectory: true,
    })

    if (result.canceled) return

    const picked = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
    }))

    const tooLarge = picked.find((asset) => (asset.size ?? 0) > MAX_FILE_SIZE)
    if (tooLarge) {
      Alert.alert('File too large', `${tooLarge.name} must be 50 MB or smaller.`)
      return
    }

    if (multiple) {
      setSubmissionFiles((current) => [
        ...current,
        ...picked.filter(
          (next) => !current.some((existing) => existing.uri === next.uri),
        ),
      ])
    } else {
      setFile(picked[0] ?? null)
    }
  }

  const submit = () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title.')
      return
    }

    if (category === 'submission') {
      const numericWeight = Number(weight)
      const numericMaxMark = Number(maxMark)
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(dueDate)

      if (!weight.trim() || Number.isNaN(numericWeight) || numericWeight < 0) {
        Alert.alert('Weight required', 'Enter a valid weight of 0 or greater.')
        return
      }

      if (!maxMark.trim() || Number.isNaN(numericMaxMark) || numericMaxMark <= 0) {
        Alert.alert('Maximum mark required', 'Enter a maximum mark greater than 0.')
        return
      }

      if (!validDate) {
        Alert.alert('Due date required', 'Enter the due date as YYYY-MM-DD.')
        return
      }

      onSubmit(
        category,
        { title, description, url: '' },
        null,
        {
          title,
          description,
          weight: numericWeight,
          maxMark: numericMaxMark,
          dueAt: `${dueDate} ${pad(dueHour)}:${pad(dueMinute)}:00`,
        },
        submissionFiles,
      )
      return
    }

    if (category === 'link' && !url.trim()) {
      Alert.alert('URL required', 'Please enter a URL for this link.')
      return
    }

    if (category === 'file' && !isEdit && !file) {
      Alert.alert('File required', 'Please select a file to upload.')
      return
    }

    onSubmit(category, { title, description, url }, file)
  }

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}
          >
            <View style={styles.header}>
              <ThemedText title style={styles.title}>
                {isEdit ? (category === 'submission' ? 'Edit assignment' : 'Edit item') : 'Upload item'}
              </ThemedText>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
                <Ionicons name='close' size={23} color={theme.text} />
              </Pressable>
            </View>

            <View style={[styles.tabs, { backgroundColor: theme.uiBackground }]}>
              {tabs.map((tab) => {
                const selected = tab.key === category
                const disabled = isEdit && tab.key !== category
                return (
                  <Pressable
                    key={tab.key}
                    disabled={disabled}
                    onPress={() => setCategory(tab.key)}
                    style={[
                      styles.tab,
                      selected && { backgroundColor: theme.primary },
                      disabled && styles.disabled,
                    ]}
                  >
                    <Ionicons name={tab.icon} size={17} color={selected ? '#FFFFFF' : theme.text} />
                    <ThemedText style={[styles.tabText, selected && styles.whiteText]}>{tab.label}</ThemedText>
                  </Pressable>
                )
              })}
            </View>

            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps='handled'>
              <ThemedTextInput value={title} onChangeText={setTitle} placeholder='Title *' />

              <ThemedTextInput
                value={description}
                onChangeText={setDescription}
                placeholder='Description (optional)'
                multiline
                style={styles.descriptionInput}
              />

              {category === 'submission' ? (
                <>
                  <View style={styles.twoColumns}>
                    <ThemedTextInput
                      value={weight}
                      onChangeText={setWeight}
                      placeholder='Weight *'
                      keyboardType='decimal-pad'
                      style={styles.flexInput}
                    />
                    <ThemedTextInput
                      value={maxMark}
                      onChangeText={setMaxMark}
                      placeholder='Maximum mark *'
                      keyboardType='decimal-pad'
                      style={styles.flexInput}
                    />
                  </View>

                  <View style={styles.dateTimeSection}>
                    <View style={styles.dateTimeField}>
                      <ThemedText style={styles.fieldLabel}>Due date *</ThemedText>
                      <Pressable
                        onPress={() => {
                          setShowCalendar((current) => !current)
                          setShowTimePicker(false)
                        }}
                        style={[styles.dateTimeButton, { borderColor: theme.border, backgroundColor: theme.uiBackground }]}
                      >
                        <Ionicons name='calendar-outline' size={19} color={theme.primary} />
                        <ThemedText style={styles.dateTimeValue}>{dueDate}</ThemedText>
                        <Ionicons
                          name={showCalendar ? 'chevron-up' : 'chevron-down'}
                          size={17}
                          color={theme.text}
                        />
                      </Pressable>
                    </View>

                    <View style={styles.dateTimeField}>
                      <ThemedText style={styles.fieldLabel}>Due time *</ThemedText>
                      <Pressable
                        onPress={() => {
                          setShowTimePicker((current) => !current)
                          setShowCalendar(false)
                        }}
                        style={[styles.dateTimeButton, { borderColor: theme.border, backgroundColor: theme.uiBackground }]}
                      >
                        <Ionicons name='time-outline' size={19} color={theme.primary} />
                        <ThemedText style={styles.dateTimeValue}>
                          {pad(dueHour)}:{pad(dueMinute)}
                        </ThemedText>
                        <Ionicons
                          name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                          size={17}
                          color={theme.text}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {showCalendar && (
                    <View style={[styles.pickerPanel, { borderColor: theme.border, backgroundColor: theme.uiBackground }]}>
                      <View style={styles.calendarHeader}>
                        <Pressable onPress={() => changeMonth(-1)} style={styles.pickerArrow}>
                          <Ionicons name='chevron-back' size={22} color={theme.text} />
                        </Pressable>
                        <ThemedText style={styles.monthTitle}>{monthLabel(calendarMonth)}</ThemedText>
                        <Pressable onPress={() => changeMonth(1)} style={styles.pickerArrow}>
                          <Ionicons name='chevron-forward' size={22} color={theme.text} />
                        </Pressable>
                      </View>

                      <View style={styles.calendarGrid}>
                        {WEEK_DAYS.map((day) => (
                          <ThemedText key={day} style={styles.weekDay}>{day}</ThemedText>
                        ))}
                        {calendarDays.map((date, index) => {
                          const selected = date ? sameDay(date, parseDate(dueDate)) : false
                          return date ? (
                            <Pressable
                              key={date.toISOString()}
                              onPress={() => selectDate(date)}
                              style={styles.dayCell}
                            >
                              <ThemedText style={[styles.dayText, selected && { backgroundColor: theme.primary }, selected && styles.whiteText]}>
                                {date.getDate()}
                              </ThemedText>
                            </Pressable>
                          ) : (
                            <View key={`empty-${index}`} style={styles.dayCell} />
                          )
                        })}
                      </View>
                    </View>
                  )}

                  {showTimePicker && (
                    <View style={[styles.pickerPanel, { borderColor: theme.border, backgroundColor: theme.uiBackground }]}>
                      <View style={styles.timePickerHeader}>
                        <ThemedText style={styles.timeColumnTitle}>Hour</ThemedText>
                        <ThemedText style={styles.timeColumnTitle}>Minute</ThemedText>
                      </View>
                      <View style={styles.timeWheels}>
                        <View style={[styles.wheel, { borderColor: theme.border }]}>
                          <ScrollView
                            ref={hourWheelRef}
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={false}
                            snapToInterval={WHEEL_ITEM_HEIGHT}
                            decelerationRate='fast'
                            contentContainerStyle={styles.wheelContent}
                            onMomentumScrollEnd={(event) => selectWheelValue(event, 23, setDueHour)}
                          >
                            {HOURS.map((hour) => (
                              <Pressable
                                key={hour}
                                onPress={() => {
                                  setDueHour(hour)
                                  hourWheelRef.current?.scrollTo({ y: hour * WHEEL_ITEM_HEIGHT, animated: true })
                                }}
                                style={styles.wheelItem}
                              >
                                <ThemedText style={[styles.wheelText, hour === dueHour && { color: theme.primary, fontWeight: '800' }]}>
                                  {pad(hour)}
                                </ThemedText>
                              </Pressable>
                            ))}
                          </ScrollView>
                          <View pointerEvents='none' style={[styles.wheelSelection, { borderColor: theme.primary }]} />
                        </View>

                        <ThemedText style={styles.timeSeparator}>:</ThemedText>

                        <View style={[styles.wheel, { borderColor: theme.border }]}>
                          <ScrollView
                            ref={minuteWheelRef}
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={false}
                            snapToInterval={WHEEL_ITEM_HEIGHT}
                            decelerationRate='fast'
                            contentContainerStyle={styles.wheelContent}
                            onMomentumScrollEnd={(event) => selectWheelValue(event, 59, setDueMinute)}
                          >
                            {MINUTES.map((minute) => (
                              <Pressable
                                key={minute}
                                onPress={() => {
                                  setDueMinute(minute)
                                  minuteWheelRef.current?.scrollTo({ y: minute * WHEEL_ITEM_HEIGHT, animated: true })
                                }}
                                style={styles.wheelItem}
                              >
                                <ThemedText style={[styles.wheelText, minute === dueMinute && { color: theme.primary, fontWeight: '800' }]}>
                                  {pad(minute)}
                                </ThemedText>
                              </Pressable>
                            ))}
                          </ScrollView>
                          <View pointerEvents='none' style={[styles.wheelSelection, { borderColor: theme.primary }]} />
                        </View>
                      </View>
                    </View>
                  )}

                  {isEdit && (
                    <View style={styles.attachmentGroup}>
                      <ThemedText title style={styles.attachmentGroupTitle}>
                        Current attachments ({assignment?.attachments.length ?? 0})
                      </ThemedText>

                      {(assignment?.attachments.length ?? 0) === 0 ? (
                        <View style={[styles.emptyAttachmentBox, { borderColor: theme.border }]}>
                          <Ionicons name='document-outline' size={18} color={theme.text} />
                          <ThemedText style={styles.helpText}>No attachments uploaded.</ThemedText>
                        </View>
                      ) : (
                        assignment?.attachments.map((attachment) => (
                          <View key={attachment.id} style={[styles.currentAttachment, { borderColor: theme.border }]}>
                            <Ionicons name='document-outline' size={18} color={theme.primary} />
                            <ThemedText style={styles.attachmentName} numberOfLines={1}>
                              {attachment.file_name}
                            </ThemedText>
                            {onDeleteAssignmentAttachment && (
                              <Pressable
                                hitSlop={8}
                                disabled={isDeletingAttachment}
                                onPress={() => onDeleteAssignmentAttachment(attachment.id, attachment.file_name)}
                                style={isDeletingAttachment && styles.disabled}
                              >
                                <Ionicons name='trash-outline' size={19} color={theme.danger} />
                              </Pressable>
                            )}
                          </View>
                        ))
                      )}
                    </View>
                  )}

                  <View style={styles.attachmentGroup}>
                    <ThemedText title style={styles.attachmentGroupTitle}>
                      Files to upload ({submissionFiles.length})
                    </ThemedText>

                    {submissionFiles.map((pickedFile) => (
                      <View key={pickedFile.uri} style={[styles.currentAttachment, { borderColor: theme.border }]}>
                        <Ionicons name='attach-outline' size={18} color={theme.primary} />
                        <ThemedText style={styles.attachmentName} numberOfLines={1}>
                          {pickedFile.name}
                        </ThemedText>
                        <Pressable
                          hitSlop={8}
                          onPress={() => setSubmissionFiles((current) => current.filter((entry) => entry.uri !== pickedFile.uri))}
                        >
                          <Ionicons name='close-circle-outline' size={20} color={theme.danger} />
                        </Pressable>
                      </View>
                    ))}
                  </View>

                  <Pressable
                    onPress={() => pickFile(true)}
                    style={[styles.filePicker, { borderColor: theme.border, backgroundColor: theme.uiBackground }]}
                  >
                    <Ionicons name='attach-outline' size={21} color={theme.primary} />
                    <ThemedText style={styles.filePickerText}>
                      {submissionFiles.length > 0 ? 'Add more attachments' : 'Add optional attachments'}
                    </ThemedText>
                  </Pressable>
                  <ThemedText style={styles.helpText}>Maximum size per file: 50 MB</ThemedText>
                </>
              ) : (
                <>
                  {category === 'link' && (
                    <ThemedTextInput
                      value={url}
                      onChangeText={setUrl}
                      placeholder='URL *'
                      autoCapitalize='none'
                      autoCorrect={false}
                      keyboardType='url'
                    />
                  )}

                  {category === 'file' && (
                    <View>
                      {isEdit && !file && item?.material_file_name && (
                        <ThemedText style={styles.currentFile}>Current file: {item.material_file_name}</ThemedText>
                      )}
                      <Pressable
                        onPress={() => pickFile(false)}
                        style={[styles.filePicker, { borderColor: theme.border, backgroundColor: theme.uiBackground }]}
                      >
                        <Ionicons name='attach-outline' size={21} color={theme.primary} />
                        <ThemedText style={styles.filePickerText} numberOfLines={2}>
                          {file?.name ?? (isEdit ? 'Choose a replacement file' : 'Choose file *')}
                        </ThemedText>
                      </Pressable>
                      <ThemedText style={styles.helpText}>Maximum size: 50 MB</ThemedText>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <Pressable
              disabled={isSaving}
              onPress={submit}
              style={[styles.submitButton, { backgroundColor: theme.primary }, isSaving && styles.disabled]}
            >
              {isSaving ? (
                <ActivityIndicator color='#FFFFFF' />
              ) : (
                <ThemedText style={styles.submitText}>{isEdit ? 'Update' : 'Create'}</ThemedText>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 18 },
  keyboardContainer: { width: '100%' },
  card: { maxHeight: '92%', borderWidth: 1, borderRadius: 20, padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  title: { flex: 1, fontSize: 20, fontWeight: '800' },
  closeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 3 },
  tab: { flex: 1, minHeight: 48, borderRadius: 9, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabText: { fontSize: 11, fontWeight: '700' },
  whiteText: { color: '#FFFFFF' },
  form: { paddingVertical: 18, gap: 12 },
  descriptionInput: { minHeight: 100, textAlignVertical: 'top' },
  twoColumns: { flexDirection: 'row', gap: 10 },
  flexInput: { flex: 1 },
  dateTimeSection: { gap: 12 },
  dateTimeField: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '700', opacity: 0.78 },
  dateTimeButton: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateTimeValue: { flex: 1, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  pickerPanel: { width: '100%', maxWidth: 360, alignSelf: 'center', borderWidth: 1, borderRadius: 14, padding: 10 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  pickerArrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '800' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekDay: { width: '14.2857%', height: 28, textAlign: 'center', fontSize: 10, fontWeight: '700', opacity: 0.65, paddingTop: 7 },
  dayCell: { width: '14.2857%', height: 34, alignItems: 'center', justifyContent: 'center' },
  dayText: { width: 30, height: 30, lineHeight: 30, borderRadius: 15, textAlign: 'center', fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  timePickerHeader: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 6 },
  timeColumnTitle: { width: 84, textAlign: 'center', fontSize: 12, fontWeight: '700', opacity: 0.7 },
  timeWheels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  wheel: { width: 84, height: WHEEL_ITEM_HEIGHT * 3, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  wheelContent: { paddingVertical: WHEEL_ITEM_HEIGHT },
  wheelItem: { height: WHEEL_ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  wheelText: { fontSize: 20, fontVariant: ['tabular-nums'] },
  wheelSelection: { position: 'absolute', top: WHEEL_ITEM_HEIGHT, left: 8, right: 8, height: WHEEL_ITEM_HEIGHT, borderTopWidth: 1, borderBottomWidth: 1 },
  timeSeparator: { fontSize: 26, fontWeight: '800' },
  currentFile: { marginBottom: 8, fontSize: 12 },
  attachmentGroup: { gap: 8 },
  attachmentGroupTitle: { fontSize: 13, fontWeight: '800' },
  emptyAttachmentBox: { minHeight: 48, borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  filePicker: { minHeight: 58, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  filePickerText: { flex: 1, fontWeight: '700' },
  helpText: { marginTop: -5, fontSize: 11 },
  currentAttachment: { minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  attachmentName: { flex: 1, fontSize: 12 },
  submitButton: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontWeight: '800' },
  disabled: { opacity: 0.45 },
})

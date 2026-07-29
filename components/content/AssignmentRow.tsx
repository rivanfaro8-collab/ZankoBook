import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { getSectionSubmission } from '@/api/submissions'
import { useAppTheme } from '@/store/themeStore'
import type { SectionSubmission } from '@/types/course'
import ThemedText from '../ThemedText'
import StudentSubmissionPanel, { isAssignmentClosed } from './StudentSubmissionPanel'

type Props = {
  assignment: SectionSubmission
  mode: 'lecturer' | 'student'
  canModify: boolean
  onEdit: (assignment: SectionSubmission) => void
  onDelete: (assignment: SectionSubmission) => void
  onDeleteAttachment: (attachmentId: number, fileName: string) => void
}

const readableSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AssignmentRow({
  assignment,
  mode,
  canModify,
  onEdit,
  onDelete,
  onDeleteAttachment,
}: Props) {
  const theme = useAppTheme()
  const [expanded, setExpanded] = useState(false)
  const detailQuery = useQuery({
    queryKey: ['section-submission', assignment.id],
    queryFn: () => getSectionSubmission(assignment.id),
    enabled: expanded,
  })
  const displayedAssignment = detailQuery.data ?? assignment
  const assessment = displayedAssignment.course_assessment

  const openAttachment = async (url: string) => {
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      Alert.alert('Unable to open attachment', 'This attachment URL is not supported on this device.')
      return
    }
    await Linking.openURL(url)
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.uiBackground, borderColor: theme.border },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={[styles.typeIcon, { backgroundColor: theme.background }]}>
          <Ionicons name='clipboard-outline' size={22} color={theme.primary} />
        </View>

        <View style={styles.titleContainer}>
          <ThemedText
            title
            style={styles.title}
          >
            {assessment.title}
          </ThemedText>
          <ThemedText style={styles.meta}>Due {assessment.due_at}</ThemedText>
          <View style={styles.attachmentSummary}>
            <Ionicons name='attach-outline' size={13} color={theme.text} />
            <ThemedText style={styles.attachmentSummaryText}>
              {displayedAssignment.attachments.length} attachment{displayedAssignment.attachments.length === 1 ? '' : 's'}
            </ThemedText>
          </View>
        </View>

        {mode === 'lecturer' && canModify && (
          <View style={styles.actions}>
            <Pressable
              hitSlop={7}
              onPress={(event) => {
                event.stopPropagation()
                onEdit(displayedAssignment)
              }}
              style={[styles.iconButton, { backgroundColor: theme.background }]}
            >
              <Ionicons name='pencil-outline' size={17} color={theme.text} />
            </Pressable>
            <Pressable
              hitSlop={7}
              onPress={(event) => {
                event.stopPropagation()
                onDelete(assignment)
              }}
              style={[styles.iconButton, { backgroundColor: theme.background }]}
            >
              <Ionicons name='trash-outline' size={17} color={theme.danger} />
            </Pressable>
          </View>
        )}

        <Ionicons
          name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={18}
          color={theme.text}
        />
      </Pressable>

      {expanded && (
        <View style={[styles.details, { borderTopColor: theme.border }]}>
          {detailQuery.isLoading && (
            <ThemedText style={styles.description}>Loading assignment details…</ThemedText>
          )}

          {detailQuery.isError && (
            <Pressable onPress={() => detailQuery.refetch()}>
              <ThemedText title style={{ color: theme.primary }}>Could not load details. Try again</ThemedText>
            </Pressable>
          )}

          {!!displayedAssignment.description && (
            <ThemedText style={styles.description}>{displayedAssignment.description}</ThemedText>
          )}

          <View style={styles.statsRow}>
            <View style={[styles.stat, { backgroundColor: theme.background }]}>
              <ThemedText style={styles.statLabel}>Maximum mark</ThemedText>
              <ThemedText title style={styles.statValue}>{assessment.max_mark}</ThemedText>
            </View>
            <View style={[styles.stat, { backgroundColor: theme.background }]}>
              <ThemedText style={styles.statLabel}>Weight</ThemedText>
              <ThemedText title style={styles.statValue}>{assessment.weight}</ThemedText>
            </View>
          </View>

          {displayedAssignment.attachments.length > 0 && (
            <View style={styles.attachments}>
              <ThemedText title style={styles.attachmentsTitle}>Attachments</ThemedText>
              {displayedAssignment.attachments.map((attachment) => (
                <View key={attachment.id} style={[styles.attachmentRow, { borderColor: theme.border }]}>
                  <Pressable
                    onPress={() => openAttachment(attachment.file_url)}
                    style={styles.attachmentMain}
                  >
                    <Ionicons name='document-outline' size={18} color={theme.primary} />
                    <View style={styles.attachmentText}>
                      <ThemedText title numberOfLines={1} style={styles.fileName}>
                        {attachment.file_name}
                      </ThemedText>
                      <ThemedText style={styles.fileMeta}>{readableSize(attachment.file_size)}</ThemedText>
                    </View>
                    <Ionicons name='open-outline' size={17} color={theme.primary} />
                  </Pressable>

                  {mode === 'lecturer' && canModify && (
                    <Pressable
                      hitSlop={7}
                      onPress={() => onDeleteAttachment(attachment.id, attachment.file_name)}
                      style={[styles.attachmentDelete, { backgroundColor: theme.background }]}
                    >
                      <Ionicons name='trash-outline' size={16} color={theme.danger} />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}

          {mode === 'student' && (
            <StudentSubmissionPanel
              assignmentId={displayedAssignment.id}
              dueAt={assessment.due_at}
            />
          )}

          {mode === 'lecturer' && (
            <View style={styles.reviewArea}>
              <Pressable
                disabled={!isAssignmentClosed(assessment.due_at)}
                onPress={() =>
                  router.push({
                    pathname: '/(lecturer)/course/[courseId]/assignment/[assignmentId]/submissions' as never,
                    params: {
                      courseId: String(assessment.course_id),
                      assignmentId: String(displayedAssignment.id),
                      assignmentTitle: assessment.title,
                    },
                  })
                }
                style={[
                  styles.reviewButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: isAssignmentClosed(assessment.due_at) ? 1 : 0.45,
                  },
                ]}
              >
                <Ionicons name='people-outline' size={18} color='#FFFFFF' />
                <ThemedText style={styles.reviewButtonText}>View submissions</ThemedText>
              </Pressable>
              {!isAssignmentClosed(assessment.due_at) && (
                <ThemedText style={styles.reviewHint}>Available after the deadline.</ThemedText>
              )}
            </View>
          )}

        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { width: '94%', alignSelf: 'center', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  pressed: { opacity: 0.8 },
  row: { minHeight: 68, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 9 },
  typeIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  titleContainer: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, fontWeight: '800', lineHeight: 21 },
  meta: { marginTop: 3, fontSize: 11 },
  attachmentSummary: { marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 3 },
  attachmentSummaryText: { fontSize: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  iconButton: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  details: { borderTopWidth: 1, padding: 14, gap: 12 },
  description: { fontSize: 13, lineHeight: 19 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, borderRadius: 10, padding: 10 },
  statLabel: { fontSize: 11 },
  statValue: { marginTop: 3, fontSize: 15, fontWeight: '800' },
  attachments: { gap: 8 },
  attachmentsTitle: { fontSize: 13, fontWeight: '800' },
  attachmentRow: { minHeight: 50, borderWidth: 1, borderRadius: 10, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  attachmentMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  attachmentText: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 12, fontWeight: '700' },
  fileMeta: { marginTop: 2, fontSize: 10 },
  attachmentDelete: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  reviewArea: { gap: 6 },
  reviewButton: { minHeight: 44, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  reviewButtonText: { color: '#FFFFFF', fontWeight: '800' },
  reviewHint: { textAlign: 'center', fontSize: 11 },
})

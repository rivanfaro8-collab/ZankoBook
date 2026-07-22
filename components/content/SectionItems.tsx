import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native'

import {
  createSectionItem,
  deleteSectionItem,
  getSectionItems,
  type PickedSectionFile,
  updateSectionItem,
} from '@/api/sectionItems'
import {
  createSectionSubmission,
  deleteSectionSubmission,
  deleteSectionSubmissionAttachment,
  getSectionSubmissions,
  updateSectionSubmission,
} from '@/api/submissions'
import { useAppTheme } from '@/store/themeStore'
import type {
  CourseSectionItem,
  SectionItemCategory,
  SectionItemFormValues,
  SectionSubmission,
  SectionSubmissionFormValues,
} from '@/types/course'
import ThemedText from '../ThemedText'
import AssignmentRow from './AssignmentRow'
import SectionItemModal from './SectionItemModal'
import SectionItemRow from './SectionItemRow'

type Props = {
  sectionId: number
  mode: 'lecturer' | 'student'
}

const oldestFirst = <T extends { id: number; created_at: string }>(entries: T[]) =>
  [...entries].sort((a, b) => {
    const byDate = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return Number.isNaN(byDate) || byDate === 0 ? a.id - b.id : byDate
  })

export default function SectionItems({ sectionId, mode }: Props) {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const itemsQueryKey = ['course-section-items', sectionId]
  const submissionsQueryKey = ['course-section-submissions', sectionId]
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<CourseSectionItem | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<SectionSubmission | null>(null)

  const itemsQuery = useQuery({
    queryKey: itemsQueryKey,
    queryFn: () => getSectionItems(sectionId),
  })

  const submissionsQuery = useQuery({
    queryKey: submissionsQueryKey,
    queryFn: () => getSectionSubmissions(sectionId),
    enabled: mode === 'lecturer',
  })

  const saveMutation = useMutation({
    mutationFn: ({
      category,
      values,
      file,
      submissionValues,
      submissionFiles,
    }: {
      category: SectionItemCategory
      values: SectionItemFormValues
      file: PickedSectionFile | null
      submissionValues?: SectionSubmissionFormValues
      submissionFiles?: PickedSectionFile[]
    }) => {
      if (category === 'submission') {
        if (!submissionValues) throw new Error('Assignment values are missing.')
        return editingAssignment
          ? updateSectionSubmission(editingAssignment.id, submissionValues, submissionFiles)
          : createSectionSubmission(sectionId, submissionValues, submissionFiles)
      }

      return editingItem
        ? updateSectionItem(editingItem.id, values, file)
        : createSectionItem(sectionId, values, file)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: itemsQueryKey }),
        queryClient.invalidateQueries({ queryKey: submissionsQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['section-submission'] }),
        queryClient.invalidateQueries({ queryKey: ['course-sections'] }),
      ])
      setModalVisible(false)
      setEditingItem(null)
      setEditingAssignment(null)
    },
    onError: (error) => Alert.alert('Unable to save', error.message),
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => deleteSectionItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsQueryKey }),
    onError: (error) => Alert.alert('Unable to delete item', error.message),
  })

  const removeAssignmentMutation = useMutation({
    mutationFn: (assignmentId: number) => deleteSectionSubmission(assignmentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: submissionsQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['course-sections'] }),
      ])
    },
    onError: (error) => Alert.alert('Unable to delete assignment', error.message),
  })

  const removeAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) => deleteSectionSubmissionAttachment(attachmentId),
    onSuccess: async (_, attachmentId) => {
      setEditingAssignment((current) =>
        current
          ? {
              ...current,
              attachments: current.attachments.filter((attachment) => attachment.id !== attachmentId),
            }
          : current,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: submissionsQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['section-submission'] }),
      ])
    },
    onError: (error) => Alert.alert('Unable to delete attachment', error.message),
  })

  const confirmDeleteItem = (item: CourseSectionItem) => {
    Alert.alert('Delete item', `Delete “${item.title}”? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeItemMutation.mutate(item.id) },
    ])
  }

  const confirmDeleteAssignment = (assignment: SectionSubmission) => {
    Alert.alert(
      'Delete assignment',
      `Delete “${assignment.course_assessment.title}”? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeAssignmentMutation.mutate(assignment.id) },
      ],
    )
  }

  const confirmDeleteAttachment = (attachmentId: number, fileName: string) => {
    Alert.alert('Delete attachment', `Delete “${fileName}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAttachmentMutation.mutate(attachmentId) },
    ])
  }

  if (itemsQuery.isLoading || (mode === 'lecturer' && submissionsQuery.isLoading)) {
    return <ActivityIndicator style={styles.loader} color={theme.primary} />
  }

  if (itemsQuery.isError || (mode === 'lecturer' && submissionsQuery.isError)) {
    const message = itemsQuery.error?.message ?? submissionsQuery.error?.message ?? 'Could not load section content.'
    return (
      <View style={styles.statusBox}>
        <ThemedText style={styles.statusText}>{message}</ThemedText>
        <Pressable onPress={() => Promise.all([itemsQuery.refetch(), submissionsQuery.refetch()])}>
          <ThemedText title style={{ color: theme.primary }}>Try again</ThemedText>
        </Pressable>
      </View>
    )
  }

  const items = oldestFirst(itemsQuery.data ?? [])
  const assignments = oldestFirst(submissionsQuery.data ?? [])

  return (
    <View style={styles.container}>
      {items.length === 0 && assignments.length === 0 && (
        <ThemedText style={styles.emptyText}>No items have been added to this section yet.</ThemedText>
      )}

      {items.map((item) => (
        <SectionItemRow
          key={`item-${item.id}`}
          item={item}
          mode={mode}
          onEdit={(selected) => {
            setEditingAssignment(null)
            setEditingItem(selected)
            setModalVisible(true)
          }}
          onDelete={confirmDeleteItem}
        />
      ))}

      {assignments.map((assignment) => (
        <AssignmentRow
          key={`assignment-${assignment.id}`}
          assignment={assignment}
          mode={mode}
          onEdit={(selected) => {
            setEditingItem(null)
            setEditingAssignment(selected)
            setModalVisible(true)
          }}
          onDelete={confirmDeleteAssignment}
          onDeleteAttachment={confirmDeleteAttachment}
        />
      ))}

      {mode === 'lecturer' && (
        <Pressable
          onPress={() => {
            setEditingItem(null)
            setEditingAssignment(null)
            setModalVisible(true)
          }}
          style={({ pressed }) => [
            styles.uploadButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name='cloud-upload-outline' size={20} color='#FFFFFF' />
          <ThemedText style={styles.uploadText}>Upload item</ThemedText>
        </Pressable>
      )}

      <SectionItemModal
        visible={modalVisible}
        item={editingItem}
        assignment={editingAssignment}
        initialCategory={editingAssignment ? 'submission' : 'file'}
        isSaving={saveMutation.isPending}
        isDeletingAttachment={removeAttachmentMutation.isPending}
        onDeleteAssignmentAttachment={confirmDeleteAttachment}
        onClose={() => {
          if (saveMutation.isPending) return
          setModalVisible(false)
          setEditingItem(null)
          setEditingAssignment(null)
        }}
        onSubmit={(category, values, file, submissionValues, submissionFiles) =>
          saveMutation.mutate({ category, values, file, submissionValues, submissionFiles })
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingVertical: 2 },
  loader: { marginVertical: 20 },
  statusBox: { alignItems: 'center', gap: 9, paddingVertical: 16 },
  statusText: { textAlign: 'center', fontSize: 13 },
  emptyText: { textAlign: 'center', fontSize: 13, marginVertical: 8 },
  uploadButton: { width: '80%', alignSelf: 'center', minHeight: 46, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 4 },
  uploadText: { color: '#FFFFFF', fontWeight: '800' },
})

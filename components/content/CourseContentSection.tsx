import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import {
  addSection,
  deleteSection,
  getCourseSections,
  updateSection,
} from '@/api/courseSections'
import type { CourseSection } from '@/types/course'
import { useAppTheme } from '@/store/themeStore'
import ThemedText from '../ThemedText'
import ThemedTextInput from '../ThemedTextInput'
import SectionItems from './SectionItems'

type Props = {
  courseId: number
  mode: 'lecturer' | 'student'
}

type SectionModalState =
  | { type: 'create' }
  | { type: 'edit'; section: CourseSection }
  | null

export default function CourseContentSection({ courseId, mode }: Props) {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [modal, setModal] = useState<SectionModalState>(null)
  const [title, setTitle] = useState('')

  const queryKey = ['course-sections', courseId]
  const sectionsQuery = useQuery({
    queryKey,
    queryFn: () => getCourseSections(courseId),
    enabled: courseId > 0,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const cleanTitle = title.trim()
      if (!cleanTitle) throw new Error('Please enter a section title.')

      return modal?.type === 'edit'
        ? updateSection(modal.section.id, { title: cleanTitle })
        : addSection(courseId, { title: cleanTitle })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
      closeModal()
    },
    onError: (error) => {
      Alert.alert('Unable to save section', error.message)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (sectionId: number) => deleteSection(sectionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => Alert.alert('Unable to delete section', error.message),
  })

  const openCreate = () => {
    setTitle('')
    setModal({ type: 'create' })
  }

  const openEdit = (section: CourseSection) => {
    setTitle(section.title)
    setModal({ type: 'edit', section })
  }

  const closeModal = () => {
    setModal(null)
    setTitle('')
  }

  const confirmDelete = (section: CourseSection) => {
    Alert.alert(
      'Delete section',
      `Delete “${section.title}”? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeMutation.mutate(section.id),
        },
      ],
    )
  }

  const toggleSection = (sectionId: number) => {
    setExpandedIds((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    )
  }

  if (sectionsQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color={theme.primary} />
        <ThemedText style={styles.statusText}>Loading course content…</ThemedText>
      </View>
    )
  }

  if (sectionsQuery.isError) {
    return (
      <View style={styles.centered}>
        <Ionicons name='alert-circle-outline' size={42} color={theme.danger} />
        <ThemedText title style={styles.errorTitle}>Could not load content</ThemedText>
        <ThemedText style={styles.statusText}>{sectionsQuery.error.message}</ThemedText>
        <Pressable
          onPress={() => sectionsQuery.refetch()}
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
        >
          <ThemedText style={styles.whiteButtonText}>Try again</ThemedText>
        </Pressable>
      </View>
    )
  }

  const sections = [...(sectionsQuery.data ?? [])].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : Number.NaN
    const bTime = b.created_at ? new Date(b.created_at).getTime() : Number.NaN
    const byDate = aTime - bTime
    return Number.isNaN(byDate) || byDate === 0 ? a.id - b.id : byDate
  })

  return (
    <View style={styles.container}>
      {mode === 'lecturer' && (
        <Pressable
          accessibilityRole='button'
          onPress={openCreate}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name='add' size={21} color='#FFFFFF' />
          <ThemedText style={styles.whiteButtonText}>Add section</ThemedText>
        </Pressable>
      )}

      <FlatList
        data={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          sections.length === 0 && styles.emptyList,
        ]}
        refreshing={sectionsQuery.isRefetching}
        onRefresh={sectionsQuery.refetch}
        renderItem={({ item }) => {
          const expanded = expandedIds.includes(item.id)
          const itemCount = item.items?.length ?? 0
          const submissionCount = item.submissions?.length ?? 0

          return (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
            >
              <Pressable
                onPress={() => toggleSection(item.id)}
                style={({ pressed }) => [
                  styles.cardHeader,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <View style={styles.cardTitleContainer}>
                  <ThemedText title style={styles.cardTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.cardMeta}>
                    {itemCount} material{itemCount === 1 ? '' : 's'}
                    {submissionCount > 0
                      ? ` · ${submissionCount} submission${submissionCount === 1 ? '' : 's'}`
                      : ''}
                  </ThemedText>
                </View>

                {mode === 'lecturer' && (
                  <View style={styles.actions}>
                    <Pressable
                      hitSlop={8}
                      onPress={(event) => {
                        event.stopPropagation()
                        openEdit(item)
                      }}
                      style={[styles.iconButton, { backgroundColor: theme.uiBackground }]}
                    >
                      <Ionicons name='pencil-outline' size={18} color={theme.text} />
                    </Pressable>
                    <Pressable
                      hitSlop={8}
                      disabled={removeMutation.isPending}
                      onPress={(event) => {
                        event.stopPropagation()
                        confirmDelete(item)
                      }}
                      style={[styles.iconButton, { backgroundColor: theme.uiBackground }]}
                    >
                      <Ionicons name='trash-outline' size={18} color={theme.danger} />
                    </Pressable>
                  </View>
                )}

                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.text}
                />
              </Pressable>

              {expanded && (
                <View style={[styles.expandedArea, { borderTopColor: theme.border }]}>
                  <SectionItems sectionId={item.id} mode={mode} />
                </View>
              )}
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name='folder-open-outline' size={48} color={theme.text} />
            <ThemedText title style={styles.errorTitle}>No sections yet</ThemedText>
            <ThemedText style={styles.statusText}>
              {mode === 'lecturer'
                ? 'Create the first section for this course.'
                : 'The lecturer has not added course content yet.'}
            </ThemedText>
          </View>
        }
      />

      <Modal visible={modal !== null} transparent animationType='fade' onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <ThemedText title style={styles.modalTitle}>
              {modal?.type === 'edit' ? 'Edit section' : 'Add section'}
            </ThemedText>
            <ThemedTextInput
              autoFocus
              value={title}
              onChangeText={setTitle}
              placeholder='Section title'
              returnKeyType='done'
              onSubmitEditing={() => saveMutation.mutate()}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Pressable
                disabled={saveMutation.isPending}
                onPress={closeModal}
                style={[styles.modalButton, { backgroundColor: theme.uiBackground }]}
              >
                <ThemedText title style={styles.modalButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                disabled={saveMutation.isPending || !title.trim()}
                onPress={() => saveMutation.mutate()}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.primary },
                  (saveMutation.isPending || !title.trim()) && styles.disabled,
                ]}
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color='#FFFFFF' />
                ) : (
                  <ThemedText style={styles.whiteButtonText}>
                    {modal?.type === 'edit' ? 'Save' : 'Create'}
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addButton: {
    alignSelf: 'flex-end',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 17,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  whiteButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 32, gap: 12 },
  emptyList: { flexGrow: 1 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitleContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardMeta: { marginTop: 4, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 7 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedArea: { borderTopWidth: 1, paddingVertical: 14 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  statusText: { marginTop: 8, fontSize: 14, textAlign: 'center' },
  errorTitle: { marginTop: 10, fontSize: 19, fontWeight: '800' },
  retryButton: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: { borderWidth: 1, borderRadius: 18, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  input: { minHeight: 52 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: { fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.5 },
})

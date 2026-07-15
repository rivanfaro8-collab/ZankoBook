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
import { useAppTheme } from '@/store/themeStore'
import type {
  CourseSectionItem,
  SectionItemCategory,
  SectionItemFormValues,
} from '@/types/course'
import ThemedText from '../ThemedText'
import SectionItemModal from './SectionItemModal'
import SectionItemRow from './SectionItemRow'

type Props = {
  sectionId: number
  mode: 'lecturer' | 'student'
}

const oldestFirst = (items: CourseSectionItem[]) => [...items].sort((a, b) => {
  const byDate = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  return Number.isNaN(byDate) || byDate === 0 ? a.id - b.id : byDate
})

export default function SectionItems({ sectionId, mode }: Props) {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const queryKey = ['course-section-items', sectionId]
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<CourseSectionItem | null>(null)

  const itemsQuery = useQuery({
    queryKey,
    queryFn: () => getSectionItems(sectionId),
  })

  const saveMutation = useMutation({
    mutationFn: ({
      category,
      values,
      file,
    }: {
      category: SectionItemCategory
      values: SectionItemFormValues
      file: PickedSectionFile | null
    }) => {
      if (category === 'submission') throw new Error('Submission is not available yet.')
      return editingItem
        ? updateSectionItem(editingItem.id, values, file)
        : createSectionItem(sectionId, values, file)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
      setModalVisible(false)
      setEditingItem(null)
    },
    onError: (error) => Alert.alert('Unable to save item', error.message),
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => deleteSectionItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => Alert.alert('Unable to delete item', error.message),
  })

  const confirmDelete = (item: CourseSectionItem) => {
    Alert.alert(
      'Delete item',
      `Delete “${item.title}”? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeMutation.mutate(item.id),
        },
      ],
    )
  }

  if (itemsQuery.isLoading) {
    return <ActivityIndicator style={styles.loader} color={theme.primary} />
  }

  if (itemsQuery.isError) {
    return (
      <View style={styles.statusBox}>
        <ThemedText style={styles.statusText}>{itemsQuery.error.message}</ThemedText>
        <Pressable onPress={() => itemsQuery.refetch()}>
          <ThemedText title style={{ color: theme.primary }}>Try again</ThemedText>
        </Pressable>
      </View>
    )
  }

  const items = oldestFirst(itemsQuery.data ?? [])

  return (
    <View style={styles.container}>
      {items.length === 0 && (
        <ThemedText style={styles.emptyText}>No items have been added to this section yet.</ThemedText>
      )}

      {items.map((item) => (
        <SectionItemRow
          key={item.id}
          item={item}
          mode={mode}
          onEdit={(selected) => {
            setEditingItem(selected)
            setModalVisible(true)
          }}
          onDelete={confirmDelete}
        />
      ))}

      {mode === 'lecturer' && (
        <Pressable
          onPress={() => {
            setEditingItem(null)
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
        isSaving={saveMutation.isPending}
        onClose={() => {
          if (saveMutation.isPending) return
          setModalVisible(false)
          setEditingItem(null)
        }}
        onSubmit={(category, values, file) => saveMutation.mutate({ category, values, file })}
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

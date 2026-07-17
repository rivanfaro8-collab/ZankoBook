import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
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

import { modifyAssessments } from '../../src/api/grades'
import { useAppTheme } from '../../src/store/themeStore'
import type {
  AssessmentUIState,
  GradebookAssessment,
  ModifyAssessmentsPayload,
} from '../../src/types/grades'
import ThemedText from '../ThemedText'
import ThemedTextInput from '../ThemedTextInput'

type Props = {
  visible: boolean
  courseId: number
  assessments: GradebookAssessment[]
  onClose: () => void
}

const numeric = (value: number | string) => {
  const result = Number(value)
  return Number.isFinite(result) ? result : 0
}

const makeTempId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

export default function EditAssessmentsModal({
  visible,
  courseId,
  assessments,
  onClose,
}: Props) {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const [items, setItems] = useState<AssessmentUIState[]>([])

  useEffect(() => {
    if (!visible) return
    setItems(
      assessments.map((assessment) => ({
        id: assessment.id,
        tempId: makeTempId(),
        title: assessment.title,
        max_mark: numeric(assessment.max_mark),
        weight: numeric(assessment.weight),
        type: assessment.type ?? 'activity',
        state: 'clean',
      })),
    )
  }, [assessments, visible])

  const hasChanges = items.some((item) => item.state !== 'clean')
  const activeItems = items.filter((item) => item.state !== 'deleted')
  const totalWeight = activeItems.reduce((sum, item) => sum + item.weight, 0)

  const mutation = useMutation({
    mutationFn: modifyAssessments,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['gradebook', courseId] })
      Alert.alert('Saved', 'Activities and weights were saved successfully.')
      onClose()
    },
    onError: (error) => {
      Alert.alert(
        'Could not save activities',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })

  const requestClose = () => {
    if (!hasChanges || mutation.isPending) {
      onClose()
      return
    }

    Alert.alert(
      'Discard changes?',
      'You have unsaved activity changes. Closing now will discard them.',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onClose },
      ],
    )
  }

  const updateItem = (
    tempId: string,
    changes: Partial<Pick<AssessmentUIState, 'title' | 'max_mark' | 'weight'>>,
  ) => {
    setItems((current) =>
      current.map((item) => {
        if (item.tempId !== tempId) return item
        const updated = { ...item, ...changes }
        if (updated.state === 'new') return updated

        const original = assessments.find((assessment) => assessment.id === updated.id)
        if (!original) return updated

        const edited =
          updated.title !== original.title ||
          updated.max_mark !== numeric(original.max_mark) ||
          updated.weight !== numeric(original.weight)

        return { ...updated, state: edited ? 'edited' : 'clean' }
      }),
    )
  }

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        tempId: makeTempId(),
        title: '',
        max_mark: 100,
        weight: 0,
        type: 'activity',
        state: 'new',
      },
    ])
  }

  const deleteItem = (tempId: string) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.tempId !== tempId) return [item]
        if (item.state === 'new') return []
        return [{ ...item, state: 'deleted' }]
      }),
    )
  }

  const restoreItem = (tempId: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.tempId !== tempId) return item
        const original = assessments.find((assessment) => assessment.id === item.id)
        if (!original) return item
        const edited =
          item.title !== original.title ||
          item.max_mark !== numeric(original.max_mark) ||
          item.weight !== numeric(original.weight)
        return { ...item, state: edited ? 'edited' : 'clean' }
      }),
    )
  }

  const validationMessage = useMemo(() => {
    if (activeItems.some((item) => !item.title.trim())) return 'Every activity needs a title.'
    if (activeItems.some((item) => item.max_mark <= 0)) return 'Maximum marks must be greater than zero.'
    if (activeItems.some((item) => item.weight < 0 || item.weight > 100)) return 'Weights must be between 0 and 100.'
    return null
  }, [activeItems])

  const save = () => {
    if (validationMessage) {
      Alert.alert('Check the activities', validationMessage)
      return
    }

    const payload: ModifyAssessmentsPayload = {
      create: items
        .filter((item) => item.state === 'new')
        .map((item) => ({
          title: item.title.trim(),
          max_mark: item.max_mark,
          weight: item.weight,
        })),
      update: items
        .filter((item) => item.state === 'edited')
        .map((item) => ({
          id: item.id as number,
          title: item.title.trim(),
          max_mark: item.max_mark,
          weight: item.weight,
        })),
      delete: items
        .filter((item) => item.state === 'deleted')
        .map((item) => item.id as number),
    }

    mutation.mutate({ courseId, payload })
  }

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={requestClose}>
      <Pressable style={styles.backdrop} onPress={requestClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.modalCard,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <View style={styles.headerText}>
                <ThemedText title style={styles.heading}>Activities & weights</ThemedText>
                <ThemedText style={styles.subheading}>Edit all assessment columns together.</ThemedText>
              </View>
              <Pressable
                onPress={requestClose}
                style={[styles.closeButton, { backgroundColor: theme.uiBackground }]}
              >
                <Ionicons name='close' size={22} color={theme.title} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps='handled'
              contentContainerStyle={styles.listContent}
            >
              {items.map((item, index) => {
                const deleted = item.state === 'deleted'
                return (
                  <View
                    key={item.tempId}
                    style={[
                      styles.activityCard,
                      {
                        backgroundColor: theme.uiBackground,
                        borderColor: deleted ? theme.danger : theme.border,
                        opacity: deleted ? 0.65 : 1,
                      },
                    ]}
                  >
                    <View style={styles.activityHeader}>
                      <ThemedText title style={styles.activityLabel}>Assessment {index + 1}</ThemedText>
                      {item.state !== 'clean' && (
                        <ThemedText
                          title
                          style={{ color: deleted ? theme.danger : theme.primary, fontSize: 12 }}
                        >
                          {item.state === 'new' ? 'NEW' : item.state.toUpperCase()}
                        </ThemedText>
                      )}
                    </View>

                    <ThemedText style={styles.fieldLabel}>Activity name</ThemedText>
                    <ThemedTextInput
                      value={item.title}
                      editable={!deleted && !mutation.isPending}
                      onChangeText={(title) => updateItem(item.tempId, { title })}
                      placeholder='Activity title'
                      style={deleted ? styles.deletedText : undefined}
                    />

                    <View style={styles.numericRow}>
                      <View style={styles.numericField}>
                        <ThemedText style={styles.fieldLabel}>Max points</ThemedText>
                        <ThemedTextInput
                          value={String(item.max_mark)}
                          editable={!deleted && !mutation.isPending}
                          onChangeText={(value) =>
                            updateItem(item.tempId, { max_mark: Number(value.replace(/[^0-9.]/g, '')) || 0 })
                          }
                          keyboardType='decimal-pad'
                        />
                      </View>
                      <View style={styles.numericField}>
                        <ThemedText style={styles.fieldLabel}>Weight %</ThemedText>
                        <ThemedTextInput
                          value={String(item.weight)}
                          editable={!deleted && !mutation.isPending}
                          onChangeText={(value) =>
                            updateItem(item.tempId, { weight: Number(value.replace(/[^0-9.]/g, '')) || 0 })
                          }
                          keyboardType='decimal-pad'
                        />
                      </View>
                    </View>

                    {deleted ? (
                      <Pressable
                        disabled={mutation.isPending}
                        onPress={() => restoreItem(item.tempId)}
                        style={[styles.rowAction, { borderColor: theme.primary }]}
                      >
                        <Ionicons name='arrow-undo-outline' size={18} color={theme.primary} />
                        <ThemedText title style={{ color: theme.primary }}>Undo deletion</ThemedText>
                      </Pressable>
                    ) : (
                      <Pressable
                        disabled={mutation.isPending}
                        onPress={() => deleteItem(item.tempId)}
                        style={[styles.rowAction, { borderColor: theme.danger }]}
                      >
                        <Ionicons name='trash-outline' size={18} color={theme.danger} />
                        <ThemedText title style={{ color: theme.danger }}>Delete activity</ThemedText>
                      </Pressable>
                    )}
                  </View>
                )
              })}

              <Pressable
                disabled={mutation.isPending}
                onPress={addItem}
                style={[styles.addButton, { borderColor: theme.primary }]}
              >
                <Ionicons name='add-circle-outline' size={21} color={theme.primary} />
                <ThemedText title style={{ color: theme.primary }}>Add activity</ThemedText>
              </Pressable>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <View style={[styles.weightCard, { backgroundColor: theme.uiBackground }]}>
                <ThemedText title>Total weight</ThemedText>
                <ThemedText
                  title
                  style={{ color: totalWeight === 100 ? theme.primary : theme.danger, fontSize: 18 }}
                >
                  {totalWeight}%
                </ThemedText>
              </View>
              <Pressable
                disabled={!hasChanges || mutation.isPending}
                onPress={save}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: !hasChanges || mutation.isPending ? 0.45 : 1,
                  },
                ]}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color='#FFFFFF' />
                ) : (
                  <ThemedText title style={styles.whiteText}>Save changes</ThemedText>
                )}
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.58)', padding: 14 },
  keyboardContainer: { width: '100%', maxHeight: '94%' },
  modalCard: { maxHeight: '94%', borderWidth: 1, borderRadius: 22, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  headerText: { flex: 1, paddingRight: 10 },
  heading: { fontSize: 22, fontWeight: '900' },
  subheading: { marginTop: 3, fontSize: 12 },
  closeButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 14 },
  activityCard: { borderWidth: 1, borderRadius: 17, padding: 14 },
  activityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  activityLabel: { fontSize: 13, fontWeight: '800' },
  fieldLabel: { marginBottom: 6, fontSize: 11, fontWeight: '700' },
  numericRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  numericField: { flex: 1 },
  deletedText: { textDecorationLine: 'line-through' },
  rowAction: { marginTop: 12, minHeight: 42, borderWidth: 1, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  addButton: { minHeight: 54, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  footer: { padding: 16, borderTopWidth: 1, gap: 12 },
  weightCard: { minHeight: 50, borderRadius: 13, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveButton: { minHeight: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  whiteText: { color: '#FFFFFF', fontWeight: '800' },
})

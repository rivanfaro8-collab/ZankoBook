import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as DocumentPicker from 'expo-document-picker'
import { useEffect, useState } from 'react'
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

import { makeAcademicRequest } from '@/api/academicRequests'
import { useAppTheme } from '@/store/themeStore'
import { useUserStore } from '@/store/userStore'
import type {
  AcademicRequestType,
  PickedAcademicRequestFile,
} from '@/types/academicRequests'
import ThemedText from '../ThemedText'
import ThemedTextInput from '../ThemedTextInput'

const MAX_FILE_SIZE = 50 * 1024 * 1024

const REQUEST_TYPES: {
  value: AcademicRequestType
  label: string
  icon: keyof typeof Ionicons.glyphMap
}[] = [
  { value: 'leave', label: 'Leave', icon: 'calendar-outline' },
  { value: 'equipment', label: 'Equipment', icon: 'construct-outline' },
  { value: 'transcript', label: 'Transcript', icon: 'document-text-outline' },
  { value: 'complaint', label: 'Complaint', icon: 'alert-circle-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
]

type Props = {
  visible: boolean
  onClose: () => void
}

export default function NewAcademicRequestModal({ visible, onClose }: Props) {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const user = useUserStore((state) => state.user)

  const [type, setType] = useState<AcademicRequestType>('leave')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<PickedAcademicRequestFile[]>([])

  const reset = () => {
    setType('leave')
    setSubject('')
    setDescription('')
    setFiles([])
  }

  useEffect(() => {
    if (!visible) {
      reset()
    }
  }, [visible])

  const mutation = useMutation({
    mutationFn: makeAcademicRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['academic-requests'] })
      Alert.alert('Request sent', 'Your academic request was sent successfully.')
      reset()
      onClose()
    },
    onError: (error) => {
      Alert.alert(
        'Could not send request',
        error instanceof Error ? error.message : 'Please try again.',
      )
    },
  })

  const close = () => {
    if (!mutation.isPending) {
      onClose()
    }
  }

  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
      copyToCacheDirectory: true,
    })

    if (result.canceled) {
      return
    }

    const selectedFiles = result.assets
      .filter((asset) => {
        if ((asset.size ?? 0) <= MAX_FILE_SIZE) {
          return true
        }

        Alert.alert(
          'File too large',
          `${asset.name} is larger than the 50 MB limit.`,
        )
        return false
      })
      .map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
      }))

    setFiles((current) => {
      const existing = new Set(current.map((file) => `${file.uri}:${file.name}`))
      const uniqueNewFiles = selectedFiles.filter(
        (file) => !existing.has(`${file.uri}:${file.name}`),
      )

      return [...current, ...uniqueNewFiles]
    })
  }

  const submit = () => {
    const cleanSubject = subject.trim()
    const cleanDescription = description.trim()

    if (!cleanSubject || !cleanDescription) {
      Alert.alert('Missing details', 'Subject and message are required.')
      return
    }

    const departmentId = user?.role === 'lecturer'
      ? user.scopes?.[0]?.scope_id
      : undefined

    mutation.mutate({
      type,
      subject: cleanSubject,
      description: cleanDescription,
      files,
      department_id: departmentId,
    })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      statusBarTranslucent
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.card,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerText}>
                <ThemedText title style={styles.title}>
                  New request
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Your department can turn this into an official letter.
                </ThemedText>
              </View>

              <Pressable
                onPress={close}
                disabled={mutation.isPending}
                hitSlop={10}
                accessibilityLabel='Close new request popup'
              >
                <Ionicons name='close' size={26} color={theme.title} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              contentContainerStyle={styles.form}
            >
              <View>
                <ThemedText title style={styles.label}>Type</ThemedText>
                <View style={styles.typeList}>
                  {REQUEST_TYPES.map((option) => {
                    const selected = option.value === type

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setType(option.value)}
                        style={({ pressed }) => [
                          styles.typeButton,
                          {
                            backgroundColor: selected
                              ? theme.primary
                              : theme.uiBackground,
                            borderColor: selected ? theme.primary : theme.border,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name={option.icon}
                          size={16}
                          color={selected ? '#FFFFFF' : theme.text}
                        />
                        <ThemedText
                          style={[styles.typeLabel, selected && styles.whiteText]}
                        >
                          {option.label}
                        </ThemedText>
                      </Pressable>
                    )
                  })}
                </View>
              </View>

              <View>
                <ThemedText title style={styles.label}>Subject</ThemedText>
                <ThemedTextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder='Short summary'
                  maxLength={150}
                />
              </View>

              <View>
                <ThemedText title style={styles.label}>Message</ThemedText>
                <ThemedTextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder='Describe your request...'
                  multiline
                  textAlignVertical='top'
                  style={styles.messageInput}
                />
              </View>

              <View>
                <View style={styles.attachmentLabelRow}>
                  <ThemedText title style={styles.label}>Attachments</ThemedText>
                  {files.length > 0 ? (
                    <ThemedText style={styles.fileCount}>({files.length})</ThemedText>
                  ) : null}
                </View>

                <Pressable
                  onPress={pickFiles}
                  style={({ pressed }) => [
                    styles.pickButton,
                    {
                      backgroundColor: theme.uiBackground,
                      borderColor: files.length > 0 ? theme.primary : theme.border,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name='attach-outline' size={21} color={theme.primary} />
                  <ThemedText title style={styles.pickButtonText}>
                    {files.length > 0 ? 'Add more files' : 'Add attachment'}
                  </ThemedText>
                </Pressable>

                {files.length > 0 ? (
                  <View style={styles.fileList}>
                    {files.map((file, index) => (
                      <View
                        key={`${file.uri}:${index}`}
                        style={[
                          styles.fileRow,
                          { backgroundColor: theme.uiBackground },
                        ]}
                      >
                        <Ionicons
                          name='document-outline'
                          size={19}
                          color={theme.primary}
                        />
                        <ThemedText title style={styles.fileName} numberOfLines={1}>
                          {file.name}
                        </ThemedText>
                        <Pressable
                          onPress={() =>
                            setFiles((current) =>
                              current.filter((_, fileIndex) => fileIndex !== index),
                            )
                          }
                          hitSlop={8}
                          accessibilityLabel={`Remove ${file.name}`}
                        >
                          <Ionicons name='close-circle' size={21} color={theme.danger} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              <Pressable
                onPress={submit}
                disabled={mutation.isPending || !subject.trim() || !description.trim()}
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: theme.primary },
                  (pressed || mutation.isPending) && styles.pressed,
                  (!subject.trim() || !description.trim()) && styles.disabled,
                ]}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color='#FFFFFF' />
                ) : (
                  <>
                    <Ionicons name='send-outline' size={20} color='#FFFFFF' />
                    <ThemedText style={styles.submitText}>Send request</ThemedText>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '91%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
  },
  form: {
    gap: 18,
    paddingBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  typeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  messageInput: {
    minHeight: 120,
  },
  attachmentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fileCount: {
    fontSize: 13,
    marginBottom: 8,
  },
  pickButton: {
    minHeight: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pickButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  fileList: {
    gap: 8,
    marginTop: 10,
  },
  fileRow: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    minHeight: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
})

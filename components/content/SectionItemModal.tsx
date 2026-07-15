import { Ionicons } from '@expo/vector-icons'
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

import type { PickedSectionFile } from '@/api/sectionItems'
import { useAppTheme } from '@/store/themeStore'
import type {
  CourseSectionItem,
  SectionItemCategory,
  SectionItemFormValues,
} from '@/types/course'
import ThemedText from '../ThemedText'
import ThemedTextInput from '../ThemedTextInput'

const MAX_FILE_SIZE = 50 * 1024 * 1024

const tabs: {
  key: SectionItemCategory
  label: string
  icon: keyof typeof Ionicons.glyphMap
}[] = [
  {
    key: 'file',
    label: 'File',
    icon: 'document-attach-outline',
  },
  {
    key: 'link',
    label: 'Link',
    icon: 'link-outline',
  },
  {
    key: 'note',
    label: 'Note',
    icon: 'reader-outline',
  },
  {
    key: 'submission',
    label: 'Submission',
    icon: 'cloud-upload-outline',
  },
]

export const getItemCategory = (
  item: CourseSectionItem,
): SectionItemCategory => {
  const type = item.type?.toLowerCase()

  if (type === 'note') {
    return 'note'
  }

  if (type === 'link') {
    return 'link'
  }

  return 'file'
}

type Props = {
  visible: boolean
  item?: CourseSectionItem | null
  initialCategory?: SectionItemCategory
  isSaving: boolean
  onClose: () => void
  onSubmit: (
    category: SectionItemCategory,
    values: SectionItemFormValues,
    file: PickedSectionFile | null,
  ) => void
}

export default function SectionItemModal({
  visible,
  item,
  initialCategory = 'file',
  isSaving,
  onClose,
  onSubmit,
}: Props) {
  const theme = useAppTheme()
  const isEdit = Boolean(item)

  const [category, setCategory] = useState<SectionItemCategory>(initialCategory)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<PickedSectionFile | null>(null)

  useEffect(() => {
    if (!visible) {
      return
    }

    const nextCategory = item ? getItemCategory(item) : initialCategory

    setCategory(nextCategory)
    setTitle(item?.title ?? '')
    setDescription(item?.description ?? '')

    setUrl(nextCategory === 'link' ? (item?.material_file_url ?? '') : '')

    setFile(null)
  }, [initialCategory, item, visible])

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: false,
      copyToCacheDirectory: true,
    })

    if (result.canceled) {
      return
    }

    const asset = result.assets[0]

    if (!asset) {
      return
    }

    if ((asset.size ?? 0) > MAX_FILE_SIZE) {
      Alert.alert(
        'File too large',
        'The selected file must be 50 MB or smaller.',
      )

      return
    }

    setFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
    })
  }

  const submit = () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title.')

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

    if (category === 'submission') {
      return
    }

    onSubmit(
      category,
      {
        title,
        description,
        url,
      },
      file,
    )
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <Pressable
            onPress={(event) => {
              event.stopPropagation()
            }}
            style={[
              styles.card,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.header}>
              <ThemedText title style={styles.title}>
                {isEdit ? 'Edit item' : 'Upload item'}
              </ThemedText>

              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={styles.closeButton}
              >
                <Ionicons name='close' size={23} color={theme.text} />
              </Pressable>
            </View>

            <View
              style={[
                styles.tabs,
                {
                  backgroundColor: theme.uiBackground,
                },
              ]}
            >
              {tabs.map((tab) => {
                const selected = tab.key === category

                const disabled = isEdit && tab.key !== category

                return (
                  <Pressable
                    key={tab.key}
                    disabled={disabled}
                    onPress={() => {
                      setCategory(tab.key)
                    }}
                    style={[
                      styles.tab,
                      selected && {
                        backgroundColor: theme.primary,
                      },
                      disabled && styles.disabled,
                    ]}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={17}
                      color={selected ? '#FFFFFF' : theme.text}
                    />

                    <ThemedText
                      style={[styles.tabText, selected && styles.whiteText]}
                    >
                      {tab.label}
                    </ThemedText>
                  </Pressable>
                )
              })}
            </View>

            <ScrollView
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps='handled'
            >
              {category === 'submission' ? (
                <View
                  style={[
                    styles.placeholder,
                    {
                      backgroundColor: theme.uiBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name='construct-outline'
                    size={34}
                    color={theme.primary}
                  />

                  <ThemedText title style={styles.placeholderTitle}>
                    Submission is coming next
                  </ThemedText>

                  <ThemedText style={styles.placeholderText}>
                    Title, description, attachment, mark, weight, and due-date
                    controls will be connected when the submission API is ready.
                  </ThemedText>
                </View>
              ) : (
                <>
                  <ThemedTextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder='Title *'
                  />

                  <ThemedTextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder='Description (optional)'
                    multiline
                    style={styles.descriptionInput}
                  />

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
                        <ThemedText style={styles.currentFile}>
                          Current file: {item.material_file_name}
                        </ThemedText>
                      )}

                      <Pressable
                        onPress={pickFile}
                        style={[
                          styles.filePicker,
                          {
                            borderColor: theme.border,
                            backgroundColor: theme.uiBackground,
                          },
                        ]}
                      >
                        <Ionicons
                          name='attach-outline'
                          size={21}
                          color={theme.primary}
                        />

                        <ThemedText
                          style={styles.filePickerText}
                          numberOfLines={2}
                        >
                          {file?.name ??
                            (isEdit
                              ? 'Choose a replacement file'
                              : 'Choose file *')}
                        </ThemedText>
                      </Pressable>

                      <ThemedText style={styles.helpText}>
                        Maximum size: 50 MB
                      </ThemedText>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <Pressable
              disabled={isSaving || category === 'submission'}
              onPress={submit}
              style={[
                styles.submitButton,
                {
                  backgroundColor: theme.primary,
                },
                (isSaving || category === 'submission') && styles.disabled,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color='#FFFFFF' />
              ) : (
                <ThemedText style={styles.submitText}>
                  {isEdit ? 'Update' : 'Create'}
                </ThemedText>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 18,
  },

  keyboardContainer: {
    width: '100%',
  },

  card: {
    maxHeight: '88%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },

  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 3,
  },

  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  tabText: {
    fontSize: 11,
    fontWeight: '700',
  },

  whiteText: {
    color: '#FFFFFF',
  },

  form: {
    paddingVertical: 18,
    gap: 12,
  },

  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  currentFile: {
    marginBottom: 8,
    fontSize: 12,
  },

  filePicker: {
    minHeight: 58,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  filePickerText: {
    flex: 1,
    fontWeight: '700',
  },

  helpText: {
    marginTop: 6,
    fontSize: 11,
  },

  submitButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  disabled: {
    opacity: 0.45,
  },

  placeholder: {
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
  },

  placeholderTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '800',
  },

  placeholderText: {
    marginTop: 7,
    textAlign: 'center',
    lineHeight: 20,
  },
})

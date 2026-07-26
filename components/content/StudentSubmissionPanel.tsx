import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as DocumentPicker from 'expo-document-picker'
import * as Linking from 'expo-linking'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
import { useState } from 'react'

import {
  deleteStudentSubmissionFile,
  getMyStudentSubmission,
  submitStudentFiles,
} from '@/api/submissions'
import type { PickedSectionFile } from '@/api/sectionItems'
import { useAppTheme } from '@/store/themeStore'
import ThemedText from '../ThemedText'

const readableSize = (bytes?: number | null) => {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const parseBackendDate = (value: string) => new Date(value.replace(' ', 'T'))

export const isAssignmentClosed = (dueAt: string) => {
  const due = parseBackendDate(dueAt)
  return Number.isNaN(due.getTime()) ? false : Date.now() > due.getTime()
}

type Props = {
  assignmentId: number
  dueAt: string
}

export default function StudentSubmissionPanel({ assignmentId, dueAt }: Props) {
  const theme = useAppTheme()
  const queryClient = useQueryClient()
  const [selectedFiles, setSelectedFiles] = useState<PickedSectionFile[]>([])
  const closed = isAssignmentClosed(dueAt)
  const queryKey = ['my-student-submission', assignmentId]

  const submissionsQuery = useQuery({
    queryKey,
    queryFn: () => getMyStudentSubmission(assignmentId),
  })

  const submitMutation = useMutation({
    mutationFn: () => submitStudentFiles(assignmentId, selectedFiles),
    onSuccess: async () => {
      setSelectedFiles([])
      await queryClient.invalidateQueries({ queryKey })
      Alert.alert('Submitted', 'Assignment submitted successfully.')
    },
    onError: (error) => Alert.alert('Unable to submit', error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStudentSubmissionFile(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => Alert.alert('Unable to delete file', error.message),
  })

  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    })
    if (result.canceled) return

    setSelectedFiles((current) => [
      ...current,
      ...result.assets.map((file) => ({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
      })),
    ])
  }

  const confirmDelete = (id: number, name: string) => {
    Alert.alert('Delete submitted file', `Delete “${name}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ])
  }

  const submittedFiles = submissionsQuery.data ?? []

  return (
    <View style={[styles.container, { borderTopColor: theme.border }]}> 
      <ThemedText title style={styles.heading}>Your submission</ThemedText>

      {submissionsQuery.isLoading ? (
        <ThemedText style={styles.helper}>Loading your files…</ThemedText>
      ) : submissionsQuery.isError ? (
        <Pressable onPress={() => submissionsQuery.refetch()}>
          <ThemedText title style={{ color: theme.primary }}>Could not load your files. Try again</ThemedText>
        </Pressable>
      ) : submittedFiles.length === 0 ? (
        <ThemedText style={styles.helper}>No files submitted yet.</ThemedText>
      ) : (
        <View style={styles.fileList}>
          {submittedFiles.map((file) => (
            <View key={file.id} style={[styles.fileRow, { borderColor: theme.border }]}> 
              <Pressable style={styles.fileMain} onPress={() => Linking.openURL(file.file_url)}>
                <Ionicons name='document-outline' size={18} color={theme.primary} />
                <View style={styles.fileText}>
                  <ThemedText title numberOfLines={1} style={styles.fileName}>{file.file_name}</ThemedText>
                  <ThemedText style={styles.fileMeta}>{readableSize(file.file_size)}</ThemedText>
                </View>
                <Ionicons name='open-outline' size={17} color={theme.primary} />
              </Pressable>
              <Pressable
                disabled={closed || deleteMutation.isPending}
                onPress={() => confirmDelete(file.id, file.file_name)}
                style={[styles.deleteButton, { backgroundColor: theme.background, opacity: closed ? 0.45 : 1 }]}
              >
                <Ionicons name='trash-outline' size={16} color={theme.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {closed ? (
        <View style={[styles.closedBox, { backgroundColor: theme.background }]}> 
          <Ionicons name='lock-closed-outline' size={17} color={theme.text} />
          <ThemedText style={styles.closedText}>The submission deadline has passed.</ThemedText>
        </View>
      ) : (
        <>
          {selectedFiles.length > 0 && (
            <View style={styles.selectedBox}>
              <ThemedText title style={styles.selectedTitle}>Files to upload ({selectedFiles.length})</ThemedText>
              {selectedFiles.map((file, index) => (
                <View key={`${file.uri}-${index}`} style={[styles.selectedRow, { borderColor: theme.border }]}> 
                  <Ionicons name='attach-outline' size={17} color={theme.primary} />
                  <View style={styles.fileText}>
                    <ThemedText numberOfLines={1} style={styles.fileName}>{file.name}</ThemedText>
                    {!!file.size && <ThemedText style={styles.fileMeta}>{readableSize(file.size)}</ThemedText>}
                  </View>
                  <Pressable onPress={() => setSelectedFiles((files) => files.filter((_, i) => i !== index))}>
                    <Ionicons name='close-circle' size={21} color={theme.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={pickFiles}
              style={[styles.secondaryButton, { borderColor: theme.primary }]}
            >
              <Ionicons name='attach-outline' size={18} color={theme.primary} />
              <ThemedText title style={{ color: theme.primary }}>
                {selectedFiles.length ? 'Add more files' : 'Select files'}
              </ThemedText>
            </Pressable>
            <Pressable
              disabled={selectedFiles.length === 0 || submitMutation.isPending}
              onPress={() => submitMutation.mutate()}
              style={[
                styles.submitButton,
                { backgroundColor: theme.primary, opacity: selectedFiles.length === 0 || submitMutation.isPending ? 0.45 : 1 },
              ]}
            >
              <Ionicons name='cloud-upload-outline' size={18} color='#FFFFFF' />
              <ThemedText style={styles.submitText}>{submitMutation.isPending ? 'Submitting…' : 'Submit files'}</ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, paddingTop: 14, gap: 10 },
  heading: { fontSize: 14, fontWeight: '800' },
  helper: { fontSize: 12 },
  fileList: { gap: 7 },
  fileRow: { minHeight: 50, borderWidth: 1, borderRadius: 10, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  fileMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileText: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 12, fontWeight: '700' },
  fileMeta: { marginTop: 2, fontSize: 10 },
  deleteButton: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  closedBox: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 10, padding: 10 },
  closedText: { flex: 1, fontSize: 12 },
  selectedBox: { gap: 7 },
  selectedTitle: { fontSize: 12, fontWeight: '800' },
  selectedRow: { minHeight: 46, borderWidth: 1, borderRadius: 10, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { gap: 8 },
  secondaryButton: { minHeight: 43, borderWidth: 1, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  submitButton: { minHeight: 44, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  submitText: { color: '#FFFFFF', fontWeight: '800' },
})

import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system/legacy'
import * as Linking from 'expo-linking'
import * as Sharing from 'expo-sharing'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { saveDownloadedFile } from '@/lib/downloadHistory'
import { useAppTheme } from '@/store/themeStore'
import type { CourseSectionItem } from '@/types/course'
import ThemedText from '../ThemedText'
import { getItemCategory } from './SectionItemModal'

type Props = {
  item: CourseSectionItem
  mode: 'lecturer' | 'student'
  onEdit: (item: CourseSectionItem) => void
  onDelete: (item: CourseSectionItem) => void
}

const safeFileName = (item: CourseSectionItem) => {
  const raw = item.material_file_name || `section-item-${item.id}`
  return raw.replace(/[\\/:*?"<>|]/g, '_')
}

export default function SectionItemRow({ item, mode, onEdit, onDelete }: Props) {
  const theme = useAppTheme()
  const category = getItemCategory(item)
  const [expanded, setExpanded] = useState(false)
  const [localUri, setLocalUri] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)

  const destination = useMemo(
    () => `${FileSystem.documentDirectory}section-items/${item.id}-${safeFileName(item)}`,
    [item],
  )

  useEffect(() => {
    if (category !== 'file') return
    FileSystem.getInfoAsync(destination).then((info) => {
      if (!info.exists) return
      setLocalUri(info.uri)
      void saveDownloadedFile({
        id: `section-item-${item.id}`,
        title: item.title,
        fileName: item.material_file_name || safeFileName(item),
        localUri: info.uri,
        mimeType: item.material_file_type || undefined,
        downloadedAt: info.modificationTime
          ? new Date(info.modificationTime * 1000).toISOString()
          : new Date().toISOString(),
      })
    }).catch(() => undefined)
  }, [category, destination, item])

  const openFile = async () => {
    if (!localUri) return
    const info = await FileSystem.getInfoAsync(localUri)
    if (!info.exists) {
      setLocalUri(null)
      Alert.alert('File unavailable', 'This downloaded file no longer exists on the device.')
      return
    }
    const available = await Sharing.isAvailableAsync()
    if (!available) {
      Alert.alert('Unable to open file', 'No compatible application is available on this device.')
      return
    }
    await Sharing.shareAsync(localUri, {
      mimeType: item.material_file_type || undefined,
      dialogTitle: `Open ${item.material_file_name || 'file'}`,
    })
  }

  const download = async () => {
    if (!item.material_file_url) {
      Alert.alert('File unavailable', 'This item does not contain a downloadable file URL.')
      return
    }

    try {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}section-items`, {
        intermediates: true,
      })

      setProgress(0)
      const resumable = FileSystem.createDownloadResumable(
        item.material_file_url,
        destination,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          const ratio = totalBytesExpectedToWrite > 0
            ? totalBytesWritten / totalBytesExpectedToWrite
            : 0
          setProgress(Math.max(0, Math.min(1, ratio)))
        },
      )

      const result = await resumable.downloadAsync()
      if (!result?.uri) throw new Error('The download did not return a local file.')
      setLocalUri(result.uri)
      await saveDownloadedFile({
        id: `section-item-${item.id}`,
        title: item.title,
        fileName: item.material_file_name || safeFileName(item),
        localUri: result.uri,
        mimeType: item.material_file_type || undefined,
        downloadedAt: new Date().toISOString(),
      })
      setProgress(null)
    } catch (error) {
      setProgress(null)
      Alert.alert('Download failed', error instanceof Error ? error.message : 'Could not download this file.')
    }
  }

  const openLink = async () => {
    const url = item.material_file_url
    if (!url) {
      Alert.alert('Link unavailable', 'This item does not contain a URL.')
      return
    }
    const canOpen = await Linking.canOpenURL(url)
    if (!canOpen) {
      Alert.alert('Unable to open link', 'The URL is not supported on this device.')
      return
    }
    await Linking.openURL(url)
  }

  const icon = category === 'file'
    ? 'document-outline'
    : category === 'link'
      ? 'link-outline'
      : 'reader-outline'

  return (
    <Pressable
      disabled={!item.description}
      onPress={() => item.description && setExpanded((value) => !value)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.uiBackground, borderColor: theme.border },
        pressed && item.description ? styles.pressed : null,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.typeIcon, { backgroundColor: theme.background }]}> 
          <Ionicons name={icon} size={22} color={theme.primary} />
        </View>

        <View style={styles.titleContainer}>
          <ThemedText title style={styles.title}>
            {item.title}
          </ThemedText>
          {item.description && (
            <Ionicons
              name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={15}
              color={theme.text}
            />
          )}
        </View>

        <View style={styles.actions}>
          {mode === 'lecturer' && (
            <>
              <Pressable
                hitSlop={7}
                onPress={(event) => {
                  event.stopPropagation()
                  onEdit(item)
                }}
                style={[styles.iconButton, { backgroundColor: theme.background }]}
              >
                <Ionicons name='pencil-outline' size={17} color={theme.text} />
              </Pressable>
              <Pressable
                hitSlop={7}
                onPress={(event) => {
                  event.stopPropagation()
                  onDelete(item)
                }}
                style={[styles.iconButton, { backgroundColor: theme.background }]}
              >
                <Ionicons name='trash-outline' size={17} color={theme.danger} />
              </Pressable>
            </>
          )}

          {category === 'link' && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation()
                openLink()
              }}
              style={[styles.primaryAction, { backgroundColor: theme.primary }]}
            >
              <Ionicons name='open-outline' size={16} color='#FFFFFF' />
              <ThemedText style={styles.primaryActionText}>Open</ThemedText>
            </Pressable>
          )}

          {category === 'file' && (
            <Pressable
              disabled={progress !== null}
              onPress={(event) => {
                event.stopPropagation()
                localUri ? openFile() : download()
              }}
              style={[
                styles.primaryAction,
                { backgroundColor: theme.primary },
                progress !== null && styles.disabled,
              ]}
            >
              <Ionicons
                name={localUri ? 'folder-open-outline' : 'download-outline'}
                size={16}
                color='#FFFFFF'
              />
              <ThemedText style={styles.primaryActionText}>
                {progress !== null
                  ? `${Math.round(progress * 100)}%`
                  : localUri
                    ? 'Open'
                    : 'Download'}
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>

      {expanded && item.description && (
        <View style={[styles.description, { borderTopColor: theme.border }]}> 
          <ThemedText style={styles.descriptionText}>{item.description}</ThemedText>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { width: '94%', alignSelf: 'center', borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  pressed: { opacity: 0.8 },
  row: { minHeight: 62, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 9 },
  typeIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  titleContainer: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 5 },
  title: { flexShrink: 1, fontSize: 15, fontWeight: '800', lineHeight: 21 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  iconButton: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  primaryAction: { minHeight: 34, minWidth: 70, paddingHorizontal: 9, borderRadius: 9, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  description: { borderTopWidth: 1, paddingHorizontal: 15, paddingVertical: 12 },
  descriptionText: { fontSize: 13, lineHeight: 19 },
  disabled: { opacity: 0.55 },
})

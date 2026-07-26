import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system/legacy'
import * as Linking from 'expo-linking'
import { useFocusEffect } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { getDownloadedFiles, removeDownloadedFile, type DownloadedFile } from '@/lib/downloadHistory'
import { useAppTheme } from '@/store/themeStore'
import SimpleBackHeader from '../SimpleBackHeader'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'

export default function DownloadedFilesScreen() {
  const theme = useAppTheme()
  const [files, setFiles] = useState<DownloadedFile[]>([])
  const [loading, setLoading] = useState(true)

  const loadFiles = useCallback(async () => {
    try {
      setFiles(await getDownloadedFiles())
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      void loadFiles()
    }, [loadFiles]),
  )

  const openFile = async (file: DownloadedFile) => {
    try {
      const info = await FileSystem.getInfoAsync(file.localUri)
      if (!info.exists) {
        await removeDownloadedFile(file.id)
        setFiles((current) => current.filter((item) => item.id !== file.id))
        Alert.alert('File unavailable', 'This downloaded file no longer exists on the device.')
        return
      }

      const uri = Platform.OS === 'android'
        ? await FileSystem.getContentUriAsync(file.localUri)
        : file.localUri
      const supported = await Linking.canOpenURL(uri)

      if (!supported) {
        Alert.alert('Unable to open file', 'No compatible application is available on this device.')
        return
      }

      await Linking.openURL(uri)
    } catch (error) {
      Alert.alert('Unable to open file', error instanceof Error ? error.message : 'Could not open this file.')
    }
  }

  const shareFile = async (file: DownloadedFile) => {
    try {
      const available = await Sharing.isAvailableAsync()
      if (!available) {
        Alert.alert('Sharing unavailable', 'File sharing is not available on this device.')
        return
      }

      await Sharing.shareAsync(file.localUri, {
        mimeType: file.mimeType,
        dialogTitle: `Share ${file.fileName}`,
      })
    } catch (error) {
      Alert.alert('Unable to share file', error instanceof Error ? error.message : 'Could not share this file.')
    }
  }

  const deleteFile = (file: DownloadedFile) => {
    Alert.alert(
      'Delete downloaded file?',
      `Are you sure you want to delete “${file.title}” from this device?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                const info = await FileSystem.getInfoAsync(file.localUri)
                if (info.exists) {
                  await FileSystem.deleteAsync(file.localUri, { idempotent: true })
                }
                await removeDownloadedFile(file.id)
                setFiles((current) => current.filter((item) => item.id !== file.id))
              } catch (error) {
                Alert.alert('Delete failed', error instanceof Error ? error.message : 'Could not delete this file.')
              }
            })()
          },
        },
      ],
    )
  }

  const showActions = (file: DownloadedFile) => {
    Alert.alert(file.title, undefined, [
      { text: 'Share', onPress: () => void shareFile(file) },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFile(file) },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <ThemedView style={styles.screen}>
      <SimpleBackHeader />
      <View style={styles.header}>
        <ThemedText title style={styles.title}>Recently Downloaded</ThemedText>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : files.length === 0 ? (
        <View style={styles.centered}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.uiBackground }]}> 
            <Ionicons name='download-outline' size={30} color={theme.primary} />
          </View>
          <ThemedText title style={styles.emptyTitle}>No downloaded files</ThemedText>
          <ThemedText style={styles.emptyText}>Files you download will appear here.</ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {files.map((file) => (
            <View
              key={file.id}
              style={[styles.row, { backgroundColor: theme.uiBackground, borderColor: theme.border }]}
            >
              <Pressable
                onPress={() => void openFile(file)}
                style={({ pressed }) => [styles.fileMain, pressed && styles.pressed]}
              >
                <View style={[styles.fileIcon, { backgroundColor: theme.background }]}> 
                  <Ionicons name='document-outline' size={21} color={theme.primary} />
                </View>
                <View style={styles.fileText}>
                  <ThemedText title style={styles.fileTitle} numberOfLines={2} ellipsizeMode='tail'>
                    {file.title}
                  </ThemedText>
                  <ThemedText style={styles.fileName} numberOfLines={1} ellipsizeMode='middle'>
                    {file.fileName}
                  </ThemedText>
                </View>
              </Pressable>

              <Pressable
                hitSlop={8}
                onPress={() => showActions(file)}
                accessibilityRole='button'
                accessibilityLabel={`More options for ${file.title}`}
                style={({ pressed }) => [
                  styles.moreButton,
                  { backgroundColor: theme.background },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name='ellipsis-vertical' size={19} color={theme.text} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 9 },
  row: { width: '94%', alignSelf: 'center', minHeight: 66, borderWidth: 1, borderRadius: 14, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  fileMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileIcon: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0 },
  fileTitle: { fontSize: 15, fontWeight: '800', lineHeight: 20 },
  fileName: { marginTop: 3, fontSize: 11 },
  moreButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emptyIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyText: { marginTop: 6, fontSize: 14, textAlign: 'center' },
  pressed: { opacity: 0.7 },
})

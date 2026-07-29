import * as FileSystem from 'expo-file-system/legacy'
import * as IntentLauncher from 'expo-intent-launcher'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'

const MIME_BY_EXTENSION: Record<string, string> = {
  bmp: 'image/bmp',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  json: 'application/json',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  pdf: 'application/pdf',
  png: 'image/png',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  webp: 'image/webp',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
}

const cleanMimeType = (value?: string | null) => {
  const normalized = value?.split(';')[0]?.trim().toLowerCase()
  if (!normalized || normalized === 'application/octet-stream') return undefined

  // Some API responses use a file extension (for example `pdf` or `jpg`)
  // instead of an Android MIME type. Convert those values before opening.
  if (!normalized.includes('/')) {
    return MIME_BY_EXTENSION[normalized]
  }

  return normalized === 'image/jpg' ? 'image/jpeg' : normalized
}

export const getFileMimeType = (fileName: string, provided?: string | null) => {
  const explicit = cleanMimeType(provided)
  if (explicit) return explicit

  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? MIME_BY_EXTENSION[extension] : undefined
}

export const resolveDownloadUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url

  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '')
  if (!baseUrl) return url

  return `${baseUrl}/${url.replace(/^\//, '')}`
}

export const isErrorDocumentMimeType = (mimeType?: string | null) => {
  const normalized = cleanMimeType(mimeType)
  return normalized === 'application/json' || normalized === 'text/html'
}

export const openLocalFile = async (
  localUri: string,
  fileName: string,
  providedMimeType?: string | null,
) => {
  if (Platform.OS !== 'android') {
    await Linking.openURL(localUri)
    return
  }

  const contentUri = await FileSystem.getContentUriAsync(localUri)
  const mimeType = getFileMimeType(fileName, providedMimeType) ?? '*/*'

  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    type: mimeType,
    flags: 1,
  })
}

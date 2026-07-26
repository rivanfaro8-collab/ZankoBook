import * as FileSystem from 'expo-file-system/legacy'

export type DownloadedFile = {
  id: string
  title: string
  fileName: string
  localUri: string
  mimeType?: string
  downloadedAt: string
}

const HISTORY_FILE = `${FileSystem.documentDirectory}download-history.json`
let mutationQueue: Promise<void> = Promise.resolve()

const readHistoryFile = async (): Promise<DownloadedFile[]> => {
  const info = await FileSystem.getInfoAsync(HISTORY_FILE)
  if (!info.exists) return []

  try {
    const raw = await FileSystem.readAsStringAsync(HISTORY_FILE)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeHistoryFile = async (items: DownloadedFile[]) => {
  await FileSystem.writeAsStringAsync(HISTORY_FILE, JSON.stringify(items))
}

export const getDownloadedFiles = async () => {
  const items = await readHistoryFile()
  const existingItems: DownloadedFile[] = []

  for (const item of items) {
    const info = await FileSystem.getInfoAsync(item.localUri)
    if (info.exists) existingItems.push(item)
  }

  if (existingItems.length !== items.length) {
    await writeHistoryFile(existingItems)
  }

  return existingItems.sort(
    (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime(),
  )
}

export const saveDownloadedFile = async (file: DownloadedFile) => {
  mutationQueue = mutationQueue.catch(() => undefined).then(async () => {
    const items = await readHistoryFile()
    const nextItems = [file, ...items.filter((item) => item.id !== file.id)]
    await writeHistoryFile(nextItems)
  })

  await mutationQueue
}

export const removeDownloadedFile = async (id: string) => {
  mutationQueue = mutationQueue.catch(() => undefined).then(async () => {
    const items = await readHistoryFile()
    await writeHistoryFile(items.filter((item) => item.id !== id))
  })

  await mutationQueue
}

import * as FileSystem from 'expo-file-system/legacy'

import { createAttendanceWeek, submitAttendanceRecords } from '../api/attendance'
import type { CreateAttendanceWeekPayload, SaveAttendancePayload } from '../types/attendance'

const QUEUE_FILE = `${FileSystem.documentDirectory}zankobook-attendance-queue.json`

export type OfflineAttendanceOperation =
  | {
      id: string
      type: 'create-session'
      tempWeekId: number
      courseId: number
      payload: CreateAttendanceWeekPayload
      createdAt: string
    }
  | {
      id: string
      type: 'save-records'
      weekId: number
      courseId: number
      payload: SaveAttendancePayload
      createdAt: string
    }

async function readQueue(): Promise<OfflineAttendanceOperation[]> {
  try {
    const info = await FileSystem.getInfoAsync(QUEUE_FILE)
    if (!info.exists) return []
    return JSON.parse(await FileSystem.readAsStringAsync(QUEUE_FILE))
  } catch {
    return []
  }
}

async function writeQueue(queue: OfflineAttendanceOperation[]) {
  await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(queue))
}

export async function enqueueAttendanceOperation(operation: OfflineAttendanceOperation) {
  const queue = await readQueue()
  const filtered = operation.type === 'save-records'
    ? queue.filter((item) => !(item.type === 'save-records' && item.weekId === operation.weekId))
    : queue
  await writeQueue([...filtered, operation])
}

export async function getPendingAttendanceCount() {
  return (await readQueue()).length
}

export async function clearAttendanceQueue() {
  await FileSystem.deleteAsync(QUEUE_FILE, { idempotent: true })
}

export async function syncAttendanceQueue() {
  const queue = await readQueue()
  if (queue.length === 0) return 0

  const idMap = new Map<number, number>()
  const remaining: OfflineAttendanceOperation[] = []
  let synced = 0

  for (const operation of queue) {
    try {
      if (operation.type === 'create-session') {
        const created = await createAttendanceWeek(operation.payload)
        idMap.set(operation.tempWeekId, created.id)
      } else {
        const weekId = idMap.get(operation.weekId) ?? operation.weekId
        await submitAttendanceRecords(operation.payload, weekId)
      }
      synced += 1
    } catch {
      remaining.push(operation)
    }
  }

  await writeQueue(remaining)
  return synced
}

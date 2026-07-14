import api from '../lib/axios'
import type {
  AttendanceRecord,
  AttendanceWeek,
  CourseStudent,
  CreateAttendanceWeekPayload,
  CreateAttendanceWeekResponse,
  GetAttendanceRecordsResponse,
  GetAttendanceWeeksResponse,
  GetCourseStudentsResponse,
  RecordAttendanceResponse,
  SaveAttendancePayload,
} from '../types/attendance'

export async function createAttendanceWeek(
  payload: CreateAttendanceWeekPayload,
): Promise<AttendanceWeek> {
  const response = await api.post<CreateAttendanceWeekResponse>(
    '/api/moodle/attendance-sessions',
    payload,
  )
  const { success, message, data } = response.data
  if (!success) throw new Error(message)
  return data
}

export async function deleteAttendanceWeek(weekId: number): Promise<void> {
  const response = await api.delete<{ success?: boolean; message?: string }>(
    `/api/moodle/attendance-sessions/${weekId}`,
  )
  const { success, message } = response.data ?? {}
  if (success === false)
    throw new Error(message ?? 'Could not delete attendance session')
}

export async function getCourseStudents(
  courseId: number,
): Promise<CourseStudent[]> {
  const response = await api.get<GetCourseStudentsResponse>(
    `/api/courses/${courseId}/students`,
  )
  const { success, message, data } = response.data
  if (!success) throw new Error(message)
  return data.data
}

export async function getAttendanceWeeks(
  courseId: number,
): Promise<AttendanceWeek[]> {
  const response = await api.get<GetAttendanceWeeksResponse>(
    `/api/moodle/attendance-sessions?filter[course_id]=${courseId}`,
  )
  const { success, message, data } = response.data
  if (!success) throw new Error(message)
  return data
}

export async function getAttendanceRecords(
  weekId: number,
): Promise<AttendanceRecord[]> {
  const response = await api.get<GetAttendanceRecordsResponse>(
    `/api/moodle/attendance-sessions/${weekId}/attendance`,
  )
  const { success, message, data } = response.data
  if (!success) throw new Error(message)
  return data
}

export async function submitAttendanceRecords(
  payload: SaveAttendancePayload,
  weekId: number,
): Promise<void> {
  const response = await api.post<RecordAttendanceResponse>(
    `/api/moodle/attendance-sessions/${weekId}/attendance`,
    payload,
  )
  const { success, message } = response.data
  if (!success) throw new Error(message)
}

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Excused Absence'

export type AttendanceWeek = {
  id: number
  course_id: number
  title: string
  session_date: string
  start_at: string
  end_at: string
  created_at?: string | null
  updated_at?: string | null
}

export type CourseStudent = {
  id: number
  user_id?: number
  user: {
    id?: number
    name: string
    email?: string
  }
}

export type AttendanceRecord = {
  id?: number
  student_id: number
  status: AttendanceStatus
  student?: CourseStudent
}

export type CreateAttendanceWeekPayload = {
  course_id: number
  title: string
  session_date: string
  start_at: string
  end_at: string
}

export type SaveAttendancePayload = {
  records: Array<{
    student_id: number
    status: AttendanceStatus
  }>
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type GetCourseStudentsResponse = ApiResponse<{
  data: CourseStudent[]
}>

export type GetAttendanceWeeksResponse = ApiResponse<AttendanceWeek[]>
export type CreateAttendanceWeekResponse = ApiResponse<AttendanceWeek>
export type GetAttendanceRecordsResponse = ApiResponse<AttendanceRecord[]>
export type RecordAttendanceResponse = ApiResponse<AttendanceRecord[]>

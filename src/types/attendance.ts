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
  local_status?: 'pending'
}

export type CourseStudent = {
  id: number
  user_id?: number
  student_number?: string
  stage?: string | number
  enrollment_type?: string
  status?: string
  created_at?: string | null
  user: {
    id?: number
    name: string
    email?: string
  }
}

export type AttendanceRecord = {
  id?: number
  attendance_session_id?: number
  student_id?: number
  student: CourseStudent
  status: AttendanceStatus
  note?: string | null
  created_at?: string
  updated_at?: string
}

export type CreateAttendanceWeekPayload = {
  course_id: number
  title: string
  session_date: string
  start_at: string
  end_at: string
}

export type SaveAttendancePayload = {
  attendance: Array<{
    student_id: number
    status: AttendanceStatus
    note?: string
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
export type RecordAttendanceResponse = ApiResponse<null>
export type StudentPersonalAttendanceRecord = {
  id: number
  attendance_session_id?: number
  student_id?: number
  status: AttendanceStatus | string
  note?: string | null
  attendance_session: {
    id?: number
    course_id?: number
    title?: string | null
    session_date: string
    start_at?: string | null
    end_at?: string | null
  }
  created_at?: string | null
  updated_at?: string | null
}

export type GetMyAttendanceParams = {
  course_id?: number
}

export type GetMyAttendanceResponse =
  ApiResponse<StudentPersonalAttendanceRecord[]>


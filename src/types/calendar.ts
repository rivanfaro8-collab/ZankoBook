type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export interface CalendarEventsQueryParams {
  startDate: string
  endDate: string
}

export interface CalendarEventCourse {
  id: number
  name: string
  code: string
}

export interface CalendarEventSubmission {
  id: number
  submitted_at: string
}

export interface AssignmentEvent {
  id: number
  assessment_id: number
  title: string
  description: string
  type?: 'assignment'
  due_at: string
  course: CalendarEventCourse
  is_submitted: boolean
  is_overdue: boolean
  submission: CalendarEventSubmission | null
}

export interface AssignmentAttachment {
  id: number
  file_name: string
  file_type: string
  file_size: number
  file_url: string
}

export interface AssignmentDetails {
  id: number
  description: string
  course_assessment: {
    id: number
    course_id: number
    teacher_id: number
    academic_year_id: number
    title: string
    max_mark: number
    weight: number
    due_at: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  section: {
    id: number
    title: string
  }
  attachments: AssignmentAttachment[]
  created_at: string
  updated_at: string
}

export type GetCalendarEventsResponse = ApiResponse<AssignmentEvent[]>
export type GetAssignmentDetailsResponse = ApiResponse<AssignmentDetails>

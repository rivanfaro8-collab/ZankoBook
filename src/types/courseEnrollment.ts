export interface StudentCourseSelectionRequest {
  academic_year_id: number
  course_ids: number[]
}

export interface AvailableCourseDepartment {
  id: number
  name: string
  code: string | null
  faculty_id: number
  is_active: number
  course_selection_starts_at: string | null
  course_selection_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface AvailableCourseTeacherUser {
  id: number
  name: string
  email: string
}

export interface AvailableCourseTeacher {
  id: number
  title: string
  speciality: string
  user: AvailableCourseTeacherUser
  created_at: string
  updated_at: string
}

export type CourseSelectionType = 'mandatory' | 'elective'

export interface AvailableCourse {
  id: number
  name: string
  code: string
  credit_hours: number
  year_level: number
  type: CourseSelectionType
  is_active: number
  department_id: number
  color: string
  role: string | null
  semester: 'fall' | 'spring'
  department: AvailableCourseDepartment
  teachers: AvailableCourseTeacher[]
  created_at: string
  updated_at: string
}

export interface AvailableCoursesData {
  is_requested: boolean
  courses: AvailableCourse[]
}

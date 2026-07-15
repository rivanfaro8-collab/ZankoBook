export type CourseDepartment = {
  id: number
  name: string
  code: string | null
  faculty_id: number
  is_active: number | null
  course_selection_starts_at: string | null
  course_selection_ends_at: string | null
  created_at: string | null
  updated_at: string | null
}

export type CourseTeacherUser = {
  id: number
  name: string
}

export type CourseTeacher = {
  id: number
  title: string | null
  speciality: string | null
  user: CourseTeacherUser
  created_at: string | null
  updated_at: string | null
}

export type Course = {
  id: number
  name: string
  code: string
  credit_hours: number
  year_level: number
  is_active: number
  department_id: number
  semester: string | null
  students_count: number
  sections_count: number
  department: CourseDepartment

  /*
   * The student courses endpoint includes teachers.
   * The lecturer courses endpoint currently does not include them.
   */
  teachers?: CourseTeacher[]

  created_at: string
  updated_at: string
}

export type CoursesApiResponse = {
  success: boolean
  message: string
  data: Course[]
}

export type CourseSectionItem = {
  id: number
  title?: string | null
  material_file_name?: string | null
  material_file_type?: string | null
  material_file_url?: string | null
  url?: string | null
  size?: string | null
}

export type CourseSubmission = {
  id: number
  title: string
  deadline?: string | null
  graded_at?: string | null
  grade?: number | string | null
  weight?: number | null
}

export type CourseSection = {
  id: number
  title: string
  course_id?: number
  course?: Course
  items?: CourseSectionItem[]
  submissions?: CourseSubmission[]
  created_at?: string
  updated_at?: string
}

export type CourseSectionPayload = {
  title: string
}

export type CourseSectionsApiResponse = {
  success: boolean
  message: string
  data: CourseSection[] | { data: CourseSection[] }
}

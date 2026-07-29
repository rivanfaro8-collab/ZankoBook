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
  email?: string | null
}

export type TeacherRole =
  | 'primary_lecturer'
  | 'assistant_lecturer'
  | 'lab_instructor'

export type CourseTeacher = {
  id: number
  title: string | null
  speciality: string | null
  role?: TeacherRole
  pivot?: {
    course_id: number
    teacher_id: number
    role: TeacherRole
  }
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
  role?: TeacherRole | null
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
  section_id: number
  title: string
  description: string | null
  type: string
  material_file_name: string | null
  material_file_type: string | null
  material_file_url: string | null
  created_at: string
  updated_at: string
  created_by_teacher_id?: number
  created_by?: {
    id: number
    name: string
    user_id: number
  }
}

export type SectionItemCategory = 'file' | 'link' | 'note' | 'submission'

export type SectionItemFormValues = {
  title: string
  description: string
  url?: string
}


export type SectionSubmissionAttachment = {
  id: number
  file_name: string
  file_type: string
  file_size: number
  file_url: string
}

export type SectionSubmissionAssessment = {
  id: number
  course_id: number
  teacher_id: number
  academic_year_id: number
  title: string
  max_mark: string
  weight: string
  due_at: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type SectionSubmission = {
  id: number
  description: string | null
  course_assessment: SectionSubmissionAssessment
  section: {
    id: number
    title: string
  }
  attachments: SectionSubmissionAttachment[]
  created_by?: {
    id: number
    name: string
    user_id: number
  }
  created_at: string
  updated_at: string
}

export type SectionSubmissionFormValues = {
  title: string
  description: string
  weight: number
  maxMark: number
  dueAt: string
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
  created_by?: {
    id: number
    title?: string | null
    speciality?: string | null
    user?: {
      id: number
      name: string
      email?: string | null
    }
  }
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

export type StudentSubmissionFile = {
  id: number
  student: {
    id: number
    name: string
  }
  submission_id: number
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  created_at: string
  updated_at: string
}

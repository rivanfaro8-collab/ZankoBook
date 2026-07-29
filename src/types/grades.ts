export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type AssessmentType =
  | 'quiz'
  | 'assignment'
  | 'final'
  | 'midterm'
  | 'project'
  | 'activity'

export type GradebookAssessment = {
  id: number
  title: string
  type: AssessmentType
  max_mark: number | string
  weight: number | string
  is_published: boolean | number
}

export type GradebookStudentMark = {
  assessment_id: number
  mark: number | string | null
  status: string | null
  feedback: string | null
}

export type GradebookStudent = {
  id: number
  name: string
  total_grade: number | string
  marks: GradebookStudentMark[]
}

export type Gradebook = {
  assessments: GradebookAssessment[]
  students: GradebookStudent[]
}

export type AssessmentEditState = 'clean' | 'new' | 'edited' | 'deleted'

export type AssessmentUIState = {
  id?: number
  tempId: string
  title: string
  max_mark: number
  weight: number
  type: AssessmentType
  is_published: boolean
  state: AssessmentEditState
}

export type CreateAssessmentPayload = {
  title: string
  weight: number
  max_mark: number
  is_published: boolean
}

export type UpdateAssessmentPayload = {
  id: number
  title?: string
  weight?: number
  max_mark?: number
  is_published: boolean
}

export type ModifyAssessmentsPayload = {
  create: CreateAssessmentPayload[]
  update: UpdateAssessmentPayload[]
  delete: number[]
}

export type SaveGradebookMarkPayload = {
  assessment_id: number
  student_id: number
  mark: number | null
  feedback: string | null
  status: 'valid' | 'voided' | 'excused' | 'absent' | 'under_review'
}

export type SaveGradebookPayload = {
  academic_year_id: number
  marks: SaveGradebookMarkPayload[]
}

export type SaveGradebookResult = {
  saved_marks_count: number
  recalculated_students_count: number
}

export type CourseAssessment = {
  assessment_id?: number
  id?: number
  course_id: number
  teacher_id: number
  academic_year_id: number
  title: string
  type: AssessmentType
  max_mark: number | string
  weight: number | string
  due_at: string | null
  is_published: boolean | number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type GetGradebookResponse = ApiResponse<Gradebook>
export type SaveGradebookResponse = ApiResponse<SaveGradebookResult>
export type ModifyAssessmentsResponse = ApiResponse<CourseAssessment[]>

export type StudentCourseAssessment = {
  assessment_id: number
  title: string
  max_mark: number | string
  weight: number | string
  mark: number | string | null
  status?: string | null
  feedback?: string | null
}

export type StudentCourseGrades = {
  assessments: StudentCourseAssessment[]
}

export type GetCourseMarksResponse = ApiResponse<StudentCourseGrades>

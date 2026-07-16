export type StudentCourseAssessment = {
  assessment_id: number
  title: string
  weight: number | string | null
  mark: number | string | null
  max_mark: number | string | null
  feedback?: string | null
  status?: string | null
}

export type CourseMarks = {
  assessments: StudentCourseAssessment[]
  [key: string]: unknown
}

export type GetCourseMarksResponse = {
  success: boolean
  message: string
  data: CourseMarks
}

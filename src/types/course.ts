export type CourseDepartment = {
  id: number
  name: string
  code: string | null
  faculty_id: number
  is_active: number | null
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
  students_count: number
  sections_count: number
  department: CourseDepartment
  created_at: string
  updated_at: string
}

export type CoursesApiResponse = {
  success: boolean
  message: string
  data: {
    courses: Course[]
  }
}

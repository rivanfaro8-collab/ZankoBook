import api from '@/lib/axios'
import type { Course, CoursesApiResponse } from '@/types/course'

// const FAKE_COURSES: Course[] = [
//   {
//     id: 1,
//     name: 'Programming Fundamentals',
//     code: 'UOS10224',
//     credit_hours: 3,
//     year_level: 2,
//     is_active: 1,
//     department_id: 1,
//     students_count: 11,
//     sections_count: 4,
//     department: {
//       id: 1,
//       name: 'Orthodontics and Dentistry',
//       code: null,
//       faculty_id: 1,
//       is_active: null,
//       created_at: null,
//       updated_at: null,
//     },
//     created_at: '2026-07-11 15:16:10',
//     updated_at: '2026-07-11 15:16:10',
//   },
//   {
//     id: 5,
//     name: 'Cyber Security',
//     code: 'KOU07508',
//     credit_hours: 3,
//     year_level: 4,
//     is_active: 1,
//     department_id: 1,
//     students_count: 12,
//     sections_count: 1,
//     department: {
//       id: 1,
//       name: 'Orthodontics and Dentistry',
//       code: null,
//       faculty_id: 1,
//       is_active: null,
//       created_at: null,
//       updated_at: null,
//     },
//     created_at: '2026-07-11 15:16:10',
//     updated_at: '2026-07-11 15:16:10',
//   },
//   {
//     id: 8,
//     name: 'Computer Architecture',
//     code: 'C4A7',
//     credit_hours: 1,
//     year_level: 2,
//     is_active: 1,
//     department_id: 2,
//     students_count: 33,
//     sections_count: 2,
//     department: {
//       id: 2,
//       name: 'Computer Science',
//       code: 'CS',
//       faculty_id: 1,
//       is_active: 1,
//       created_at: null,
//       updated_at: null,
//     },
//     created_at: '2026-07-11 15:16:10',
//     updated_at: '2026-07-11 15:16:10',
//   },
//   {
//     id: 12,
//     name: 'Database Systems',
//     code: 'DBS204',
//     credit_hours: 4,
//     year_level: 3,
//     is_active: 1,
//     department_id: 2,
//     students_count: 24,
//     sections_count: 3,
//     department: {
//       id: 2,
//       name: 'Computer Science',
//       code: 'CS',
//       faculty_id: 1,
//       is_active: 1,
//       created_at: null,
//       updated_at: null,
//     },
//     created_at: '2026-07-11 15:16:10',
//     updated_at: '2026-07-11 15:16:10',
//   },
// ]

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

export async function getStudentCourses(): Promise<Course[]> {
  const response = await api.get<CoursesApiResponse>('/api/moodle/my-courses')

  if (!response.data.success) {
    throw new Error(
      response.data.message || 'Could not retrieve student courses.',
    )
  }

  return response.data.data.courses
}

export async function getLecturerCourses(): Promise<Course[]> {
  const response = await api.get<CoursesApiResponse>(
    '/api/moodle/lecturer/courses',
  )

  if (!response.data.success) {
    throw new Error(
      response.data.message || 'Could not retrieve lecturer courses.',
    )
  }

  return response.data.data.courses
}

// FAKE API METHODS — active while the backend is being fixed.
// export async function getStudentCourses(): Promise<Course[]> {
//   await wait(450)
//   return FAKE_COURSES
// }

// export async function getLecturerCourses(): Promise<Course[]> {
//   await wait(450)
//   return FAKE_COURSES
// }

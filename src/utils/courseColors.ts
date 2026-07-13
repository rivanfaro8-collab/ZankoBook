import type { Course } from '@/types/course'

// Every color in this palette is intentionally dark enough for permanent white code text.
// Keep this palette shared: any screen that calls getCourseColor for the same course gets
// the same visual identity.
export const COURSE_COLORS = [
  '#006D77', '#0077B6', '#0062A3', '#00509D', '#1D4ED8',
  '#1E40AF', '#3730A3', '#4338CA', '#4C1D95', '#5B21B6',
  '#6D28D9', '#7E22CE', '#86198F', '#A21CAF', '#9D174D',
  '#BE123C', '#B91C1C', '#C2410C', '#B45309', '#A16207',
  '#4D7C0F', '#3F6212', '#15803D', '#047857', '#0F766E',
  '#0E7490', '#0369A1', '#075985', '#334155', '#374151',
  '#3F3F46', '#44403C', '#7F1D1D', '#7C2D12', '#78350F',
  '#713F12', '#365314', '#14532D', '#064E3B', '#134E4A',
  '#164E63', '#0C4A6E', '#172554', '#1E1B4B', '#2E1065',
  '#3B0764', '#4A044E', '#500724', '#881337', '#8B1A10',
] as const

function hashString(value: string): number {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

export function getCourseColor(course: Pick<Course, 'id' | 'code'>): string {
  const stableKey = course.code.trim().toUpperCase() || String(course.id)
  return COURSE_COLORS[hashString(stableKey) % COURSE_COLORS.length]
}

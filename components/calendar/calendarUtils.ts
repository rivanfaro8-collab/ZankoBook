import type { AssignmentEvent } from '../../src/types/calendar'

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatApiDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseBackendDate(value: string): Date {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const parsed = new Date(normalized)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const [datePart, timePart = '00:00:00'] = value.split(' ')
  const segments = datePart.split(/[-/]/).map(Number)
  const time = timePart.split(':').map(Number)
  if (segments[0] > 31) {
    return new Date(segments[0], segments[1] - 1, segments[2], time[0] || 0, time[1] || 0, time[2] || 0)
  }
  return new Date(segments[2], segments[1] - 1, segments[0], time[0] || 0, time[1] || 0, time[2] || 0)
}

export function dateKeyFromEvent(event: AssignmentEvent): string {
  return formatApiDate(parseBackendDate(event.due_at))
}

export function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - first.getDay())
  const gridEnd = new Date(last)
  gridEnd.setDate(last.getDate() + (6 - last.getDay()))

  const days: Date[] = []
  const cursor = new Date(gridStart)
  while (cursor <= gridEnd) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function visibleMonthRange(month: Date): { startDate: string; endDate: string } {
  const days = monthGrid(month)
  return {
    startDate: formatApiDate(days[0]),
    endDate: formatApiDate(days[days.length - 1]),
  }
}

export function formatTime(value: string): string {
  return parseBackendDate(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatLongDate(value: string): string {
  return parseBackendDate(value).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

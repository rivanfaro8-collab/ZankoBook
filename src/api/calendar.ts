import api from '../lib/axios'
import type {
  AssignmentDetails,
  AssignmentEvent,
  CalendarEventsQueryParams,
  GetAssignmentDetailsResponse,
  GetCalendarEventsResponse,
} from '../types/calendar'

export async function getCalendarEvents(
  payload: CalendarEventsQueryParams,
): Promise<AssignmentEvent[]> {
  const response = await api.get<GetCalendarEventsResponse>(
    '/api/moodle/calendar-events',
    {
      params: {
        start_date: payload.startDate,
        end_date: payload.endDate,
      },
    },
  )

  const { success, message, data } = response.data
  if (!success) throw new Error(message || 'Calendar events could not be loaded')
  return data
}

export async function getAssignmentDetails(eventId: number): Promise<AssignmentDetails> {
  const response = await api.get<GetAssignmentDetailsResponse>(
    `/api/moodle/section-submissions/${eventId}`,
  )

  const { success, message, data } = response.data
  if (!success) throw new Error(message || 'Assignment details could not be loaded')
  return data
}

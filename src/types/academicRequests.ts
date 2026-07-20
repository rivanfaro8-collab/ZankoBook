export type AcademicRequestType =
  | 'leave'
  | 'equipment'
  | 'transcript'
  | 'complaint'
  | 'other'

export type AcademicRequestStatus = 'approved' | 'pending' | 'rejected'

export type PickedAcademicRequestFile = {
  uri: string
  name: string
  mimeType?: string | null
  size?: number | null
}

export type AcademicRequestPayload = {
  type: AcademicRequestType
  subject: string
  description: string
  department_id?: number
  files?: PickedAcademicRequestFile[]
}

export type AcademicRequestAttachment = {
  id: number
  file_name: string
  file_url: string
  file_size: number
  file_type: string
}

export type AcademicRequest = {
  id: number
  type: string
  status: AcademicRequestStatus
  subject: string
  description: string
  user?: {
    id: number
    name: string
  } | null
  department?: {
    id: number
    name: string
  } | null
  created_at: string
  updated_at: string
  attachments: AcademicRequestAttachment[]
}

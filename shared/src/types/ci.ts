export type ID = number

export type JobStatus = 'queued' | 'running' | 'success' | 'failed' | 'canceled'

export interface Project {
  id: ID
  name: string
  key: string
  description?: string | null
  createdAt?: string
  updatedAt?: string | null
}

export interface Pipeline {
  id: ID
  projectId: ID
  name: string
  yaml: string
  version: string
  environmentId?: ID | null
  createdAt?: string
}

export interface PipelineRun {
  id: ID
  pipelineId: ID
  status: JobStatus
  triggeredBy?: ID | null
  queuedAt?: string
  commitSha?: string | null
  ref?: string | null
}

export interface Job {
  id: ID
  runId: ID
  stage: string
  stepIndex: number
  name: string
  status: JobStatus
  image?: string | null
  command: string
  logsLocation?: string | null
  artifactsLocation?: string | null
  exitCode?: number | null
}

export type ApiItemResponse<T> = { data: T }
export type ApiListResponse<T> = { data: T[] }


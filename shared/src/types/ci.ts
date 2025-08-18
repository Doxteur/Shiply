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
  startedAt?: string | null
  finishedAt?: string | null
  createdAt?: string
  updatedAt?: string | null
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
export type ApiPaginatedResponse<T> = { data: T[]; meta: { total: number; perPage: number; currentPage: number; lastPage: number } }

export type ProjectRunStats = {
  total: number
  success: number
  failed: number
  running: number
  queued: number
  canceled: number
}

export interface ProjectConfig {
  runMode?: 'command' | 'dockerfile' | 'compose'
  startCommand?: string
  dockerfilePath?: string
  composePath?: string
  defaultBranch?: string
  rootPath?: string
  envVars?: Array<{ key: string; value: string }>
  repositoryFullName?: string // e.g. owner/repo
  pipelinePath?: string // e.g. .shiply.yml
}


import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axiosInstance from '@/app/utils/axios'
import type { ApiItemResponse, ApiListResponse, PipelineRun, Job, ProjectRunStats } from '@shared/types'

type RunsState = {
  byId: Record<number, PipelineRun>
  jobsByRunId: Record<number, Job[]>
  latestIds: number[]
  latestByProjectId: Record<number, number[]>
  statsByProjectId: Record<number, ProjectRunStats>
  loading: boolean
  error: string | null
}

const initialState: RunsState = {
  byId: {},
  jobsByRunId: {},
  latestIds: [],
  latestByProjectId: {},
  statsByProjectId: {},
  loading: false,
  error: null,
}

export const triggerRun = createAsyncThunk<PipelineRun, { pipelineId: number; commitSha?: string; ref?: string }, { rejectValue: string }>(
  'runs/trigger',
  async ({ pipelineId, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<ApiItemResponse<PipelineRun>>(`/pipelines/${pipelineId}/run`, payload)
      return data.data
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'trigger run failed')
    }
  }
)

export const fetchRun = createAsyncThunk<PipelineRun, { id: number }, { rejectValue: string }>(
  'runs/fetchOne',
  async ({ id }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/runs/${id}`)
      return (data as unknown as ApiItemResponse<PipelineRun>).data
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'fetch run failed')
    }
  }
)

export const fetchRunJobs = createAsyncThunk<{ runId: number; jobs: Job[] }, { runId: number }, { rejectValue: string }>(
  'runs/fetchJobs',
  async ({ runId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ApiListResponse<Job>>(`/runs/${runId}/jobs`)
      return { runId, jobs: data.data }
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'fetch jobs failed')
    }
  }
)

export const fetchLatestRunsByProject = createAsyncThunk<{ projectId: number; runs: PipelineRun[] }, { projectId: number }, { rejectValue: string }>(
  'runs/fetchLatestByProject',
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ApiListResponse<PipelineRun>>(`/projects/${projectId}/runs/latest`)
      return { projectId, runs: data.data }
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'fetch latest runs failed')
    }
  }
)

export const fetchProjectRunStats = createAsyncThunk<{ projectId: number; stats: ProjectRunStats }, { projectId: number }, { rejectValue: string }>(
  'runs/fetchProjectRunStats',
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ApiItemResponse<ProjectRunStats>>(`/projects/${projectId}/runs/stats`)
      return { projectId, stats: data.data }
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'fetch stats failed')
    }
  }
)

const runsSlice = createSlice({
  name: 'runs',
  initialState,
  reducers: {
    setLatest(state, action: PayloadAction<number[]>) {
      state.latestIds = action.payload
    },
    clearRun(state, action: PayloadAction<number>) {
      delete state.byId[action.payload]
      delete state.jobsByRunId[action.payload]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerRun.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload
        state.latestIds = [action.payload.id, ...state.latestIds]
      })
      .addCase(fetchRun.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload
      })
      .addCase(fetchRunJobs.fulfilled, (state, action) => {
        state.jobsByRunId[action.payload.runId] = action.payload.jobs
      })
      .addCase(fetchLatestRunsByProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLatestRunsByProject.fulfilled, (state, action) => {
        state.loading = false
        for (const run of action.payload.runs) {
          state.byId[run.id] = run
        }
        state.latestByProjectId[action.payload.projectId] = action.payload.runs.map((r) => r.id)
      })
      .addCase(fetchLatestRunsByProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'fetch failed'
      })
      .addCase(fetchProjectRunStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjectRunStats.fulfilled, (state, action) => {
        state.loading = false
        state.statsByProjectId[action.payload.projectId] = action.payload.stats
      })
      .addCase(fetchProjectRunStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'fetch failed'
      })
  },
})

export const { setLatest, clearRun } = runsSlice.actions
export default runsSlice.reducer




import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axiosInstance from '@/app/utils/axios'
import type { ApiListResponse, ApiItemResponse, Pipeline } from '@shared/types'

type PipelinesState = {
  byProjectId: Record<number, Pipeline[]>
  loading: boolean
  creating: boolean
  error: string | null
  selectedPipelineId: number | null
}

const initialState: PipelinesState = {
  byProjectId: {},
  loading: false,
  creating: false,
  error: null,
  selectedPipelineId: null,
}

export const fetchPipelines = createAsyncThunk<{ projectId: number; items: Pipeline[] }, { projectId: number }, { rejectValue: string }>(
  'pipelines/fetchByProject',
  async ({ projectId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ApiListResponse<Pipeline>>(`/projects/${projectId}/pipelines`)
      return { projectId, items: data.data }
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'fetch pipelines failed')
    }
  }
)

export const createPipeline = createAsyncThunk<Pipeline, { projectId: number; name: string; yaml: string; version?: string; environmentId?: number | null }, { rejectValue: string }>(
  'pipelines/create',
  async ({ projectId, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<ApiItemResponse<Pipeline>>(`/projects/${projectId}/pipelines`, payload)
      return data.data
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'create pipeline failed')
    }
  }
)

export const syncPipelineFromRepo = createAsyncThunk<Pipeline, { projectId: number; pipelinePath?: string }, { rejectValue: string }>(
  'pipelines/syncFromRepo',
  async ({ projectId, pipelinePath }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<ApiItemResponse<Pipeline>>(`/projects/${projectId}/pipelines/sync-repo`, pipelinePath ? { pipelinePath } : {})
      return data.data
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'sync pipeline failed')
    }
  }
)

const pipelinesSlice = createSlice({
  name: 'pipelines',
  initialState,
  reducers: {
    selectPipeline(state, action: PayloadAction<number | null>) {
      state.selectedPipelineId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPipelines.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPipelines.fulfilled, (state, action) => {
        state.loading = false
        state.byProjectId[action.payload.projectId] = action.payload.items
      })
      .addCase(fetchPipelines.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'fetch failed'
      })
      .addCase(createPipeline.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createPipeline.fulfilled, (state, action: PayloadAction<Pipeline>) => {
        state.creating = false
        const pid = action.payload.projectId
        state.byProjectId[pid] = [action.payload, ...(state.byProjectId[pid] ?? [])]
      })
      .addCase(createPipeline.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? 'create failed'
      })
      .addCase(syncPipelineFromRepo.fulfilled, (state, action: PayloadAction<Pipeline>) => {
        const pid = action.payload.projectId
        const list = state.byProjectId[pid] ?? []
        const idx = list.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) {
          list[idx] = action.payload
          state.byProjectId[pid] = [...list]
        } else {
          state.byProjectId[pid] = [action.payload, ...list]
        }
      })
  },
})

export const { selectPipeline } = pipelinesSlice.actions
export default pipelinesSlice.reducer




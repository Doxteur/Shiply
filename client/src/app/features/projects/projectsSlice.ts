import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axiosInstance from '@/app/utils/axios'
import type { ApiListResponse, ApiItemResponse, Project, ApiResponse } from '@shared/types'
import type { RootState } from '@/app/store'

type ProjectsState = {
  items: Project[]
  loading: boolean
  creating: boolean
  error: string | null
  selectedProjectId: number | null
  createFormDraft: { name: string; key: string; description: string } | null
}

const initialState: ProjectsState = {
  items: [],
  loading: false,
  creating: false,
  error: null,
  selectedProjectId: null,
  createFormDraft: null,
}

export const fetchProjects = createAsyncThunk<Project[], void, { rejectValue: string }>(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ApiListResponse<Project>>('/projects')
      return data.data
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'fetch projects failed')
    }
  }
)

export const createProject = createAsyncThunk<Project, { name: string; key: string; description?: string | null }, { rejectValue: string }>(
  'projects/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<ApiItemResponse<Project>>('/projects', payload)
      return data.data
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'create project failed')
    }
  }
)

export const deleteProject = createAsyncThunk<number, { id: number }, { rejectValue: string }>(
  'projects/delete',
  async ({ id }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<ApiResponse>(`/projects/${id}`)
      return id
    } catch (e: unknown) {
      return rejectWithValue((e as Error).message ?? 'delete project failed')
    }
  }
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    selectProject(state, action: PayloadAction<number | null>) {
      state.selectedProjectId = action.payload
    },
    setCreateFormDraft(
      state,
      action: PayloadAction<{ name: string; key: string; description: string } | null>
    ) {
      state.createFormDraft = action.payload
    },
    clearCreateFormDraft(state) {
      state.createFormDraft = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'fetch failed'
      })
      .addCase(createProject.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.creating = false
        state.items.unshift(action.payload)
      })
      .addCase(createProject.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload ?? 'create failed'
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((p) => p.id !== action.payload)
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.payload ?? 'delete failed'
      })
  },
})

export const { selectProject, setCreateFormDraft, clearCreateFormDraft } = projectsSlice.actions
export default projectsSlice.reducer

export const selectAllProjects = (s: RootState) => (s.projects?.items ?? []) as Project[]
export const selectSelectedProjectId = (s: RootState) => (s.projects?.selectedProjectId ?? null) as number | null



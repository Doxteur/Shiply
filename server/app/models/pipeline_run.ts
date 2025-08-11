import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type PipelineRunStatus = 'queued' | 'running' | 'success' | 'failed' | 'canceled'

export default class PipelineRun extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'pipeline_id' })
  declare pipelineId: number

  @column()
  declare status: PipelineRunStatus

  @column({ columnName: 'triggered_by' })
  declare triggeredBy: number | null

  @column({ columnName: 'queued_at' })
  declare queuedAt: DateTime

  @column({ columnName: 'started_at' })
  declare startedAt: DateTime | null

  @column({ columnName: 'finished_at' })
  declare finishedAt: DateTime | null

  @column({ columnName: 'commit_sha' })
  declare commitSha: string | null

  @column()
  declare ref: string | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

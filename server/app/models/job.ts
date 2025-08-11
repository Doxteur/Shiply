import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type JobStatus = 'queued' | 'running' | 'success' | 'failed' | 'canceled'

export default class Job extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'run_id' })
  declare runId: number

  @column()
  declare stage: string

  @column({ columnName: 'step_index' })
  declare stepIndex: number

  @column()
  declare name: string

  @column()
  declare status: JobStatus

  @column()
  declare image: string | null

  @column()
  declare command: string

  @column({ columnName: 'logs_location' })
  declare logsLocation: string | null

  @column({ columnName: 'artifacts_location' })
  declare artifactsLocation: string | null

  @column({ columnName: 'exit_code' })
  declare exitCode: number | null

  @column({ columnName: 'started_at' })
  declare startedAt: DateTime | null

  @column({ columnName: 'finished_at' })
  declare finishedAt: DateTime | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

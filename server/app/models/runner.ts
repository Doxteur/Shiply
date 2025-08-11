import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type RunnerStatus = 'online' | 'offline' | 'busy'

export default class Runner extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare labels: any | null

  @column({ columnName: 'max_concurrency' })
  declare maxConcurrency: number

  @column({ columnName: 'current_running' })
  declare currentRunning: number

  @column()
  declare status: RunnerStatus

  @column({ columnName: 'last_heartbeat_at' })
  declare lastHeartbeatAt: DateTime | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

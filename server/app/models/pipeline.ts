import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Pipeline extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'project_id' })
  declare projectId: number

  @column()
  declare name: string

  @column()
  declare version: string

  @column({ columnName: 'environment_id' })
  declare environmentId: number | null

  @column()
  declare yaml: string

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}



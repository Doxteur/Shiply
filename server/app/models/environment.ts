import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Environment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'project_id' })
  declare projectId: number

  @column()
  declare name: string

  @column()
  declare config: any | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

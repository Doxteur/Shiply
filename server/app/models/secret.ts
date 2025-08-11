import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Secret extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'project_id' })
  declare projectId: number

  @column({ columnName: 'environment_id' })
  declare environmentId: number | null

  @column()
  declare key: string

  @column({ columnName: 'value_encrypted' })
  declare valueEncrypted: string

  @column()
  declare iv: string

  @column()
  declare algorithm: string

  @column({ columnName: 'created_by' })
  declare createdBy: number | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}



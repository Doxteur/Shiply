import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AuditLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'actor_id' })
  declare actorId: number | null

  @column()
  declare action: string

  @column({ columnName: 'resource_type' })
  declare resourceType: string

  @column({ columnName: 'resource_id' })
  declare resourceId: number | null

  @column()
  declare metadata: any | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime
}



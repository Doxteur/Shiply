import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_integrations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().index()
      table.string('provider', 50).notNullable().index()
      table.text('access_token_enc').notNullable()
      table.string('scope', 255).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['user_id', 'provider'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

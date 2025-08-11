import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected jobs = 'jobs'

  async up() {
    this.schema.alterTable(this.jobs, (table) => {
      table
        .integer('runner_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('runners')
        .onDelete('SET NULL')
      table.index(['status'])
      table.index(['runner_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.jobs, (table) => {
      table.dropIndex(['status'])
      table.dropIndex(['runner_id'])
      table.dropColumn('runner_id')
    })
  }
}

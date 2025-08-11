import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected projects = 'projects'
  protected environments = 'environments'
  protected pipelines = 'pipelines'
  protected pipelineRuns = 'pipeline_runs'
  protected jobs = 'jobs'
  protected runners = 'runners'
  protected secrets = 'secrets'
  protected auditLogs = 'audit_logs'

  async up() {
    // projects
    this.schema.createTable(this.projects, (table) => {
      table.increments('id').notNullable()
      table.string('name', 150).notNullable()
      table.string('key', 50).notNullable().unique()
      table.text('description').nullable()
      table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // environments
    this.schema.createTable(this.environments, (table) => {
      table.increments('id').notNullable()
      table
        .integer('project_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.projects)
        .onDelete('CASCADE')
      table.string('name', 50).notNullable() // dev, staging, prod
      table.json('config').nullable()
      table.unique(['project_id', 'name'])
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // pipelines
    this.schema.createTable(this.pipelines, (table) => {
      table.increments('id').notNullable()
      table
        .integer('project_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.projects)
        .onDelete('CASCADE')
      table.string('name', 150).notNullable()
      table.string('version', 20).notNullable().defaultTo('1')
      table
        .integer('environment_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable(this.environments)
        .onDelete('SET NULL')
      table.text('yaml', 'longtext').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['project_id'])
    })

    // pipeline_runs
    this.schema.createTable(this.pipelineRuns, (table) => {
      table.increments('id').notNullable()
      table
        .integer('pipeline_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.pipelines)
        .onDelete('CASCADE')
      table
        .enum('status', ['queued', 'running', 'success', 'failed', 'canceled'])
        .notNullable()
        .defaultTo('queued')
      table.integer('triggered_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('queued_at').notNullable()
      table.timestamp('started_at').nullable()
      table.timestamp('finished_at').nullable()
      table.string('commit_sha', 64).nullable()
      table.string('ref', 100).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['pipeline_id', 'status'])
    })

    // jobs
    this.schema.createTable(this.jobs, (table) => {
      table.increments('id').notNullable()
      table
        .integer('run_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.pipelineRuns)
        .onDelete('CASCADE')
      table.string('stage', 100).notNullable()
      table.integer('step_index').notNullable()
      table.string('name', 150).notNullable()
      table
        .enum('status', ['queued', 'running', 'success', 'failed', 'canceled'])
        .notNullable()
        .defaultTo('queued')
      table.string('image', 200).nullable()
      table.text('command').notNullable()
      table.text('logs_location').nullable()
      table.text('artifacts_location').nullable()
      table.integer('exit_code').nullable()
      table.timestamp('started_at').nullable()
      table.timestamp('finished_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['run_id', 'status'])
    })

    // runners
    this.schema.createTable(this.runners, (table) => {
      table.increments('id').notNullable()
      table.string('name', 150).notNullable().unique()
      table.json('labels').nullable()
      table.integer('max_concurrency').notNullable().defaultTo(1)
      table.integer('current_running').notNullable().defaultTo(0)
      table
        .enum('status', ['online', 'offline', 'busy'])
        .notNullable()
        .defaultTo('offline')
      table.timestamp('last_heartbeat_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // secrets
    this.schema.createTable(this.secrets, (table) => {
      table.increments('id').notNullable()
      table
        .integer('project_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.projects)
        .onDelete('CASCADE')
      table
        .integer('environment_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable(this.environments)
        .onDelete('SET NULL')
      table.string('key', 150).notNullable()
      table.text('value_encrypted').notNullable()
      table.string('iv', 64).notNullable()
      table.string('algorithm', 32).notNullable().defaultTo('aes-256-gcm')
      table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['project_id', 'environment_id', 'key'])
    })

    // audit_logs
    this.schema.createTable(this.auditLogs, (table) => {
      table.increments('id').notNullable()
      table.integer('actor_id').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.string('action', 100).notNullable()
      table.string('resource_type', 100).notNullable()
      table.integer('resource_id').unsigned().nullable()
      table.json('metadata').nullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.auditLogs)
    this.schema.dropTable(this.secrets)
    this.schema.dropTable(this.runners)
    this.schema.dropTable(this.jobs)
    this.schema.dropTable(this.pipelineRuns)
    this.schema.dropTable(this.pipelines)
    this.schema.dropTable(this.environments)
    this.schema.dropTable(this.projects)
  }
}



import User from '#models/user'
import Project from '#models/project'
import Pipeline from '#models/pipeline'
import PipelineRun from '#models/pipeline_run'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Seed admin user
    const user = await User.firstOrCreate(
      { email: 'admin@admin.com' },
      { email: 'admin@admin.com', password: 'password', fullName: 'Admin' }
    )

    // Seed a demo project (if not exists)
    await Project.firstOrCreate(
      { key: 'DEMO' },
      {
        name: 'Demo Project',
        key: 'DEMO',
        description: 'Projet de démonstration pour Shiply',
        createdBy: user.id,
      }
    )

    // Attach a demo pipeline and seed some runs with various statuses
    const project = await Project.findBy('key', 'DEMO')
    if (!project) return

    const pipeline = await Pipeline.firstOrCreate(
      { projectId: project.id, name: 'build-test-deploy' },
      {
        projectId: project.id,
        name: 'build-test-deploy',
        version: '1',
        yaml: `version: 1\nname: demo\nstages:\n  - name: Build\n    steps:\n      - run: bun install\n      - run: bun run build\n  - name: Test\n    steps:\n      - run: bun test --coverage\n  - name: Deploy\n    steps:\n      - run: echo "deploy"`,
        environmentId: null,
      }
    )

    const existingRuns = await PipelineRun.query().where('pipeline_id', pipeline.id)
    if (existingRuns.length === 0) {
      const now = Date.now()
      const minutes = (m: number) => new Date(now - m * 60 * 1000) as any

      // success (finished)
      await PipelineRun.create({
        pipelineId: pipeline.id,
        status: 'success',
        triggeredBy: user.id,
        queuedAt: minutes(180),
        startedAt: minutes(175),
        finishedAt: minutes(170),
        commitSha: null,
        ref: 'refs/heads/main',
      })

      // failed (finished)
      await PipelineRun.create({
        pipelineId: pipeline.id,
        status: 'failed',
        triggeredBy: user.id,
        queuedAt: minutes(140),
        startedAt: minutes(138),
        finishedAt: minutes(136),
        commitSha: null,
        ref: 'refs/heads/main',
      })

      // running (started, not finished)
      await PipelineRun.create({
        pipelineId: pipeline.id,
        status: 'running',
        triggeredBy: user.id,
        queuedAt: minutes(15),
        startedAt: minutes(10),
        finishedAt: null,
        commitSha: null,
        ref: 'refs/heads/develop',
      })

      // queued (not started)
      await PipelineRun.create({
        pipelineId: pipeline.id,
        status: 'queued',
        triggeredBy: user.id,
        queuedAt: minutes(5),
        startedAt: null,
        finishedAt: null,
        commitSha: null,
        ref: 'refs/heads/feature/x',
      })

      // canceled
      await PipelineRun.create({
        pipelineId: pipeline.id,
        status: 'canceled',
        triggeredBy: user.id,
        queuedAt: minutes(90),
        startedAt: minutes(88),
        finishedAt: minutes(87),
        commitSha: null,
        ref: 'refs/heads/main',
      })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import Runner from '#models/runner'
import Job from '#models/job'
import Database from '@adonisjs/lucid/services/db'

export default class RunnersController {
  async heartbeat({ request, response }: HttpContext) {
    const { name, labels, maxConcurrency, currentRunning } = request.only([
      'name',
      'labels',
      'maxConcurrency',
      'currentRunning',
    ])
    if (!name) return response.badRequest({ error: 'name is required' })
    const now = new Date() as any
    const runner = await Runner.updateOrCreate(
      { name },
      {
        name,
        labels: labels ?? null,
        maxConcurrency: maxConcurrency ?? 1,
        currentRunning: currentRunning ?? 0,
        status: 'online',
        lastHeartbeatAt: now,
      }
    )
    return response.ok({ data: runner })
  }

  async claim({ request, response }: HttpContext) {
    const { name, labels } = request.only(['name', 'labels'])
    if (!name) return response.badRequest({ error: 'name is required' })

    const trx = await Database.transaction()
    try {
      const runner = await Runner.updateOrCreate(
        { name },
        { name, labels: labels ?? null, status: 'busy', lastHeartbeatAt: new Date() as any },
        { client: trx }
      )

      const job = await Job.query({ client: trx })
        .where('status', 'queued')
        .orderBy('id', 'asc')
        .first()

      if (!job) {
        await trx.commit()
        return response.ok({ data: null })
      }

      job.status = 'running'
      ;(job as any).runnerId = runner.id
      job.startedAt = new Date() as any
      await job.save()

      await trx.commit()
      return response.ok({ data: job })
    } catch (e) {
      await trx.rollback()
      return response.internalServerError({ error: 'claim failed' })
    }
  }
}

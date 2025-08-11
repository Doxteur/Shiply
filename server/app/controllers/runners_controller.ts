import type { HttpContext } from '@adonisjs/core/http'
import Runner from '#models/runner'

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
}

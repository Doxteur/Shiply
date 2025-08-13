import type { HttpContext } from '@adonisjs/core/http'
import Job from '#models/job'

export default class JobsController {
  async finish({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    const { status, exitCode, logsLocation, artifactsLocation } = request.only([
      'status',
      'exitCode',
      'logsLocation',
      'artifactsLocation',
    ])

    const job = await Job.find(id)
    if (!job) return response.notFound({ error: 'job not found' })

    if (status) (job as any).status = status
    if (exitCode !== undefined) (job as any).exitCode = exitCode
    if (logsLocation) (job as any).logsLocation = logsLocation
    if (artifactsLocation) (job as any).artifactsLocation = artifactsLocation
    job.finishedAt = new Date() as any
    await job.save()
    return response.ok({ data: job })
  }
}

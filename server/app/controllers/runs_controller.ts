import type { HttpContext } from '@adonisjs/core/http'
import PipelineRun from '#models/pipeline_run'
import Pipeline from '#models/pipeline'

export default class RunsController {
  async show({ params, response }: HttpContext) {
    const run = await PipelineRun.find(params.id)
    if (!run) return response.notFound({ error: 'run not found' })
    return response.ok({ data: run })
  }

  async trigger({ params, response, auth, request }: HttpContext) {
    const pipelineId = Number(params.id)
    const pipeline = await Pipeline.find(pipelineId)
    if (!pipeline) return response.notFound({ error: 'pipeline not found' })
    const { commitSha, ref } = request.only(['commitSha', 'ref'])

    const run = await PipelineRun.create({
      pipelineId: pipeline.id,
      status: 'queued',
      triggeredBy: auth.user?.id ?? null,
      queuedAt: new Date() as any,
      commitSha: commitSha ?? null,
      ref: ref ?? null,
    })
    return response.created({ data: run })
  }
}

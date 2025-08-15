import type { HttpContext } from '@adonisjs/core/http'
import PipelineRun from '#models/pipeline_run'
import Pipeline from '#models/pipeline'
import Job from '#models/job'
import YAML from 'yaml'

export default class RunsController {
  async latestByProject({ params, response }: HttpContext) {
    const projectId = Number(params.id)
    // get pipelines of project
    const pipelines = await Pipeline.query().where('project_id', projectId)
    const pipelineIds = pipelines.map((p) => p.id)
    if (pipelineIds.length === 0) return response.ok({ data: [] })
    // latest 10 runs across pipelines of the project
    const runs = await PipelineRun.query()
      .whereIn('pipeline_id', pipelineIds)
      .orderBy('created_at', 'desc')
      .limit(10)
    return response.ok({ data: runs })
  }

  async statsByProject({ params, response }: HttpContext) {
    const projectId = Number(params.id)
    const pipelines = await Pipeline.query().where('project_id', projectId)
    const pipelineIds = pipelines.map((p) => p.id)
    if (pipelineIds.length === 0) {
      return response.ok({
        data: { total: 0, success: 0, failed: 0, running: 0, queued: 0, canceled: 0 },
      })
    }
    const runs = await PipelineRun.query().whereIn('pipeline_id', pipelineIds)
    const stats = { total: runs.length, success: 0, failed: 0, running: 0, queued: 0, canceled: 0 }
    for (const r of runs) {
      if (r.status === 'success') stats.success++
      else if (r.status === 'failed') stats.failed++
      else if (r.status === 'running') stats.running++
      else if (r.status === 'queued') stats.queued++
      else if (r.status === 'canceled') stats.canceled++
    }
    return response.ok({ data: stats })
  }
  async show({ params, response }: HttpContext) {
    const run = await PipelineRun.find(params.id)
    if (!run) return response.notFound({ error: 'run not found' })
    const jobs = await Job.query().where('run_id', run.id).orderBy('step_index', 'asc')
    const counts = {
      queued: jobs.filter((j) => j.status === 'queued').length,
      running: jobs.filter((j) => j.status === 'running').length,
      success: jobs.filter((j) => j.status === 'success').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      canceled: jobs.filter((j) => j.status === 'canceled').length,
      total: jobs.length,
    }
    let aggregatedStatus: 'queued' | 'running' | 'success' | 'failed' | 'canceled' = 'queued'
    if (counts.failed > 0) aggregatedStatus = 'failed'
    else if (counts.running > 0) aggregatedStatus = 'running'
    else if (counts.success === counts.total && counts.total > 0) aggregatedStatus = 'success'
    else if (counts.canceled > 0) aggregatedStatus = 'canceled'
    else aggregatedStatus = counts.total > 0 ? 'queued' : run.status
    return response.ok({ data: run, jobs, counts, aggregatedStatus })
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
    // planifier les jobs depuis le YAML (stages[].steps[].run)
    try {
      const parsed = YAML.parse(pipeline.yaml)
      const stages = Array.isArray(parsed?.stages) ? parsed.stages : []
      let stepIndex = 0
      for (const stage of stages) {
        const steps = Array.isArray(stage?.steps) ? stage.steps : []
        for (const step of steps) {
          const command: string | undefined = step?.run
          if (!command) continue
          await Job.create({
            runId: run.id,
            stage: String(stage?.name ?? 'default'),
            stepIndex: stepIndex++,
            name: String(step?.name ?? `step-${stepIndex}`),
            status: 'queued',
            image: step?.image ?? null,
            command,
            logsLocation: null,
            artifactsLocation: null,
            exitCode: null,
          })
        }
      }
    } catch {
      // ignore parsing error for now
    }
    return response.created({ data: run })
  }

  async jobs({ params, response }: HttpContext) {
    const runId = Number(params.id)
    const jobs = await Job.query().where('run_id', runId).orderBy('step_index', 'asc')
    return response.ok({ data: jobs })
  }
}

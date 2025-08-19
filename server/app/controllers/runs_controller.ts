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

  async indexByProject({ params, request, response }: HttpContext) {
    const projectId = Number(params.id)
    const { page = 1, perPage = 10 } = request.qs()
    const pipelines = await Pipeline.query().where('project_id', projectId)
    const pipelineIds = pipelines.map((p) => p.id)
    if (pipelineIds.length === 0) {
      return response.ok({
        data: [],
        meta: { total: 0, perPage: Number(perPage), currentPage: Number(page), lastPage: 0 },
      })
    }
    const paginator = await PipelineRun.query()
      .whereIn('pipeline_id', pipelineIds)
      .orderBy('created_at', 'desc')
      .paginate(Number(page), Number(perPage))
    const json = paginator.toJSON()
    return response.ok({
      data: json.data,
      meta: {
        total: json.meta.total,
        perPage: json.meta.perPage,
        currentPage: json.meta.currentPage,
        lastPage: json.meta.lastPage,
      },
    })
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

  async deploy({ params, response, auth }: HttpContext) {
    const runId = Number(params.id)
    const run = await PipelineRun.find(runId)
    if (!run) return response.notFound({ error: 'run not found' })
    const pipeline = await Pipeline.find(run.pipelineId)
    if (!pipeline) return response.notFound({ error: 'pipeline not found' })

    // charger config projet via relation pipeline -> project_id
    const projectId = (pipeline as any).projectId
    const project = await (await import('#models/project')).default.find(projectId)
    if (!project) return response.notFound({ error: 'project not found' })
    let cfg: any = (project as any).config
    try {
      cfg = typeof cfg === 'string' ? JSON.parse(cfg) : cfg || {}
    } catch {
      cfg = {}
    }

    // déterminer le driver
    const runMode: string = cfg?.runMode || (cfg?.composePath ? 'compose' : cfg?.dockerfilePath ? 'dockerfile' : cfg?.startCommand ? 'command' : 'compose')
    const driver = runMode === 'compose' ? 'compose' : runMode === 'dockerfile' ? 'dockerfile' : 'command'

    // step_index suivant
    const last = await Job.query().where('run_id', run.id).orderBy('step_index', 'desc').first()
    const nextIndex = last ? last.stepIndex + 1 : 0

    const job = await Job.create({
      runId: run.id,
      stage: 'Deploy',
      stepIndex: nextIndex,
      name: `deploy:${driver}`,
      status: 'queued',
      image: null,
      command: `__shiply_deploy__:${driver}`,
      logsLocation: null,
      artifactsLocation: null,
      exitCode: null,
    })

    return response.created({ data: job })
  }

  async cancel({ params, response }: HttpContext) {
    const runId = Number(params.id)
    const run = await PipelineRun.find(runId)
    if (!run) return response.notFound({ error: 'run not found' })
    const jobs = await Job.query().where('run_id', run.id)
    const affectedRunnerIds = new Set<number>()
    for (const j of jobs) {
      if (j.status === 'queued' || j.status === 'running') {
        ;(j as any).status = 'canceled'
        ;(j as any).finishedAt = new Date() as any
        await j.save()
        const rid: number | null = (j as any).runnerId ?? null
        if (rid) affectedRunnerIds.add(rid)
      }
    }
    ;(run as any).status = 'canceled'
    ;(run as any).finishedAt = new Date() as any
    await run.save()

    // Mettre à jour les runners affectés pour les remettre 'online' si plus rien ne tourne
    const { default: Runner } = await import('#models/runner')
    for (const rid of affectedRunnerIds) {
      const count = await Job.query().where('runner_id', rid).where('status', 'running').count('* as total')
      const total = Number((count[0] as any)?.$extras?.total ?? 0)
      const runner = await Runner.find(rid)
      if (runner) {
        ;(runner as any).currentRunning = total
        ;(runner as any).status = total > 0 ? 'busy' : 'online'
        ;(runner as any).lastHeartbeatAt = new Date() as any
        await runner.save()
      }
    }
    return response.ok({ data: run })
  }
}

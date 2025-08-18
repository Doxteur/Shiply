import type { HttpContext } from '@adonisjs/core/http'
import Job from '#models/job'
import PipelineRun from '#models/pipeline_run'
import Pipeline from '#models/pipeline'
import Project from '#models/project'
import * as RepoWorkspace from '#services/repo_workspace_service'
import path from 'node:path'

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

    // Mettre à jour l'état agrégé du run
    const run = await PipelineRun.find(job.runId)
    if (run) {
      const jobs = await Job.query().where('run_id', run.id)
      const total = jobs.length
      const counts = {
        queued: jobs.filter((j) => j.status === 'queued').length,
        running: jobs.filter((j) => j.status === 'running').length,
        success: jobs.filter((j) => j.status === 'success').length,
        failed: jobs.filter((j) => j.status === 'failed').length,
        canceled: jobs.filter((j) => j.status === 'canceled').length,
      }
      let aggregated: 'queued' | 'running' | 'success' | 'failed' | 'canceled' = run.status
      if (counts.failed > 0) aggregated = 'failed'
      else if (counts.running > 0 || counts.queued > 0) aggregated = 'running'
      else if (counts.success === total && total > 0) aggregated = 'success'
      else if (counts.canceled > 0) aggregated = 'canceled'

      if (aggregated !== run.status) {
        ;(run as any).status = aggregated
      }
      if (!run.startedAt) {
        ;(run as any).startedAt = new Date() as any
      }
      if (aggregated === 'success' || aggregated === 'failed' || aggregated === 'canceled') {
        ;(run as any).finishedAt = new Date() as any
      }
      await run.save()
    }

    return response.ok({ data: job })
  }

  async context({ params, response }: HttpContext) {
    const id = Number(params.id)
    const job = await Job.find(id)
    if (!job) return response.notFound({ error: 'job not found' })
    const run = await PipelineRun.find(job.runId)
    if (!run) return response.notFound({ error: 'run not found' })
    const pipeline = await Pipeline.find(run.pipelineId)
    if (!pipeline) return response.notFound({ error: 'pipeline not found' })
    const project = await Project.find(pipeline.projectId)
    if (!project) return response.notFound({ error: 'project not found' })

    let cfg: any = (project as any).config
    try {
      cfg = typeof cfg === 'string' ? JSON.parse(cfg) : cfg || {}
    } catch {
      cfg = {}
    }

    const workspaceRoot = await RepoWorkspace.ensureWorkspace()
    const projectDirName = `project_${project.id}`
    const projectPath = path.resolve(workspaceRoot, projectDirName)
    const rootPath: string = (cfg?.rootPath ?? '').toString().replace(/^\/+|\/+$/g, '')
    const workdirHost = rootPath ? path.resolve(projectPath, rootPath) : projectPath
    const workdirInContainer = rootPath ? `/workspace/${rootPath}` : '/workspace'
    const envVars: Array<{ key: string; value: string }> = Array.isArray(cfg?.envVars) ? cfg.envVars : []

    return response.ok({
      data: {
        projectId: project.id,
        workspaceRoot,
        projectPath,
        workdirHost,
        workdirInContainer,
        envVars,
      },
    })
  }
}

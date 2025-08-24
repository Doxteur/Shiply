import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import { errors } from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import * as RepoWorkspace from '#services/repo_workspace_service'
import UserIntegration from '#models/user_integration'
import * as CryptoService from '#services/crypto_service'
import env from '#start/env'

export default class ProjectsController {
  async index({ response }: HttpContext) {
    const projects = await Project.query().orderBy('created_at', 'desc')
    return response.ok({ data: projects })
  }

  async store({ request, response, auth }: HttpContext) {
    const { name, key, description, config } = request.only([
      'name',
      'key',
      'description',
      'config',
    ])
    if (!name || !key) {
      throw new errors.E_VALIDATION_ERROR('name et key sont requis')
    }
    const exists = await Project.findBy('key', key)
    if (exists) {
      throw new errors.E_VALIDATION_ERROR('key déjà utilisée')
    }
    const payload: any = {
      name,
      key,
      description: description ?? null,
      createdBy: auth.user?.id ?? null,
    }
    if (config) {
      payload.config = JSON.stringify(config)
    }
    const project = await Project.create(payload)
    // Normaliser la sortie: parser config si string
    if ((project as any).config && typeof (project as any).config === 'string') {
      try {
        ;(project as any).config = JSON.parse((project as any).config)
      } catch {}
    }
    return response.created({ data: project })
  }

  async updateConfig({ request, response, params }: HttpContext) {
    const id = Number(params.id)
    const body = request.only([
      'runMode',
      'startCommand',
      'dockerfilePath',
      'composePath',
      'defaultBranch',
      'rootPath',
      'envVars',
      // champs nécessaires à la synchro GitHub
      'repositoryFullName',
      'pipelinePath',
    ])
    // Normaliser rootPath null -> '/'
    if (Object.hasOwn?.(body, 'rootPath') && body.rootPath === null) {
      ;(body as any).rootPath = '/'
    }
    const project = await Project.find(id)
    if (!project) return response.notFound({ error: 'project not found' })
    // merge léger (MVP): récupérer actuel
    const currentRaw = (project as any).config
    let current: Record<string, unknown> = {}
    try {
      current = typeof currentRaw === 'string' ? JSON.parse(currentRaw) : currentRaw || {}
    } catch {
      current = {}
    }
    const next = { ...current, ...body }
    await db
      .from('projects')
      .where('id', id)
      .update({ config: JSON.stringify(next), updated_at: new Date() as any })
    const updated = await Project.find(id)
    if (updated && typeof (updated as any).config === 'string') {
      try {
        ;(updated as any).config = JSON.parse((updated as any).config)
      } catch (e) {
        console.error(e)
      }
    }
    // Si repoFullName est défini, on matérialise le repo dans le workspace
    try {
      const repoFullName = (next as any).repositoryFullName as string | undefined
      const defaultBranch = (next as any).defaultBranch as string | undefined
      if (repoFullName) {
        // Récupérer le token GitHub de l'utilisateur courant (MVP: premier du provider)
        const integ = await UserIntegration.query().where('provider', 'github').first()
        const token = integ
          ? CryptoService.decryptString(integ.accessTokenEnc, env.get('APP_KEY'))
          : undefined
        const targetDirName = `project_${id}`
        await RepoWorkspace.cloneOrUpdateRepo({
          repoFullName,
          branch: defaultBranch,
          targetDirName,
          githubToken: token,
        })
      }
    } catch (e) {
      // Ne pas bloquer la réponse si le clone échoue; retourner l'info au client
      return response.ok({ data: updated, cloneError: String(e) })
    }

    return response.ok({ data: updated })
  }

  async destroy({ params, response }: HttpContext) {
    const id = Number(params.id)
    const project = await Project.find(id)
    if (!project) return response.notFound({ error: 'project not found' })

    // Empêcher la suppression si des runs sont en cours/queue
    const busy = await db
      .from('pipeline_runs')
      .join('pipelines', 'pipeline_runs.pipeline_id', 'pipelines.id')
      .where('pipelines.project_id', id)
      .whereIn('pipeline_runs.status', ['queued', 'running'])
      .count('* as total')
    const total = Number((busy[0] as any)?.total ?? (busy[0] as any)?.['count(*)'] ?? 0)
    if (total > 0) {
      return response.conflict({ error: 'project has running or queued runs' })
    }

    await db.from('projects').where('id', id).delete()
    try {
      await RepoWorkspace.removeProjectWorkspace(id)
    } catch {}
    return response.ok({ success: true, message: 'project deleted' })
  }
}

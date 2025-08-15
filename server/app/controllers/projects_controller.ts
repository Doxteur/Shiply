import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import { errors } from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

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
    ])
    // Normaliser rootPath null -> '/'
    if (Object.prototype.hasOwnProperty.call(body, 'rootPath') && body.rootPath === null) {
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
      } catch {}
    }
    return response.ok({ data: updated })
  }
}

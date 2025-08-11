import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import { errors } from '@vinejs/vine'

export default class ProjectsController {
  async index({ response }: HttpContext) {
    const projects = await Project.query().orderBy('created_at', 'desc')
    return response.ok({ data: projects })
  }

  async store({ request, response, auth }: HttpContext) {
    const { name, key, description } = request.only(['name', 'key', 'description'])
    if (!name || !key) {
      throw new errors.E_VALIDATION_ERROR('name et key sont requis')
    }
    const exists = await Project.findBy('key', key)
    if (exists) {
      throw new errors.E_VALIDATION_ERROR('key déjà utilisée')
    }
    const project = await Project.create({
      name,
      key,
      description: description ?? null,
      createdBy: auth.user?.id ?? null,
    })
    return response.created({ data: project })
  }
}

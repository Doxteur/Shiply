import type { HttpContext } from '@adonisjs/core/http'
import Pipeline from '#models/pipeline'
import Project from '#models/project'
import { errors } from '@vinejs/vine'

export default class PipelinesController {
  async store({ request, response, params }: HttpContext) {
    const projectId = Number(params.id)
    const { name, yaml, version, environmentId } = request.only([
      'name',
      'yaml',
      'version',
      'environmentId',
    ])
    if (!name || !yaml) {
      throw new errors.E_VALIDATION_ERROR('name et yaml sont requis')
    }
    const project = await Project.find(projectId)
    if (!project) {
      return response.notFound({ error: 'project not found' })
    }
    const pipeline = await Pipeline.create({
      projectId: project.id,
      name,
      yaml,
      version: version ?? '1',
      environmentId: environmentId ?? null,
    })
    return response.created({ data: pipeline })
  }
}

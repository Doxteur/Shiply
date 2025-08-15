import type { HttpContext } from '@adonisjs/core/http'
import Pipeline from '#models/pipeline'
import Project from '#models/project'
import { errors } from '@vinejs/vine'
import YAML from 'yaml'
import { pipelineJsonSchema } from '#services/pipeline_schema'

export default class PipelinesController {
  async index({ params, response }: HttpContext) {
    const projectId = Number(params.id)
    const project = await Project.find(projectId)
    if (!project) {
      return response.notFound({ error: 'project not found' })
    }
    const pipelines = await Pipeline.query().where('project_id', projectId).orderBy('created_at', 'desc')
    return response.ok({ data: pipelines })
  }

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
    // Validate YAML (JSON Schema)
    try {
      const parsed = YAML.parse(yaml)
      const ajvPkg = await import('ajv')
      const AjvModule = ajvPkg.default as unknown as { new (opts?: any): any }
      const ajv = new AjvModule({ allErrors: true })
      const validate = ajv.compile(pipelineJsonSchema as any)
      const ok = validate(parsed)
      if (!ok) {
        return response.status(422).json({ error: 'invalid_yaml', details: validate.errors })
      }
    } catch (e) {
      return response.status(422).json({ error: 'invalid_yaml_parse', details: String(e) })
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

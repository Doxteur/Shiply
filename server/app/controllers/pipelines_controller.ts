import type { HttpContext } from '@adonisjs/core/http'
import Pipeline from '#models/pipeline'
import Project from '#models/project'
import { errors } from '@vinejs/vine'
import YAML from 'yaml'
import { pipelineJsonSchema } from '#services/pipeline_schema'
import UserIntegration from '#models/user_integration'
import * as CryptoService from '#services/crypto_service'
import env from '#start/env'

export default class PipelinesController {
  private async getGithubDefaultBranch(
    repoFullName: string,
    token: string
  ): Promise<string | undefined> {
    try {
      const repoInfo = await fetch(`https://api.github.com/repos/${repoFullName}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      })
      if (!repoInfo.ok) return undefined
      const info = (await repoInfo.json()) as any
      return typeof info?.default_branch === 'string' ? info.default_branch : undefined
    } catch {
      return undefined
    }
  }

  private buildRefCandidates(
    refOverride?: string,
    configDefaultBranch?: string,
    repoDefaultBranch?: string
  ): string[] {
    const list: string[] = []
    if (refOverride && !list.includes(refOverride)) list.push(refOverride)
    if (configDefaultBranch && !list.includes(configDefaultBranch)) list.push(configDefaultBranch)
    if (repoDefaultBranch && !list.includes(repoDefaultBranch)) list.push(repoDefaultBranch)

    // Ajoute un fallback commun
    if (!list.includes('main')) list.push('main')
    if (!list.includes('develop')) list.push('develop')

    return list
  }

  private buildCandidatePaths(rootPath: string, basePath: string): string[] {
    const encodePath = (p: string) =>
      p
        .split('/')
        .map((s) => encodeURIComponent(s))
        .join('/')
    const encoded: string[] = []

    const rootPrefix = rootPath ? `${rootPath}/` : ''
    const full = rootPath ? `${rootPath}/${basePath}` : basePath
    encoded.push(encodePath(full))

    const candidateFiles = [
      '.shiply.yml',
      '.shiply.yaml',
      'shiply.yml',
      'shiply.yaml',
      'deploy.shiply.yml',
      'deploy.shiply.yaml',
    ]
    const candidateDirs = [
      '',
      '.github',
      '.github/workflows',
      'ci',
      'pipelines',
      '.shiply',
      'config',
      'deploy',
      'pipeline',
    ]

    const seen = new Set<string>(encoded)
    for (const dir of candidateDirs) {
      const dirPrefix = dir ? `${rootPrefix}${dir}/` : rootPrefix
      for (const file of candidateFiles) {
        const p = encodePath(`${dirPrefix}${file}`)
        if (!seen.has(p)) {
          seen.add(p)
          encoded.push(p)
        }
      }
    }

    return encoded
  }

  private async tryFetchGithubFile(
    repoFullName: string,
    token: string,
    encodedPaths: string[],
    refs: string[]
  ): Promise<{
    yamlText: string | null
    lastUrl: string
    usedRef?: string
    tried: Array<{ url: string; status: number; message?: string }>
  }> {
    const tried: Array<{ url: string; status: number; message?: string }> = []
    let lastUrl = ''
    for (const r of refs) {
      for (const p of encodedPaths) {
        const url = `https://api.github.com/repos/${repoFullName}/contents/${p}?ref=${encodeURIComponent(r)}`
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3.raw' },
        })
        lastUrl = url
        if (res.ok) {
          const text = await res.text()
          return { yamlText: text, lastUrl, usedRef: r, tried }
        }
        let message: string | undefined
        try {
          const j = (await res.json()) as any
          if (typeof j?.message === 'string') message = j.message
        } catch {
          try {
            message = await res.text()
          } catch {
            message = undefined
          }
        }
        tried.push({ url, status: res.status, message })
      }
    }
    return { yamlText: null, lastUrl, usedRef: undefined, tried }
  }

  private async validatePipelineYaml(
    yamlText: string
  ): Promise<{ ok: true } | { ok: false; details: unknown }> {
    try {
      const parsed = YAML.parse(yamlText)
      const ajvPkg = await import('ajv')
      const AjvModule = ajvPkg.default as unknown as { new (opts?: any): any }
      const ajv = new AjvModule({ allErrors: true })
      const validate = ajv.compile(pipelineJsonSchema as any)
      const ok = validate(parsed)
      if (!ok) return { ok: false, details: validate.errors }
      return { ok: true }
    } catch (e) {
      return { ok: false, details: String(e) }
    }
  }

  async index({ params, response }: HttpContext) {
    const projectId = Number(params.id)
    const project = await Project.find(projectId)
    if (!project) {
      return response.notFound({ error: 'project not found' })
    }
    const pipelines = await Pipeline.query()
      .where('project_id', projectId)
      .orderBy('created_at', 'desc')
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

  async syncFromRepo({ params, auth, request, response }: HttpContext) {
    const projectId = Number(params.id)
    const { pipelinePath, ref: refOverride } = request.only(['pipelinePath', 'ref'])
    const project = await Project.find(projectId)
    if (!project) return response.notFound({ error: 'project not found' })

    const userId = auth.user?.id
    if (!userId) return response.unauthorized({ error: 'unauthorized' })

    const cfg = (project.config as any) || {}
    const repoFullName = cfg?.repositoryFullName
    const rootPathRaw: string = (cfg?.rootPath ?? '').toString()
    const rootPath = rootPathRaw.replace(/(^\/+|\/+$)/g, '')
    const basePathRaw: string = (pipelinePath || cfg?.pipelinePath || '.shiply.yml').toString()
    const basePath = basePathRaw.replace(/^\/+/, '')
    let ref: string | undefined = refOverride || cfg?.defaultBranch
    if (!repoFullName)
      return response.badRequest({ error: 'missing repositoryFullName in project.config' })

    // get github token for user
    const integ = await UserIntegration.query()
      .where('user_id', userId)
      .andWhere('provider', 'github')
      .first()
    if (!integ) return response.badRequest({ error: 'no github integration' })
    const token = CryptoService.decryptString(integ.accessTokenEnc, env.get('APP_KEY'))

    // refs candidates
    const repoDefaultBranch = await this.getGithubDefaultBranch(repoFullName, token)
    const refCandidates = this.buildRefCandidates(
      refOverride,
      cfg?.defaultBranch,
      repoDefaultBranch
    )

    // chemins candidats
    const tryPaths = this.buildCandidatePaths(rootPath, basePath)

    const fetched = await this.tryFetchGithubFile(repoFullName, token, tryPaths, refCandidates)
    const yamlText = fetched.yamlText
    const lastUrl = fetched.lastUrl
    const lastRefUsed = fetched.usedRef
    const tried = fetched.tried
    if (lastRefUsed) ref = lastRefUsed
    if (!yamlText) {
      return response.badRequest({
        error: 'github_fetch_failed',
        status: tried[tried.length - 1]?.status ?? 0,
        url: lastUrl,
        repositoryFullName: repoFullName,
        fullPath: rootPath ? `${rootPath}/${basePath}` : basePath,
        ref,
        tried,
      })
    }

    // validate YAML
    const validation = await this.validatePipelineYaml(yamlText)
    if (!validation.ok) {
      return response
        .status(422)
        .json({ error: 'invalid_yaml', details: (validation as any).details })
    }

    // create or update pipeline (single default)
    let pipeline = await Pipeline.query()
      .where('project_id', projectId)
      .andWhere('name', 'repository-sync')
      .first()
    if (!pipeline) {
      pipeline = await Pipeline.create({
        projectId,
        name: 'repository-sync',
        version: '1',
        yaml: yamlText,
        environmentId: null,
      })
    } else {
      pipeline.merge({ yaml: yamlText })
      await pipeline.save()
    }
    return response.ok({ data: pipeline })
  }
}

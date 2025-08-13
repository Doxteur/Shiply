import type { HttpContext } from '@adonisjs/core/http'
import Job from '#models/job'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export default class JobLogsController {
  private getLogsDir() {
    return path.resolve(process.cwd(), 'storage', 'logs', 'jobs')
  }

  private async ensureDir(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true })
  }

  private getJobLogPath(jobId: number) {
    return path.join(this.getLogsDir(), `${jobId}.log`)
  }

  async append({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    const job = await Job.find(id)
    if (!job) return response.notFound({ error: 'job not found' })

    const { chunk } = request.only(['chunk']) as { chunk?: string }
    if (!chunk) return response.badRequest({ error: 'chunk is required' })

    const dir = this.getLogsDir()
    await this.ensureDir(dir)
    const filePath = this.getJobLogPath(id)
    await fs.appendFile(filePath, chunk)

    if (!job.logsLocation) {
      job.logsLocation = `/logs/jobs/${id}.log`
      await job.save()
    }

    return response.ok({ success: true })
  }

  async show({ params, response }: HttpContext) {
    const id = Number(params.id)
    const filePath = this.getJobLogPath(id)
    try {
      const content = await fs.readFile(filePath, 'utf8')
      response.header('Content-Type', 'text/plain; charset=utf-8')
      return response.ok(content)
    } catch {
      return response.notFound({ error: 'logs not found' })
    }
  }
}

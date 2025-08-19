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
      // Si le fichier de logs n'existe pas encore, retourner 200 vide pour éviter un 404 côté front
      response.header('Content-Type', 'text/plain; charset=utf-8')
      return response.ok('')
    }
  }

  async stream({ params, response, request }: HttpContext) {
    const id = Number(params.id)
    const filePath = this.getJobLogPath(id)
    response.header('Content-Type', 'text/event-stream')
    response.header('Cache-Control', 'no-cache')
    response.header('Connection', 'keep-alive')
    response.response.write(`: connected\n\n`)

    const qs = request.qs() as Record<string, string | undefined>
    const once =
      (qs.once || '').toString().toLowerCase() === '1' ||
      (qs.once || '').toString().toLowerCase() === 'true'

    let lastSize = 0
    let interval: NodeJS.Timeout | null = null

    const pushChunk = async () => {
      try {
        const stats = await fs.stat(filePath).catch(() => null)
        if (!stats) return
        if (stats.size > lastSize) {
          const buf = await fs.readFile(filePath, { encoding: 'utf8' })
          const slice = buf.slice(lastSize)
          lastSize = stats.size
          if (slice) {
            const data = slice.replace(/\r/g, '\n')
            response.response.write(`data: ${data}\n\n`)
          }
        }
      } catch {}
    }

    // push immediately once
    await pushChunk()
    if (once) {
      try {
        response.response.end()
      } catch {}
      return
    }

    interval = setInterval(pushChunk, 500)

    request.request.on('close', () => {
      if (interval) clearInterval(interval)
      try {
        response.response.end()
      } catch {}
    })
  }
}

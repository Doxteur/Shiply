import axios from 'axios'
import Docker from 'dockerode'
import type { Readable } from 'node:stream'
import fs from 'node:fs'
import path from 'node:path'

const API_URL = process.env.API_URL || 'http://localhost:3333'
const api = axios.create({ baseURL: API_URL, timeout: 3000 })
const RUNNER_NAME = process.env.RUNNER_NAME || `runner-${Math.random().toString(36).slice(2, 8)}`

async function heartbeat() {
  await api.post(`/runners/heartbeat`, {
    name: RUNNER_NAME,
    labels: { docker: false },
    maxConcurrency: 1,
  })
}

async function claim() {
  const res = await api.post(`/runners/claim`, { name: RUNNER_NAME })
  return res.data?.data ?? null
}

async function tryClient(client: Docker): Promise<boolean> {
  try {
    await client.ping()
    return true
  } catch {
    return false
  }
}

async function createDockerClient(): Promise<Docker> {
  // 1) Respect DOCKER_HOST if present
  if (process.env.DOCKER_HOST) {
    const c = new Docker()
    console.log(`[docker] Trying DOCKER_HOST=${process.env.DOCKER_HOST}`)
    if (await tryClient(c)) return c
    console.warn('[docker] DOCKER_HOST unreachable, trying fallbacks...')
  }

  // 2) Windows named pipe
  if (process.platform === 'win32') {
    const npipe = '//./pipe/docker_engine'
    const c = new Docker({ socketPath: npipe })
    console.log(`[docker] Trying Windows named pipe ${npipe}`)
    if (await tryClient(c)) return c
  }

  // 3) Unix socket (WSL/Unix)
  const unixSock = '/var/run/docker.sock'
  const c = new Docker({ socketPath: unixSock })
  console.log(`[docker] Trying unix socket ${unixSock}`)
  if (await tryClient(c)) return c

  throw new Error(
    'Docker daemon inaccessible. Set DOCKER_HOST=npipe:////./pipe/docker_engine on Windows (or enable tcp://localhost:2375), or ensure /var/run/docker.sock exists.'
  )
}

function sanitizeLogText(input: string): string {
  // Remplacer les retours chariot par des sauts de ligne
  let out = input.replace(/\r/g, "\n")
  // Supprimer les séquences ANSI/VT100 couleurs et commandes courantes
  out = out.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '')
  // Nettoyer OSC (]... BEL or ST)
  out = out.replace(/\x1B\].*?(\x07|\x1B\\)/g, '')
  // Compacter les lignes multiples créées par les CR
  out = out.replace(/\n{3,}/g, '\n\n')
  return out
}

async function execJob(job: any) {
  // Récupérer le contexte d'exécution (montage workspace + env)
  const ctxRes = await api.get(`/jobs/${job.id}/context`)
  const ctx = ctxRes.data?.data || {}
  const workdirHost: string = ctx.workdirHost
  const workdirInContainer: string = ctx.workdirInContainer || '/workspace'
  const envVars: Array<{ key: string; value: string }> = Array.isArray(ctx.envVars) ? ctx.envVars : []
  if (!workdirHost || !fs.existsSync(workdirHost)) {
    throw new Error(`workspace does not exist: ${workdirHost}`)
  }
  const docker = await createDockerClient()
  const image = job.image || 'alpine:3.20'
  const cmd = ['/bin/sh', '-lc', job.command]
  console.log(`[job:${job.id}] Pulling image ${image} ...`)
  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (err: unknown, stream?: Readable) => {
      if (err) return reject(err)
      if (!stream) return resolve()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(docker.modem as any).followProgress(stream, (progressErr: unknown) =>
        progressErr ? reject(progressErr) : resolve()
      )
    })
  })
  console.log(`[job:${job.id}] Running in container...`)
  const container = await docker.createContainer({
    Image: image,
    Cmd: cmd,
    Tty: false,
    WorkingDir: workdirInContainer,
    HostConfig: {
      Binds: [
        `${path.resolve(workdirHost)}:${workdirInContainer}:rw`,
      ],
    },
    Env: [
      ...envVars.map((e) => `${e.key}=${e.value}`),
      'NO_COLOR=1',
      'FORCE_COLOR=0',
      'CI=1',
      'TERM=dumb',
    ],
  })
  try {
    // Attacher le flux avant le démarrage pour ne rien perdre
    const attach = await container.attach({ stream: true, stdout: true, stderr: true })
    let pending = ''
    let flushTimer: NodeJS.Timeout | null = null
    const flush = async () => {
      if (!pending) return
      const sending = pending
      pending = ''
      try {
        await api.post(`/jobs/${job.id}/logs`, { chunk: sending })
      } catch {
        // on ignore pour la robustesse
      }
    }
    const scheduleFlush = () => {
      if (flushTimer) return
      flushTimer = setTimeout(async () => {
        flushTimer = null
        await flush()
      }, 200)
    }
    attach.on('data', (buf: Buffer) => {
      pending += sanitizeLogText(buf.toString('utf8'))
      scheduleFlush()
    })
    attach.on('error', () => {
      // best effort
      void flush()
    })
    attach.on('end', () => {
      // best effort
      void flush()
    })
    await container.start()
    const wait = await container.wait()
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    await flush()
    const exitCode = wait.StatusCode ?? 1
    await api.post(`/jobs/${job.id}/finish`, {
      status: exitCode === 0 ? 'success' : 'failed',
      exitCode,
      logsLocation: null,
      artifactsLocation: null,
    })
  } finally {
    try {
      await container.remove({ force: true })
    } catch {}
  }
}

async function waitForApi() {
  const start = Date.now()
  const retryMs = 1000
  for (;;) {
    try {
      await api.get('/health')
      console.log(`[api] Ready after ${Date.now() - start}ms → ${API_URL}`)
      return
    } catch (e) {
      process.stdout.write('.')
      await new Promise((r) => setTimeout(r, retryMs))
    }
  }
}

async function main() {
  console.log(`Runner started: ${RUNNER_NAME} → ${API_URL}`)
  await waitForApi()
  // simple loop
  // deno-lint-ignore no-constant-condition
  while (true) {
    try {
      await heartbeat()
      const job = await claim()
      if (job) await execJob(job)
    } catch (e) {
      console.error('runner loop error', e)
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
}

main()



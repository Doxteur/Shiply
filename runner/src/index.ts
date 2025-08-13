import axios from 'axios'
import Docker from 'dockerode'
import type { Readable } from 'node:stream'

const API_URL = process.env.API_URL || 'http://localhost:3333'
const RUNNER_NAME = process.env.RUNNER_NAME || `runner-${Math.random().toString(36).slice(2, 8)}`

async function heartbeat() {
  await axios.post(`${API_URL}/runners/heartbeat`, {
    name: RUNNER_NAME,
    labels: { docker: false },
    maxConcurrency: 1,
  })
}

async function claim() {
  const res = await axios.post(`${API_URL}/runners/claim`, { name: RUNNER_NAME })
  return res.data?.data ?? null
}

async function execJob(job: any) {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' })
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
  const container = await docker.createContainer({ Image: image, Cmd: cmd, Tty: true })
  try {
    await container.start()
    const wait = await container.wait()
    const exitCode = wait.StatusCode ?? 1
    // Récupérer les logs après exécution
    const raw = (await container.logs({ stdout: true, stderr: true, timestamps: false })) as Buffer
    try {
      await axios.post(`${API_URL}/jobs/${job.id}/logs`, { chunk: raw.toString('utf8') })
    } catch (e) {
      console.error('append log failed', e)
    }
    await axios.post(`${API_URL}/jobs/${job.id}/finish`, {
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

async function main() {
  console.log(`Runner started: ${RUNNER_NAME} → ${API_URL}`)
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



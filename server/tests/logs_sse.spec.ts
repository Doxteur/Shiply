import { test } from '@japa/runner'
import { getAuthToken } from './utils/auth.js'
import http from 'node:http'

test.group('Logs SSE', () => {
  test('SSE stream returns appended logs', async ({ client, assert }) => {
    const token = await getAuthToken(client)

    // Create project
    const proj = await client
      .post('/projects')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'SSE', key: `SSE_${Date.now()}` })
    proj.assertStatus(201)
    const projectId = proj.body().data.id as number

    // Create pipeline (single step)
    const pipe = await client
      .post(`/projects/${projectId}/pipelines`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'p',
        yaml: `version: 1\nname: sse\nstages:\n  - name: build\n    steps:\n      - run: echo hi`,
      })
    pipe.assertStatus(201)
    const pipelineId = pipe.body().data.id as number

    // Run
    const run = await client
      .post(`/pipelines/${pipelineId}/run`)
      .header('Authorization', `Bearer ${token}`)
      .json({})
    run.assertStatus(201)
    const runId = run.body().data.id as number

    // Get job id
    const jobsRes = await client
      .get(`/runs/${runId}/jobs`)
      .header('Authorization', `Bearer ${token}`)
      .json({})
    jobsRes.assertStatus(200)
    const jobId = jobsRes.body().data[0].id as number

    // Append a chunk so SSE has something to deliver
    const append = await client.post(`/jobs/${jobId}/logs`).json({ chunk: 'hello-sse\n' })
    append.assertStatus(200)

    // Connect SSE and expect to receive the chunk
    const chunks: string[] = []
    await new Promise<void>((resolve, reject) => {
      const req = http.get(`http://localhost:3333/jobs/${jobId}/logs/stream?once=1`, (res) => {
        res.setEncoding('utf8')
        const onData = (d: string) => {
          chunks.push(d)
          if (chunks.join('').includes('hello-sse')) {
            res.removeListener('data', onData)
            try {
              req.destroy()
            } catch {
              console.error('req.destroy() failed')
            }
            res.destroy()
            resolve()
          }
        }
        res.on('data', onData)
      })
      req.on('error', reject)
    })

    assert.ok(chunks.join('').length > 0)
  })
})

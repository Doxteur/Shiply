import { test } from '@japa/runner'
import { getAuthToken } from './utils/auth.js'

test.group('Runs jobs listing and aggregation', () => {
  test('list jobs of a run and get aggregated status', async ({ client, assert }) => {
    const token = await getAuthToken(client)

    // Create project
    const proj = await client
      .post('/projects')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Agg', key: `AGG_${Date.now()}` })
    proj.assertStatus(201)
    const projectId = proj.body().data.id as number

    // Create pipeline with one step
    const pipe = await client
      .post(`/projects/${projectId}/pipelines`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'p',
        yaml: 'version: 1\nname: agg\nstages:\n  - name: build\n    steps:\n      - run: echo hi',
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

    // List jobs of the run (may be queued or running)
    const list = await client.get(`/runs/${runId}/jobs`).header('Authorization', `Bearer ${token}`)
    list.assertStatus(200)
    assert.isArray(list.body().data)

    // Get run with aggregation
    const show = await client.get(`/runs/${runId}`).header('Authorization', `Bearer ${token}`)
    show.assertStatus(200)
    assert.exists(show.body().aggregatedStatus)
    assert.exists(show.body().counts)
  })
})

import { test } from '@japa/runner'
import { getAuthToken } from './utils/auth.js'

test.group('Projects, Pipelines, Runs', () => {
  test('create project, create pipeline, trigger run, get run', async ({ client, assert }) => {
    const token = await getAuthToken(client)

    // Create project
    const projRes = await client
      .post('/projects')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'Demo', key: `DEMO_${Date.now()}`, description: 'Demo project' })
    projRes.assertStatus(201)
    const projectId = projRes.body().data.id as number
    assert.ok(projectId)

    // List projects
    const listRes = await client.get('/projects').header('Authorization', `Bearer ${token}`)
    listRes.assertStatus(200)
    assert.isArray(listRes.body().data)

    // Create pipeline
    const pipelineRes = await client
      .post(`/projects/${projectId}/pipelines`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'build-test-deploy',
        yaml: 'version: 1\nname: build-test-deploy\nstages: []',
      })
    pipelineRes.assertStatus(201)
    const pipelineId = pipelineRes.body().data.id as number
    assert.ok(pipelineId)

    // Trigger run
    const runRes = await client
      .post(`/pipelines/${pipelineId}/run`)
      .header('Authorization', `Bearer ${token}`)
      .json({ ref: 'main' })
    runRes.assertStatus(201)
    const runId = runRes.body().data.id as number
    assert.ok(runId)

    // Get run
    const getRun = await client.get(`/runs/${runId}`).header('Authorization', `Bearer ${token}`)
    getRun.assertStatus(200)
    assert.equal(getRun.body().data.id, runId)
  })
})



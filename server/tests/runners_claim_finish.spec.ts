import { test } from '@japa/runner'
import { getAuthToken } from './utils/auth.js'

test.group('Runners claim & finish', () => {
  test('claim a queued job and finish it', async ({ client, assert }) => {
    const token = await getAuthToken(client)

    // Create project & pipeline with one step
    const proj = await client
      .post('/projects')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'ClaimProj', key: `CLM_${Date.now()}` })
    proj.assertStatus(201)
    const projectId = proj.body().data.id as number

    const pipe = await client
      .post(`/projects/${projectId}/pipelines`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        name: 'p',
        yaml: `version: 1\nname: p\nstages:\n  - name: build\n    steps:\n      - run: echo "hi"`,
      })
    pipe.assertStatus(201)
    const pipelineId = pipe.body().data.id as number

    const run = await client
      .post(`/pipelines/${pipelineId}/run`)
      .header('Authorization', `Bearer ${token}`)
      .json({})
    run.assertStatus(201)

    // Runner heartbeats and claims
    const hb = await client.post('/runners/heartbeat').json({ name: 'runner-A' })
    console.log('hb', hb.body())
    hb.assertStatus(200)

    const claim = await client.post('/runners/claim').json({ name: 'runner-A' })
    claim.assertStatus(200)
    assert.ok(claim.body().data)
    const jobId = claim.body().data.id as number

    // Finish the job
    const fin = await client.post(`/jobs/${jobId}/finish`).json({
      status: 'success',
      exitCode: 0,
      logsLocation: '/tmp/log',
      artifactsLocation: '/tmp/art',
    })
    fin.assertStatus(200)
    assert.equal(fin.body().data.status, 'success')
  })
})

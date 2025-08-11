import { test } from '@japa/runner'

test.group('Runners & Metrics', () => {
  test('runner heartbeat upserts and metrics are exposed', async ({ client, assert }) => {
    const hb = await client.post('/runners/heartbeat').json({
      name: `runner_${Date.now()}`,
      labels: { docker: true },
      maxConcurrency: 2,
    })
    hb.assertStatus(200)
    assert.equal(hb.body().data.status, 'online')

    const metrics = await client.get('/metrics')
    metrics.assertStatus(200)
    assert.include(metrics.text(), 'shiply_up 1')
  })
})



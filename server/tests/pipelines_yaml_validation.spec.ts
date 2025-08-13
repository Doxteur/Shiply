import { test } from '@japa/runner'
import { getAuthToken } from './utils/auth.js'

test.group('Pipelines YAML validation', () => {
  test('rejects invalid yaml (no stages)', async ({ client, assert }) => {
    const token = await getAuthToken(client)

    const proj = await client
      .post('/projects')
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'YAMLInvalid', key: `YIN_${Date.now()}` })
    proj.assertStatus(201)
    const projectId = proj.body().data.id as number

    const res = await client
      .post(`/projects/${projectId}/pipelines`)
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'p', yaml: 'version: 1\nname: demo' })
    res.assertStatus(422)
    assert.equal(res.body().error, 'invalid_yaml')
  })
})

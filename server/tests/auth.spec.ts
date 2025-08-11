import { test } from '@japa/runner'

test.group('Auth', () => {
  test('register then login', async ({ client, assert }) => {
    const email = `u_${Date.now()}@example.com`
    const password = 'password123!'
    const fullName = 'Jane Doe'

    const register = await client.post('/auth/register').json({ email, password, fullName })
    register.assertStatus(201)
    assert.exists(register.body().token)

    const login = await client.post('/auth/login').json({ email, password })
    login.assertStatus(200)
    assert.exists(login.body().token)
  })
})

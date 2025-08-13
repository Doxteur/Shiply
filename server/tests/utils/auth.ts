import type { ApiClient } from '@japa/api-client'

export async function getAuthToken(client: ApiClient) {
  const email = `tester_${Date.now()}@example.com`
  const password = 'password123!'
  const fullName = 'Test User'

  const registerRes = await client.post('/auth/register').json({
    email,
    password,
    fullName,
  })

  if (registerRes.status() !== 201) {
    throw new Error(
      `Register failed: ${registerRes.status()} ${JSON.stringify(registerRes.body())}`
    )
  }

  const raw = registerRes.body().token as any
  const token = typeof raw === 'string' ? raw : (raw?.value ?? raw?.token)
  if (!token || typeof token !== 'string') {
    throw new Error('No token returned from register')
  }
  return token
}

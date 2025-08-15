import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import axios from 'axios'
import UserIntegration from '#models/user_integration'
import { encryptString, decryptString } from '#services/crypto_service'
import { signState, verifyState } from '#services/state_service'

export default class GithubIntegrationsController {
  async authorize({ auth, response }: HttpContext) {
    const clientId = env.get('GITHUB_CLIENT_ID')
    const callback = env.get('GITHUB_CALLBACK_URL')
    const scope = 'read:user,read:org,repo'
    const state = signState({ uid: auth.user?.id, ts: Date.now() }, env.get('APP_KEY'))
    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientId || ''
    )}&redirect_uri=${encodeURIComponent(callback || '')}&scope=${encodeURIComponent(
      scope
    )}&state=${encodeURIComponent(state)}`
    return response.ok({ url })
  }

  async callback({ request, response }: HttpContext) {
    const code = request.input('code')
    const state = request.input('state')
    if (!code) return response.badRequest({ error: 'code is required' })
    if (!state) return response.badRequest({ error: 'state is required' })
    const verified = verifyState(state, env.get('APP_KEY'))
    if (!verified) return response.unauthorized({ error: 'invalid_state' })
    const uid = Number((verified as any).uid)
    if (!uid) return response.unauthorized({ error: 'invalid_user' })
    const clientId = env.get('GITHUB_CLIENT_ID')
    const clientSecret = env.get('GITHUB_CLIENT_SECRET')
    const frontend = env.get('FRONTEND_URL') || 'http://localhost:5173'
    try {
      const tokenRes = await axios.post(
        'https://github.com/login/oauth/access_token',
        { client_id: clientId, client_secret: clientSecret, code },
        { headers: { Accept: 'application/json' } }
      )
      const accessToken: string | undefined = tokenRes.data?.access_token
      if (!accessToken) return response.badRequest({ error: 'no_access_token' })
      const enc = encryptString(accessToken, env.get('APP_KEY'))
      const existing = await UserIntegration.query()
        .where('user_id', uid)
        .where('provider', 'github')
        .first()
      if (existing) {
        existing.accessTokenEnc = enc
        existing.scope = tokenRes.data?.scope ?? null
        await existing.save()
      } else {
        await UserIntegration.create({
          userId: uid,
          provider: 'github',
          accessTokenEnc: enc,
          scope: tokenRes.data?.scope ?? null,
        } as any)
      }
      return response.redirect(`${frontend}/projects/new?github=connected`)
    } catch (e) {
      return response.internalServerError({ error: 'github_oauth_failed', details: String(e) })
    }
  }

  async status({ auth, response }: HttpContext) {
    const row = await UserIntegration.query()
      .where('user_id', auth.user?.id || 0)
      .where('provider', 'github')
      .first()
    return response.ok({ connected: !!row })
  }

  async repos({ auth, response }: HttpContext) {
    const row = await UserIntegration.query()
      .where('user_id', auth.user?.id || 0)
      .where('provider', 'github')
      .first()
    if (!row) return response.unauthorized({ error: 'not_connected' })
    try {
      const token = decryptString(row.accessTokenEnc, env.get('APP_KEY'))
      const reposRes = await axios.get(
        'https://api.github.com/user/repos?per_page=50&sort=updated',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        }
      )
      const items = (reposRes.data || []).map((r: any) => ({
        name: r.name,
        full_name: r.full_name,
        private: r.private,
        html_url: r.html_url,
      }))
      return response.ok({ data: items })
    } catch (e) {
      return response.internalServerError({ error: 'github_repos_failed', details: String(e) })
    }
  }
}

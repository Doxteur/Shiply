import crypto from 'node:crypto'

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function signState(payload: Record<string, unknown>, secret: string) {
  const json = JSON.stringify(payload)
  const encoded = base64url(json)
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest()
  const sigB64 = base64url(sig)
  return `${encoded}.${sigB64}`
}

export function verifyState(token: string, secret: string): null | Record<string, unknown> {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [encoded, sig] = parts
  const expect = base64url(crypto.createHmac('sha256', secret).update(encoded).digest())
  if (sig !== expect) return null
  try {
    const json = Buffer.from(encoded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
      'utf8'
    )
    const payload = JSON.parse(json) as Record<string, unknown>
    return payload
  } catch {
    return null
  }
}

import crypto from 'node:crypto'

const ALGO = 'aes-256-gcm'

export function encryptString(plainText: string, key: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, crypto.createHash('sha256').update(key).digest(), iv)
  const enc = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptString(payloadB64: string, key: string) {
  const buf = Buffer.from(payloadB64, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const data = buf.subarray(28)
  const decipher = crypto.createDecipheriv(
    ALGO,
    crypto.createHash('sha256').update(key).digest(),
    iv
  )
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  return dec.toString('utf8')
}

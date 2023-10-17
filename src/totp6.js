/**
  * @file MFCHF-TOTP6
  * @copyright Multifactor 2023
  * @license BSD-3-Clause-Clear
  *
  * @description
  * MFCHF with a password + 6-digit TOTP code
  *
  * @author Vivek Nair (https://nair.me) <vivek@nair.me>
  */
const crypto = require('crypto')
const { argon2id } = require('hash-wasm')
const speakeasy = require('speakeasy')
const mod = (n, m) => ((n % m) + m) % m

/**
 * Setup an MFCHF hash with a password and 6-digit TOTP factor
 *
 * @example
 * // Setup MFCHF-TOTP6 hash
 * const { hash, secret } = await mfchf.totp6.setup('password123')
 *
 * // Verify MFCHF-TOTP6 hash
 * const otp = parseInt(speakeasy.totp({ secret }))
 * const result = await mfchf.totp6.verify(hash, 'password123', otp)
 * result.valid.should.be.true
 *
 * @param {string} password - The password to use
 * @param {number} [window=87600] - Maximum window between logins, in number of steps (1 month by default)
 * @returns {MFCHFSetup} The resulting MFCHF hash and TOTP secret
 *
 * @author Vivek Nair (https://nair.me) <vivek@nair.me>
 * @since 0.2.0
 */
async function setup (password, window = 86400) {
  if (typeof password !== 'string') throw new TypeError('password must be a string')
  if (password.length === 0) throw new RangeError('password cannot be empty')

  const target = crypto.randomInt(10 ** 6)
  const totpBuffer = Buffer.alloc(4)
  totpBuffer.writeUInt32BE(target, 0)

  const passwordBuffer = Buffer.from(password, 'utf-8')
  const fullBuffer = Buffer.concat([totpBuffer, passwordBuffer])

  let hash = 'mt6a2id'
  const salt = crypto.randomBytes(32)
  hash += ':' + salt.toString('base64')

  const key = Buffer.from(await argon2id({
    password: fullBuffer,
    salt,
    parallelism: 1,
    iterations: 2,
    memorySize: 32768,
    hashLength: 32,
    outputType: 'binary'
  }))
  const digest = crypto.createHash('sha256').update(key).digest('base64')
  hash += ':' + digest

  const secret = crypto.randomBytes(32)
  const time = Date.now()
  hash += ':' + time.toString(10)
  const offsets = Buffer.alloc(4 * window)
  for (let i = 0; i < window; i++) {
    const counter = Math.floor(time / (30 * 1000)) + i
    const code = parseInt(speakeasy.totp({
      secret: secret.toString('hex'),
      step: 30,
      epoch: 0,
      counter,
      digits: 6,
      encoding: 'hex',
      algorithm: 'sha1'
    }))
    const offset = mod(target - code, 10 ** 6)
    offsets.writeUInt32BE(offset, 4 * i)
  }
  hash += ':' + offsets.toString('base64')

  const cipher = crypto.createCipheriv('aes-256-ecb', key, null)
  cipher.setAutoPadding(false)
  const blind = cipher.update(secret)
  hash += ':' + blind.toString('base64')

  return { hash, secret }
}

/**
 * Verify an MFCHF hash with a password and 6-digit TOTP code
 *
 * @example
 * // Setup MFCHF-TOTP6 hash
 * const { hash, secret } = await mfchf.totp6.setup('password123')
 *
 * // Verify MFCHF-TOTP6 hash
 * const otp = parseInt(speakeasy.totp({ secret }))
 * const result = await mfchf.totp6.verify(hash, 'password123', otp)
 * result.valid.should.be.true
 *
 * @param {string} hash - The MFCHF hash to verify
 * @param {string} password - The password to use
 * @param {number} code - The TOTP code to use
 * @returns {MFCHFVerify} The verification result
 *
 * @author Vivek Nair (https://nair.me) <vivek@nair.me>
 * @since 0.2.0
 */
async function verify (hash, password, code) {
  if (typeof hash !== 'string') throw new TypeError('hash must be a string')
  const parts = hash.split(':')
  const type = parts[0]
  if (type !== 'mt6a2id') throw new TypeError('hash type must be mh6a2id')
  if (typeof password !== 'string') throw new TypeError('password must be a string')
  if (password.length === 0) throw new RangeError('password cannot be empty')
  if (!Number.isInteger(code)) throw new TypeError('code must be an integer')

  const offsets = Buffer.from(parts[4], 'base64')
  const startCounter = Math.floor(parseInt(parts[3], 10) / (30 * 1000))
  const nowCounter = Math.floor(Date.now() / (30 * 1000))
  const index = nowCounter - startCounter
  const offset = offsets.readUInt32BE(4 * index)
  const window = offsets.length / 4
  const target = mod(offset + code, 10 ** 6)
  const totpBuffer = Buffer.alloc(4)
  totpBuffer.writeUInt32BE(target, 0)

  const passwordBuffer = Buffer.from(password, 'utf-8')
  const fullBuffer = Buffer.concat([totpBuffer, passwordBuffer])

  hash = 'mt6a2id'
  const salt = Buffer.from(parts[1], 'base64')
  hash += ':' + salt.toString('base64')
  const key = Buffer.from(await argon2id({
    password: fullBuffer,
    salt,
    parallelism: 1,
    iterations: 2,
    memorySize: 32768,
    hashLength: 32,
    outputType: 'binary'
  }))

  const digest = crypto.createHash('sha256').update(key).digest('base64')
  hash += ':' + digest
  if (digest !== parts[2]) return { valid: false }

  const blind = Buffer.from(parts[5], 'base64')

  const decipher = crypto.createDecipheriv('aes-256-ecb', key, null)
  decipher.setAutoPadding(false)
  const secret = decipher.update(blind)
  const time = Date.now()
  hash += ':' + time.toString(10)

  const newOffsets = Buffer.allocUnsafe(4 * window)
  offsets.copy(newOffsets, 0, 4 * index)

  for (let i = window - index; i < window; i++) {
    const counter = Math.floor(time / (30 * 1000)) + i
    const code = parseInt(speakeasy.totp({
      secret: secret.toString('hex'),
      step: 30,
      epoch: 0,
      counter,
      digits: 6,
      encoding: 'hex',
      algorithm: 'sha1'
    }))
    const offset = mod(target - code, 10 ** 6)
    newOffsets.writeUInt32BE(offset, 4 * i)
  }

  hash += ':' + offsets.toString('base64')
  hash += ':' + blind.toString('base64')

  return { valid: true, hash }
}

module.exports.totp6 = { setup, verify }

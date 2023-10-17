/**
  * @file MFCHF-HOTP6
  * @copyright Multifactor 2023
  * @license BSD-3-Clause-Clear
  *
  * @description
  * MFCHF with a password + 6-digit HOTP code
  *
  * @author Vivek Nair (https://nair.me) <vivek@nair.me>
  */
const crypto = require('crypto')
const { argon2id } = require('hash-wasm')
const { hotp } = require('speakeasy')
const mod = (n, m) => ((n % m) + m) % m

/**
 * Setup an MFCHF hash with a password and 6-digit HOTP factor
 *
 * @example
 * // Setup MFCHF-HOTP6 hash
 * const { hash, secret } = await mfchf.hotp6.setup('password123')
 *
 * // Verify MFCHF-HOTP6 hash
 * const otp = parseInt(hotp({ secret, counter: 1 }))
 * const result = await mfchf.hotp6.verify(hash, 'password123', otp)
 * result.valid.should.be.true
 *
 * @param {string} password - The password to use
 * @returns {MFCHFSetup} The resulting MFCHF hash and HOTP secret
 *
 * @author Vivek Nair (https://nair.me) <vivek@nair.me>
 * @since 0.1.0
 */
async function setup (password) {
  if (typeof password !== 'string') throw new TypeError('password must be a string')
  if (password.length === 0) throw new RangeError('password cannot be empty')

  const target = crypto.randomInt(10 ** 6)
  const hotpBuffer = Buffer.alloc(4)
  hotpBuffer.writeUInt32BE(target, 0)

  const passwordBuffer = Buffer.from(password, 'utf-8')
  const fullBuffer = Buffer.concat([hotpBuffer, passwordBuffer])

  let hash = 'mh6a2id'
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
  const code = parseInt(hotp({
    secret: secret.toString('hex'),
    counter: 1,
    digits: 6,
    encoding: 'hex',
    algorithm: 'sha1'
  }))

  const offset = mod(target - code, 10 ** 6)
  hash += ':1:' + offset.toString(10)

  const cipher = crypto.createCipheriv('aes-256-ecb', key, null)
  cipher.setAutoPadding(false)
  const blind = cipher.update(secret)
  hash += ':' + blind.toString('base64')

  return { hash, secret }
}

/**
 * Verify an MFCHF hash with a password and 6-digit HOTP code
 *
 * @example
 * // Setup MFCHF-HOTP6 hash
 * const { hash, secret } = await mfchf.hotp6.setup('password123')
 *
 * // Verify MFCHF-HOTP6 hash
 * const otp = parseInt(hotp({ secret, counter: 1 }))
 * const result = await mfchf.hotp6.verify(hash, 'password123', otp)
 * result.valid.should.be.true
 *
 * @param {string} hash - The MFCHF hash to verify
 * @param {string} password - The password to use
 * @param {number} code - The HOTP code to use
 * @returns {MFCHFVerify} The verification result
 *
 * @author Vivek Nair (https://nair.me) <vivek@nair.me>
 * @since 0.1.0
 */
async function verify (hash, password, code) {
  if (typeof hash !== 'string') throw new TypeError('hash must be a string')
  const parts = hash.split(':')
  const type = parts[0]
  if (type !== 'mh6a2id') throw new TypeError('hash type must be mh6a2id')
  if (typeof password !== 'string') throw new TypeError('password must be a string')
  if (password.length === 0) throw new RangeError('password cannot be empty')
  if (!Number.isInteger(code)) throw new TypeError('code must be an integer')

  let offset = parseInt(parts[4], 10)
  const target = mod(offset + code, 10 ** 6)
  const hotpBuffer = Buffer.alloc(4)
  hotpBuffer.writeUInt32BE(target, 0)

  const passwordBuffer = Buffer.from(password, 'utf-8')
  const fullBuffer = Buffer.concat([hotpBuffer, passwordBuffer])

  hash = 'mh6a2id'
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

  const counter = parseInt(parts[3], 10) + 1
  hash += ':' + counter.toString(10)

  code = parseInt(hotp({
    secret: secret.toString('hex'),
    counter,
    digits: 6,
    encoding: 'hex',
    algorithm: 'sha1'
  }))
  offset = mod(target - code, 10 ** 6)
  hash += ':' + offset.toString(10)
  hash += ':' + blind.toString('base64')

  return { valid: true, hash }
}

module.exports.hotp6 = { setup, verify }

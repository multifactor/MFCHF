/**
  * @file Multi-Factor Credential Hashing Function (MFCHF)
  * @copyright Multifactor 2023
  * @license BSD-3-Clause-Clear
  *
  * @description
  * JavaScript implementation of a Multi-Factor Credential Hashing Function (MFCHF)
  *
  * @author Vivek Nair (https://nair.me) <vivek@nair.me>
  */

/**
 * @typedef {Object} MFCHFSetup
 * @property {string} hash - The MFCHF hash, formatted as a string
 * @property {Buffer} secret - The underlying 2FA secret (HOTP, TOTP, etc.)
 */

/**
  * @typedef {Object} MFCHFVerify
  * @property {boolean} valid - Whether the MFCHF hash matches the factors
  * @property {string} [hash] - The updated MFCHF hash, formatted as a string
  */

module.exports = {
  ...require('./hotp6'),
  ...require('./totp6')
}

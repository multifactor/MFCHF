/* eslint no-unused-expressions: "off" */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const mfchf = require('../src')
const { suite, test } = require('mocha')
const speakeasy = require('speakeasy')

suite('totp6', () => {
  test('async', () => {
    return new Promise((resolve, reject) => {
      mfchf.totp6.setup('password123').then(({ hash, secret }) => {
        setTimeout(async () => {
          const otp = parseInt(speakeasy.totp({ secret }))
          const result = await mfchf.totp6.verify(hash, 'password123', otp)
          result.valid.should.be.true
          resolve()
        }, 30 * 1000)
      })
    })
  }).timeout(35 * 1000)

  test('password/invalid', () => {
    mfchf.totp6.setup(123456).should.be.rejectedWith(TypeError)
    mfchf.totp6.setup('').should.be.rejectedWith(RangeError)
    mfchf.totp6.verify('mt6a2id:', 123456, 123456).should.be.rejectedWith(TypeError)
    mfchf.totp6.verify('mt6a2id:', '', 123456).should.be.rejectedWith(RangeError)
  })

  test('hash/invalid', () => {
    mfchf.totp6.verify(123456, 'password123', 123456).should.be.rejectedWith(TypeError)
    mfchf.totp6.verify('mh6a2id:', '', 123456).should.be.rejectedWith(TypeError)
  })

  test('code/invalid', () => {
    mfchf.totp6.verify('mt6a2id:', 'password123', 'hello').should.be.rejectedWith(TypeError)
  })

  test('types', async () => {
    const { hash, secret } = await mfchf.totp6.setup('password123')
    hash.should.be.a('string')
    secret.should.be.instanceof(Buffer)

    const otp = parseInt(speakeasy.totp({ secret }))
    const result = await mfchf.totp6.verify(hash, 'password123', otp)
    result.hash.should.be.a('string')
    result.valid.should.be.a('boolean')
  })

  test('example', async () => {
    // Setup MFCHF-TOTP6 hash
    const { hash, secret } = await mfchf.totp6.setup('password123')

    // Verify MFCHF-TOTP6 hash
    const otp = parseInt(speakeasy.totp({ secret }))
    const result = await mfchf.totp6.verify(hash, 'password123', otp)
    result.valid.should.be.true
  })

  test('full', async () => {
    const { hash, secret } = await mfchf.totp6.setup('password123')

    let otp = parseInt(speakeasy.totp({ secret }))
    let fake = await mfchf.totp6.verify(hash, 'password321', otp)
    fake.valid.should.be.false
    fake = await mfchf.totp6.verify(hash, 'password123', 999999 - otp)
    fake.valid.should.be.false
    let result = await mfchf.totp6.verify(hash, 'password123', otp)
    result.valid.should.be.true

    otp = parseInt(speakeasy.totp({ secret }))
    fake = await mfchf.totp6.verify(hash, 'password321', otp)
    fake.valid.should.be.false
    fake = await mfchf.totp6.verify(hash, 'password123', 999999 - otp)
    fake.valid.should.be.false
    result = await mfchf.totp6.verify(result.hash, 'password123', otp)
    result.valid.should.be.true

    otp = parseInt(speakeasy.totp({ secret }))
    fake = await mfchf.totp6.verify(hash, 'password321', otp)
    fake.valid.should.be.false
    fake = await mfchf.totp6.verify(hash, 'password123', 999999 - otp)
    fake.valid.should.be.false
    result = await mfchf.totp6.verify(result.hash, 'password123', otp)
    result.valid.should.be.true
  })
})

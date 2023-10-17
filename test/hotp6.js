/* eslint no-unused-expressions: "off" */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const mfchf = require('../src')
const { suite, test } = require('mocha')
const { hotp } = require('speakeasy')

suite('hotp6', () => {
  test('password/invalid', () => {
    mfchf.hotp6.setup(123456).should.be.rejectedWith(TypeError)
    mfchf.hotp6.setup('').should.be.rejectedWith(RangeError)
    mfchf.hotp6.verify('mh6a2id:', 123456, 123456).should.be.rejectedWith(TypeError)
    mfchf.hotp6.verify('mh6a2id:', '', 123456).should.be.rejectedWith(RangeError)
  })

  test('hash/invalid', () => {
    mfchf.hotp6.verify(123456, 'password123', 123456).should.be.rejectedWith(TypeError)
    mfchf.hotp6.verify('mt6a2id:', '', 123456).should.be.rejectedWith(TypeError)
  })

  test('code/invalid', () => {
    mfchf.hotp6.verify('mh6a2id:', 'password123', 'hello').should.be.rejectedWith(TypeError)
  })

  test('types', async () => {
    const { hash, secret } = await mfchf.hotp6.setup('password123')
    hash.should.be.a('string')
    secret.should.be.instanceof(Buffer)

    const otp = parseInt(hotp({ secret, counter: 1 }))
    const result = await mfchf.hotp6.verify(hash, 'password123', otp)
    result.hash.should.be.a('string')
    result.valid.should.be.a('boolean')
  })

  test('example', async () => {
    // Setup MFCHF-HOTP6 hash
    const { hash, secret } = await mfchf.hotp6.setup('password123')

    // Verify MFCHF-HOTP6 hash
    const otp = parseInt(hotp({ secret, counter: 1 }))
    const result = await mfchf.hotp6.verify(hash, 'password123', otp)
    result.valid.should.be.true
  })

  test('full', async () => {
    const { hash, secret } = await mfchf.hotp6.setup('password123')

    let otp = parseInt(hotp({ secret, counter: 1 }))
    let fake = await mfchf.hotp6.verify(hash, 'password321', otp)
    fake.valid.should.be.false
    fake = await mfchf.hotp6.verify(hash, 'password123', 999999 - otp)
    fake.valid.should.be.false
    let result = await mfchf.hotp6.verify(hash, 'password123', otp)
    result.valid.should.be.true

    otp = parseInt(hotp({ secret, counter: 2 }))
    fake = await mfchf.hotp6.verify(hash, 'password321', otp)
    fake.valid.should.be.false
    fake = await mfchf.hotp6.verify(hash, 'password123', 999999 - otp)
    fake.valid.should.be.false
    result = await mfchf.hotp6.verify(result.hash, 'password123', otp)
    result.valid.should.be.true

    otp = parseInt(hotp({ secret, counter: 3 }))
    fake = await mfchf.hotp6.verify(hash, 'password321', otp)
    fake.valid.should.be.false
    fake = await mfchf.hotp6.verify(hash, 'password123', 999999 - otp)
    fake.valid.should.be.false
    result = await mfchf.hotp6.verify(result.hash, 'password123', otp)
    result.valid.should.be.true
  })
})

/* eslint no-unused-expressions: "off" */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const mfchf = require('../src')
const { suite, test } = require('mocha')

suite('default', () => {
  test('default', () => {
    mfchf
  })
})

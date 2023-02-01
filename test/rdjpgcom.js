import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { expect } from 'chai'
import rdjpgcom from '../lib/index.js'
import { COM } from '../lib/markers.js'


const F = (name) =>
  readFileSync(`./test/fixtures/${name}.jpg`)

describe('rdjpgcom', () => {
  it('returns an empty array when there are no text comments', () => {
    expect(rdjpgcom(F('nocom'))).to.eql([])
    expect(rdjpgcom(F('binary'))).to.eql([])
  })

  it('returns array of strings when comments present', () => {
    expect(rdjpgcom(F('com'))).to.eql(['A comment.'])

    expect(rdjpgcom(F('multi'))).to.eql([
      'A comment.',
      'A second comment\non two lines!\n'
    ])
  })

  it('returns all raw com segments if encoding is null', () => {
    expect(rdjpgcom(F('nocom'), { encoding: null })).to.eql([])

    let com = rdjpgcom(F('com'), { encoding: null })

    expect(com).to.have.lengthOf(1)
    expect(com[0]).to.have.property('marker', COM)
    expect(com[0]).to.have.property('payload').an.instanceOf(Buffer)
    expect(com[0].payload.toString()).to.eql('A comment.')

    let multi = rdjpgcom(F('multi'), { encoding: null })

    expect(multi).to.have.lengthOf(2)
    expect(multi[0].payload.toString()).to.eql('A comment.')

    let binary = rdjpgcom(F('binary'), { encoding: null })

    expect(binary).to.have.lengthOf(1)
    expect([...binary[0].payload.values()]).to.eql([0xe0, 0x80, 0x80])
  })
})

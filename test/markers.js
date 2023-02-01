import { Buffer } from 'node:buffer'
import { expect } from 'chai'
import * as M from '../lib/markers.js'


describe('indexOfNextMarker', () => {
  it('returns index of next marker in buffer', () => {
    expect(M.indexOfNextMarker(Buffer.from([0xff, 0]))).to.equal(1)
  })

  it('returns -1 if no marker in buffer', () => {
    expect(M.indexOfNextMarker(Buffer.from([]))).to.equal(-1)
    expect(M.indexOfNextMarker(Buffer.from('something'))).to.equal(-1)
    expect(M.indexOfNextMarker(Buffer.from([0xff]))).to.equal(-1)
  })

  it('swallows ff byte padding', () => {
    expect(M.indexOfNextMarker(Buffer.from([0xff, 0xff, 0]))).to.equal(2)
    expect(M.indexOfNextMarker(Buffer.from([0xff, 0xff, 0xff, 0]))).to.equal(3)
  })

  it('throws if not given a buffer', () => {
    expect(M.indexOfNextMarker).to.throw(TypeError)
  })
})

describe('parse', () => {
  it('parses segments with no payload', () => {
    expect(M.parse(Buffer.from([M.SOI])))
      .to.eql({ marker: M.SOI, offset: 1, size: 0 })

    expect(M.parse(Buffer.from([M.EOI])))
      .to.eql({ marker: M.EOI, offset: 1, size: 0 })

    expect(M.parse(Buffer.from([M.RST0])))
      .to.eql({ marker: M.RST0, offset: 1, size: 0 })
  })

  it('parses variable size segments', () => {
    expect(M.parse(Buffer.from([
      M.APP0, 0, 2
    ])))
      .to.eql({ marker: M.APP0, offset: 3, size: 0 })

    expect(M.parse(Buffer.from([
      M.APP0, 0, 2, 0, 0, 0, 0
    ])))
      .to.eql({ marker: M.APP0, offset: 3, size: 0 })

    expect(M.parse(Buffer.from([
      M.APP0, 0, 3, 0, 0, 0, 0
    ])))
      .to.eql({ marker: M.APP0, offset: 3, size: 1 })
  })

  it('fails when size is missing or invalid', () => {
    expect(() => M.parse(Buffer.from([M.APP1])))
      .to.throw('16-bit uint expected')
    expect(() => M.parse(Buffer.from([M.APP1, 0])))
      .to.throw('16-bit uint expected')
  })

  it('fails when size is too small', () => {
    expect(() => M.parse(Buffer.from([M.APP1, 0, 0])))
      .to.throw('>= 2 expected')
    expect(() => M.parse(Buffer.from([M.APP1, 0, 1])))
      .to.throw('>= 2 expected')
  })

  it('fails when size exceeds buffer', () => {
    expect(() => M.parse(Buffer.from([M.APP1, 0, 3])))
      .to.throw('premature end')
  })
})

describe('scan', () => {
  it('returns an iterator', () => {
    expect(M.scan()).to.respondTo(Symbol.iterator)
  })

  it('returns all marked segments', () => {
    expect([...M.scan(Buffer.from([
      0xff, M.SOI, 0xff, M.DHT, 0, 5, 1, 2, 3, 0xff, M.EOI
    ]))]).to.eql([
      { marker: M.SOI, offset: 2, size: 0 },
      { marker: M.DHT, offset: 6, size: 3 },
      { marker: M.EOI, offset: 11, size: 0 },
    ])
  })

  it('returns blank iterator if no markers present', () => {
    expect([...M.scan(Buffer.from([]))]).to.eql([])
    expect([...M.scan(Buffer.from([1, 2, 3]))]).to.eql([])
    expect([...M.scan(Buffer.from([1, 2, 3, 0xff]))]).to.eql([])
  })

  it('breaks at EOI', () => {
    expect([...M.scan(Buffer.from([
      0xff, M.SOI, 0xff, M.DHT, 0, 5, 1, 2, 3, 0xff, M.EOI, 0xff, M.SOI
    ]))]).to.have.lengthOf(3)
  })

  it('breaks at SOS', () => {
    expect([...M.scan(Buffer.from([
      0xff, M.SOI, 0xff, M.SOS, 0, 5, 1, 2, 3, 0xff, M.EOI
    ]))]).to.have.lengthOf(2)
  })

  it('throws if not given a buffer', () => {
    expect(() => ([...M.scan()])).to.throw(TypeError)
  })
})

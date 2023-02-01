import assert from 'node:assert'
import { Buffer } from 'node:buffer'
import { TextDecoder } from 'node:util'
import * as M from './marker.js'


const check = (...args) =>
  compare(...args) === 0

const compare = (buffer, bytes, offset = 0) =>
  buffer
    .slice(offset, bytes.length)
    .compare(Buffer.from(bytes))


/**
 * Returns an array of all textual comments in a JPEG file.
 */
export function rdjpgcom(buffer, {
  encoding = 'utf-8',
  raw = false
} = {}) {
  assert(check(buffer, [M.FF, M.SOI]), 'no JPEG data')

  let td = raw ?
    null :
    new TextDecoder(encoding, { fatal: true })

  let comments = []
  let segments = M.scan(buffer, 2)

  for (let { marker, offset, size } of segments) {
    try {
      if (marker === M.COM) {
        let payload = buffer.slice(offset, size)

        if (raw)
          comments.push({ marker, offset, payload })
        else
          comments.push(td.decode(payload))
      }
    } catch (e) {
      // Ignore text decoding errors
      if (!(e instanceof TypeError))
        throw e
    }
  }

  return comments
}

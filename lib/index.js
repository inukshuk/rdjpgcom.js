import assert from 'node:assert'
import { Buffer } from 'node:buffer'
import { TextDecoder } from 'node:util'
import * as M from './markers.js'


const check = (...args) =>
  compare(...args) === 0

const compare = (buffer, bytes, offset = 0) =>
  buffer
    .subarray(offset, offset + bytes.length)
    .compare(Buffer.from(bytes))


/**
 * Returns an array of all textual comments in a JPEG file.
 * If `options.encoding` is set to `null` the returned
 * array will contain all COM segments with corresponding
 * raw `payload` Buffers.
 *
 * @param [Buffer] buffer the JPEG file data
 * @param [object] options
 */
export function rdjpgcom(buffer, {
  encoding = 'utf-8'
} = {}) {
  assert(check(buffer, [M.FF, M.SOI]), 'no JPEG data')

  let td = (encoding == null) ?
    null :
    new TextDecoder(encoding, { fatal: true })

  let comments = []
  let segments = M.scan(buffer, 2)

  for (let { marker, offset, size } of segments) {
    try {
      if (marker === M.COM) {
        let payload = buffer.subarray(offset, offset + size)

        if (encoding == null)
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

export default rdjpgcom

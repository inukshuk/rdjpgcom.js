import assert from 'node:assert'

// JPEG markers consist of one or more 0xFF bytes,
// followed by a marker code byte.
// This is a list of marker codes (not necessarily complete).

export const SOF0  = 0xC0
export const SOF1  = 0xC1
export const SOF2  = 0xC2
export const SOF3  = 0xC3
export const DHT   = 0xC4
export const SOF5  = 0xC5
export const SOF6  = 0xC6
export const SOF7  = 0xC7
export const SOF9  = 0xC9
export const SOF10 = 0xCA
export const SOF11 = 0xCB
export const SOF13 = 0xCD
export const SOF14 = 0xCE
export const SOF15 = 0xCF
export const RST0  = 0xD0
export const RST1  = 0xD1
export const RST2  = 0xD2
export const RST3  = 0xD3
export const RST4  = 0xD4
export const RST5  = 0xD5
export const RST6  = 0xD6
export const RST7  = 0xD7
export const SOI   = 0xD8
export const EOI   = 0xD9
export const SOS   = 0xDA
export const DQT   = 0xDB
export const DRI   = 0xDD
export const APP0  = 0xE0
export const APP1  = 0xE1
export const APP2  = 0xE2
export const APP3  = 0xE3
export const APP4  = 0xE4
export const APP5  = 0xE5
export const APP6  = 0xE6
export const APP7  = 0xE7
export const APP8  = 0xE8
export const APP9  = 0xE9
export const APP10 = 0xEA
export const APP11 = 0xEB
export const APP12 = 0xEC
export const APP13 = 0xED
export const APP14 = 0xEE
export const APP15 = 0xEF
export const COM   = 0xFE

export const FF    = 0xFF


export function indexOfNextMarker(buffer, offset = 0) {
  if (buffer == null)
    throw new TypeError('not a buffer')

  let idx = buffer.indexOf(FF, offset)

  if (idx === -1)
    return -1

  // Swallow optional FF padding
  while (idx < buffer.length && buffer[idx + 1] === FF) ++idx

  // There should be at least one marker byte left
  if (idx === buffer.length - 1)
    return -1
  else
    return idx + 1
}

/**
 * Parses a JPEG segment at the given offset in the buffer.
 * Returns the segment's marker, as well as the payload's
 * size and offset in the buffer.
 */
export function parse(buffer, offset = 0) {
  let size = 0
  let marker = buffer.readUInt8(offset)
  offset += 1

  // SOI, EOI, and RSTn have no payload!
  if (!(marker >= RST0 && marker <= EOI)) {
    assert(offset + 2 <= buffer.length, 'bad marker size: 16-bit uint expected')

    size = buffer.readUInt16BE(offset)
    offset += 2

    assert(size >= 2, 'bad marker size: >= 2 expected')
    size -= 2

    assert(offset + size <= buffer.length, 'premature end of segment')
  }

  return { marker, offset, size }
}


/**
 * Scans the buffer, returning an iterator of all JPEG segments.
 */
export function* scan(buffer, offset = 0) {
  offset = indexOfNextMarker(buffer, offset)

  while (offset !== -1) {
    let segment = parse(buffer, offset)

    yield segment

    if (segment.marker === SOS)
      break
    if (segment.marker === EOI)
      break

    offset = indexOfNextMarker(buffer, segment.offset + segment.size)
  }
}

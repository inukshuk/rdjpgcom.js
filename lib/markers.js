export const SOF0  = 0xC0
export const SOF1  = 0xC1
export const SOF2  = 0xC2
export const SOF3  = 0xC3
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
export const APP0  = 0xE0
export const APP12 = 0xEC
export const COM   = 0xFE

export const FF    = 0xFF

export function hasPayload(marker) {
}

export function indexOfNextMarker(buffer, offset = 0) {
  let idx = buffer.indexOf(buffer, offset)

  if (idx !== -1) {
    // Swallow optional FF padding
    while (idx < buffer.length && buffer[idx + 1] === FF) ++idx
  }

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
  let marker = buffer.readUInt8(offset)
  offset += 1

  let size = 0

  // SOI, EOI, and RSTn have no payload!
  if (marker < RST0 || marker > EOI) {
    assert(offset + 2 < buffer.length, 'Bad JPEG marker length')

    size = buffer.readUInt16BE(buffer, offset)
    offset += 2

    assert(size >= 2, 'Bad JPEG marker length')
    size -= 2

    assert(offset + size <= buffer.length, 'Premature end of JPEG segment')
  }

  return { offset, marker, size }
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

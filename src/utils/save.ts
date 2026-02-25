const WINDOWS_RESERVED = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i

export const sanitizeFileName = (name: string): string => {
  // eslint-disable-next-line no-control-regex
  let sanitized = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')

  sanitized = sanitized.trim()
  sanitized = sanitized.replace(/[. ]+$/g, '')

  if (!sanitized) {
    sanitized = 'untitled'
  }

  if (WINDOWS_RESERVED.test(sanitized)) {
    sanitized = '_' + sanitized
  }

  const MAX_LEN = 250

  if (sanitized.length > MAX_LEN) {
    const match = sanitized.match(/(\.[^.]*)$/)
    if (match && match.index !== undefined && match.index > 0) {
      const ext = match[1]
      const base = sanitized.slice(0, MAX_LEN - ext.length)
      sanitized = base + ext
    } else {
      sanitized = sanitized.slice(0, MAX_LEN)
    }
  }

  return sanitized
}

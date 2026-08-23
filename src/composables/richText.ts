const LINK_PATTERN = /\[([^\]]+)\]\(([^()\s]+)\)/g

const SAFE_URL_PATTERN = /^(https?:\/\/|mailto:)\S+$/i

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function renderInlineLinks(text: string): string {
  const escaped = escapeHtml(text)
  return escaped.replace(LINK_PATTERN, (_match, rawLabel: string, rawUrl: string) => {
    const label = rawLabel.trim()
    const url = rawUrl.trim()
    if (!label || !SAFE_URL_PATTERN.test(url)) return _match
    const attributes =
      url.toLowerCase().startsWith('mailto:')
        ? `href="${url}"`
        : `href="${url}" target="_blank" rel="noopener noreferrer"`
    return `<a ${attributes}>${label}</a>`
  })
}

export function stripInlineLinks(text: string): string {
  return text.replace(LINK_PATTERN, '$1').trim()
}

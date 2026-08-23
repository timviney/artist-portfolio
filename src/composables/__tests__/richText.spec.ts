import { describe, expect, it } from 'vitest'

import { renderInlineLinks, stripInlineLinks } from '../richText'

describe('renderInlineLinks', () => {
  it('converts markdown-style links to anchors with safe attributes', () => {
    const html = renderInlineLinks('Photo by [Ana Silva](https://example.com)')

    expect(html).toBe(
      'Photo by <a href="https://example.com" target="_blank" rel="noopener noreferrer">Ana Silva</a>',
    )
  })

  it('supports multiple links mixed with plain text', () => {
    const html = renderInlineLinks('[A](https://a.co) and [B](http://b.org)')

    expect(html.match(/<a /g)).toHaveLength(2)
    expect(html).toContain('href="https://a.co"')
    expect(html).toContain('href="http://b.org"')
  })

  it('renders mailto links without target/rel', () => {
    const html = renderInlineLinks('[Email me](mailto:me@example.com)')

    expect(html).toBe('<a href="mailto:me@example.com">Email me</a>')
  })

  it('blocks javascript and other unsafe URL schemes', () => {
    for (const url of [
      'javascript:alert(1)',
      'JAVASCRIPT:alert(1)',
      'data:text/html,x',
      'vbscript:x',
      'file:///etc/passwd',
    ]) {
      const html = renderInlineLinks(`[click](${url})`)
      expect(html).not.toContain('<a ')
      expect(html).toContain(`[click](${url})`)
    }
  })

  it('escapes HTML in the surrounding text, labels and URLs', () => {
    const html = renderInlineLinks('<script>[x](https://e.co/?a="1"&b=2)</script>')

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('href="https://e.co/?a=&quot;1&quot;&amp;b=2"')
  })

  it('leaves malformed or empty links as literal text', () => {
    for (const text of ['[unclosed](https://e.co', '[](https://e.co)', '[label]()', 'plain text']) {
      expect(renderInlineLinks(text)).toBe(text)
    }
  })
})

describe('stripInlineLinks', () => {
  it('replaces links with their labels for plain-text contexts', () => {
    expect(stripInlineLinks('Photo by [Ana Silva](https://example.com)!')).toBe(
      'Photo by Ana Silva!',
    )
  })

  it('keeps text without links unchanged apart from trimming', () => {
    expect(stripInlineLinks('  no links here  ')).toBe('no links here')
  })
})

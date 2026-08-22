export type SocialIconKind =
  | 'instagram'
  | 'youtube'
  | 'x'
  | 'facebook'
  | 'tiktok'
  | 'spotify'
  | 'spotlight'
  | 'link'

export function resolveSocialIconKind(url: string): SocialIconKind {
  let hostname: string
  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return 'link'
  }

  if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) return 'instagram'
  if (hostname === 'youtu.be' || hostname === 'youtube.com' || hostname.endsWith('.youtube.com'))
    return 'youtube'
  if (hostname === 'x.com' || hostname === 'twitter.com') return 'x'
  if (hostname === 'facebook.com' || hostname === 'fb.me' || hostname.endsWith('.facebook.com'))
    return 'facebook'
  if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) return 'tiktok'
  if (hostname === 'spotify.com' || hostname.endsWith('.spotify.com')) return 'spotify'
  if (hostname === 'spotlight.com' || hostname.endsWith('.spotlight.com')) return 'spotlight'
  return 'link'
}

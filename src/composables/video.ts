const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,20})/
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d{6,12})/

export function toEmbedUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined
  const trimmed = rawUrl.trim()
  const youtube = trimmed.match(YOUTUBE_ID)
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`
  const vimeo = trimmed.match(VIMEO_ID)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return undefined
}

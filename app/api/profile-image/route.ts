import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url')
  if (!url) return new NextResponse('Missing image URL', { status: 400 })

  let imageUrl: URL
  try {
    imageUrl = new URL(url)
  } catch {
    return new NextResponse('Invalid image URL', { status: 400 })
  }

  const isAllowedHost = imageUrl.hostname === 'whatsapp.net' || imageUrl.hostname.endsWith('.whatsapp.net') || imageUrl.hostname === 'whatsapp.com' || imageUrl.hostname.endsWith('.whatsapp.com') || imageUrl.hostname === 'fbcdn.net' || imageUrl.hostname.endsWith('.fbcdn.net')
  if (imageUrl.protocol !== 'https:' || !isAllowedHost) {
    return new NextResponse('Image host not allowed', { status: 403 })
  }

  const response = await fetch(imageUrl, {
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      Referer: 'https://web.whatsapp.com/',
    },
    redirect: 'follow',
    cache: 'no-store',
  })
  if (!response.ok) return new NextResponse('Image unavailable', { status: response.status })

  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

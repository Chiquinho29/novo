import { NextResponse } from 'next/server'

const allowedHostnames = new Set(['pps.whatsapp.net'])

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url')
  if (!url) return new NextResponse('Missing image URL', { status: 400 })

  let imageUrl: URL
  try {
    imageUrl = new URL(url)
  } catch {
    return new NextResponse('Invalid image URL', { status: 400 })
  }

  if (imageUrl.protocol !== 'https:' || !allowedHostnames.has(imageUrl.hostname)) {
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

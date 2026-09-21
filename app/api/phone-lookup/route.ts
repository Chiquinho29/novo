import { NextResponse } from 'next/server'

const endpoint = 'https://whatsapp-profile-data1.p.rapidapi.com/WhatsappProfileDataWithToken'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const phone = typeof body.phone === 'string' ? body.phone.replace(/[^\d+]/g, '') : ''

    if (!phone || phone.replace(/\D/g, '').length < 7) {
      return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 })
    }

    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'The API key is not configured on the server.' }, { status: 500 })
    }

    const headers = {
      Accept: 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'whatsapp-profile-data1.p.rapidapi.com',
    }
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone.replace(/\D/g, '') }),
      cache: 'no-store',
    })

    if (!response.ok && [400, 415, 422].includes(response.status)) {
      const formBody = new URLSearchParams({
        phone_number: phone.replace(/\D/g, ''),
      })
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
        cache: 'no-store',
      })
    }

    const text = await response.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    if (!response.ok) {
      const providerMessage = typeof data === 'object' && data !== null
        ? JSON.stringify(data)
        : String(data)
      console.error('[v0] RapidAPI lookup failed:', response.status, providerMessage)
      return NextResponse.json({ error: `The API rejected the lookup (${response.status}).`, details: data }, { status: response.status })
    }

    return NextResponse.json({ phone, data })
  } catch {
    return NextResponse.json({ error: 'The lookup could not be completed right now.' }, { status: 500 })
  }
}

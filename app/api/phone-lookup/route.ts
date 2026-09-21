import { NextResponse } from 'next/server'

const endpoint = 'https://whatsapp-profile-data1.p.rapidapi.com/WhatsappProfileDataWithToken'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const phone = typeof body.phone === 'string' ? body.phone.replace(/[^\d+]/g, '') : ''

    if (!phone || phone.replace(/\D/g, '').length < 7) {
      return NextResponse.json({ error: 'Digite um número de telefone válido.' }, { status: 400 })
    }

    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'A chave da API não está configurada no servidor.' }, { status: 500 })
    }

    const headers = {
      Accept: 'application/json',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'whatsapp-profile-data1.p.rapidapi.com',
    }
    const formBody = new URLSearchParams({
      phone_number: phone.replace(/\D/g, ''),
    })
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
      cache: 'no-store',
    })

    if (!response.ok && [400, 415, 422].includes(response.status)) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone.replace(/\D/g, '') }),
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
      return NextResponse.json({ error: `A API recusou a consulta (${response.status}).`, details: data }, { status: response.status })
    }

    return NextResponse.json({ phone, data })
  } catch {
    return NextResponse.json({ error: 'Não foi possível realizar a consulta agora.' }, { status: 500 })
  }
}

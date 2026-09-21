'use client'

import { useEffect, useState } from 'react'

const checkoutUrl = 'https://pay.mycheckoutt.com/019ed7b9-c5b1-7386-9353-17e47481c169?ref='

function findPicture(value: unknown): string | null {
  if (typeof value === 'string' && /^https?:\/\//i.test(value) && /whatsapp|pps\.whatsapp|profile|picture/i.test(value)) return value
  if (!value || typeof value !== 'object') return null
  for (const [key, nested] of Object.entries(value)) {
    if (/picture|photo|avatar|image/i.test(key) && typeof nested === 'string' && /^https?:\/\//i.test(nested)) return nested
    const found = findPicture(nested)
    if (found) return found
  }
  return null
}

export default function LimitPage() {
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    const cookiePicture = document.cookie.split('; ').find((item) => item.startsWith('infochecker_profile_image='))?.split('=').slice(1).join('=')
    if (cookiePicture) {
      setProfileImage(decodeURIComponent(cookiePicture))
      return
    }
    const raw = sessionStorage.getItem('infochecker-result')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      const picture = findPicture(parsed)
      if (picture) setProfileImage(picture)
    } catch {
      sessionStorage.removeItem('infochecker-result')
    }
  }, [])

  const imageSrc = profileImage ? `/api/profile-image?url=${encodeURIComponent(profileImage)}` : null

  return <main className="limit-page">
    <section className="limit-card" aria-labelledby="limit-title">
      <div className="limit-avatar">{imageSrc ? <img src={imageSrc} alt="WhatsApp profile photo" /> : <span aria-hidden="true">◯</span>}</div>
      <p className="tag">LIMIT REACHED</p>
      <h1 id="limit-title">Your free search has been used</h1>
      <p className="limit-copy">Unlock the complete report and view all available information for this number.</p>
      <a className="limit-checkout" href={checkoutUrl} target="_blank" rel="noopener noreferrer">UNLOCK FULL REPORT</a>
      <p className="limit-note">Your privacy and search data remain protected.</p>
    </section>
  </main>
}

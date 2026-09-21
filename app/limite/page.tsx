'use client'

import { useEffect, useState } from 'react'

const checkoutUrl = 'https://pay.mycheckoutt.com/0198b568-3b38-73a5-8722-0f9287d4f393?ref='

export default function LimitPage() {
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('infochecker-result')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      const picture = parsed?.data?.picture ?? parsed?.data?.data?.picture ?? parsed?.picture
      if (typeof picture === 'string') setProfileImage(picture)
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

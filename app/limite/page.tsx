'use client'

import { useEffect, useState } from 'react'

const CHECKOUT_LINK_97 = 'https://pay.mycheckoutt.com/01a0ca73-e0cc-704e-aec5-892e6530d433?ref='
const CHECKOUT_LINK_37 = 'https://pay.mycheckoutt.com/019ed7b9-c5b1-7386-9353-17e47481c169?ref='

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
      <section className="limit-offers" aria-labelledby="limit-offers-title"><p className="limit-offers-label" id="limit-offers-title">CHOOSE YOUR ACCESS</p><div className="limit-offers-grid"><article className="offer-card offer-card-featured"><span className="offer-badge">BEST VALUE</span><h2>GET ALL APPS FOR ONLY $97</h2><p>Unlock the complete InfoChecker suite with all available apps.</p><strong className="offer-highlight">ONE OFFER — ALL APPS</strong><ul><li>InfoCheck</li><li>Location</li><li>InstaCheck</li><li>TinderCheck</li><li>FacebookCheck</li><li>WhatsAppCheck</li><li>TikTokCheck</li></ul><div className="offer-price">$97</div><a className="checkout-button" href={CHECKOUT_LINK_97} target="_blank" rel="noopener noreferrer">GET ALL APPS — $97</a></article><article className="offer-card"><span className="offer-badge">QUICK ACCESS</span><h2>INFOCHECK — ONLY $37</h2><p>Get access to the complete InfoCheck report.</p><ul><li>InfoCheck</li></ul><div className="offer-price">$37</div><a className="checkout-button" href={CHECKOUT_LINK_37} target="_blank" rel="noopener noreferrer">GET INFOCHECK — $37</a></article></div></section><p className="limit-note">Your privacy and search data remain protected.</p>
    </section>
  </main>
}

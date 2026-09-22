'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getApproximateLocation } from '@/lib/phone-location'

const ApproximateLocationMap = dynamic(() => import('@/components/approximate-location-map'), { ssr: false })

function ResultadoContent() {
  const params = useSearchParams()
  const phone = params.get('phone') ?? 'Searched number'
  const pending = params.get('pending') === 'true'
  const approximateLocation = getApproximateLocation(phone)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const people = [
    ['Isabela', '/avatar-woman-1.png'], ['Mariana', '/avatar-woman-2.png'], ['Camila', '/avatar-woman-3.png'],
    ['Marcos', '/avatar-man-1.png'], ['Rafael', '/avatar-man-2.png'], ['Thiago', '/avatar-man-3.png'],
    ['André', '/avatar-man-4.png'], ['Gabriel', '/avatar-man-5.png'], ['Eduardo', '/avatar-man-6.png'],
    ['Lucas', '/avatar-man-7.png'], ['Aline', '/avatar-woman-4.png'], ['Fernanda', '/avatar-woman-5.png'],
  ] as const
  const [activePeople, setActivePeople] = useState(people.slice(0, 3))

  useEffect(() => {
    const raw = sessionStorage.getItem('infochecker-result')
    if (raw) setData(JSON.parse(raw))
  }, [])

  useEffect(() => {
    const rotatePeople = () => setActivePeople([...people].sort(() => Math.random() - 0.5).slice(0, 3))
    const interval = window.setInterval(rotatePeople, 4200)
    return () => window.clearInterval(interval)
  }, [])

  const entries = data ? Object.entries(data).filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object') : []
  const CHECKOUT_LINK_97 = 'https://pay.mycheckoutt.com/01a0ca73-e0cc-704e-aec5-892e6530d433?ref='
  const CHECKOUT_LINK_37 = 'https://pay.mycheckoutt.com/019ed7b9-c5b1-7386-9353-17e47481c169?ref='

  return <main className="result-page"><header className="result-header"><a className="brand" href="/">Info<span>Checker</span></a><span className="secure-badge">Secure lookup</span></header><section className="result-hero"><div className="result-spinner" aria-hidden="true"><span /></div><p className="tag">{pending ? 'LOOKUP SUBMITTED' : 'LOOKUP REPORT'}</p><h1>{pending ? 'All set! Your searches are complete.' : 'Information found'}</h1><p className="result-phone">{phone}</p>{!pending && <p className="result-intro">Review the public data returned for this number below.</p>}</section><section className="result-content"><div className="result-card"><div className="location-card"><div className="location-card-copy"><p className="card-label">APPROXIMATE LOCATION</p><h2>{approximateLocation ? `${approximateLocation.city}, ${approximateLocation.state}` : 'Location unavailable'}</h2><p>Approximate location based on the regional code or IP.</p>{approximateLocation && <small>{approximateLocation.country} · {approximateLocation.latitude.toFixed(4)}, {approximateLocation.longitude.toFixed(4)}</small>}</div><ApproximateLocationMap location={approximateLocation} /></div><section className="media-preview" aria-labelledby="media-preview-title"><div className="notifications-heading"><div><p className="card-label">AVAILABLE MEDIA</p><h2 id="media-preview-title">Photos, conversations and calls</h2></div></div><div className="media-preview-grid">{[['/results/conversations.png','Conversations'],['/results/calls-media.png','Calls and media'],['/results/voice-messages.png','Voice messages']].map(([src,label]) => <article className="media-preview-card" key={src}><img src={src} alt={label} /><div className="media-preview-lock"><span aria-hidden="true">▣</span> SEE IT</div></article>)}</div></section><section className="release-notifications" aria-labelledby="release-notifications-title"><div className="notifications-heading"><div><p className="card-label">RECENT ACTIVITY</p><h2 id="release-notifications-title">Unlocked searches</h2></div><span className="live-indicator"><span /> Live</span></div><div className="notification-list">{activePeople.map(([name, avatar], index) => <article className="release-notification" key={`${name}-${avatar}`}><img className="notification-avatar" src={avatar} alt={`Profile photo of ${name}`} /><div><strong>{name}</strong><p>{index === 0 ? 'just unlocked their searches' : index === 1 ? 'unlocked a new lookup' : 'just viewed the results'}</p><small>{approximateLocation ? `${approximateLocation.city}, ${approximateLocation.state}` : 'Location aproximada'}</small></div><time>{index === 0 ? 'now' : `há ${index} min`}</time></article>)}</div></section><div className="result-card-head"><div><p className="card-label">RESULTADO DA PESQUISA</p><h2>Dados do telefone</h2></div><span className="status-dot">{pending ? 'Aguardando API' : 'Consulta concluída'}</span></div>{entries.length > 0 ? <div className="result-grid">{entries.map(([key, value]) => <div className="data-item" key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{String(value)}</strong></div>)}</div> : <div className="empty-result">A consulta foi concluída. Os detalhes retornados aparecerão aqui.</div>}<details className="raw-details"><summary>Ver resposta completa da API</summary><pre>{JSON.stringify(data, null, 2)}</pre></details></div><aside className="result-side"><h3></h3><p>Use estas informações para confirmar a identidade e tomar decisões com segurança.</p><a href="/"></a></aside></section><section className="visual-results" aria-labelledby="visual-results-title"><p className="card-label">RESULTS PREVIEW</p><h2 id="visual-results-title">Found content</h2><div className="visual-results-grid"><img src="/results/conversations.png" alt="Preview of found conversations" /><img src="/results/calls-media.png" alt="Preview of found calls and media" /><img src="/results/voice-messages.png" alt="Preview of found voice messages" /></div></section><section className="modalities-card" aria-labelledby="modalities-title"><div className="modalities-heading"><p className="card-label">OTHER PLATFORMS</p><h2 id="modalities-title">Find more information</h2><p>Explore other options available for your search.</p><p className="modalities-highlight">View photos, conversations, real-time locations, and much more. Access everything in one place with privacy, security, and data protection. Our platform was designed to provide a safe, discreet, and reliable experience for every lookup.</p></div><div className="social-visual-grid"><div className="social-visual-card"><img src="/social/whatsapp.png" alt="WhatsApp icon" /><span>WhatsApp</span></div><div className="social-visual-card"><img src="/social/instagram.png" alt="Instagram icon" /><span>Instagram</span></div><div className="social-visual-card"><img src="/social/tiktok.png" alt="TikTok icon" /><span>TikTok</span></div><div className="social-visual-card"><img src="/social/tinder.png" alt="Tinder icon" /><span>Tinder</span></div><div className="social-visual-card social-visual-card-facebook"><span>Facebook</span></div><div className="social-visual-card"><img src="/location-pin.png" alt="Location icon" /><span>Location</span></div></div></section><div className="checkout-cta"><a href="#" target="_blank" rel="noopener noreferrer" className="checkout-button"></a></div><section className="checkout-offers" aria-labelledby="offers-title"><div className="offer-card offer-card-featured"><span className="offer-badge">SPECIAL OFFER</span><h2 id="offers-title">GET ALL APPS FOR ONLY $97</h2><p>Unlock access to the complete InfoChecker suite with all available apps in one offer.</p><strong className="offer-highlight">ONE OFFER — ALL APPS</strong><ul><li>InfoCheck</li><li>Location</li><li>InstaCheck</li><li>TinderCheck</li><li>FacebookCheck</li><li>WhatsAppCheck</li><li>TikTokCheck</li></ul><div className="offer-price">$97</div><a className="checkout-button" href={CHECKOUT_LINK_97}>GET ALL APPS — $97</a></div><div className="offer-card"><span className="offer-badge">SPECIAL OFFER</span><h2>INFOCHECK — ONLY $37</h2><p>Get access to InfoCheck with a simple one-time offer.</p><ul><li>InfoCheck</li></ul><div className="offer-price">$37</div><a className="checkout-button" href={CHECKOUT_LINK_37}>GET INFOCHECK — $37</a></div></section></main>
}

export default function ResultadoPage() {
  return <Suspense fallback={<main className="result-page" aria-busy="true" />}><ResultadoContent /></Suspense>
}

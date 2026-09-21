'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'

const ApproximateLocationMap = dynamic(() => import('@/components/approximate-location-map'), { ssr: false })
import { getApproximateLocation } from '@/lib/phone-location'

const fetchProfile = async ([url, phone]: [string, string]) => { const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) }); if (!response.ok) throw new Error('profile lookup failed'); return response.json() }
const imageUrlPattern = /^(https?:\/\/|data:image\/)/i
const imageKeyPattern = /(photo|picture|image|avatar|profile|thumbnail|pic|url)/i
const findProfileImage = (value: unknown, imageContext = false): string | null => {
  if (typeof value === 'string') return imageContext && imageUrlPattern.test(value) ? value : null
  if (!value || typeof value !== 'object') return null
  if (Array.isArray(value)) {
    for (const item of value) { const nested = findProfileImage(item, imageContext); if (nested) return nested }
    return null
  }
  for (const [key, item] of Object.entries(value)) {
    const isImageField = imageKeyPattern.test(key)
    const nested = findProfileImage(item, isImageField || imageContext)
    if (nested) return nested
  }
  return null
}

function ConsultandoContent() {
  const params = useSearchParams()
  const phone = params.get('phone') ?? ''
  const approximateLocation = getApproximateLocation(phone)
  const { data: profileResponse } = useSWR(phone ? ['/api/phone-lookup', phone] : null, fetchProfile, { revalidateOnFocus: false })
  const profileImage = findProfileImage(profileResponse?.data) ?? findProfileImage(profileResponse)
  const displayProfileImage = profileImage ? `/api/profile-image?url=${encodeURIComponent(profileImage)}` : null
  const [progress, setProgress] = useState(0)
  const [extraAccessVisible, setExtraAccessVisible] = useState(false)
  const analysisSteps = ['Connecting to servers', 'Verifying the phone number', 'Analyzing available data', 'Checking public information', 'Organizing the report']
  const visibleStepCount = Math.min(analysisSteps.length, Math.max(1, Math.ceil(progress / 20)))

  useEffect(() => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      setProgress(Math.min(100, Math.round((elapsed / 10000) * 100)))
    }, 100)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress < 100) return
    const revealTimer = window.setTimeout(() => setExtraAccessVisible(true), 800)
    return () => window.clearTimeout(revealTimer)
  }, [progress])

  return (
    <main className="checking-page">
      <header className="result-header"><a className="brand" href="/">Info<span>Checker</span></a><a className="back-button" href="/" aria-label="Back to the home page">← Back</a><span className="secure-badge">Secure lookup</span></header>
      <section className="checking-panel" aria-live="polite">
        <div className="checking-location-map"><ApproximateLocationMap location={approximateLocation} /></div>
        <div className="location-success-alert" role="status"><span className="success-badge" aria-hidden="true">✓</span><div><p className="tag">LOCATION</p><h1>Location found successfully!</h1></div></div>
        <div className="whatsapp-number-result"><img src={displayProfileImage ?? '/social-whatsapp.png'} alt={displayProfileImage ? 'Profile photo for the searched number' : 'WhatsApp'} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/social-whatsapp.png' }} /><strong>{phone}</strong></div>
        <div className="progress-label"><span>Lookup progress</span><strong>{progress}%</strong></div><div className="checking-progress" role="progressbar" aria-label="Lookup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div><div className="analysis-steps" aria-label="Analysis steps">{analysisSteps.slice(0, visibleStepCount).map((step, index) => <div className="analysis-step" key={step}><span className="analysis-step-icon" aria-hidden="true">✓</span><span>{step}</span><small>{index === visibleStepCount - 1 && progress < 100 ? 'in progress' : 'completed'}</small></div>)}</div>{extraAccessVisible ? <div className="extra-access-stage"><div className="extra-access-card" role="status"><span className="extra-access-icon" aria-hidden="true">✓</span><div><p className="extra-access-label">EXTRA ACCESS UNLOCKED</p><p className="extra-access-message">1 additional WhatsApp lookup has been unlocked.</p></div></div><button className="extra-access-button" type="button" onClick={() => window.location.href = `/analise-complementar?phone=${encodeURIComponent(phone)}`}>CONTINUE</button></div> : <small>{progress < 100 ? 'Waiting for the API connection...' : 'Lookup completed. Waiting for the next step...'}</small>}
      </section>
    </main>
  )
}

export default function ConsultandoPage() {
  return (
    <Suspense fallback={<main className="checking-page" aria-busy="true" />}>
      <ConsultandoContent />
    </Suspense>
  )
}

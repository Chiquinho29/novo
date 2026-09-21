'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'

const ApproximateLocationMap = dynamic(() => import('@/components/approximate-location-map'), { ssr: false })
import { getApproximateLocation } from '@/lib/phone-location'

const fetchProfile = async ([url, phone]: [string, string]) => { const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) }); if (!response.ok) throw new Error('profile lookup failed'); return response.json() }
const findProfileImage = (value: unknown): string | null => { if (!value || typeof value !== 'object') return null; for (const [key, item] of Object.entries(value)) { if (typeof item === 'string' && /^(https?:\/\/|data:image\/)/i.test(item) && /(photo|picture|image|avatar|profile|thumbnail)/i.test(key)) return item; if (typeof item === 'object') { const nested = findProfileImage(item); if (nested) return nested } } return null }

function ConsultandoContent() {
  const params = useSearchParams()
  const phone = params.get('phone') ?? ''
  const approximateLocation = getApproximateLocation(phone)
  const { data: profileResponse } = useSWR(phone ? ['/api/phone-lookup', phone] : null, fetchProfile, { revalidateOnFocus: false })
  const profileImage = findProfileImage(profileResponse?.data) ?? findProfileImage(profileResponse)
  const [progress, setProgress] = useState(0)
  const [extraAccessVisible, setExtraAccessVisible] = useState(false)
  const analysisSteps = ['Conectando aos servidores', 'Verificando o número de telefone', 'Analisando os dados disponíveis', 'Consultando informações públicas', 'Organizando o relatório']
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
      <header className="result-header"><a className="brand" href="/">Info<span>Checker</span></a><a className="back-button" href="/" aria-label="Voltar para a página inicial">← Voltar</a><span className="secure-badge">Consulta segura</span></header>
      <section className="checking-panel" aria-live="polite">
        <div className="checking-location-map"><ApproximateLocationMap location={approximateLocation} /></div>
        <div className="location-success-alert" role="status"><span className="success-badge" aria-hidden="true">✓</span><div><p className="tag">LOCALIZAÇÃO</p><h1>Localização encontrada com sucesso!</h1></div></div>
        <div className="whatsapp-number-result"><img src={profileImage ?? '/social-whatsapp.png'} alt={profileImage ? 'Foto do perfil pesquisado' : 'WhatsApp'} /><strong>{phone}</strong></div>
        <div className="progress-label"><span>Progresso da consulta</span><strong>{progress}%</strong></div><div className="checking-progress" role="progressbar" aria-label="Progresso da consulta" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div><div className="analysis-steps" aria-label="Etapas da análise">{analysisSteps.slice(0, visibleStepCount).map((step, index) => <div className="analysis-step" key={step}><span className="analysis-step-icon" aria-hidden="true">✓</span><span>{step}</span><small>{index === visibleStepCount - 1 && progress < 100 ? 'em andamento' : 'concluída'}</small></div>)}</div>{extraAccessVisible ? <div className="extra-access-stage"><div className="extra-access-card" role="status"><span className="extra-access-icon" aria-hidden="true">✓</span><div><p className="extra-access-label">ACESSO EXTRA LIBERADO</p><p className="extra-access-message">1 consulta complementar do WhatsApp foi liberada.</p></div></div><button className="extra-access-button" type="button" onClick={() => window.location.href = `/analise-complementar?phone=${encodeURIComponent(phone)}`}>CONTINUAR</button></div> : <small>{progress < 100 ? 'Aguardando a conexão com a API...' : 'Consulta concluída. Aguardando a próxima etapa...'}</small>}
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

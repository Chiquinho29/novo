'use client'

import { Suspense, useEffect, useState, type CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const statuses = [
  'Preparando análise...',
  'Organizando informações...',
  'Verificando dados disponíveis...',
  'Concluindo análise...',
]

function AnaliseComplementarContent() {
  const router = useRouter()
  const params = useSearchParams()
  const phone = params.get('phone') ?? ''
  const completed = params.get('completed') === 'true'
  const [progress, setProgress] = useState(completed ? 100 : 0)

  useEffect(() => {
    if (completed) return
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      setProgress(Math.min(100, Math.round((elapsed / 10000) * 100)))
    }, 100)
    return () => window.clearInterval(timer)
  }, [completed])

  useEffect(() => {
    if (completed || progress < 100) return
    const timer = window.setTimeout(() => {
      router.push(`/analise-complementar?phone=${encodeURIComponent(phone)}&completed=true`)
    }, 800)
    return () => window.clearTimeout(timer)
  }, [progress, phone, router])

  const status = progress === 100 ? '✓ ANÁLISE CONCLUÍDA' : statuses[Math.min(3, Math.floor(progress / 25))]
  const foundItems = ['17 áudios encontrados', '27 conversas encontradas', '113 fotos encontradas', '45 vídeos encontrados', 'Ligações encontradas']

  return (
    <main className="analysis-page">
      <header className="result-header"><a className="brand" href="/">Info<span>Checker</span></a><a className="back-button" href="/" aria-label="Voltar para a página inicial">← Voltar</a><span className="secure-badge">Consulta segura</span></header>
      <section className="analysis-panel" aria-live="polite">
        <p className="tag">ANÁLISE COMPLEMENTAR</p>
        <h1>Verificando informações disponíveis</h1>
        <p className="analysis-subtitle">Verificando informações disponíveis para esta demonstração...</p>
        <div className="analysis-ring" style={{ '--progress': `${progress * 3.6}deg` } as CSSProperties}>
          <div><strong>{progress}%</strong><span>analisado</span></div>
        </div>
        <p className={progress === 100 ? 'analysis-status complete' : 'analysis-status'}>{completed ? '✓ ANÁLISE CONCLUÍDA' : status}</p>
        <div className="checking-progress analysis-bar" role="progressbar" aria-label="Progresso da análise" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
        {completed && <><p className="analysis-done">Análise complementar concluída para {phone}.</p><div className="found-items" aria-live="polite"><p className="found-items-title">Itens encontrados</p>{foundItems.map((item) => <div className="found-item" key={item}><span aria-hidden="true">!</span>{item}</div>)}</div><section className="analysis-summary" aria-labelledby="analysis-summary-title"><h2 id="analysis-summary-title">RESULTADOS DA ANÁLISE</h2><div className="summary-indicators">{['Notificações', 'Interações', 'Ligações', 'Mídias', 'Mensagens de voz'].map((item, index) => <div className="summary-indicator" style={{ '--delay': `${index * 90}ms` } as CSSProperties} key={item}><span aria-hidden="true">✓</span>{item}</div>)}</div><a className="view-results-button" href={`/resultado?phone=${encodeURIComponent(phone)}&pending=true`}>VER RESULTADO</a></section></>}
      </section>
    </main>
  )
}

export default function AnaliseComplementarPage() {
  return (
    <Suspense fallback={<main className="analysis-page" aria-busy="true" />}> 
      <AnaliseComplementarContent />
    </Suspense>
  )
}

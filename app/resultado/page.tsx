'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getApproximateLocation } from '@/lib/phone-location'

const ApproximateLocationMap = dynamic(() => import('@/components/approximate-location-map'), { ssr: false })

function ResultadoContent() {
  const params = useSearchParams()
  const phone = params.get('phone') ?? 'Número consultado'
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
  const checkoutUrl = 'https://pay.mycheckoutt.com/0198b568-3b38-73a5-8722-0f9287d4f393?ref='

  return <main className="result-page"><header className="result-header"><a className="brand" href="/">Info<span>Checker</span></a><a className="back-button" href="/" aria-label="Voltar para a página inicial">← Voltar</a><span className="secure-badge">Consulta segura</span></header><section className="result-hero"><div className="result-spinner" aria-hidden="true"><span /></div><p className="tag">{pending ? 'CONSULTA ENCAMINHADA' : 'RELATÓRIO DA CONSULTA'}</p><h1>{pending ? 'Tudo certo! Suas pesquisas foram concluídas.' : 'Informações encontradas'}</h1><p className="result-phone">{phone}</p>{!pending && <p className="result-intro">Confira abaixo os dados públicos retornados para este número.</p>}</section><section className="result-content"><div className="result-card"><a className="checkout-button" href={checkoutUrl} target="_blank" rel="noopener noreferrer">Liberar agora</a><div className="location-card"><div className="location-card-copy"><p className="card-label">LOCALIZAÇÃO APROXIMADA</p><h2>{approximateLocation ? `${approximateLocation.city}, ${approximateLocation.state}` : 'Localização não disponível'}</h2><p>Localização aproximada baseada no código regional ou IP.</p>{approximateLocation && <small>{approximateLocation.country} · {approximateLocation.latitude.toFixed(4)}, {approximateLocation.longitude.toFixed(4)}</small>}</div><ApproximateLocationMap location={approximateLocation} /></div><section className="release-notifications" aria-labelledby="release-notifications-title"><div className="notifications-heading"><div><p className="card-label">ATIVIDADE RECENTE</p><h2 id="release-notifications-title">Pesquisas liberadas</h2></div><span className="live-indicator"><span /> Ao vivo</span></div><div className="notification-list">{activePeople.map(([name, avatar], index) => <article className="release-notification" key={`${name}-${avatar}`}><img className="notification-avatar" src={avatar} alt={`Foto de perfil de ${name}`} /><div><strong>{name}</strong><p>{index === 0 ? 'acabou de liberar suas pesquisas' : index === 1 ? 'liberou uma nova consulta' : 'acabou de visualizar os resultados'}</p><small>{approximateLocation ? `${approximateLocation.city}, ${approximateLocation.state}` : 'Localização aproximada'}</small></div><time>{index === 0 ? 'agora' : `há ${index} min`}</time></article>)}</div></section><div className="result-card-head"><div><p className="card-label">RESULTADO DA PESQUISA</p><h2>Dados do telefone</h2></div><span className="status-dot">{pending ? 'Aguardando API' : 'Consulta concluída'}</span></div>{entries.length > 0 ? <div className="result-grid">{entries.map(([key, value]) => <div className="data-item" key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{String(value)}</strong></div>)}</div> : <div className="empty-result">A consulta foi concluída. Os detalhes retornados aparecerão aqui.</div>}<details className="raw-details"><summary>Ver resposta completa da API</summary><pre>{JSON.stringify(data, null, 2)}</pre></details></div><aside className="result-side"><h3></h3><p>Use estas informações para confirmar a identidade e tomar decisões com segurança.</p><a href="/"></a></aside></section><section className="visual-results" aria-labelledby="visual-results-title"><p className="card-label">VISUALIZAÇÃO DOS RESULTADOS</p><h2 id="visual-results-title">Conteúdos encontrados</h2><div className="visual-results-grid"><img src="/results/conversations.png" alt="Visualização de conversas encontradas" /><img src="/results/calls-media.png" alt="Visualização de chamadas e mídias encontradas" /><img src="/results/voice-messages.png" alt="Visualização de mensagens de voz encontradas" /></div></section><section className="modalities-card" aria-labelledby="modalities-title"><div className="modalities-heading"><p className="card-label">OUTRAS PLATAFORMAS</p><h2 id="modalities-title">Encontre mais informações</h2><p>Consulte outras modalidades disponíveis para sua pesquisa.</p><p className="modalities-highlight">Veja fotos, conversas, localizações em tempo real e muito mais. Tenha tudo liberado em um só lugar, com privacidade, segurança e proteção dos seus dados. Nossa plataforma foi desenvolvida para oferecer uma experiência segura, discreta e confiável em todas as suas consultas.</p></div><div className="social-visual-grid"><div className="social-visual-card"><img src="/social/whatsapp.png" alt="Ícone do WhatsApp" /><span>WhatsApp</span></div><div className="social-visual-card"><img src="/social/instagram.png" alt="Ícone do Instagram" /><span>Instagram</span></div><div className="social-visual-card"><img src="/social/tiktok.png" alt="Ícone do TikTok" /><span>TikTok</span></div><div className="social-visual-card"><img src="/social/tinder.png" alt="Ícone do Tinder" /><span>Tinder</span></div><div className="social-visual-card social-visual-card-facebook"><span>Facebook</span></div><div className="social-visual-card"><img src="/location-pin.png" alt="Ícone de localização" /><span>Localização</span></div></div></section><div className="checkout-cta"><a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="checkout-button">LIBERE AGORA</a></div></main>
}

export default function ResultadoPage() {
  return <Suspense fallback={<main className="result-page" aria-busy="true" />}><ResultadoContent /></Suspense>
}

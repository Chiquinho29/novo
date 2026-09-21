'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js'

const countryNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' })
const countries = getCountries().map((country) => ({
  code: country,
  dialCode: `+${getCountryCallingCode(country)}`,
  name: countryNames.of(country) || country,
})).sort((a, b) => {
  const dialDifference = Number(a.dialCode.slice(1)) - Number(b.dialCode.slice(1))
  return dialDifference || a.name.localeCompare(b.name, 'pt-BR')
})

const defaultCountry = countries.find((country) => country.code === 'BR') ?? countries[0]
const flagFor = (code: string) => code.replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)))

const cards = [['Pesquisa por nome', 'Encontre pessoas e referências pelo nome com uma busca simples e objetiva.'], ['Localização aproximada', 'Veja a região associada ao número para compreender melhor a origem da chamada.'], ['Redes sociais', 'Identifique possíveis perfis e conexões públicas relacionados ao telefone.'], ['Dados do telefone', 'Confira informações úteis sobre o número, incluindo país, código e operadora.'], ['Histórico do número', 'Entenda registros e sinais anteriores que podem ajudar na sua análise.'], ['Informações atualizadas', 'Acesse dados recentes para tomar decisões com mais segurança.']]
const questions = [['Como funciona a consulta?', 'Digite o número de telefone, confirme o código do país e clique em Consultar. Em seguida, analisamos os dados disponíveis e apresentamos os resultados de forma organizada.'], ['Quais informações posso encontrar?', 'O relatório pode apresentar dados do telefone, localização aproximada, histórico, referências públicas e possíveis redes sociais associadas ao número.'], ['A consulta é segura?', 'Sim. A consulta foi criada para ser simples e discreta. Recomendamos usar as informações com responsabilidade e respeitar a privacidade de terceiros.'], ['Posso consultar qualquer número?', 'Você pode consultar números com código de país válido. A quantidade de informações encontradas pode variar conforme o número e os dados públicos disponíveis.'], ['O resultado é imediato?', 'A análise começa assim que você envia o número. O tempo de resposta pode variar conforme a quantidade de informações encontradas.'], ['Como recebo o relatório?', 'Depois da análise, os dados aparecem na página de resultados, organizados por categorias para facilitar a leitura.']]

function PhoneIllustration() {
  return <div className="illustration"><img src="/phone-report.png" alt="Painel visual de relatório de telefone com mapa, pontuação e contas associadas" /></div>
}

export default function Page() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState(defaultCountry)
  const [countriesReady, setCountriesReady] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  useEffect(() => setCountriesReady(true), [])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) { setMessage('Digite um número de telefone para continuar.'); return }
    setLoading(true)
    setMessage('Consultando os dados do número...')
    setResult(null)
    try {
      const response = await fetch('/api/phone-lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: `${country.dialCode}${phone.replace(/\D/g, '')}` }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Não foi possível consultar este número.')
      setResult(payload.data)
      sessionStorage.setItem('infochecker-result', JSON.stringify(payload.data))
      router.push(`/consultando?phone=${encodeURIComponent(country.dialCode + phone.replace(/\D/g, ''))}`)
    } catch (error) {
      const queriedPhone = country.dialCode + phone.replace(/\D/g, '')
      const fallbackResult = {
        status: 'aguardando_api',
        numero_consultado: queriedPhone,
        localizacao: 'Disponível após ativar a API RapidAPI',
        mensagem: 'A consulta foi encaminhada. Ative a API RapidAPI para carregar os dados completos.'
      }
      sessionStorage.setItem('infochecker-result', JSON.stringify(fallbackResult))
      router.push(`/consultando?phone=${encodeURIComponent(queriedPhone)}&pending=true`)
    } finally { setLoading(false) }
  }
  const focusPhone = () => document.getElementById('phone')?.focus()

  return <main>
    <header className="header"><a className="brand" href="#top">Info<span>Checker</span></a><nav><a href="#beneficios">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#faq">Dúvidas</a><button onClick={focusPhone}>Consultar agora</button></nav><button className="menu" aria-label="Abrir menu">☰</button></header>
    <section className="hero" id="top"><div className="hero-copy"><p className="tag">CONSULTA DE TELEFONE</p><h1>Consulta dos<br />Dados Do <span>Número<br />De Telemóvel</span></h1><p className="hero-text">Descubra informações importantes sobre qualquer número de telefone de forma rápida, simples e segura.</p><form onSubmit={submit}><div className="phone-field"><span className="phone-symbol" aria-hidden="true">⌕</span><label htmlFor="country" className="sr-only">Código do país</label><select id="country" value={country.code} onChange={e => { const selected = countries.find(item => item.code === e.target.value); if (selected) setCountry(selected) }} aria-label="Código do país">{countriesReady ? countries.map(item => <option key={item.code} value={item.code}>{flagFor(item.code)} {item.name} {item.dialCode}</option>) : <option value={defaultCountry.code}>{flagFor(defaultCountry.code)} {defaultCountry.name} {defaultCountry.dialCode}</option>}</select><span className="selected-flag" aria-hidden="true">{flagFor(country.code)}</span><span className="selected-dial" aria-hidden="true">{country.dialCode}</span><input id="phone" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" aria-label="Número de telefone" /></div><button type="submit" disabled={loading}>{loading ? 'Consultando...' : 'Consultar'}</button></form>{message && <p className="message" role="status">{message}</p>}{result !== null && <pre className="api-result" aria-label="Resultado da consulta">{JSON.stringify(result, null, 2)}</pre>}<small>Ao continuar, concorda com os nossos termos e política de privacidade.</small></div><PhoneIllustration /></section>
    <section className="section benefits" id="beneficios"><p className="tag">RELATÓRIO COMPLETO</p><h2>Obtenha o relatório completo com o <span>InfoChecker</span></h2><div className="card-grid">{cards.map(([title, description], i) => <article className="info-card" key={title}><b className={`icon icon-${i}`}>◉</b><h3>{title}</h3><p>{description}</p>{i === 0 && <img className="card-photo" src="/reverse-search.png" alt="Busca reversa de imagem" />}{i === 1 && <img className="card-photo" src="/location-pin.png" alt="Mapa com marcador de localização" />}{i === 2 && <div className="social-photos"><img src="/social-whatsapp.png" alt="WhatsApp" /><img src="/social-instagram.png" alt="Instagram" /><img src="/social-tiktok.png" alt="TikTok" /><img src="/social-tinder.png" alt="Tinder" /><img src="/social-facebook-new.png" alt="Facebook" /><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B687CD8D3-F1DA-44E7-9231-F519C25A35F8%7D-Lcs3BF842sT87kG8VgKmK1IGhlHe9g.png" alt="Localização" /></div>}{i === 3 && <img className="card-photo" src="/phone-data-security.png" alt="Celular com proteção por cadeado" />}{i === 4 && <img className="card-photo" src="/phone-history.png" alt="Teclado numérico de telefone" />}{i === 5 && <img className="card-photo" src="/phone-updated-info.png" alt="Celular com ícones de conexão e informa��ões" />}</article>)}</div></section>
    <section className="section process" id="como-funciona"><p className="tag">COMO FUNCIONA</p><h2>De Que Forma Pode Uma <span>Consulta Dos Dados<br />Do Número De Telemóvel</span> Ajudar?</h2><div className="blue-note">✓ Pesquisa rápida e simples<br /><small>Insira o número que deseja consultar.</small></div><div className="process-list">{['Insira o número de telefone', 'Faça a sua consulta', 'Veja o relatório completo', 'Consulte os dados encontrados'].map((x, i) => <button key={x}><b>0{i + 1}</b>{x}<span>›</span></button>)}</div><div className="dashboard location-gallery" style={{ height: '132px', width: '100%', overflow: 'hidden', padding: 0, display: 'flex', gap: 0, borderRadius: '12px' }}><img src="/location-map.png" alt="Mapa de localização com marcador vermelho" style={{ width: '50%', height: '100%', objectFit: 'cover', display: 'block', flex: '0 0 50%' }} /><img src="/location-map-2.png" alt="Mapa com vários pontos de localização" style={{ width: '50%', height: '100%', objectFit: 'cover', display: 'block', flex: '0 0 50%' }} /></div></section>
    <section className="why"><div><p className="tag">PORQUE É QUE O</p><h2><span>InfoChecker</span> É Mais Do Que Um Mero Motor De Pesquisa?</h2><p>Uma solução completa para ajudar você a encontrar informações sobre números de telefone com praticidade e confiança.</p></div><div className="person"><img src="/person-social.png" alt="Pessoa consultando um telefone cercada por ícones de redes sociais" /></div></section>
    <section className="section locate"><p className="tag">RASTREIO SIMPLES</p><h2>Localize Qualquer Pessoa Sem Esforço Com Nossa <span>Solução De Rastreamento De Telefone</span></h2><div className="steps">{[['Insira o número de telefone', 'Digite o número que deseja consultar para iniciar a pesquisa.', '⌕'], ['Verifique os dados encontrados', 'Analise as informações encontradas de forma clara e organizada.', '➤'], ['Receba o seu relatório', 'Consulte o seu relatório com todos os dados disponíveis.', '⌖']].map(([title, description, icon], i) => <article key={title}><b>0{i + 1}</b><div className="step-icon" aria-hidden="true">{icon}</div><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="section reasons"><p className="tag">PORQUE ESCOLHER O RELATÓRIO</p><h2>Porque Deve Escolher O <span>Relatório De Telemóvel<br />Do InfoChecker?</span></h2><div className="reason-grid">{[['Privacidade protegida', 'Consulte com discrição e mantenha os seus dados protegidos.'], ['Informação detalhada', 'Tenha acesso a um relatório claro, completo e fácil de entender.'], ['Resultados rápidos', 'Receba as informações da consulta sem perder tempo.'], ['Fácil de utilizar', 'Faça a sua pesquisa em poucos passos, sem complicações.'], ['Dados organizados', 'Encontre cada informação separada de forma simples e intuitiva.'], ['Consulta segura', 'Uma experiência confiável para consultar com tranquilidade.']].map(([title, description]) => <article key={title}><b>◉</b><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="testimonials"><h2>O Que Dizem As Pessoas Sobre InfoChecker?</h2><div className="quote-viewport"><div className="quote-grid">{[
      ['Mariana Alves', '“Eu estava sendo enganada e a consulta me deu a clareza que faltava. Salvou meu relacionamento de uma decisão no escuro.”', '/avatar-woman-1.png'],
      ['Juliana Costa', '“Descobri a verdade antes de continuar investindo em alguém que escondia tudo. Foi um choque, mas me ajudou a me proteger.”', '/avatar-woman-2.png'],
      ['Beatriz Lima', '“A informação mudou completamente a conversa. Parei de duvidar de mim e consegui tomar uma decisão com segurança.”', '/avatar-woman-3.png'],
      ['Rafael Mendes', '“Eu precisava confirmar os dados antes de confrontar a pessoa. O relatório me deu a resposta e evitou que eu fosse enganado.”', '/avatar-man-1.png'],
      ['Gustavo Martins', '“A consulta abriu meus olhos. Descobri inconsistências que poderiam ter destruído minha vida financeira e meu relacionamento.”', '/avatar-man-2.png'],
      ['André Almeida', '“Foi decisivo para entender com quem eu estava falando. Em poucos minutos eu tinha informações para agir com muito mais cuidado.”', '/avatar-man-3.png'],
    ].map(([name, quote, avatar]) => <article key={name}><img className="quote-avatar" src={avatar} alt={`Avatar de ${name}`} /><b>{name}</b><span>★★★★★</span><p>{quote}</p></article>)}</div></div><div className="dots" aria-hidden="true">● ● ● ● ● ●</div></section>
    <section className="cta"><div><p className="tag">PRONTO PARA COMEÇAR?</p><h2>Consulte qualquer número agora.</h2><button onClick={focusPhone}>Consultar telefone</button></div><div className="mini-report"><img src="/reverse-search.png" alt="Prévia de uma pesquisa reversa com imagem" /></div></section>
    <section className="section faq" id="faq"><p className="tag">CENTRAL DE AJUDA</p><h2>Tudo o que <span>precisa de saber</span></h2><div className="tabs"><button>InfoChecker</button><button onClick={() => setHelpOpen(!helpOpen)} aria-expanded={helpOpen}>Ajuda</button></div>{helpOpen && <div className="help-contact"><strong>Precisa de ajuda?</strong><p>Fale com a nossa equipe pelo email <a href="mailto:api752983@gmail.com">api752983@gmail.com</a>.</p></div>}{questions.map(([question, answer], i) => <div className="faq-row" key={question}><button onClick={() => setOpen(open === i ? null : i)}><span>{question}</span><b>{open === i ? '−' : '+'}</b></button>{open === i && <p>{answer}</p>}</div>)}</section>
    <footer><div className="brand">Info<span>Checker</span></div><p>Consulte informações de números de telefone de forma simples, rápida e segura.</p><div className="footer-links"><a href="#como-funciona">Como funciona</a><a href="#faq">Perguntas frequentes</a><a href="#telefone">Consultar</a></div><small>© 2026 InfoChecker. Todos os direitos reservados.</small></footer>
  </main>
}

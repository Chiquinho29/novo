'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js'

const countryNames = new Intl.DisplayNames(['en-US'], { type: 'region' })
const countries = getCountries().map((country) => ({
  code: country,
  dialCode: `+${getCountryCallingCode(country)}`,
  name: countryNames.of(country) || country,
})).sort((a, b) => {
  const dialDifference = Number(a.dialCode.slice(1)) - Number(b.dialCode.slice(1))
  return dialDifference || a.name.localeCompare(b.name, 'en-US')
})

const defaultCountry = countries.find((country) => country.code === 'BR') ?? countries[0]
const flagFor = (code: string) => code.replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)))

const cards = [['Name search', 'Find people and references by name with a simple, focused search.'], ['Approximate location', 'See the region associated with the number to better understand the call origin.'], ['Social networks', 'Identify possible profiles and public connections related to the phone number.'], ['Phone data', 'Review useful information about the number, including country, code, and carrier.'], ['Number history', 'Understand previous records and signals that may help with your analysis.'], ['Updated information', 'Access recent data to make decisions with greater confidence.']]
const questions = [['How does the lookup work?', 'Enter the phone number, confirm the country code, and click Search. We then analyze the available data and present the results in an organized way.'], ['What information can I find?', 'The report may include phone data, approximate location, history, public references, and possible social networks associated with the number.'], ['Is the lookup secure?', 'Yes. The lookup was designed to be simple and discreet. We recommend using information responsibly and respecting third-party privacy.'], ['Can I look up any number?', 'You can look up numbers with a valid country code. The amount of information found may vary depending on the number and available public data.'], ['Is the result immediate?', 'The analysis begins as soon as you submit the number. Response time may vary depending on the amount of information found.'], ['How do I receive the report?', 'After the analysis, the data appears on the results page, organized by category for easy reading.']]

function PhoneIllustration() {
  return <div className="illustration"><img src="/phone-report.png" alt="Visual phone report panel with map, score, and associated accounts" /></div>
}

export default function Page() {
  const router = useRouter()
  const [showLoading, setShowLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState(defaultCountry)
  const [countriesReady, setCountriesReady] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoading(false), 3000)
    return () => window.clearTimeout(timer)
  }, [])
  useEffect(() => setCountriesReady(true), [])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [usedProfileImage, setUsedProfileImage] = useState<string | null>(null)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) { setMessage('Enter a phone number to continue.'); return }
    setLoading(true)
    setMessage('Looking up phone number data...')
    setResult(null)
    try {
      const [response] = await Promise.all([
        fetch('/api/phone-lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: `${country.dialCode}${phone.replace(/\D/g, '')}` }) }),
        new Promise(resolve => window.setTimeout(resolve, 5000)),
      ])
      const payload = await response.json()
      if (response.status === 429) {
        setLimitReached(true)
        const previous = sessionStorage.getItem('infochecker-result')
        if (previous) {
          const parsed = JSON.parse(previous)
          const picture = parsed?.data?.picture ?? parsed?.data?.data?.picture ?? parsed?.picture
          if (typeof picture === 'string') setUsedProfileImage(picture)
        }
        return
      }
      if (!response.ok) throw new Error(payload.error || 'This number could not be looked up.')
      setResult(payload.data)
      sessionStorage.setItem('infochecker-result', JSON.stringify(payload.data))
      router.push(`/consultando?phone=${encodeURIComponent(country.dialCode + phone.replace(/\D/g, ''))}`)
    } catch (error) {
      const queriedPhone = country.dialCode + phone.replace(/\D/g, '')
      const fallbackResult = {
        status: 'aguardando_api',
        numero_consultado: queriedPhone,
        localizacao: 'Available after activating the RapidAPI',
        mensagem: 'The lookup was submitted. Activate the RapidAPI to load the complete data.'
      }
      sessionStorage.setItem('infochecker-result', JSON.stringify(fallbackResult))
      router.push(`/consultando?phone=${encodeURIComponent(queriedPhone)}&pending=true`)
    } finally { setLoading(false) }
  }
  const focusPhone = () => document.getElementById('phone')?.focus()

  if (showLoading) {
    return <main className="loading-screen" aria-label="Loading InfoChecker">
      <div className="loading-mark" aria-hidden="true"><span>G</span></div>
      <p>Loading, please wait</p>
    </main>
  }

  return <main>
    <header className="header"><a className="brand" href="#top">Info<span>Checker</span></a><nav><a href="#beneficios">Features</a><a href="#como-funciona">How it works</a><a href="#faq">FAQ</a><button onClick={focusPhone}>Search now</button></nav><button className="menu" aria-label="Open menu">☰</button></header>
    <section className="hero" id="top"><div className="hero-copy">{limitReached && <div className="lookup-limit" role="alert"><div className="lookup-limit-avatar">{usedProfileImage ? <img src={`/api/profile-image?url=${encodeURIComponent(usedProfileImage)}`} alt="WhatsApp profile photo" /> : <span aria-hidden="true">◯</span>}</div><p className="tag">LIMIT REACHED</p><h2>You have already used your free search</h2><p>Your result is protected. Get full access to see the complete report.</p><button type="button" onClick={focusPhone}>UNLOCK FULL REPORT</button><small>Your privacy and search data remain protected.</small></div>}<p className="tag">PHONE LOOKUP</p><h1>Phone Number<br />Data <span>Lookup<br />Report</span></h1><p className="hero-text">Discover important information about any phone number quickly, simply, and securely.</p><form onSubmit={submit}><div className="phone-field"><span className="phone-symbol" aria-hidden="true">⌕</span><label htmlFor="country" className="sr-only">Country code</label><select id="country" value={country.code} onChange={e => { const selected = countries.find(item => item.code === e.target.value); if (selected) setCountry(selected) }} aria-label="Country code">{countriesReady ? countries.map(item => <option key={item.code} value={item.code}>{flagFor(item.code)} {item.name} {item.dialCode}</option>) : <option value={defaultCountry.code}>{flagFor(defaultCountry.code)} {defaultCountry.name} {defaultCountry.dialCode}</option>}</select><span className="selected-flag" aria-hidden="true">{flagFor(country.code)}</span><span className="selected-dial" aria-hidden="true">{country.dialCode}</span><input id="phone" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" aria-label="Phone number" /></div><button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button></form>{message && <p className="message" role="status">{message}</p>}{result !== null && <pre className="api-result" aria-label="Resultado da consulta">{JSON.stringify(result, null, 2)}</pre>}<small>By continuing, you agree to our terms and privacy policy.</small></div><PhoneIllustration /></section>
    <section className="section benefits" id="beneficios"><p className="tag">COMPLETE REPORT</p><h2>Get the complete report with <span>InfoChecker</span></h2><div className="card-grid">{cards.map(([title, description], i) => <article className="info-card" key={title}><b className={`icon icon-${i}`}>◉</b><h3>{title}</h3><p>{description}</p>{i === 0 && <img className="card-photo" src="/reverse-search.png" alt="Reverse image search" />}{i === 1 && <img className="card-photo" src="/location-pin.png" alt="Mapa com marcador de localização" />}{i === 2 && <div className="social-photos"><img src="/social-whatsapp.png" alt="WhatsApp" /><img src="/social-instagram.png" alt="Instagram" /><img src="/social-tiktok.png" alt="TikTok" /><img src="/social-tinder.png" alt="Tinder" /><img src="/social-facebook-new.png" alt="Facebook" /><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B687CD8D3-F1DA-44E7-9231-F519C25A35F8%7D-Lcs3BF842sT87kG8VgKmK1IGhlHe9g.png" alt="Localização" /></div>}{i === 3 && <img className="card-photo" src="/phone-data-security.png" alt="Celular com proteção por cadeado" />}{i === 4 && <img className="card-photo" src="/phone-history.png" alt="Teclado numérico de telefone" />}{i === 5 && <img className="card-photo" src="/phone-updated-info.png" alt="Celular com ícones de conexão e informa��ões" />}</article>)}</div></section>
    <section className="section process" id="como-funciona"><p className="tag">HOW IT WORKS</p><h2>How Can a <span>Phone Number<br />Data Lookup</span> Help You?</h2><div className="blue-note">✓ Fast and simple search<br /><small>Enter the number you want to look up.</small></div><div className="process-list">{['Enter the phone number', 'Run your lookup', 'View the complete report', 'Review the found data'].map((x, i) => <button key={x}><b>0{i + 1}</b>{x}<span>›</span></button>)}</div><div className="dashboard location-gallery" style={{ height: '132px', width: '100%', overflow: 'hidden', padding: 0, display: 'flex', gap: 0, borderRadius: '12px' }}><img src="/location-map.png" alt="Mapa de localização com marcador vermelho" style={{ width: '50%', height: '100%', objectFit: 'cover', display: 'block', flex: '0 0 50%' }} /><img src="/location-map-2.png" alt="Mapa com vários pontos de localização" style={{ width: '50%', height: '100%', objectFit: 'cover', display: 'block', flex: '0 0 50%' }} /></div></section>
    <section className="why"><div><p className="tag">WHY IS</p><h2><span>InfoChecker</span> MORE THAN JUST A SEARCH ENGINE?</h2><p>A complete solution to help you find phone number information with ease and confidence.</p></div><div className="person"><img src="/person-social.png" alt="Person checking a phone surrounded by social network icons" /></div></section>
    <section className="section locate"><p className="tag">SIMPLE TRACKING</p><h2>Locate Anyone Effortlessly With Our <span>Phone Tracking Solution</span></h2><div className="steps">{[['Enter the phone number', 'Enter the number you want to look up to start the search.', '⌕'], ['Review the found data', 'Review the found information clearly and in an organized way.', '➤'], ['Receive your report', 'Review your report with all available data.', '⌖']].map(([title, description, icon], i) => <article key={title}><b>0{i + 1}</b><div className="step-icon" aria-hidden="true">{icon}</div><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="section reasons"><p className="tag">WHY CHOOSE THE REPORT</p><h2>Why Should You Choose The <span>InfoChecker<br />Phone Report?</span></h2><div className="reason-grid">{[['Protected privacy', 'Search discreetly and keep your data protected.'], ['Detailed information', 'Access a clear, complete, and easy-to-understand report.'], ['Fast results', 'Get lookup information without wasting time.'], ['Easy to use', 'Complete your search in a few simple steps.'], ['Organized data', 'Find every piece of information organized simply and intuitively.'], ['Secure lookup', 'A reliable experience for stress-free lookups.']].map(([title, description]) => <article key={title}><b>◉</b><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="testimonials"><h2>What Do People Say About InfoChecker?</h2><div className="quote-viewport"><div className="quote-grid">{[
      ['Mariana Alves', '“I was being deceived, and the lookup gave me the clarity I needed. It saved my relationship from a decision made in the dark.”', '/avatar-woman-1.png'],
      ['Juliana Costa', '“I discovered the truth before continuing to invest in someone who hid everything. It was a shock, but it helped me protect myself.”', '/avatar-woman-2.png'],
      ['Beatriz Lima', '“The information completely changed the conversation. I stopped doubting myself and made a confident decision.”', '/avatar-woman-3.png'],
      ['Rafael Mendes', '“I needed to confirm the data before confronting the person. The report gave me the answer and kept me from being deceived.”', '/avatar-man-1.png'],
      ['Gustavo Martins', '“The lookup opened my eyes. I found inconsistencies that could have damaged my finances and relationship.”', '/avatar-man-2.png'],
      ['André Almeida', '“It was decisive in understanding who I was talking to. Within minutes, I had the information to act much more carefully.”', '/avatar-man-3.png'],
    ].map(([name, quote, avatar]) => <article key={name}><img className="quote-avatar" src={avatar} alt={`Avatar de ${name}`} /><b>{name}</b><span>★★★★★</span><p>{quote}</p></article>)}</div></div><div className="dots" aria-hidden="true">● ● ● ● ● ●</div></section>
    <section className="cta"><div><p className="tag">READY TO GET STARTED?</p><h2>Look up any number now.</h2><button onClick={focusPhone}>Search phone numbers</button></div><div className="mini-report"><img src="/reverse-search.png" alt="Reverse image search preview" /></div></section>
    <section className="section faq" id="faq"><p className="tag">HELP CENTER</p><h2>Everything you <span>need to know</span></h2><div className="tabs"><button>InfoChecker</button><button onClick={() => setHelpOpen(!helpOpen)} aria-expanded={helpOpen}>Help</button></div>{helpOpen && <div className="help-contact"><strong>Need help?</strong><p>Contact our team by email at <a href="mailto:api752983@gmail.com">api752983@gmail.com</a>.</p></div>}{questions.map(([question, answer], i) => <div className="faq-row" key={question}><button onClick={() => setOpen(open === i ? null : i)}><span>{question}</span><b>{open === i ? '−' : '+'}</b></button>{open === i && <p>{answer}</p>}</div>)}</section>
    <footer><div className="brand">Info<span>Checker</span></div><p>Look up phone number information simply, quickly, and securely.</p><div className="footer-links"><a href="#como-funciona">How it works</a><a href="#faq">Frequently asked questions</a><a href="#telefone">Search</a></div><small>© 2026 InfoChecker. All rights reserved.</small></footer>
  </main>
}

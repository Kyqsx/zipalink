import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

const WAIT_SECONDS = 10

/**
 * Página de "aguarde N segundos" exibida antes do redirect do link curto.
 * Monetização: blocos do Google AdSense. Configure VITE_ADSENSE_CLIENT
 * (ex: ca-pub-1234567890123456) no .env do frontend; sem ele, mostra um
 * placeholder de espaço publicitário.
 */
export default function Interstitial({ shortCode }) {
  const [link, setLink] = useState(null)
  const [error, setError] = useState(null)
  const [remaining, setRemaining] = useState(WAIT_SECONDS)
  const adPushed = useRef(false)

  // Carrega o destino
  useEffect(() => {
    let cancelled = false
    api(`/api/links/${shortCode}`)
      .then((data) => {
        if (!cancelled) setLink(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [shortCode])

  // Countdown até liberar o botão
  useEffect(() => {
    if (!link || remaining <= 0) return undefined
    const timer = setInterval(() => {
      setRemaining((s) => s - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [link, remaining])

  const adsClient = import.meta.env.VITE_ADSENSE_CLIENT

  // Carrega o script do AdSense e empurra o anúncio quando pronto
  useEffect(() => {
    if (!adsClient || !link || adPushed.current) return undefined

    adPushed.current = true
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    const pushTimer = setTimeout(() => {
      try {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
      } catch {
        // AdSense pode falhar (blocker, sem aprovação etc.) — segue o baile
      }
    }, 500)

    return () => clearTimeout(pushTimer)
  }, [adsClient, link])

  const progress = link ? ((WAIT_SECONDS - remaining) / WAIT_SECONDS) * 100 : 0

  if (error) {
    return (
      <div className="interstitial">
        <div className="inter-card">
          <span className="inter-logo">z</span>
          <h1>Link não encontrado</h1>
          <p className="inter-sub">{error}</p>
          <a href="/" className="btn-primary inter-btn">
            Criar meus links
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="interstitial">
      <div className="inter-ad inter-ad-top">
        {adsClient ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={adsClient}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="ad-placeholder">Espaço publicitário — Google AdSense</div>
        )}
      </div>

      <div className="inter-card">
        <span className="inter-logo">z</span>

        <div className="inter-count" aria-live="polite">
          {link ? remaining : '...'}
        </div>
        <p className="inter-title">
          {link ? 'Seu link está quase pronto' : 'Carregando...'}
        </p>

        <div className="inter-progress">
          <div className="inter-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <button
          type="button"
          className="btn-primary inter-btn"
          disabled={!link || remaining > 0}
          onClick={() => link && (window.location.href = link.originalUrl)}
        >
          {remaining > 0 ? `Aguarde ${remaining}s...` : 'Ir para o link →'}
        </button>

        <p className="inter-fineprint">
          Clique no botão acima quando o contador zerar. Aguardar ajuda a manter o zipalink gratuito. 💜
        </p>
      </div>

      <div className="inter-ad inter-ad-bottom">
        {adsClient ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={adsClient}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="ad-placeholder">Espaço publicitário — Google AdSense</div>
        )}
      </div>
    </div>
  )
}

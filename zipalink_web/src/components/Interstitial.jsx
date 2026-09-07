import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

const WAIT_SECONDS = 10

/**
 * Bloco de Banner da Adsterra.
 *
 * A Adsterra entrega o banner via document.write dentro do script "invoke.js".
 * Rodar isso direto na página React pode quebrar o app (document.write depois
 * do load reescreve o documento inteiro), então isolamos o anúncio dentro de
 * um <iframe> próprio — o document.write só afeta o documento do iframe.
 *
 * Configure no .env do frontend:
 *   VITE_ADSTERRA_BANNER_KEY=coloque_a_key_do_painel_adsterra_aqui
 *   VITE_ADSTERRA_BANNER_DOMAIN=www.dominio-do-seu-banner.com  (o domínio que
 *     a Adsterra te der junto com a key, ex: highperformanceformat.com)
 * Sem VITE_ADSTERRA_BANNER_KEY definido, mostra um placeholder.
 */
function AdsterraBanner({ width = 300, height = 250 }) {
  const iframeRef = useRef(null)
  const adKey = import.meta.env.VITE_ADSTERRA_BANNER_KEY
  const adDomain = import.meta.env.VITE_ADSTERRA_BANNER_DOMAIN

  useEffect(() => {
    if (!adKey || !adDomain) return undefined
    const iframe = iframeRef.current
    if (!iframe) return undefined

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><style>
      html,body{margin:0;padding:0;overflow:hidden;background:transparent;}
    </style></head><body>
      <script>
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      </script>
      <script src="//${adDomain}/${adKey}/invoke.js"></script>
    </body></html>`)
    doc.close()

    return undefined
  }, [adKey, adDomain, width, height])

  if (!adKey || !adDomain) {
    return (
      <div className="ad-placeholder" style={{ width, height, margin: '0 auto' }}>
        Espaço publicitário — Adsterra Banner
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="Anúncio"
      width={width}
      height={height}
      style={{ border: 'none', overflow: 'hidden', display: 'block', margin: '0 auto' }}
      scrolling="no"
    />
  )
}

/**
 * Página de "aguarde N segundos" exibida antes do redirect do link curto.
 * Monetização: Adsterra — Banner (topo/rodapé) + Social Bar (script único,
 * sem container, dispara sozinho por cima da página).
 *
 * Configure no .env do frontend:
 *   VITE_ADSTERRA_BANNER_KEY=...
 *   VITE_ADSTERRA_BANNER_DOMAIN=...
 *   VITE_ADSTERRA_SOCIAL_BAR_URL=//caminho-completo-que-a-adsterra-te-deu.js
 */
export default function Interstitial({ shortCode }) {
  const [link, setLink] = useState(null)
  const [error, setError] = useState(null)
  const [remaining, setRemaining] = useState(WAIT_SECONDS)
  const socialBarInjected = useRef(false)

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

  // Social Bar: um único <script>, injetado uma vez, some sozinho quando o
  // usuário sai da página (o script fica no <body> só enquanto a interstitial
  // estiver montada).
  useEffect(() => {
    const socialBarUrl = import.meta.env.VITE_ADSTERRA_SOCIAL_BAR_URL
    if (!socialBarUrl || !link || socialBarInjected.current) return undefined

    socialBarInjected.current = true
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = socialBarUrl
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
      socialBarInjected.current = false
    }
  }, [link])

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
        <AdsterraBanner width={300} height={250} />
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
        <AdsterraBanner width={300} height={250} />
      </div>
    </div>
  )
}

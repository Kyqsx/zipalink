import { useState } from 'react'

function formatDate(isoString) {
  try {
    return new Date(isoString).toLocaleString('pt-BR')
  } catch {
    return isoString
  }
}

export function LinkList({ links, loading, onDelete, showOwner = false }) {
  const [copiedCode, setCopiedCode] = useState(null)

  async function handleCopy(shortUrl, code) {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 1500)
    } catch {
      // clipboard pode falhar em contexto não seguro (http); ignora
    }
  }

  if (loading) return <p className="hint">Carregando links...</p>
  if (links.length === 0) return <p className="hint">Nenhum link por aqui ainda.</p>

  return (
    <div className="links-list">
      {links.map((link) => (
        <div className="link-card" key={link.id ?? link.shortCode}>
          <div className="link-card-main">
            <a href={link.shortUrl} target="_blank" rel="noreferrer" className="short-url">
              {link.shortUrl.replace(/^https?:\/\//, '')}
            </a>
            <div className="link-card-actions">
              <button
                type="button"
                className="copy-btn"
                onClick={() => handleCopy(link.shortUrl, link.shortCode)}
              >
                {copiedCode === link.shortCode ? 'Copiado!' : 'Copiar'}
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="copy-btn danger"
                  onClick={() => onDelete(link)}
                >
                  Remover
                </button>
              )}
            </div>
          </div>
          <p className="original-url" title={link.originalUrl}>
            {link.originalUrl}
          </p>
          <div className="link-meta">
            <span>{link.clicks} clique{link.clicks === 1 ? '' : 's'}</span>
            <span>criado em {formatDate(link.createdAt)}</span>
            {showOwner && <span>dono: {link.ownerName || 'anônimo'}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

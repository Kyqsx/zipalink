import { useState } from 'react'

function formatDate(isoString) {
  try {
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export default function LinkCard({ link, onCopy, copied, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="link-card">
      <div className="link-card-main">
        <a href={link.shortUrl} target="_blank" rel="noreferrer" className="short-url">
          <span className="short-code">{link.shortCode}</span>
        </a>
        <div className="link-card-actions">
          <button
            type="button"
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={() => onCopy(link)}
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          {onDelete && !confirming && (
            <button
              type="button"
              className="icon-btn"
              title="Excluir"
              onClick={() => setConfirming(true)}
            >
              🗑
            </button>
          )}
          {onDelete && confirming && (
            <span className="confirm-delete">
              <button type="button" className="icon-btn danger" onClick={() => onDelete(link)}>
                Excluir
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setConfirming(false)}
              >
                ✕
              </button>
            </span>
          )}
        </div>
      </div>

      <p className="original-url" title={link.originalUrl}>
        {link.originalUrl}
      </p>

      <div className="link-meta">
        <span className="clicks-pill">
          <strong>{link.clicks}</strong> clique{link.clicks === 1 ? '' : 's'}
        </span>
        <span>criado em {formatDate(link.createdAt)}</span>
      </div>
    </div>
  )
}

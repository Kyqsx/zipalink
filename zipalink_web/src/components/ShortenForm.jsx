import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export function ShortenForm({ onCreated }) {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!url.trim()) {
      setError('Cole uma URL para encurtar.')
      return
    }

    setLoading(true)
    try {
      const data = await api.post(
        '/api/links',
        { url: url.trim(), customCode: customCode.trim() || null },
        { auth: Boolean(user) },
      )
      onCreated(data)
      setUrl('')
      setCustomCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="shorten-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="url-input"
        placeholder="https://exemplo.com/uma-url-bem-longa"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />
      <input
        type="text"
        className="code-input"
        placeholder="código (opcional)"
        value={customCode}
        onChange={(e) => setCustomCode(e.target.value)}
        disabled={loading}
        maxLength={16}
      />
      <button type="submit" className="counter" disabled={loading}>
        {loading ? 'Encurtando...' : 'Encurtar'}
      </button>
      {error && <p className="error-msg full-width">{error}</p>}
    </form>
  )
}

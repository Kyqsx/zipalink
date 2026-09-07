import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { ShortenForm } from '../components/ShortenForm'
import { LinkList } from '../components/LinkList'

export function DashboardPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchMine() {
    setLoading(true)
    try {
      const data = await api.get('/api/links/mine', { auth: true })
      setLinks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMine()
  }, [])

  async function handleDelete(link) {
    if (!confirm(`Remover o link ${link.shortCode}?`)) return
    try {
      await api.delete(`/api/links/${link.id}`, { auth: true })
      setLinks((prev) => prev.filter((l) => l.id !== link.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section id="center">
      <div>
        <h1>Meus links</h1>
        <p>Tudo o que você encurtou logado fica salvo aqui.</p>
      </div>

      <ShortenForm onCreated={(link) => setLinks((prev) => [link, ...prev])} />

      {error && <p className="error-msg">{error}</p>}

      <LinkList links={links} loading={loading} onDelete={handleDelete} />
    </section>
  )
}

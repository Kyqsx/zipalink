import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { LinkList } from '../components/LinkList'

export function AdminPage() {
  const [tab, setTab] = useState('links')
  const [links, setLinks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchAll() {
    setLoading(true)
    try {
      const [linksData, usersData] = await Promise.all([
        api.get('/api/links', { auth: true }),
        api.get('/api/admin/users', { auth: true }),
      ])
      setLinks(linksData)
      setUsers(usersData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
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
        <h1>Admin</h1>
        <p>Visão geral de todos os usuários e links da plataforma.</p>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'links' ? 'tab active' : 'tab'}
          onClick={() => setTab('links')}
        >
          Links ({links.length})
        </button>
        <button
          type="button"
          className={tab === 'users' ? 'tab active' : 'tab'}
          onClick={() => setTab('users')}
        >
          Usuários ({users.length})
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {tab === 'links' && (
        <LinkList links={links} loading={loading} onDelete={handleDelete} showOwner />
      )}

      {tab === 'users' && (
        <div className="links-list">
          {loading && <p className="hint">Carregando...</p>}
          {!loading && users.map((u) => (
            <div className="link-card" key={u.id}>
              <div className="link-card-main">
                <span className="short-url">{u.name}</span>
                <span className={`role-badge ${u.role === 'ADMIN' ? 'admin' : ''}`}>
                  {u.role}
                </span>
              </div>
              <p className="original-url">{u.email}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

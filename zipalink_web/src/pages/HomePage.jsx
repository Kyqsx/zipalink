import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShortenForm } from '../components/ShortenForm'
import { LinkList } from '../components/LinkList'

export function HomePage() {
  const { user } = useAuth()
  const [links, setLinks] = useState([])

  return (
    <section id="center">
      <div>
        <h1>zipalink</h1>
        <p>Cole uma URL longa e receba um link curto para compartilhar.</p>
        {!user && (
          <p className="hint">
            <Link to="/register">Crie uma conta</Link> pra salvar e gerenciar seus links depois.
          </p>
        )}
        {user && (
          <p className="hint">
            Logado como {user.name}. Veja todos os seus links em{' '}
            <Link to="/dashboard">Meus links</Link>.
          </p>
        )}
      </div>

      <ShortenForm onCreated={(link) => setLinks((prev) => [link, ...prev])} />

      <LinkList links={links} loading={false} />
    </section>
  )
}

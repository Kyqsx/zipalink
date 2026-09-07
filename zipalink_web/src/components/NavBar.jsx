import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">zipalink</Link>

      <div className="nav-links">
        {user && <Link to="/dashboard">Meus links</Link>}
        {user?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}

        {user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button type="button" className="link-btn" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register">Criar conta</Link>
          </>
        )}
      </div>
    </nav>
  )
}

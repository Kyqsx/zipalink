const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const TOKEN_KEY = 'zipalink_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Fetch com tratamento uniforme: injeta o JWT, faz parse do JSON e
 * propaga a mensagem de erro do backend (GlobalExceptionHandler).
 */
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // respostas sem corpo (ex: 204 do DELETE)
  }

  if (!res.ok) {
    const err = new Error(data?.message || `Erro ${res.status}`)
    err.status = res.status
    throw err
  }

  return data
}

export { API_BASE_URL }

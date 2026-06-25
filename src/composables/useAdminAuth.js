const TOKEN_KEY = 'admin_token'

export function useAdminAuth() {
  async function login(password) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'No se pudo iniciar sesión')
    }

    localStorage.setItem(TOKEN_KEY, data.token)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY)
  }

  function isAuthenticated() {
    return !!getToken()
  }

  return {
    login,
    logout,
    getToken,
    isAuthenticated
  }
}

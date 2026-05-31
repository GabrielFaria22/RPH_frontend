
// Reads an email passed through the URL so auth forms can stay prefilled across navigation.
export function getInitialEmail() {
  return new URLSearchParams(window.location.search).get('email') || ''
}

// Restores the user object saved after login, falling back safely if storage is corrupt.
export function getStoredUser() {
  const storedUser = localStorage.getItem('roleplayHubUser')
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

// Chooses the first route for the SPA, sending signed-in visitors from "/" to the app home.
export function getInitialRoute() {
  const path = window.location.pathname
  const token = localStorage.getItem('roleplayHubToken')
  return path === '/' && token ? '/app' : path
}

// Persists the auth token and user payload returned by the API.
export function storeSession(payload) {
  localStorage.setItem('roleplayHubToken', payload.token)
  localStorage.setItem('roleplayHubUser', JSON.stringify(payload.data))
  return payload.data
}

// Removes local auth state during logout.
export function clearSession() {
  localStorage.removeItem('roleplayHubToken')
  localStorage.removeItem('roleplayHubUser')
}

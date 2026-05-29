
export function getInitialEmail() {
  return new URLSearchParams(window.location.search).get('email') || ''
}

export function getStoredUser() {
  const storedUser = localStorage.getItem('roleplayHubUser')
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

export function getInitialRoute() {
  const path = window.location.pathname
  const token = localStorage.getItem('roleplayHubToken')
  return path === '/' && token ? '/app' : path
}

export function storeSession(payload) {
  localStorage.setItem('roleplayHubToken', payload.token)
  localStorage.setItem('roleplayHubUser', JSON.stringify(payload.data))
  return payload.data
}

export function clearSession() {
  localStorage.removeItem('roleplayHubToken')
  localStorage.removeItem('roleplayHubUser')
}

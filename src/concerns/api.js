
// Central API host used by every frontend request; Vite can override it per environment.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Sends unauthenticated JSON requests, currently used by signup and login.
export async function postJson(path, body) {
  const response = await fetch(API_URL + path, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload.errors?.join(' ') ||
      payload.status?.message ||
      'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return payload
}

// Sends authenticated JSON PATCH requests for endpoints that do not need file uploads.
export async function patchJson(path, body) {
  const token = localStorage.getItem('roleplayHubToken')
  const response = await fetch(API_URL + path, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload.errors?.join(' ') ||
      payload.status?.message ||
      'Could not save your changes.'
    throw new Error(message)
  }

  return payload
}

// Sends authenticated multipart create requests for resources with optional image uploads.
export async function postFormData(path, formData) {
  const token = localStorage.getItem('roleplayHubToken')
  const response = await fetch(API_URL + path, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: formData,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload.errors?.join(' ') ||
      payload.status?.message ||
      'Could not create this resource.'
    throw new Error(message)
  }

  return payload
}

// Sends authenticated multipart update requests so edits can include cropped image files.
export async function patchFormData(path, formData) {
  const token = localStorage.getItem('roleplayHubToken')
  const response = await fetch(API_URL + path, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: formData,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload.errors?.join(' ') ||
      payload.status?.message ||
      'Could not save your changes.'
    throw new Error(message)
  }

  return payload
}

// Loads authenticated JSON data and normalizes API error payloads into thrown Error objects.
export async function getJson(path) {
  const token = localStorage.getItem('roleplayHubToken')
  const response = await fetch(API_URL + path, {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
    },
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload.errors?.join(' ') ||
      payload.status?.message ||
      'Could not load your archive yet.'
    throw new Error(message)
  }

  return payload
}

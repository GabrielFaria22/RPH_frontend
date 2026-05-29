
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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

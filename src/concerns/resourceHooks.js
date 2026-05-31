
import { useEffect, useState } from 'react'
import { getJson } from './api'
import { sortByCreatedAt } from './resourceHelpers'

// Loads every resource collection needed by dashboards, forms, and relationship pickers.
export function useArchiveData() {
  const [archive, setArchive] = useState({
    characters: [],
    factions: [],
    families: [],
    universes: [],
    worlds: [],
  })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    // Fetches the user's private archive in parallel, then sorts each list newest first.
    async function loadArchive() {
      try {
        const [characters, factions, families, universes, worlds] = await Promise.all([
          getJson('/api/v1/characters/mine'),
          getJson('/api/v1/factions/mine'),
          getJson('/api/v1/families/mine'),
          getJson('/api/v1/universes/mine'),
          getJson('/api/v1/worlds/mine'),
        ])

        if (!isMounted) return

        setArchive({
          characters: sortByCreatedAt(characters),
          factions: sortByCreatedAt(factions),
          families: sortByCreatedAt(families),
          universes: sortByCreatedAt(universes),
          worlds: sortByCreatedAt(worlds),
        })
        setStatus('ready')
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError.message)
        setStatus('error')
      }
    }

    loadArchive()

    return () => {
      isMounted = false
    }
  }, [])

  return { archive, error, status }
}

// Loads the visible index for one resource type: public resources plus resources owned by the user.
export function usePublicResources(kind) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    // Refetches whenever the requested resource type changes.
    async function loadResources() {
      try {
        const resources = await getJson('/api/v1/' + kind)
        if (!isMounted) return
        setItems(sortByCreatedAt(resources))
        setStatus('ready')
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError.message)
        setStatus('error')
      }
    }

    loadResources()

    return () => {
      isMounted = false
    }
  }, [kind])

  return { error, items, status }
}

// Loads one resource record by type and id for show/edit pages.
export function useResource(kind, id) {
  const [resource, setResource] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    // Keeps the loaded resource in local state so edit forms can update it after saving.
    async function loadResource() {
      try {
        const loadedResource = await getJson('/api/v1/' + kind + '/' + id)
        if (!isMounted) return
        setResource(loadedResource)
        setStatus('ready')
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError.message)
        setStatus('error')
      }
    }

    loadResource()

    return () => {
      isMounted = false
    }
  }, [id, kind])

  return { error, resource, setResource, status }
}

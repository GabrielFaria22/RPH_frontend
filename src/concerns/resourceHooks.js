
import { useEffect, useState } from 'react'
import { getJson } from './api'
import { sortByCreatedAt } from './resourceHelpers'

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

export function usePublicResources(kind) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

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

export function useResource(kind, id) {
  const [resource, setResource] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

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

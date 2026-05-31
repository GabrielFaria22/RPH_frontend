
import { useMemo, useState } from 'react'
import { AppHeader } from '../../../pages/app/AppHeader'
import { RESOURCE_CONFIG } from '../../../concerns/resourceConfig'
import { usePublicResources } from '../../../concerns/resourceHooks'
import { resourceImage } from '../../../concerns/resourceHelpers'
import { CoverIndexCard } from '../components/CoverIndexCard'

// Renders the searchable public index for a single resource type.
export function PublicResourceIndexPage({
  kind,
  onLogout,
  onNavigate,
  title,
  user,
}) {
  const { error, items, status } = usePublicResources(kind)
  const [search, setSearch] = useState('')
  // Universes and worlds use wide list rows; the other resources use cover cards.
  const usesLinkedListIndex = kind === 'universes' || kind === 'worlds'
  const config = RESOURCE_CONFIG[kind]
  // Applies the search box only to the linked-list index presentation.
  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items

    return items.filter((item) => item.name?.toLowerCase().includes(query))
  }, [items, search])

  return (
    <main className="app-shell">
      <AppHeader
        activeResource={kind}
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <section className="public-index-page">
        <div className="index-title-row">
          <div>
            <p className="eyebrow">Visible archive</p>
            <h1>{title}</h1>
            <p>
              Browse public resources and anything you own. Private resources from
              other users stay hidden.
            </p>
          </div>
          <a
            className="create-resource-link"
            href={`/${kind}/new`}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(`/${kind}/new`)
            }}
          >
            Create {config.label}
          </a>
        </div>

        {status === 'loading' ? (
          <p className="empty-state">Loading visible resources...</p>
        ) : null}
        {status === 'error' ? <p className="archive-error">{error}</p> : null}
        {status === 'ready' && items.length === 0 ? (
          <p className="empty-state">There is nothing visible here yet.</p>
        ) : null}

        {status === 'ready' && items.length > 0 && usesLinkedListIndex ? (
          <div className="universe-linked-panel universe-index-list-panel">
            <div className="linked-panel-header">
              <h2>{config.collectionTitle.replace(/^My /, '')}</h2>
              <label htmlFor={`${kind}-index-search`}>
                <span>Search {kind}</span>
                <input
                  id={`${kind}-index-search`}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>
            {visibleItems.length > 0 ? (
              <div className="linked-world-list">
                {visibleItems.map((item) => (
                  <LinkedIndexRow
                    item={item}
                    kind={kind}
                    key={item.id}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : (
              <p className="empty-state">No {kind} match that search.</p>
            )}
          </div>
        ) : null}

        {status === 'ready' && items.length > 0 && !usesLinkedListIndex ? (
          <div className={`cover-index-grid ${kind}-index-grid`}>
            {items.map((item) => (
              <CoverIndexCard
                item={item}
                key={item.id}
                kind={kind}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

// Renders one wide background-image row in the universe/world public indexes.
function LinkedIndexRow({ item, kind, onNavigate }) {
  const cover = resourceImage(item)
  const href = `/${kind}/${item.id}`

  return (
    <a
      className="linked-world-row public-index-row"
      href={href}
      style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      onClick={(event) => {
        event.preventDefault()
        onNavigate(href)
      }}
    >
      <span>{item.name}</span>
    </a>
  )
}

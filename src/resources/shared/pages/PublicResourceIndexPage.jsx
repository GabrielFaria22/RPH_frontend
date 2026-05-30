
import { AppHeader } from '../../../pages/app/AppHeader'
import { RESOURCE_CONFIG } from '../../../concerns/resourceConfig'
import { usePublicResources } from '../../../concerns/resourceHooks'
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
            Create {RESOURCE_CONFIG[kind].label}
          </a>
        </div>

        {status === 'loading' ? (
          <p className="empty-state">Loading visible resources...</p>
        ) : null}
        {status === 'error' ? <p className="archive-error">{error}</p> : null}
        {status === 'ready' && items.length === 0 ? (
          <p className="empty-state">There is nothing visible here yet.</p>
        ) : null}

        {status === 'ready' && items.length > 0 ? (
          <div className="cover-index-grid">
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

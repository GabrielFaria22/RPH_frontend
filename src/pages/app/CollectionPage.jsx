
import { useArchiveData } from '../../concerns/resourceHooks'
import { initialsFor, resourceImage, summarize } from '../../concerns/resourceHelpers'
import { AppHeader } from './AppHeader'

// Shows one of the current user's private archive lists on the dashboard side of the app.
export function CollectionPage({ kind, onBack, onLogout, onNavigate, title, user }) {
  const { archive, error, status } = useArchiveData()
  const items = archive[kind]

  return (
    <main className="app-shell">
      <AppHeader
        activeResource={kind}
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <section className="collection-page">
        <button className="back-button" type="button" onClick={onBack}>
          Back to home
        </button>
        <p className="eyebrow">Your archive</p>
        <h1>{title}</h1>

        {status === 'loading' ? (
          <p className="empty-state">Loading your archive...</p>
        ) : null}
        {status === 'error' ? <p className="archive-error">{error}</p> : null}
        {status === 'ready' && items.length === 0 ? (
          <p className="empty-state">There is nothing here yet.</p>
        ) : null}

        {status === 'ready' && items.length > 0 ? (
          <div className="collection-list">
            {items.map((item) => (
              <ArchiveListItem item={item} key={item.id} kind={kind} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

// Renders a compact dashboard row for an owned resource.
function ArchiveListItem({ item, kind }) {
  const description =
    kind === 'characters'
      ? item.description || item.story || item.occupation
      : item.description
  const fallback =
    kind === 'characters'
      ? 'A character page waiting for story details.'
      : kind === 'families'
        ? 'A family page waiting for lineage details.'
        : kind === 'factions'
          ? 'A faction page waiting for organizational details.'
          : 'A wiki page waiting for a description.'
  const image = resourceImage(item)

  return (
    <article className="archive-list-item">
      {image ? (
        <img src={image} alt="" />
      ) : (
        <div className={`archive-avatar ${kind}`} aria-hidden="true">
          {initialsFor(item.name || 'RH')}
        </div>
      )}
      <div>
        <h3>{item.name}</h3>
        <p>{summarize(description, fallback)}</p>
      </div>
    </article>
  )
}

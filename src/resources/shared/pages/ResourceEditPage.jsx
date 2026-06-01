
import { AppHeader } from '../../../pages/app/AppHeader'
import { attachmentUrl } from '../../../concerns/resourceHelpers'
import { RESOURCE_CONFIG } from '../../../concerns/resourceConfig'
import { useResource } from '../../../concerns/resourceHooks'
import { ResourceEditorForm } from '../components/ResourceEditorForm'

// Renders the shared edit page shell and delegates form fields to ResourceEditorForm.
export function ResourceEditPage({
  id,
  kind,
  onBack,
  onLogout,
  onNavigate,
  onSaved,
  user,
}) {
  const config = RESOURCE_CONFIG[kind]
  const { error, resource, setResource, status } = useResource(kind, id)
  const heroCover = config.hasImages ? attachmentUrl(resource?.cover_image) : ''
  // Families use a different ownership flag than the other API resources.
  const canEditResource =
    resource &&
    (kind === 'families'
      ? resource.owned_by_current_user
      : resource.editable_by_current_user)

  return (
    <main className="app-shell">
      <AppHeader
        activeResource={kind}
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <section className="edit-page">
        {status === 'ready' && resource ? (
          <section
            className="resource-cover-hero edit-resource-hero"
            style={heroCover ? { backgroundImage: `url(${heroCover})` } : undefined}
            aria-label={`${resource.name} cover`}
          >
            <section className="resource-cover-hero-content">
              <div className="wiki-article-actions">
                <button className="back-button" type="button" onClick={onBack}>
                  Back to article
                </button>
                {kind === 'families' && resource?.family_tree_id && canEditResource ? (
                  <button
                    className="back-button"
                    type="button"
                    onClick={() =>
                      onNavigate(`/family_trees/${resource.family_tree_id}/edit`)
                    }
                  >
                    Edit tree
                  </button>
                ) : null}
              </div>

              <header className="wiki-title-block">
                <p className="eyebrow">{config.editEyebrow}</p>
                <h1>{resource.name}</h1>
              </header>
            </section>
          </section>
        ) : (
          <>
            <button className="back-button" type="button" onClick={onBack}>
              Back to article
            </button>
            <p className="eyebrow">{config.editEyebrow}</p>
            <h1>{`${config.label} article`}</h1>
          </>
        )}

        {status === 'loading' ? (
          <p className="empty-state">Loading editor...</p>
        ) : null}
        {status === 'error' ? <p className="archive-error">{error}</p> : null}

        {status === 'ready' && resource && !canEditResource ? (
          <p className="archive-error">
            This {config.loadingLabel} is visible to you, but only its owner can
            edit it.
          </p>
        ) : null}

        {status === 'ready' && canEditResource ? (
          <ResourceEditorForm
            config={config}
            id={id}
            key={`${kind}-${resource.id}`}
            kind={kind}
            onNavigate={onNavigate}
            onSaved={onSaved}
            resource={resource}
            setResource={setResource}
          />
        ) : null}
      </section>
    </main>
  )
}

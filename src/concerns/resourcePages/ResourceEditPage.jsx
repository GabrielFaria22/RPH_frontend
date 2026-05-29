
import { AppHeader } from '../../pages/app/AppHeader'
import { RESOURCE_CONFIG } from '../resourceConfig'
import { useResource } from '../resourceHooks'
import { ResourceEditorForm } from './components/ResourceEditorForm'

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
        <button className="back-button" type="button" onClick={onBack}>
          Back to article
        </button>
        {kind === 'families' && resource?.family_tree_id && canEditResource ? (
          <button
            className="back-button"
            type="button"
            onClick={() => onNavigate(`/family_trees/${resource.family_tree_id}/edit`)}
          >
            Edit tree
          </button>
        ) : null}
        <p className="eyebrow">{config.editEyebrow}</p>
        <h1>{status === 'ready' ? resource?.name : `${config.label} article`}</h1>

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
            onSaved={onSaved}
            resource={resource}
            setResource={setResource}
          />
        ) : null}
      </section>
    </main>
  )
}

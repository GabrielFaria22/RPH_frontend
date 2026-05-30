import { useMemo, useState } from 'react'
import { patchJson } from '../../../concerns/api'
import { usePublicResources, useResource } from '../../../concerns/resourceHooks'
import { AppHeader } from '../../../pages/app/AppHeader'
import { FamilyTreeCanvas } from '../components/FamilyTreeCanvas'

const kind = 'family_trees'

// Renders the family tree show/edit page and loads eligible characters.
export function FamilyTreePage({ id, mode, onBack, onLogout, onNavigate, user }) {
  const { error, resource: familyTree, setResource, status } = useResource(kind, id)
  const { items: characters, status: charactersStatus } = usePublicResources('characters')
  const visibleCharacters = useMemo(
    () =>
      familyTree
        ? characters.filter(
            (character) => String(character.universe_id) === String(familyTree.universe_id),
          )
        : [],
    [characters, familyTree],
  )
  const [saveStatus, setSaveStatus] = useState('idle')
  const [message, setMessage] = useState('')

  // Persists the current family tree canvas layout to the API.
  const handleSave = async (layout) => {
    if (!familyTree) return

    setSaveStatus('loading')
    setMessage('')

    try {
      const savedTree = await patchJson(`/api/v1/family_trees/${familyTree.id}`, {
        family_tree: {
          layout,
          name: familyTree.name,
        },
      })
      setResource(savedTree)
      setSaveStatus('success')
      setMessage('Family tree saved.')
    } catch (saveError) {
      setSaveStatus('error')
      setMessage(saveError.message)
    }
  }

  return (
    <main className="app-shell">
      <AppHeader
        activeResource="families"
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <section className="family-tree-page">
        <div className="family-tree-title-row">
          <div>
            <button className="back-button" type="button" onClick={onBack}>
              Back to family
            </button>
            <p className="eyebrow">{mode === 'edit' ? 'Edit family tree' : 'Family tree'}</p>
            <h1>{familyTree?.name || 'Family tree'}</h1>
          </div>
        </div>

        {status === 'loading' || charactersStatus === 'loading' ? (
          <p className="empty-state">Loading family tree...</p>
        ) : null}
        {status === 'error' ? <p className="archive-error">{error}</p> : null}

        {status === 'ready' && familyTree ? (
          <>
            {mode === 'edit' && !familyTree.editable_by_current_user ? (
              <p className="archive-error">
                This family tree is visible to you, but only its owner or an admin
                can edit it.
              </p>
            ) : (
              <FamilyTreeCanvas
                characters={visibleCharacters}
                familyTree={familyTree}
                key={`${familyTree.id}-${familyTree.updated_at}`}
                mode={mode}
                onSave={handleSave}
                saveStatus={saveStatus}
              />
            )}
            {message ? (
              <p className={`form-message ${saveStatus}`}>{message}</p>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  )
}

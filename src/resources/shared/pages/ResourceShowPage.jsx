
import { useMemo } from 'react'
import { AppHeader } from '../../../pages/app/AppHeader'
import { RESOURCE_CONFIG } from '../../../concerns/resourceConfig'
import { useArchiveData, useResource } from '../../../concerns/resourceHooks'
import {
  attachmentUrl,
  displayNameById,
  initialsFor,
  resourcePortrait,
  sanitizeArticleHtml,
} from '../../../concerns/resourceHelpers'

// Renders the shared wiki-style show page for a resource type.
export function ResourceShowPage({
  id,
  kind,
  onBack,
  onEdit,
  onLogout,
  onNavigate,
  renderAfterTitle,
  user,
}) {
  const config = RESOURCE_CONFIG[kind]
  const { archive } = useArchiveData()
  const { error, resource, status } = useResource(kind, id)

  // Controls whether the edit action appears for the loaded record.
  const canEditResource =
    resource &&
    (kind === 'families'
      ? resource.owned_by_current_user
      : resource.editable_by_current_user)

  // Builds sanitized article markup and a table of contents whenever the resource text changes.
  const article = useMemo(
    () =>
      sanitizeArticleHtml(
        resource?.description || resource?.story || config.articleFallback,
    ),
    [config.articleFallback, resource?.description, resource?.story],
  )

  // Cover and portrait images are optional and only supported by configured resource types.
  const portrait = resource && config.hasImages ? resourcePortrait(resource) : ''
  const usesUniverseTabs = kind === 'universes'
  const heroCover = config.hasImages ? attachmentUrl(resource?.cover_image) : ''
  const characterUniverseId =
    kind === 'characters' ? resource?.universe?.id || resource?.universe_id : ''
  const characterUniverseName = kind === 'characters' ? resource?.universe?.name : ''
  const backButtonLabel = characterUniverseId
    ? `Back to ${characterUniverseName || 'universe'}`
    : config.backLabel
  const handleBackClick = () => {
    if (characterUniverseId) {
      onNavigate(`/universes/${characterUniverseId}`)
      return
    }

    onBack()
  }

  return (
    <main className="app-shell">
      <AppHeader
        activeResource={kind}
        user={user}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      {status === 'loading' ? (
        <section className="wiki-article-shell">
          <p className="empty-state">Loading {config.loadingLabel}...</p>
        </section>
      ) : null}

      {status === 'error' ? <p className="archive-error">{error}</p> : null}

      {status === 'ready' && resource ? (
        <article className="wiki-article-shell">
          <section
            className="resource-cover-hero"
            style={heroCover ? { backgroundImage: `url(${heroCover})` } : undefined}
            aria-label={`${resource.name} cover`}
          >
            <section className="resource-cover-hero-content">
              <div className="wiki-article-actions">
                <button className="back-button" type="button" onClick={handleBackClick}>
                  {backButtonLabel}
                </button>
                {canEditResource ? (
                  <button className="back-button" type="button" onClick={onEdit}>
                    Edit page
                  </button>
                ) : null}
                {kind === 'families' && resource.family_tree_id ? (
                  <button
                    className="back-button"
                    type="button"
                    onClick={() => {
                      onNavigate(`/family_trees/${resource.family_tree_id}`)
                    }}
                  >
                    View tree
                  </button>
                ) : null}
              </div>

              <header className="wiki-title-block">
                <p className="eyebrow">{config.label}</p>
                <h1>{resource.name}</h1>
                <span>{resource.public ? 'Public page' : 'Private page'}</span>
              </header>
            </section>
          </section>

          {usesUniverseTabs && renderAfterTitle ? (
            renderAfterTitle(
              resource,
              <ResourceArticleLayout
                archive={archive}
                article={article}
                kind={kind}
                onNavigate={onNavigate}
                portrait={portrait}
                resource={resource}
              />,
            )
          ) : (
            <ResourceArticleLayout
              archive={archive}
              article={article}
              kind={kind}
              onNavigate={onNavigate}
              portrait={portrait}
              resource={resource}
            />
          )}
        </article>
      ) : null}
    </main>
  )
}

function ResourceArticleLayout({ archive, article, kind, onNavigate, portrait, resource }) {
  const relatedFamilies =
    kind === 'characters' ? normalizeRelatedFamilies(resource, archive) : []

  return (
    <div className="wiki-layout">
      <aside className="wiki-toc" aria-label="Contents">
        <h2>Contents</h2>
        <ol>
          {article.toc.map((item) => (
            <li className={`toc-level-${item.level}`} key={item.id}>
              <a href={`#${item.id}`}>{item.title}</a>
            </li>
          ))}
        </ol>
      </aside>

      <div
        className="wiki-body"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />

      <aside className="wiki-infobox" aria-label={`${resource.name} summary`}>
        {portrait ? (
          <img src={portrait} alt="" />
        ) : (
          <div className="infobox-fallback" aria-hidden="true">
            {initialsFor(resource.name)}
          </div>
        )}
        <h2>{resource.name}</h2>
        <dl>
          <div>
            <dt>Visibility</dt>
            <dd>{resource.public ? 'Public' : 'Private'}</dd>
          </div>
          {resource.full_name ? (
            <div>
              <dt>Full name</dt>
              <dd>{resource.full_name}</dd>
            </div>
          ) : null}
          {resource.nickname ? (
            <div>
              <dt>Nickname</dt>
              <dd>{resource.nickname}</dd>
            </div>
          ) : null}
          {resource.occupation ? (
            <div>
              <dt>Occupation</dt>
              <dd>{resource.occupation}</dd>
            </div>
          ) : null}
          {resource.age ? (
            <div>
              <dt>Age</dt>
              <dd>{resource.age}</dd>
            </div>
          ) : null}
          {resource.leader_character_id ? (
            <div>
              <dt>Leader</dt>
              <dd>
                {displayNameById(
                  archive.characters,
                  resource.leader_character_id,
                  'Character',
                )}
              </dd>
            </div>
          ) : null}
          {resource.faction_id ? (
            <div>
              <dt>Faction</dt>
              <dd>
                {displayNameById(archive.factions, resource.faction_id, 'Faction')}
              </dd>
            </div>
          ) : null}
          {kind === 'characters' && relatedFamilies.length ? (
            <div>
              <dt>Related families</dt>
              <dd>
                <RelatedFamilyLinks
                  families={relatedFamilies}
                  onNavigate={onNavigate}
                />
              </dd>
            </div>
          ) : resource.family_ids?.length ? (
            <div>
              <dt>Families</dt>
              <dd>
                {resource.family_ids
                  .map((familyId) =>
                    displayNameById(archive.families, familyId, 'Family'),
                  )
                  .join(', ')}
              </dd>
            </div>
          ) : null}
          {resource.universe ? (
            <div>
              <dt>Universe</dt>
              <dd>{resource.universe.name}</dd>
            </div>
          ) : resource.universe_id ? (
            <div>
              <dt>Universe ID</dt>
              <dd>{resource.universe_id}</dd>
            </div>
          ) : null}
          {resource.world ? (
            <div>
              <dt>World</dt>
              <dd>{resource.world.name}</dd>
            </div>
          ) : resource.world_id ? (
            <div>
              <dt>World ID</dt>
              <dd>{resource.world_id}</dd>
            </div>
          ) : null}
          <div>
            <dt>Created</dt>
            <dd>{new Date(resource.created_at).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{new Date(resource.updated_at).toLocaleDateString()}</dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}

function RelatedFamilyLinks({ families, onNavigate }) {
  return (
    <ul className="related-family-list">
      {families.map(({ family, familyTree }) => (
        <li key={family.id}>
          <span>{family.name || `Family #${family.id}`}</span>
          <div className="related-family-actions">
            <button
              type="button"
              onClick={() => onNavigate(`/families/${family.id}`)}
            >
              Family
            </button>
            {familyTree?.id ? (
              <button
                type="button"
                onClick={() => onNavigate(`/family_trees/${familyTree.id}`)}
              >
                Tree
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function normalizeRelatedFamilies(resource, archive) {
  if (resource.related_families?.length) {
    return uniqueFamilies(
      resource.related_families
        .map((entry) => ({
          family: entry.family,
          familyTree: entry.family_tree,
        }))
        .filter((entry) => entry.family?.id),
    )
  }

  if (resource.families?.length) {
    const familyTrees = resource.family_trees || []

    return uniqueFamilies(
      resource.families.map((family) => ({
        family,
        familyTree:
          familyTrees.find(
            (familyTree) =>
              String(familyTree.family_id) === String(family.id) ||
              String(familyTree.id) === String(family.family_tree_id),
          ) || (family.family_tree_id ? { id: family.family_tree_id } : null),
      })),
    )
  }

  if (resource.family_ids?.length) {
    return uniqueFamilies(
      resource.family_ids.map((familyId) => {
        const family =
          archive.families.find(
            (candidate) => String(candidate.id) === String(familyId),
          ) || { id: familyId, name: `Family #${familyId}` }

        return {
          family,
          familyTree: family.family_tree_id ? { id: family.family_tree_id } : null,
        }
      }),
    )
  }

  return []
}

function uniqueFamilies(families) {
  const seen = new Set()

  return families.filter(({ family }) => {
    if (!family?.id || seen.has(String(family.id))) return false

    seen.add(String(family.id))
    return true
  })
}

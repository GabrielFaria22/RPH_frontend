
import { useMemo, useState } from 'react'
import { AppHeader } from '../../pages/app/AppHeader'
import { RESOURCE_CONFIG } from '../resourceConfig'
import { useArchiveData, usePublicResources, useResource } from '../resourceHooks'
import {
  displayNameById,
  initialsFor,
  resourceImage,
  resourcePortrait,
  sanitizeArticleHtml,
} from '../resourceHelpers'

export function ResourceShowPage({
  id,
  kind,
  onBack,
  onEdit,
  onLogout,
  onNavigate,
  user,
}) {
  const config = RESOURCE_CONFIG[kind]
  const { archive } = useArchiveData()
  const { error, resource, status } = useResource(kind, id)
  const canEditResource =
    resource &&
    (kind === 'families'
      ? resource.owned_by_current_user
      : resource.editable_by_current_user)
  const article = useMemo(
    () =>
      sanitizeArticleHtml(
        resource?.description || resource?.story || config.articleFallback,
      ),
    [config.articleFallback, resource?.description, resource?.story],
  )
  const cover = resource && config.hasImages ? resourceImage(resource) : ''
  const portrait = resource && config.hasImages ? resourcePortrait(resource) : ''

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
          <div
            className="wiki-cover"
            style={cover ? { backgroundImage: `url(${cover})` } : undefined}
          />
          <div className="wiki-article-actions">
            <button className="back-button" type="button" onClick={onBack}>
              {config.backLabel}
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

          {kind === 'universes' ? (
            <UniverseLinkedLists
              universe={resource}
              onNavigate={onNavigate}
            />
          ) : null}

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
                {resource.family_ids?.length ? (
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
        </article>
      ) : null}
    </main>
  )
}

function UniverseLinkedLists({ onNavigate, universe }) {
  const [activePanel, setActivePanel] = useState('')
  const [worldSearch, setWorldSearch] = useState('')
  const [characterSearch, setCharacterSearch] = useState('')
  const { items: worlds, status: worldsStatus } = usePublicResources('worlds')
  const { items: characters, status: charactersStatus } =
    usePublicResources('characters')
  const universeWorlds = useMemo(
    () =>
      worlds.filter((world) => belongsToUniverse(world, universe.id)),
    [universe.id, worlds],
  )
  const universeCharacters = useMemo(
    () =>
      characters.filter((character) => belongsToUniverse(character, universe.id)),
    [characters, universe.id],
  )
  const visibleWorlds = useMemo(
    () => filterByName(universeWorlds, worldSearch),
    [universeWorlds, worldSearch],
  )
  const visibleCharacters = useMemo(
    () => filterByName(universeCharacters, characterSearch),
    [characterSearch, universeCharacters],
  )

  const togglePanel = (panel) => {
    setActivePanel((current) => (current === panel ? '' : panel))
  }

  return (
    <section className="universe-linked-archive" aria-label="Universe resources">
      <div className="universe-link-triggers">
        <button
          className={activePanel === 'worlds' ? 'active' : ''}
          type="button"
          onClick={() => togglePanel('worlds')}
        >
          <span>{universeWorlds.length}</span>
          Worlds
        </button>
        <button
          className={activePanel === 'characters' ? 'active' : ''}
          type="button"
          onClick={() => togglePanel('characters')}
        >
          <span>{universeCharacters.length}</span>
          Characters
        </button>
      </div>

      {activePanel === 'worlds' ? (
        <LinkedPanel
          emptyText={
            worldsStatus === 'loading' ? 'Loading worlds...' : 'No worlds found.'
          }
          searchId="universe-world-search"
          searchLabel="Search worlds"
          searchValue={worldSearch}
          title="Worlds"
          onSearch={setWorldSearch}
        >
          <div className="linked-world-list">
            {visibleWorlds.map((world) => (
              <button
                className="linked-world-row"
                key={world.id}
                style={
                  resourceImage(world)
                    ? { backgroundImage: `url(${resourceImage(world)})` }
                    : undefined
                }
                type="button"
                onClick={() => onNavigate(`/worlds/${world.id}`)}
              >
                <span>{world.name}</span>
              </button>
            ))}
          </div>
        </LinkedPanel>
      ) : null}

      {activePanel === 'characters' ? (
        <LinkedPanel
          emptyText={
            charactersStatus === 'loading'
              ? 'Loading characters...'
              : 'No characters found.'
          }
          searchId="universe-character-search"
          searchLabel="Search characters"
          searchValue={characterSearch}
          title="Characters"
          onSearch={setCharacterSearch}
        >
          <div className="linked-character-list">
            {visibleCharacters.map((character) => (
              <button
                className="linked-character-row"
                key={character.id}
                type="button"
                onClick={() => onNavigate(`/characters/${character.id}`)}
              >
                {resourcePortrait(character) ? (
                  <img src={resourcePortrait(character)} alt="" />
                ) : (
                  <span className="linked-character-fallback" aria-hidden="true">
                    {initialsFor(character.name || 'RH')}
                  </span>
                )}
                <span>{character.name}</span>
              </button>
            ))}
          </div>
        </LinkedPanel>
      ) : null}
    </section>
  )
}

function LinkedPanel({
  children,
  emptyText,
  onSearch,
  searchId,
  searchLabel,
  searchValue,
  title,
}) {
  const childCount = children.props.children.length

  return (
    <div className="universe-linked-panel">
      <div className="linked-panel-header">
        <h2>{title}</h2>
        <label htmlFor={searchId}>
          <span>{searchLabel}</span>
          <input
            id={searchId}
            type="search"
            value={searchValue}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
      </div>
      {childCount > 0 ? children : <p className="empty-state">{emptyText}</p>}
    </div>
  )
}

function belongsToUniverse(resource, universeId) {
  return (
    String(resource.universe_id) === String(universeId) ||
    String(resource.universe?.id) === String(universeId)
  )
}

function filterByName(items, search) {
  const normalizedSearch = search.trim().toLowerCase()
  if (!normalizedSearch) return items

  return items.filter((item) =>
    item.name.toLowerCase().includes(normalizedSearch),
  )
}
